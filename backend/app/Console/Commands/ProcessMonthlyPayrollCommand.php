<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Company;
use App\Models\Employee;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Services\Payroll\EgyptPayrollService;
use App\Services\Payroll\SaudiPayrollService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProcessMonthlyPayrollCommand extends Command
{
    protected $signature = 'payroll:process-monthly {--company= : Specific company country code (SAU or EGY)}';
    protected $description = 'Process automated monthly payroll statutory calculations for active companies';

    public function handle(EgyptPayrollService $egyptService, SaudiPayrollService $saudiService): int
    {
        $country = $this->option('company');
        $query = Company::query();
        if ($country) {
            $query->where('country_code', strtoupper($country));
        }

        $companies = $query->get();
        if ($companies->isEmpty()) {
            $this->warn('No matching companies found.');
            return Command::SUCCESS;
        }

        $startDate = now()->startOfMonth()->toDateString();
        $endDate = now()->endOfMonth()->toDateString();
        $disburseDate = now()->endOfMonth()->subDays(3)->toDateString();
        $monthName = now()->format('F Y');

        foreach ($companies as $company) {
            $this->info("Processing payroll for: {$company->legal_name} ({$company->country_code})...");

            $isEgypt = ($company->country_code === 'EGY');
            $cycleName = "مسير رواتب {$monthName} - " . ($isEgypt ? 'فرع القاهرة' : 'المقر الرئيسي بالرياض');

            DB::transaction(function () use ($company, $cycleName, $startDate, $endDate, $disburseDate, $isEgypt, $egyptService, $saudiService) {
                $run = PayrollRun::create([
                    'tenant_id' => $company->tenant_id,
                    'company_id' => $company->id,
                    'cycle_name' => $cycleName,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'disbursement_date' => $disburseDate,
                    'status' => 'CALCULATED',
                ]);

                $employees = Employee::with(['currentSalary', 'profile'])
                    ->where('company_id', $company->id)
                    ->where('employment_status', 'ACTIVE')
                    ->get();

                $totalGross = 0.0;
                $totalSI = 0.0;
                $totalTax = 0.0;
                $totalNet = 0.0;

                foreach ($employees as $emp) {
                    $salary = $emp->currentSalary;
                    if (!$salary) continue;

                    $basic = (float) $salary->base_salary;
                    $housing = (float) $salary->housing_allowance;
                    $transport = (float) $salary->transportation_allowance;
                    $other = (float) $salary->other_allowances;

                    if ($isEgypt) {
                        $calc = $egyptService->computeMonthlyPayroll($basic, $housing + $transport, $other);
                        $eeSI = $calc['employee_social_insurance'];
                        $erSI = $calc['employer_social_insurance'];
                        $tax = $calc['income_tax'];
                        $net = $calc['net_salary'];
                    } else {
                        $calc = $saudiService->computeMonthlyPayroll($basic, $housing, $transport + $other, $emp->is_national);
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
                    $totalSI += $eeSI;
                    $totalTax += $tax;
                    $totalNet += $net;
                }

                $run->update([
                    'total_gross' => $totalGross,
                    'total_social_insurance' => $totalSI,
                    'total_income_tax' => $totalTax,
                    'total_net' => $totalNet,
                ]);

                $this->table(
                    ['Metric', 'Amount (' . $company->currency . ')'],
                    [
                        ['Total Gross', number_format($totalGross, 2)],
                        ['Total Social Insurance / GOSI', number_format($totalSI, 2)],
                        ['Total Withholding Tax', number_format($totalTax, 2)],
                        ['Total Net Pay', number_format($totalNet, 2)],
                        ['Employees Processed', $employees->count()],
                    ]
                );
            });
        }

        $this->info('✓ Monthly payroll calculation completed successfully.');
        return Command::SUCCESS;
    }
}

