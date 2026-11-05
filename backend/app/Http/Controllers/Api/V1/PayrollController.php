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
                    // Egypt Statutory Calculation
                    $calc = $this->egyptService->computeMonthlyPayroll($basic, $housing + $transport, $other);
                    $eeSI = $calc['employee_social_insurance'];
                    $erSI = $calc['employer_social_insurance'];
                    $tax = $calc['income_tax'];
                    $net = $calc['net_salary'];
                } else {
                    // Saudi Arabia / GCC Calculation
                    $calc = $this->saudiService->computeMonthlyPayroll($basic, $housing, $transport + $other, $emp->is_national);
                    $eeSI = $calc['employee_gosi'];
                    $erSI = $calc['employer_gosi'];
                    $tax = 0.00; // No personal income tax in Saudi Arabia
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
                    'SA0000000000000000000000', // IBAN
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

