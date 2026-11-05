<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssetAssignment;
use App\Models\Employee;
use App\Services\Payroll\EndOfServiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OffboardingController extends Controller
{
    public function __construct(
        protected EndOfServiceService $esbService
    ) {}

    /**
     * Compute End of Service Award (ESB) preview under Saudi / Egyptian labor law
     */
    public function calculateEsb(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'last_full_salary' => 'required|numeric|min:0',
            'service_years' => 'required|numeric|min:0',
            'separation_reason' => 'required|in:RESIGNATION,TERMINATION,CONTRACT_EXPIRED,MARRIAGE_FEMALE,FORCE_MAJEURE',
            'is_female' => 'boolean',
        ]);

        $result = $this->esbService->calculate(
            (float) $validated['last_full_salary'],
            (float) $validated['service_years'],
            $validated['separation_reason'],
            (bool) ($validated['is_female'] ?? false)
        );

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Multi-department offboarding clearance check
     */
    public function clearanceStatus(string $employeeId): JsonResponse
    {
        $employee = Employee::with(['department', 'branch', 'currentSalary'])->findOrFail($employeeId);

        // 1. IT Clearance: unreturned assets
        $unreturnedAssets = AssetAssignment::with('asset')
            ->where('employee_id', $employeeId)
            ->whereNull('returned_date')
            ->get();

        $itClear = ($unreturnedAssets->isEmpty());

        // 2. Finance Clearance
        $financeClear = true; // In production, checks pending advance loans or unliquidated expense claims

        // 3. HR Clearance
        $hrClear = true;

        $overallClear = $itClear && $financeClear && $hrClear;

        return response()->json([
            'success' => true,
            'data' => [
                'employee' => $employee,
                'is_fully_cleared' => $overallClear,
                'departments' => [
                    'it_hardware' => [
                        'cleared' => $itClear,
                        'pending_items' => $unreturnedAssets,
                    ],
                    'finance_accounting' => [
                        'cleared' => $financeClear,
                        'pending_loans' => 0.00,
                    ],
                    'hr_operations' => [
                        'cleared' => $hrClear,
                        'status' => 'PENDING_EXIT_INTERVIEW',
                    ],
                ],
            ],
        ]);
    }

    /**
     * Initiate employee separation
     */
    public function initiate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|uuid|exists:employees,id',
            'separation_date' => 'required|date',
            'separation_reason' => 'required|in:RESIGNATION,TERMINATION,CONTRACT_EXPIRED,RETIREMENT',
            'notes' => 'nullable|string',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);
        $employee->update([
            'separation_date' => $validated['separation_date'],
            'employment_status' => 'OFFBOARDED',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Offboarding and separation workflow initiated successfully',
            'data' => $employee,
        ]);
    }
}

