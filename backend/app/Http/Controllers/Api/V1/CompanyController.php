<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companies = Company::with(['branches', 'departments'])
            ->withCount('employees')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $companies,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $company = Company::with([
            'branches.employees',
            'departments.employees'
        ])->withCount('employees')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $company,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'legal_name' => 'required|string|max:200',
            'trade_name' => 'nullable|string|max:150',
            'commercial_registration_no' => 'nullable|string|max:50',
            'tax_registration_no' => 'nullable|string|max:50',
            'social_insurance_no' => 'nullable|string|max:50',
            'wps_employer_id' => 'nullable|string|max:50',
            'bank_code' => 'nullable|string|max:20',
            'primary_iban' => 'nullable|string|max:34',
            'country_code' => 'required|string|size:3|in:SAU,EGY,UAE,QAT,KWT,BHR,OMN',
            'currency' => 'required|string|size:3|in:SAR,EGP,AED,QAR,KWD,BHD,OMR,USD',
        ]);

        $tenantId = $request->user()->tenant_id;
        $validated['tenant_id'] = $tenantId;

        $company = Company::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Company registered successfully',
            'data' => $company->load(['branches', 'departments']),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $company = Company::findOrFail($id);

        $validated = $request->validate([
            'legal_name' => 'string|max:200',
            'trade_name' => 'nullable|string|max:150',
            'commercial_registration_no' => 'nullable|string|max:50',
            'tax_registration_no' => 'nullable|string|max:50',
            'social_insurance_no' => 'nullable|string|max:50',
            'wps_employer_id' => 'nullable|string|max:50',
            'bank_code' => 'nullable|string|max:20',
            'primary_iban' => 'nullable|string|max:34',
            'country_code' => 'string|size:3|in:SAU,EGY,UAE,QAT,KWT,BHR,OMN',
            'currency' => 'string|size:3|in:SAR,EGP,AED,QAR,KWD,BHD,OMR,USD',
        ]);

        $company->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Company updated successfully',
            'data' => $company->fresh(['branches', 'departments']),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $company = Company::withCount(['employees', 'branches'])->findOrFail($id);

        if ($company->employees_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete company with active assigned employees',
            ], 422);
        }

        $company->delete();

        return response()->json([
            'success' => true,
            'message' => 'Company deleted successfully',
        ]);
    }
}

