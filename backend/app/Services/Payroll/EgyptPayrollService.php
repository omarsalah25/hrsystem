<?php

declare(strict_types=1);

namespace App\Services\Payroll;

/**
 * Egyptian Statutory Payroll Calculator
 * Implements Social Insurance Law 148 (2019) and Income Tax Law 30 (2023 / 2024 Presidential Decrees)
 */
class EgyptPayrollService
{
    // 2024 Insurable Wage Statutory Limits (EGP)
    public const MIN_INSURABLE_WAGE = 2000.00;
    public const MAX_INSURABLE_WAGE = 12600.00;

    // Social Insurance Contribution Rates
    public const EMPLOYEE_SI_RATE = 0.11;     // 11%
    public const EMPLOYER_SI_RATE = 0.1875;   // 18.75%
    public const EMERGENCY_FUND_RATE = 0.01;  // 1%
    public const MARTYRS_FUND_RATE = 0.0005;  // 0.05%
    public const HEALTH_INSURANCE_RATE = 0.01;// 1% Comprehensive Health Insurance

    // Annual Personal Tax Exemption (2024 Decree)
    public const ANNUAL_PERSONAL_EXEMPTION = 20000.00;

    /**
     * Compute full Egyptian statutory monthly deduction breakdown
     */
    public function computeMonthlyPayroll(
        float $basicSalary,
        float $fixedAllowances = 0.0,
        float $variableAllowances = 0.0,
        float $unpaidAbsenceDeductions = 0.0
    ): array {
        $grossSalary = $basicSalary + $fixedAllowances + $variableAllowances;

        // 1. Social Insurance Insurable Wage Calculation (Capped)
        $contributoryWage = min(max($basicSalary + $fixedAllowances, self::MIN_INSURABLE_WAGE), self::MAX_INSURABLE_WAGE);

        $employeeSocialInsurance = round($contributoryWage * self::EMPLOYEE_SI_RATE, 2);
        $employerSocialInsurance = round($contributoryWage * self::EMPLOYER_SI_RATE, 2);
        $emergencyFund = round($basicSalary * self::EMERGENCY_FUND_RATE, 2);
        $martyrsFund = round($grossSalary * self::MARTYRS_FUND_RATE, 2);
        $healthInsurance = round($grossSalary * self::HEALTH_INSURANCE_RATE, 2);

        // 2. Personal Income Tax Calculation
        $annualGross = $grossSalary * 12;
        $annualEmployeeSI = $employeeSocialInsurance * 12;
        $monthlyIncomeTax = $this->calculateMonthlyIncomeTax($annualGross, $annualEmployeeSI);

        // 3. Net Salary Calculation
        $totalEmployeeDeductions = $employeeSocialInsurance 
            + $monthlyIncomeTax 
            + $healthInsurance 
            + $martyrsFund 
            + $unpaidAbsenceDeductions;

        $netSalary = max(0.00, round($grossSalary - $totalEmployeeDeductions, 2));

        return [
            'gross_salary' => $grossSalary,
            'insurable_wage' => $contributoryWage,
            'employee_social_insurance' => $employeeSocialInsurance,
            'employer_social_insurance' => $employerSocialInsurance,
            'emergency_fund_employer' => $emergencyFund,
            'martyrs_fund' => $martyrsFund,
            'health_insurance_employee' => $healthInsurance,
            'income_tax' => $monthlyIncomeTax,
            'unpaid_absence_deductions' => $unpaidAbsenceDeductions,
            'total_deductions' => $totalEmployeeDeductions,
            'net_salary' => $netSalary,
        ];
    }

    /**
     * Calculate monthly income tax from annualized taxable base using progressive tax brackets
     */
    public function calculateMonthlyIncomeTax(float $annualGross, float $annualEmployeeSI): float
    {
        // Net Taxable Income = Annual Gross - Employee SI - Personal Exemption
        $taxableIncome = $annualGross - $annualEmployeeSI - self::ANNUAL_PERSONAL_EXEMPTION;

        if ($taxableIncome <= 0) {
            return 0.00;
        }

        $tax = 0.0;

        // Bracket 1: 0 to 40,000 @ 0% (Tax exempt)
        // Bracket 2: 40,001 to 55,000 (15,000) @ 10%
        if ($taxableIncome > 40000) {
            $tax += min($taxableIncome - 40000, 15000) * 0.10;
        }
        // Bracket 3: 55,001 to 70,000 (15,000) @ 15%
        if ($taxableIncome > 55000) {
            $tax += min($taxableIncome - 55000, 15000) * 0.15;
        }
        // Bracket 4: 70,001 to 200,000 (130,000) @ 20%
        if ($taxableIncome > 70000) {
            $tax += min($taxableIncome - 70000, 130000) * 0.20;
        }
        // Bracket 5: 200,001 to 400,000 (200,000) @ 22.5%
        if ($taxableIncome > 200000) {
            $tax += min($taxableIncome - 200000, 200000) * 0.225;
        }
        // Bracket 6: 400,001 to 1,200,000 (800,000) @ 25%
        if ($taxableIncome > 400000) {
            $tax += min($taxableIncome - 400000, 800000) * 0.25;
        }
        // Bracket 7: > 1,200,000 @ 27.5%
        if ($taxableIncome > 1200000) {
            $tax += ($taxableIncome - 1200000) * 0.275;
        }

        return round($tax / 12, 2);
    }
}

