<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AttendancePunch;
use App\Models\AttendanceRecord;
use App\Models\Branch;
use App\Models\Employee;
use App\Services\Attendance\GeofenceService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function __construct(
        protected GeofenceService $geofenceService
    ) {}

    /**
     * List all attendance logs and recent hardware/mobile punches
     */
    public function index(Request $request): JsonResponse
    {
        $punches = AttendancePunch::with(['employee.department', 'employee.branch'])
            ->orderBy('punch_time', 'desc')
            ->limit(50)
            ->get();

        $records = AttendanceRecord::with(['employee.department', 'employee.branch'])
            ->orderBy('date', 'desc')
            ->limit(50)
            ->get();

        $today = now()->toDateString();
        $presentToday = AttendanceRecord::where('date', $today)->where('status', 'PRESENT')->count();
        $lateToday = AttendanceRecord::where('date', $today)->where('late_minutes', '>', 0)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'punches' => $punches,
                'records' => $records,
                'stats' => [
                    'present_today' => $presentToday ?: $records->where('status', 'PRESENT')->count(),
                    'late_today' => $lateToday ?: $records->where('late_minutes', '>', 0)->count(),
                    'total_punches' => $punches->count(),
                ],
            ],
        ]);
    }

    /**
     * Trigger daily attendance reconciliation engine
     */
    public function reconcile(): JsonResponse
    {
        Artisan::call('attendance:reconcile');

        return response()->json([
            'success' => true,
            'message' => 'تمت مطابقة واحتساب ساعات الدوام والبصمات بنجاح',
            'output' => trim(Artisan::output()),
        ]);
    }

    /**
     * Mobile GPS & Web Clock-In / Clock-Out Punch
     */
    public function punch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source' => 'nullable|in:MOBILE_GPS,WEB_PORTAL,BIOMETRIC_ADMS',
            'device_source' => 'nullable|in:MOBILE_APP,BIOMETRIC_CLOCK,MANUAL_WEB',
            'punch_type' => 'nullable|in:IN,OUT,CHECK_IN,CHECK_OUT',
            'employee_id' => 'nullable|uuid|exists:employees,id',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        // Normalize source
        $source = $validated['source'] ?? match ($validated['device_source'] ?? 'MANUAL_WEB') {
            'MOBILE_APP' => 'MOBILE_GPS',
            'BIOMETRIC_CLOCK' => 'BIOMETRIC_ADMS',
            default => 'WEB_PORTAL',
        };
        $validated['source'] = $source;

        $user = $request->user();
        $employee = !empty($validated['employee_id'])
            ? Employee::find($validated['employee_id'])
            : ($user->employee ?? Employee::where('user_id', $user->id)->first() ?? Employee::first());

        if (!$employee) {
            abort(400, 'User is not linked to an employee record.');
        }

        // Branch Geofence Verification if mobile GPS
        $isWithinGeofence = null;
        if ($validated['source'] === 'MOBILE_GPS') {
            if (!isset($validated['latitude']) || !isset($validated['longitude'])) {
                abort(422, 'GPS coordinates required for mobile attendance.');
            }

            $branch = $employee->branch ?? Branch::where('company_id', $employee->company_id)->first();
            
            if ($branch && $branch->geofence_latitude && $branch->geofence_longitude) {
                $isWithinGeofence = $this->geofenceService->isWithinGeofence(
                    (float) $validated['latitude'],
                    (float) $validated['longitude'],
                    (float) $branch->geofence_latitude,
                    (float) $branch->geofence_longitude,
                    (int) ($branch->geofence_radius_meters ?? 200)
                );

                if (!$isWithinGeofence) {
                    return response()->json([
                        'success' => false,
                        'message' => __('messages.out_of_geofence'),
                        'error_code' => 'OUT_OF_GEOFENCE',
                    ], 422);
                }
            }
        }

        $now = now();
        $today = $now->toDateString();

        return DB::transaction(function () use ($employee, $now, $today, $validated, $isWithinGeofence) {
            // Find existing daily attendance record
            $attendance = AttendanceRecord::where('employee_id', $employee->id)
                ->where('date', $today)
                ->first();

            $explicitType = $validated['punch_type'] ?? null;
            if ($explicitType === 'CHECK_IN' || $explicitType === 'IN') {
                $punchType = 'IN';
            } elseif ($explicitType === 'CHECK_OUT' || $explicitType === 'OUT') {
                $punchType = 'OUT';
            } else {
                $punchType = (!$attendance || !$attendance->first_punch_in) ? 'IN' : 'OUT';
            }

            // 1. Record raw punch
            AttendancePunch::create([
                'tenant_id' => $employee->tenant_id,
                'employee_id' => $employee->id,
                'punch_time' => $now,
                'punch_type' => $punchType,
                'source' => $validated['source'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'is_within_geofence' => $isWithinGeofence,
            ]);

            // 2. Upsert daily summary
            if (!$attendance) {
                $attendance = AttendanceRecord::create([
                    'tenant_id' => $employee->tenant_id,
                    'employee_id' => $employee->id,
                    'date' => $today,
                    'first_punch_in' => $now,
                    'status' => 'PRESENT',
                    'source' => $validated['source'] === 'MOBILE_GPS' ? 'MOBILE_GEOFENCE' : 'HYBRID',
                ]);
            } else {
                $attendance->update([
                    'last_punch_out' => $now,
                    'total_hours_worked' => round(Carbon::parse($attendance->first_punch_in)->diffInMinutes($now) / 60, 2),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => $punchType === 'IN' ? __('messages.clock_in_success') : __('messages.clock_out_success'),
                'data' => [
                    'punch_type' => $punchType,
                    'punch_time' => $now->toDateTimeString(),
                    'attendance' => $attendance,
                ],
            ]);
        });
    }

    /**
     * Fetch employee's monthly attendance sheet
     */
    public function mySummary(Request $request): JsonResponse
    {
        $employee = $request->filled('employee_id')
            ? Employee::find($request->employee_id)
            : ($request->user()->employee ?? Employee::where('user_id', $request->user()->id)->first() ?? Employee::first());

        if (!$employee) {
            abort(400, 'Employee not found.');
        }

        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $records = AttendanceRecord::where('employee_id', $employee->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date', 'desc')
            ->get();

        $punches = AttendancePunch::where('employee_id', $employee->id)
            ->whereDate('punch_time', '>=', now()->subDays(7))
            ->orderBy('punch_time', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'employee' => [
                    'id' => $employee->id,
                    'full_name' => $employee->full_name,
                    'employee_number' => $employee->employee_number,
                ],
                'records' => $records,
                'punches' => $punches,
                'summary' => [
                    'present_days' => $records->where('status', 'PRESENT')->count(),
                    'late_days' => $records->where('late_minutes', '>', 0)->count(),
                    'total_hours' => $records->sum('total_hours_worked'),
                    'total_overtime' => $records->sum('overtime_hours'),
                ],
            ],
        ]);
    }
}

