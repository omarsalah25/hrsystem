<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobOpening;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecruitmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = JobOpening::with(['department'])
            ->withCount([
                'applications',
                'applications as applied_count' => fn($q) => $q->where('stage', 'APPLIED'),
                'applications as interview_count' => fn($q) => $q->where('stage', 'INTERVIEW'),
                'applications as offer_count' => fn($q) => $q->where('stage', 'OFFER'),
                'applications as hired_count' => fn($q) => $q->where('stage', 'HIRED'),
            ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $openings = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $openings,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => 'required|uuid|exists:departments,id',
            'title_ar' => 'required|string|max:150',
            'title_en' => 'required|string|max:150',
            'job_description' => 'required|string',
            'employment_type' => 'in:FULL_TIME,PART_TIME,REMOTE,CONTRACT',
            'min_budget' => 'nullable|numeric|min:0',
            'max_budget' => 'nullable|numeric|min:0',
            'status' => 'in:DRAFT,OPEN,INTERVIEWING,FILLED,CANCELLED',
        ]);

        $opening = JobOpening::create([
            'tenant_id' => $request->user()->tenant_id,
            'department_id' => $validated['department_id'],
            'title_ar' => $validated['title_ar'],
            'title_en' => $validated['title_en'],
            'job_description' => $validated['job_description'],
            'employment_type' => $validated['employment_type'] ?? 'FULL_TIME',
            'min_budget' => $validated['min_budget'] ?? null,
            'max_budget' => $validated['max_budget'] ?? null,
            'status' => $validated['status'] ?? 'OPEN',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Job opening created successfully',
            'data' => $opening->load('department'),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $opening = JobOpening::with([
            'department',
            'applications' => fn($q) => $q->orderBy('created_at', 'desc')
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $opening,
        ]);
    }

    public function storeApplication(Request $request, string $openingId): JsonResponse
    {
        $validated = $request->validate([
            'candidate_name' => 'required|string|max:150',
            'candidate_email' => 'required|email|max:150',
            'candidate_phone' => 'required|string|max:50',
            'expected_salary' => 'nullable|numeric|min:0',
            'cv_document_path' => 'nullable|string|max:255',
        ]);

        $opening = JobOpening::findOrFail($openingId);

        $application = JobApplication::create([
            'tenant_id' => $request->user()->tenant_id,
            'job_opening_id' => $opening->id,
            'candidate_name' => $validated['candidate_name'],
            'candidate_email' => $validated['candidate_email'],
            'candidate_phone' => $validated['candidate_phone'],
            'expected_salary' => $validated['expected_salary'] ?? null,
            'cv_document_path' => $validated['cv_document_path'] ?? null,
            'stage' => 'APPLIED',
            'scorecard_rating' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Candidate application submitted successfully',
            'data' => $application,
        ], 201);
    }

    public function updateStage(Request $request, string $applicationId): JsonResponse
    {
        $validated = $request->validate([
            'stage' => 'required|in:APPLIED,SCREENING,INTERVIEW,OFFER,HIRED,REJECTED',
        ]);

        $application = JobApplication::findOrFail($applicationId);
        $application->update(['stage' => $validated['stage']]);

        return response()->json([
            'success' => true,
            'message' => 'Candidate pipeline stage updated',
            'data' => $application,
        ]);
    }

    public function updateScorecard(Request $request, string $applicationId): JsonResponse
    {
        $validated = $request->validate([
            'scorecard_rating' => 'required|integer|min:1|max:5',
            'interviewer_feedback' => 'nullable|string',
        ]);

        $application = JobApplication::findOrFail($applicationId);
        $application->update([
            'scorecard_rating' => $validated['scorecard_rating'],
            'interviewer_feedback' => $validated['interviewer_feedback'] ?? $application->interviewer_feedback,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Interview scorecard saved',
            'data' => $application,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $opening = JobOpening::findOrFail($id);
        $opening->delete();

        return response()->json([
            'success' => true,
            'message' => 'Job opening deleted successfully',
        ]);
    }
}

