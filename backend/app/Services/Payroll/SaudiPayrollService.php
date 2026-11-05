<?php

declare(strict_types=1);

namespace App\Services\Payroll;

/**
 * Saudi Arabia & GCC Statutory Payroll Calculator
 * Implements GOSI Social Insurance, SANED, and Wage Protection System (WPS) calculations
 */
class SaudiPayrollService
{
    public const MIN_SAUDI_WAGE = 1500.00;
    public const MIN_EXPAT_WAGE = 400.00;
    public const MAX_CONTRIBUTORY_WAGE = 45000.00;

    // Saudi National Rates
    public const SAUDI_EE_PENSION_RATE = 0.09;   // 9%
    public const SAUDI_EE_SANED_RATE = 0.0075;   // 0.75%
    public const SAUDI_ER_PENSION_RATE = 0.09;   // 9%
    public const SAUDI_ER_SANED_RATE = 0.0075;   // 0.75%
    public const SAUDI_ER_HAZARDS_RATE = 0.02;   // 2%

    // Expatriate Rates
    public const EXPAT_ER_HAZARDS_RATE = 0.02;   // 2% Employer only

    /**
     * Compute Saudi GOSI and net salary breakdown
     */
    public function computeMonthlyPayroll(
        float $basicSalary,
        float $housingAllowance = 0.0,
        float $otherAllowances = 0.0,
        bool $isSaudiNational = true,
        float $unpaidAbsenceDeductions = 0.0,
        float $otherDeductions = 0.0
    ): array {
        $grossSalary = $basicSalary + $housingAllowance + $otherAllowances;

        // GOSI Contributory Wage = Basic Salary + Housing Allowance
        $contributoryWage = $basicSalary + $housingAllowance;
        $minWage = $isSaudiNational ? self::MIN_SAUDI_WAGE : self::MIN_EXPAT_WAGE;
        $cappedContributoryWage = min(max($contributoryWage, $minWage), self::MAX_CONTRIBUTORY_WAGE);

        if ($isSaudiNational) {
            // Employee Share: 9% Pension + 0.75% SANED = 9.75%
            $employeeGosi = round($cappedContributoryWage * (self::SAUDI_EE_PENSION_RATE + self::SAUDI_EE_SANED_RATE), 2);
            // Employer Share: 9% Pension + 0.75% SANED + 2% Hazards = 11.75%
            $employerGosi = round($cappedContributoryWage * (self::SAUDI_ER_PENSION_RATE + self::SAUDI_ER_SANED_RATE + self::SAUDI_ER_HAZARDS_RATE), 2);
        } else {
            // Expatriates: 0% employee share, 2% employer occupational hazards
            $employeeGosi = 0.00;
            $employerGosi = round($cappedContributoryWage * self::EXPAT_ER_HAZARDS_RATE, 2);
        }

        $totalDeductions = $employeeGosi + $unpaidAbsenceDeductions + $otherDeductions;
        $netSalary = max(0.00, round($grossSalary - $totalDeductions, 2));

        return [
            'gross_salary' => $grossSalary,
            'contributory_wage' => $cappedContributoryWage,
            'is_saudi_national' => $isSaudiNational,
            'employee_gosi' => $employeeGosi,
            'employer_gosi' => $employerGosi,
            'unpaid_absence_deductions' => $unpaidAbsenceDeductions,
            'other_deductions' => $otherDeductions,
            'total_deductions' => $totalDeductions,
            'net_salary' => $netSalary,
        ];
    }
}

