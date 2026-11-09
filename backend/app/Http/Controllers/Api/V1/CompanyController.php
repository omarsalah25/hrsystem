<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companies = Company::with(['tenant', 'branches', 'departments'])
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
            'tenant',
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
            'subdomain' => 'nullable|string|max:63',
            'subscription_plan' => 'nullable|string|in:STARTER,GROWTH,ENTERPRISE',
        ]);

        // Auto-provision a dedicated Tenant for every new Company created
        $rawSubdomain = $validated['subdomain'] ?? ($validated['trade_name'] ?? $validated['legal_name']);
        $baseSlug = Str::slug($rawSubdomain);
        if (empty($baseSlug)) {
            $baseSlug = 'tenant-' . strtolower(Str::random(6));
        }
        $subdomain = substr($baseSlug, 0, 55);
        $counter = 1;
        while (Tenant::where('subdomain', $subdomain)->exists()) {
            $subdomain = substr($baseSlug, 0, 50) . '-' . $counter;
            $counter++;
        }

        $jurisdiction = match ($validated['country_code']) {
            'SAU' => 'SAUDI_ARABIA',
            'EGY' => 'EGYPT',
            'UAE', 'QAT', 'KWT', 'BHR', 'OMN' => 'GCC_OTHER',
            default => 'GLOBAL',
        };

        $tenant = Tenant::create([
            'name' => $validated['trade_name'] ?: $validated['legal_name'],
            'subdomain' => $subdomain,
            'subscription_plan' => $validated['subscription_plan'] ?? 'ENTERPRISE',
            'country_jurisdiction' => $jurisdiction,
            'is_active' => true,
        ]);

        unset($validated['subdomain'], $validated['subscription_plan']);
        $validated['tenant_id'] = $tenant->id;

        $company = Company::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Company and dedicated Tenant provisioned successfully',
            'data' => $company->load(['tenant', 'branches', 'departments']),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $company = Company::with('tenant')->findOrFail($id);

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
            'subdomain' => 'nullable|string|max:63',
            'subscription_plan' => 'nullable|string|in:STARTER,GROWTH,ENTERPRISE',
            'tenant_is_active' => 'nullable|boolean',
        ]);

        if ($company->tenant && ($request->has('subdomain') || $request->has('subscription_plan') || $request->has('tenant_is_active'))) {
            $tenantUpdates = [];
            if (!empty($validated['subdomain'])) {
                $cleanSub = Str::slug($validated['subdomain']);
                if ($cleanSub && !Tenant::where('subdomain', $cleanSub)->where('id', '!=', $company->tenant->id)->exists()) {
                    $tenantUpdates['subdomain'] = $cleanSub;
                }
            }
            if (!empty($validated['subscription_plan'])) {
                $tenantUpdates['subscription_plan'] = $validated['subscription_plan'];
            }
            if ($request->has('tenant_is_active')) {
                $tenantUpdates['is_active'] = (bool) $validated['tenant_is_active'];
            }
            if (!empty($tenantUpdates)) {
                $company->tenant->update($tenantUpdates);
            }
        }

        unset($validated['subdomain'], $validated['subscription_plan'], $validated['tenant_is_active']);
        $company->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Company updated successfully',
            'data' => $company->fresh(['tenant', 'branches', 'departments']),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $company = Company::with('tenant')->withCount(['employees', 'branches'])->findOrFail($id);

        if ($company->employees_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete company with active assigned employees',
            ], 422);
        }

        $tenant = $company->tenant;
        $company->delete();

        if ($tenant && $tenant->companies()->count() === 0 && $tenant->users()->count() === 0) {
            $tenant->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Company deleted successfully',
        ]);
    }
}

