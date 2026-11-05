<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OkrGoal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerformanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OkrGoal::with(['employee.department', 'employee.designation']);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('cycle_period')) {
            $query->where('cycle_period', $request->cycle_period);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $goals = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $goals,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|uuid|exists:employees,id',
            'title' => 'required|string|max:200',
            'cycle_period' => 'required|string|max:50',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
            'status' => 'in:NOT_STARTED,IN_PROGRESS,ACHIEVED,DEFERRED',
        ]);

        $goal = OkrGoal::create([
            'tenant_id' => $request->user()->tenant_id,
            'employee_id' => $validated['employee_id'],
            'title' => $validated['title'],
            'cycle_period' => $validated['cycle_period'],
            'progress_percentage' => $validated['progress_percentage'] ?? 0,
            'status' => $validated['status'] ?? 'IN_PROGRESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'OKR goal created successfully',
            'data' => $goal->load('employee'),
        ], 201);
    }

    public function updateProgress(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'progress_percentage' => 'required|integer|min:0|max:100',
            'status' => 'nullable|in:NOT_STARTED,IN_PROGRESS,ACHIEVED,DEFERRED',
        ]);

        $goal = OkrGoal::findOrFail($id);
        $status = $validated['status'] ?? ($validated['progress_percentage'] >= 100 ? 'ACHIEVED' : 'IN_PROGRESS');

        $goal->update([
            'progress_percentage' => $validated['progress_percentage'],
            'status' => $status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Goal progress updated',
            'data' => $goal,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $goal = OkrGoal::findOrFail($id);
        $goal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Goal deleted successfully',
        ]);
    }
}

