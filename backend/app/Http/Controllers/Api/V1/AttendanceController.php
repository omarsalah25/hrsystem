<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AttendancePunch;
use App\Models\AttendanceRecord;
use App\Models\Branch;
use App\Services\Attendance\GeofenceService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function __construct(
        protected GeofenceService $geofenceService
    ) {}

    /**
     * Mobile GPS & Web Clock-In / Clock-Out Punch
     */
    public function punch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source' => 'required|in:MOBILE_GPS,WEB_PORTAL',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $user = $request->user();
        $employee = $user->employee;

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

            $punchType = (!$attendance || !$attendance->first_punch_in) ? 'IN' : 'OUT';

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
        $employee = $request->user()->employee;
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

