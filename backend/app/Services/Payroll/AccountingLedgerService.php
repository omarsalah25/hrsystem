<?php

declare(strict_types=1);

namespace App\Services\Payroll;

use App\Models\PayrollRun;

class AccountingLedgerService
{
    /**
     * Generate double-entry General Ledger (GL) journal voucher for a payroll run
     */
    public function generateJournalVoucher(PayrollRun $run): array
    {
        $run->load(['company', 'payslips']);

        $currency = $run->company->currency ?? 'SAR';
        $isKSA = ($run->company->country_code === 'SAU');

        $totalGross = (float) $run->total_gross;
        $totalEmployeeSI = (float) $run->total_social_insurance;
        $totalEmployerSI = (float) $run->payslips->sum('employer_social_insurance');
        $totalTax = (float) $run->total_income_tax;
        $totalUnpaidAndOtherDeductions = (float) ($run->payslips->sum('unpaid_leave_deductions') + $run->payslips->sum('other_deductions'));
        $totalNet = (float) $run->total_net;

        $journalEntries = [];
        $line = 1;

        // 1. DEBIT: Gross Salary & Allowance Expense (Account 5101)
        $journalEntries[] = [
            'line' => $line++,
            'account_code' => '5101',
            'account_name_ar' => 'مصروفات الرواتب والأجور الشاملة',
            'account_name_en' => 'Gross Salaries & Wages Expense',
            'debit' => $totalGross,
            'credit' => 0.00,
            'currency' => $currency,
        ];

        // 2. DEBIT: Employer Statutory Social Insurance / GOSI Expense (Account 5102)
        $siAccountNameAr = $isKSA ? 'مساهمة المنشأة في التأمينات الاجتماعية (GOSI ER)' : 'حصة المنشأة في التأمينات الاجتماعية (قانون 148)';
        $journalEntries[] = [
            'line' => $line++,
            'account_code' => '5102',
            'account_name_ar' => $siAccountNameAr,
            'account_name_en' => 'Employer Social Insurance Contribution Expense',
            'debit' => $totalEmployerSI,
            'credit' => 0.00,
            'currency' => $currency,
        ];

        // 3. CREDIT: Total Social Insurance Payable (Employee + Employer) (Account 2101)
        $totalSIPayable = $totalEmployeeSI + $totalEmployerSI;
        $journalEntries[] = [
            'line' => $line++,
            'account_code' => '2101',
            'account_name_ar' => 'مستحقات هيئة التأمينات الاجتماعية الدائنة',
            'account_name_en' => 'Social Insurance / GOSI Authority Payable',
            'debit' => 0.00,
            'credit' => $totalSIPayable,
            'currency' => $currency,
        ];

        // 4. CREDIT: Withholding Income Tax Payable (Account 2103) - Egypt Law 30
        if ($totalTax > 0) {
            $journalEntries[] = [
                'line' => $line++,
                'account_code' => '2103',
                'account_name_ar' => 'ضريبة كسب العمل المستحقة لمصلحة الضرائب',
                'account_name_en' => 'Withholding Payroll Tax Payable (ETA)',
                'debit' => 0.00,
                'credit' => $totalTax,
                'currency' => $currency,
            ];
        }

        // 5. CREDIT: Accrued Deductions & Absenteeism Clearing (Account 2104)
        if ($totalUnpaidAndOtherDeductions > 0) {
            $journalEntries[] = [
                'line' => $line++,
                'account_code' => '2104',
                'account_name_ar' => 'حساب تسوية خصومات الغياب والجزاءات',
                'account_name_en' => 'Payroll Penalties & Unpaid Absence Clearing',
                'debit' => 0.00,
                'credit' => $totalUnpaidAndOtherDeductions,
                'currency' => $currency,
            ];
        }

        // 6. CREDIT: Net Salaries Payable / Bank Clearing (Account 2105)
        $journalEntries[] = [
            'line' => $line++,
            'account_code' => '2105',
            'account_name_ar' => 'صافي مسير الرواتب المستحق للتحويل البنكي (WPS)',
            'account_name_en' => 'Net Salaries Payable / Bank Clearing',
            'debit' => 0.00,
            'credit' => $totalNet,
            'currency' => $currency,
        ];

        // Verification of Debits == Credits
        $sumDebits = array_sum(array_column($journalEntries, 'debit'));
        $sumCredits = array_sum(array_column($journalEntries, 'credit'));
        $variance = round($sumDebits - $sumCredits, 2);

        return [
            'voucher_number' => 'JV-PAY-' . substr($run->id, 0, 8),
            'voucher_date' => $run->disbursement_date,
            'cycle_name' => $run->cycle_name,
            'company_name' => $run->company->legal_name,
            'currency' => $currency,
            'total_debit' => round($sumDebits, 2),
            'total_credit' => round($sumCredits, 2),
            'variance' => $variance,
            'is_balanced' => ($variance === 0.00),
            'entries' => $journalEntries,
        ];
    }
}

