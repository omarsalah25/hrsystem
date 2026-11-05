<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssetAssignment;
use App\Models\CompanyAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CompanyAsset::with(['company', 'activeAssignment.employee']);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name_ar', 'like', "%{$s}%")
                  ->orWhere('name_en', 'like', "%{$s}%")
                  ->orWhere('asset_code', 'like', "%{$s}%")
                  ->orWhere('serial_number', 'like', "%{$s}%");
            });
        }

        $assets = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $assets,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|uuid|exists:companies,id',
            'asset_code' => 'required|string|max:50',
            'name_ar' => 'required|string|max:150',
            'name_en' => 'required|string|max:150',
            'category' => 'required|in:LAPTOP,PHONE,VEHICLE,KEYCARD,EQUIPMENT',
            'serial_number' => 'nullable|string|max:100',
            'purchase_value' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'status' => 'in:AVAILABLE,ASSIGNED,MAINTENANCE,RETIRED',
        ]);

        $asset = CompanyAsset::create([
            'tenant_id' => $request->user()->tenant_id,
            'company_id' => $validated['company_id'],
            'asset_code' => $validated['asset_code'],
            'name_ar' => $validated['name_ar'],
            'name_en' => $validated['name_en'],
            'category' => $validated['category'],
            'serial_number' => $validated['serial_number'] ?? null,
            'purchase_value' => $validated['purchase_value'] ?? 0.00,
            'purchase_date' => $validated['purchase_date'] ?? null,
            'status' => $validated['status'] ?? 'AVAILABLE',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Asset registered successfully',
            'data' => $asset,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $asset = CompanyAsset::with([
            'company',
            'assignments.employee.department',
            'activeAssignment.employee'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $asset,
        ]);
    }

    public function assign(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|uuid|exists:employees,id',
            'assigned_date' => 'required|date',
            'condition_on_handover' => 'required|in:NEW,EXCELLENT,GOOD,FAIR',
            'handover_notes' => 'nullable|string',
        ]);

        $asset = CompanyAsset::findOrFail($id);

        return DB::transaction(function () use ($validated, $asset, $request) {
            $assignment = AssetAssignment::create([
                'tenant_id' => $request->user()->tenant_id,
                'asset_id' => $asset->id,
                'employee_id' => $validated['employee_id'],
                'assigned_date' => $validated['assigned_date'],
                'condition_on_handover' => $validated['condition_on_handover'],
                'handover_notes' => $validated['handover_notes'] ?? null,
            ]);

            $asset->update(['status' => 'ASSIGNED']);

            return response()->json([
                'success' => true,
                'message' => 'Asset assigned to employee successfully',
                'data' => $assignment->load(['employee', 'asset']),
            ]);
        });
    }

    public function returnAsset(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'returned_date' => 'required|date',
            'condition_on_return' => 'required|in:NEW,EXCELLENT,GOOD,FAIR,DAMAGED',
            'handover_notes' => 'nullable|string',
        ]);

        $asset = CompanyAsset::findOrFail($id);
        $assignment = AssetAssignment::where('asset_id', $asset->id)
            ->whereNull('returned_date')
            ->latest()
            ->firstOrFail();

        return DB::transaction(function () use ($validated, $asset, $assignment) {
            $assignment->update([
                'returned_date' => $validated['returned_date'],
                'condition_on_return' => $validated['condition_on_return'],
                'handover_notes' => $validated['handover_notes'] ?? $assignment->handover_notes,
            ]);

            $newStatus = ($validated['condition_on_return'] === 'DAMAGED') ? 'MAINTENANCE' : 'AVAILABLE';
            $asset->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Asset returned successfully',
                'data' => $assignment,
            ]);
        });
    }

    public function destroy(string $id): JsonResponse
    {
        $asset = CompanyAsset::findOrFail($id);
        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset deleted successfully',
        ]);
    }
}

