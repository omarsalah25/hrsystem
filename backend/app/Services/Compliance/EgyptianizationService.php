<?php

declare(strict_types=1);

namespace App\Services\Compliance;

use App\Models\Company;
use App\Models\Employee;

class EgyptianizationService
{
    /**
     * Verify Egyptianization quota under Law 12 of 2003 Article 28
     * (Workforce >= 90% Egyptian, Wages >= 80% Egyptian)
     */
    public function compute(string $companyId): array
    {
        $company = Company::findOrFail($companyId);

        $employees = Employee::with('currentSalary')
            ->where('company_id', $companyId)
            ->where('employment_status', 'ACTIVE')
            ->get();

        $totalHeadcount = $employees->count();
        if ($totalHeadcount === 0) {
            return [
                'company_name' => $company->legal_name,
                'total_headcount' => 0,
                'egyptian_count' => 0,
                'foreign_count' => 0,
                'egyptian_headcount_percentage' => 0.0,
                'is_headcount_compliant' => true,
                'total_wages' => 0.00,
                'egyptian_wages_percentage' => 0.0,
                'is_wages_compliant' => true,
                'is_fully_compliant' => true,
            ];
        }

        $egyptianEmployees = $employees->filter(fn($e) => $e->is_national === true);
        $egyptianCount = $egyptianEmployees->count();
        $foreignCount = $totalHeadcount - $egyptianCount;

        $headcountPercentage = round(($egyptianCount / $totalHeadcount) * 100, 2);
        $isHeadcountCompliant = ($headcountPercentage >= 90.0);

        // Wage Quota
        $totalWages = 0.0;
        $egyptianWages = 0.0;

        foreach ($employees as $emp) {
            $salary = $emp->currentSalary;
            if ($salary) {
                $gross = (float) $salary->base_salary + (float) $salary->housing_allowance + (float) $salary->transportation_allowance + (float) $salary->other_allowances;
                $totalWages += $gross;
                if ($emp->is_national) {
                    $egyptianWages += $gross;
                }
            }
        }

        $wagesPercentage = ($totalWages > 0) ? round(($egyptianWages / $totalWages) * 100, 2) : 100.0;
        $isWagesCompliant = ($wagesPercentage >= 80.0);

        $isFullyCompliant = $isHeadcountCompliant && $isWagesCompliant;

        return [
            'company_name' => $company->legal_name,
            'total_headcount' => $totalHeadcount,
            'egyptian_count' => $egyptianCount,
            'foreign_count' => $foreignCount,
            'egyptian_headcount_percentage' => $headcountPercentage,
            'statutory_headcount_target' => 90.0,
            'is_headcount_compliant' => $isHeadcountCompliant,
            'total_wages' => round($totalWages, 2),
            'egyptian_wages_percentage' => $wagesPercentage,
            'statutory_wages_target' => 80.0,
            'is_wages_compliant' => $isWagesCompliant,
            'is_fully_compliant' => $isFullyCompliant,
            'legal_reference' => 'قانون العمل المصري رقم 12 لسنة 2003 (مادة 28)',
            'status_message_ar' => $isFullyCompliant
                ? 'المنشأة مستوفية لنسبة تشغيل العمالة المصرية (90%) وحصة الأجور (80%) قانوناً.'
                : 'تحذير: المنشأة تجاوزت النسبة القانونية للعمالة الأجنبية أو حصة أجورهم المقررة.',
        ];
    }
}

