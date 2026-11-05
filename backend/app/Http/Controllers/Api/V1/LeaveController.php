<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
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
        $employee = $request->user()->employee;
        if (!$employee) {
            abort(400, 'Employee profile not found.');
        }

        $requests = LeaveRequest::with('leaveType')
            ->where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'leave_type_id' => 'required|uuid|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:500',
            'medical_document' => 'nullable|file|mimes:pdf,jpg,png|max:5120', // 5MB limit
        ]);

        $employee = $request->user()->employee;
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
            'leave_type_id' => $validated['leave_type_id'],
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

