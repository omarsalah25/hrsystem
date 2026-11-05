<?php

declare(strict_types=1);

namespace App\Services\Payroll;

/**
 * Saudi Labor Law End of Service Award (ESB - مكافأة نهاية الخدمة) Calculator
 * Implements Articles 84, 85, and 87 of Saudi Labor Law
 */
class EndOfServiceService
{
    /**
     * Compute statutory end of service award based on tenure, final wage, and separation reason
     *
     * @param float $lastFullSalary Last wage (Basic + Housing + recurring allowances)
     * @param float $serviceYears Total continuous service in years (e.g., 4.5)
     * @param string $separationReason 'TERMINATION', 'CONTRACT_EXPIRED', 'RESIGNATION', 'MARRIAGE_FEMALE'
     * @param bool $isFemale
     * @return array
     */
    public function calculate(
        float $lastFullSalary,
        float $serviceYears,
        string $separationReason = 'RESIGNATION',
        bool $isFemale = false
    ): array {
        if ($serviceYears < (1.0 / 12.0)) {
            return [
                'base_entitlement' => 0.00,
                'reduction_factor' => 0.0,
                'final_award_amount' => 0.00,
                'statutory_article' => 'Article 84',
            ];
        }

        // 1. Calculate Base Entitlement (Article 84)
        // Half month salary for each of first 5 years + full month salary for each subsequent year
        $baseEntitlement = 0.0;
        if ($serviceYears <= 5.0) {
            $baseEntitlement = ($lastFullSalary / 2.0) * $serviceYears;
        } else {
            $firstFiveYears = ($lastFullSalary / 2.0) * 5.0;
            $remainingYears = $serviceYears - 5.0;
            $baseEntitlement = $firstFiveYears + ($lastFullSalary * $remainingYears);
        }

        // 2. Evaluate Reduction Factor (Article 85 & 87)
        $factor = 1.0;
        $article = 'Article 84 (Full Award)';

        if ($separationReason === 'MARRIAGE_FEMALE' && $isFemale) {
            $factor = 1.0;
            $article = 'Article 87 (Female Marriage/Childbirth Exemption)';
        } elseif ($separationReason === 'RESIGNATION') {
            $article = 'Article 85 (Resignation Tiers)';
            if ($serviceYears < 2.0) {
                $factor = 0.0; // Under 2 years = No award
            } elseif ($serviceYears <= 5.0) {
                $factor = 1.0 / 3.0; // 1/3 between 2 and 5 years
            } elseif ($serviceYears <= 10.0) {
                $factor = 2.0 / 3.0; // 2/3 between 5 and 10 years
            } else {
                $factor = 1.0; // Over 10 years = Full award
            }
        }

        $finalAward = round($baseEntitlement * $factor, 2);

        return [
            'service_years' => round($serviceYears, 2),
            'last_full_salary' => $lastFullSalary,
            'base_entitlement' => round($baseEntitlement, 2),
            'reduction_factor' => round($factor, 4),
            'final_award_amount' => $finalAward,
            'statutory_article' => $article,
        ];
    }
}

