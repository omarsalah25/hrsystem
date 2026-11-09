<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LeaveController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isPrivileged = in_array($user->role, ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'LINE_MANAGER'], true);

        $query = LeaveRequest::with(['leaveType', 'employee.department', 'employee.branch'])
            ->orderBy('created_at', 'desc');

        if (!$isPrivileged && $user->employee) {
            $query->where('employee_id', $user->employee->id);
        } elseif ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $requests = $query->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    public function types(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => LeaveType::all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'nullable|uuid|exists:employees,id',
            'leave_type_id' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:500',
            'medical_document' => 'nullable|file|mimes:pdf,jpg,png|max:5120', // 5MB limit
        ]);

        $employee = !empty($validated['employee_id'])
            ? Employee::find($validated['employee_id'])
            : ($request->user()->employee ?? Employee::where('user_id', $request->user()->id)->first() ?? Employee::first());

        if (!$employee) {
            abort(400, 'User is not linked to an employee profile.');
        }

        $typeParam = $validated['leave_type_id'];
        $leaveType = \Illuminate\Support\Str::isUuid($typeParam)
            ? LeaveType::find($typeParam)
            : LeaveType::where('code', $typeParam)->first();

        if (!$leaveType) {
            $leaveType = LeaveType::firstOrFail();
        }

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $totalDays = $start->diffInDays($end) + 1;

        // Store medical slip strictly in local private storage
        $docPath = null;
        if ($request->hasFile('medical_document')) {
            $docPath = $request->file('medical_document')->store(
                "tenants/{$employee->tenant_id}/leaves/{$employee->id}",
                'local' // Uses storage/app/private/
            );
        }

        $leave = LeaveRequest::create([
            'tenant_id' => $employee->tenant_id,
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_days' => $totalDays,
            'reason' => $validated['reason'],
            'medical_document_path' => $docPath,
            'status' => 'PENDING_MANAGER',
        ]);

        return response()->json([
            'success' => true,
            'message' => __('messages.leave_submitted'),
            'data' => $leave->load('leaveType'),
        ], 201);
    }

    public function approve(string $id, Request $request): JsonResponse
    {
        $leave = LeaveRequest::findOrFail($id);
        $user = $request->user();

        $leave->update([
            'status' => 'APPROVED',
            'approved_by_manager_id' => $user->employee?->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => __('messages.leave_approved'),
            'data' => $leave,
        ]);
    }

    public function reject(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $leave = LeaveRequest::findOrFail($id);
        $leave->update([
            'status' => 'REJECTED',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => __('messages.leave_rejected'),
            'data' => $leave,
        ]);
    }
}

