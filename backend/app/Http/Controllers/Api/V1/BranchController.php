<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Branch::with('company')->withCount('employees');

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $branches = $query->get();

        return response()->json([
            'success' => true,
            'data' => $branches,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $branch = Branch::with([
            'company',
            'employees' => fn($q) => $q->with(['department', 'designation', 'currentSalary'])
        ])->withCount('employees')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $branch,
        ]);
    }

    public function updateGeofence(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'geofence_latitude' => 'required|numeric|between:-90,90',
            'geofence_longitude' => 'required|numeric|between:-180,180',
            'geofence_radius_meters' => 'required|integer|min:20|max:5000',
            'attendance_mode' => 'required|in:BIOMETRIC_ONLY,MOBILE_GEOFENCE_ONLY,HYBRID_BOTH',
        ]);

        $branch = Branch::findOrFail($id);
        $branch->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Branch geofence and attendance rules updated successfully',
            'data' => $branch,
        ]);
    }
}

