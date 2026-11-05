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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|uuid|exists:companies,id',
            'name' => 'required|string|max:100',
            'address_line' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'timezone' => 'nullable|string|max:50',
            'geofence_latitude' => 'nullable|numeric|between:-90,90',
            'geofence_longitude' => 'nullable|numeric|between:-180,180',
            'geofence_radius_meters' => 'nullable|integer|min:20|max:5000',
            'attendance_mode' => 'nullable|in:BIOMETRIC_ONLY,MOBILE_GEOFENCE_ONLY,BOTH,ANY',
        ]);

        $validated['tenant_id'] = $request->user()->tenant_id;
        $validated['timezone'] = $validated['timezone'] ?? 'Asia/Riyadh';
        $validated['geofence_radius_meters'] = $validated['geofence_radius_meters'] ?? 200;
        $validated['attendance_mode'] = $validated['attendance_mode'] ?? 'BOTH';

        $branch = Branch::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Branch created successfully',
            'data' => $branch->load('company'),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:100',
            'address_line' => 'string|max:255',
            'city' => 'string|max:100',
            'timezone' => 'string|max:50',
            'geofence_latitude' => 'nullable|numeric|between:-90,90',
            'geofence_longitude' => 'nullable|numeric|between:-180,180',
            'geofence_radius_meters' => 'integer|min:20|max:5000',
            'attendance_mode' => 'in:BIOMETRIC_ONLY,MOBILE_GEOFENCE_ONLY,BOTH,ANY',
        ]);

        $branch->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Branch updated successfully',
            'data' => $branch->fresh('company'),
        ]);
    }

    public function updateGeofence(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'geofence_latitude' => 'required|numeric|between:-90,90',
            'geofence_longitude' => 'required|numeric|between:-180,180',
            'geofence_radius_meters' => 'required|integer|min:20|max:5000',
            'attendance_mode' => 'required|in:BIOMETRIC_ONLY,MOBILE_GEOFENCE_ONLY,BOTH,ANY,HYBRID_BOTH',
        ]);

        if ($validated['attendance_mode'] === 'HYBRID_BOTH') {
            $validated['attendance_mode'] = 'BOTH';
        }

        $branch = Branch::findOrFail($id);
        $branch->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Branch geofence and attendance rules updated successfully',
            'data' => $branch,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $branch = Branch::withCount('employees')->findOrFail($id);

        if ($branch->employees_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete branch with active assigned employees',
            ], 422);
        }

        $branch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Branch deleted successfully',
        ]);
    }
}

