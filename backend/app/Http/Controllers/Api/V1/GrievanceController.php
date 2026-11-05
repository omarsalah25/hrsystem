<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GrievanceCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GrievanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GrievanceCase::with(['complainant.department', 'respondent.department']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $cases = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $cases,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'complainant_employee_id' => 'required|uuid|exists:employees,id',
            'respondent_employee_id' => 'nullable|uuid|exists:employees,id',
            'category' => 'required|in:HARASSMENT,WAGE_DISPUTE,WORK_ENVIRONMENT,DISCRIMINATION,SAFETY',
            'incident_description' => 'required|string',
            'is_confidential' => 'boolean',
        ]);

        $year = date('Y');
        $count = GrievanceCase::whereYear('created_at', $year)->count() + 1;
        $caseNumber = sprintf('GRC-%s-%04d', $year, $count);

        $case = GrievanceCase::create([
            'tenant_id' => $request->user()->tenant_id,
            'complainant_employee_id' => $validated['complainant_employee_id'],
            'respondent_employee_id' => $validated['respondent_employee_id'] ?? null,
            'case_number' => $caseNumber,
            'category' => $validated['category'],
            'incident_description' => $validated['incident_description'],
            'is_confidential' => $validated['is_confidential'] ?? true,
            'status' => 'FILED',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Grievance case registered under strict confidentiality',
            'data' => $case->load(['complainant', 'respondent']),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $case = GrievanceCase::with([
            'complainant.department',
            'complainant.branch',
            'respondent.department',
            'respondent.branch'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $case,
        ]);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:FILED,UNDER_INVESTIGATION,HEARING_SCHEDULED,RESOLVED,DISMISSED',
            'resolution_notes' => 'nullable|string',
        ]);

        $case = GrievanceCase::findOrFail($id);
        $case->update([
            'status' => $validated['status'],
            'resolution_notes' => $validated['resolution_notes'] ?? $case->resolution_notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Grievance status updated',
            'data' => $case,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $case = GrievanceCase::findOrFail($id);
        $case->delete();

        return response()->json([
            'success' => true,
            'message' => 'Grievance case deleted successfully',
        ]);
    }
}

