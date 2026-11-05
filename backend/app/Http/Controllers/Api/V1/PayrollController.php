<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Employee;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Services\Payroll\EgyptPayrollService;
use App\Services\Payroll\SaudiPayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PayrollController extends Controller
{
    public function __construct(
        protected EgyptPayrollService $egyptService,
        protected SaudiPayrollService $saudiService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = PayrollRun::with('company');

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $runs = $query->latest()->paginate($request->integer('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $runs,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $run = PayrollRun::with([
            'company',
            'payslips.employee.department',
            'payslips.employee.designation'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $run,
        ]);
    }

    /**
     * Initialize and calculate a monthly payroll run
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|uuid|exists:companies,id',
            'cycle_name' => 'required|string|max:150',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'disbursement_date' => 'required|date',
        ]);

        $company = Company::findOrFail($validated['company_id']);
        $tenantId = $request->user()->tenant_id;
        $isEgypt = ($company->country_code === 'EGY');

        return DB::transaction(function () use ($validated, $company, $tenantId, $isEgypt) {
            $run = PayrollRun::create([
                'tenant_id' => $tenantId,
                'company_id' => $company->id,
                'cycle_name' => $validated['cycle_name'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'disbursement_date' => $validated['disbursement_date'],
                'status' => 'CALCULATED',
            ]);

            $employees = Employee::with(['currentSalary', 'profile'])
                ->where('company_id', $company->id)
                ->where('employment_status', 'ACTIVE')
                ->get();

            $totalGross = 0.0;
            $totalSocialInsurance = 0.0;
            $totalIncomeTax = 0.0;
            $totalNet = 0.0;

            foreach ($employees as $emp) {
                $salary = $emp->currentSalary;
                if (!$salary) continue;

                $basic = (float) $salary->base_salary;
                $housing = (float) $salary->housing_allowance;
                $transport = (float) $salary->transportation_allowance;
                $other = (float) $salary->other_allowances;

                if ($isEgypt) {
                    $calc = $this->egyptService->computeMonthlyPayroll($basic, $housing + $transport, $other);
                    $eeSI = $calc['employee_social_insurance'];
                    $erSI = $calc['employer_social_insurance'];
                    $tax = $calc['income_tax'];
                    $net = $calc['net_salary'];
                } else {
                    $calc = $this->saudiService->computeMonthlyPayroll($basic, $housing, $transport + $other, $emp->is_national);
                    $eeSI = $calc['employee_gosi'];
                    $erSI = $calc['employer_gosi'];
                    $tax = 0.00;
                    $net = $calc['net_salary'];
                }

                $gross = $basic + $housing + $transport + $other;

                Payslip::create([
                    'payroll_run_id' => $run->id,
                    'employee_id' => $emp->id,
                    'gross_earnings' => $gross,
                    'employee_social_insurance' => $eeSI,
                    'employer_social_insurance' => $erSI,
                    'income_tax' => $tax,
                    'unpaid_leave_deductions' => 0.00,
                    'other_deductions' => 0.00,
                    'net_pay' => $net,
                ]);

                $totalGross += $gross;
                $totalSocialInsurance += $eeSI;
                $totalIncomeTax += $tax;
                $totalNet += $net;
            }

            $run->update([
                'total_gross' => $totalGross,
                'total_social_insurance' => $totalSocialInsurance,
                'total_income_tax' => $totalIncomeTax,
                'total_net' => $totalNet,
            ]);

            return response()->json([
                'success' => true,
                'message' => __('messages.payroll_calculated'),
                'data' => $run->load('payslips.employee'),
            ], 201);
        });
    }

    /**
     * Adjust a specific payslip line in a calculated run
     */
    public function adjustPayslip(Request $request, string $runId, string $payslipId): JsonResponse
    {
        $validated = $request->validate([
            'other_deductions' => 'nullable|numeric|min:0',
            'unpaid_leave_deductions' => 'nullable|numeric|min:0',
            'adjustment_reason' => 'required|string|max:255',
        ]);

        $run = PayrollRun::findOrFail($runId);
        if ($run->status === 'FINANCE_APPROVED' || $run->status === 'DISBURSED' || $run->status === 'CLOSED') {
            return response()->json(['success' => false, 'message' => 'Cannot adjust finalized or disbursed payroll.'], 422);
        }

        $payslip = Payslip::where('payroll_run_id', $run->id)->findOrFail($payslipId);

        $unpaidDed = (float) ($validated['unpaid_leave_deductions'] ?? $payslip->unpaid_leave_deductions);
        $otherDed = (float) ($validated['other_deductions'] ?? $payslip->other_deductions);

        $newNet = $payslip->gross_earnings - $payslip->employee_social_insurance - $payslip->income_tax - $unpaidDed - $otherDed;

        $payslip->update([
            'unpaid_leave_deductions' => $unpaidDed,
            'other_deductions' => $otherDed,
            'net_pay' => max(0, $newNet),
        ]);

        $newTotalNet = $run->payslips()->sum('net_pay');
        $run->update(['total_net' => $newTotalNet]);

        return response()->json([
            'success' => true,
            'message' => 'Payslip line adjusted successfully',
            'data' => $payslip,
        ]);
    }

    /**
     * Approve payroll run for disbursement
     */
    public function approve(string $id): JsonResponse
    {
        $run = PayrollRun::findOrFail($id);
        $run->update(['status' => 'FINANCE_APPROVED']);

        return response()->json([
            'success' => true,
            'message' => 'Payroll run approved and authorized for bank disbursement',
            'data' => $run,
        ]);
    }

    /**
     * Export Saudi Wage Protection System (WPS / Mudad SIF file)
     */
    public function exportWpsSif(string $id): StreamedResponse
    {
        $run = PayrollRun::with(['company', 'payslips.employee.profile'])->findOrFail($id);
        $company = $run->company;

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"WPS_{$run->id}.csv\"",
        ];

        return response()->stream(function () use ($run, $company) {
            $handle = fopen('php://output', 'w');

            // Header Record (SCR)
            fputcsv($handle, [
                'SCR',
                $company->commercial_registration_no ?? '1010000000',
                $company->bank_code ?? 'RJHI',
                now()->format('Ymd'),
                now()->format('Hi'),
                'RUN' . substr($run->id, 0, 8),
                $company->primary_iban ?? 'SA0000000000000000000000',
                $run->total_net,
                $run->payslips->count(),
                $company->currency ?? 'SAR'
            ]);

            // Employee Records (EDR)
            foreach ($run->payslips as $payslip) {
                $emp = $payslip->employee;
                fputcsv($handle, [
                    'EDR',
                    $emp->profile?->national_id_encrypted ? decrypt($emp->profile->national_id_encrypted) : $emp->employee_number,
                    $emp->full_name,
                    'SA0000000000000000000000',
                    $company->bank_code ?? 'RJHI',
                    $payslip->gross_earnings,
                    0.00,
                    0.00,
                    $payslip->employee_social_insurance,
                    $emp->employee_number
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
