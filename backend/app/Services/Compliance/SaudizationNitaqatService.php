<?php

declare(strict_types=1);

namespace App\Services\Compliance;

use App\Models\Company;
use App\Models\Employee;

class SaudizationNitaqatService
{
    /**
     * Compute Nitaqat category, weighted percentage, and visa quota status for a Saudi company
     */
    public function compute(string $companyId): array
    {
        $company = Company::findOrFail($companyId);

        $employees = Employee::where('company_id', $companyId)
            ->where('employment_status', 'ACTIVE')
            ->get();

        $totalHeadcount = $employees->count();
        if ($totalHeadcount === 0) {
            return [
                'company_name' => $company->legal_name,
                'total_headcount' => 0,
                'saudi_count' => 0,
                'expat_count' => 0,
                'saudization_percentage' => 0.0,
                'nitaqat_tier' => 'NOT_APPLICABLE',
                'nitaqat_color' => 'GRAY',
                'status_message_ar' => 'لا يوجد موظفون نشطون مسجلون في المنشأة.',
            ];
        }

        $saudiCount = $employees->where('is_national', true)->count();
        $expatCount = $totalHeadcount - $saudiCount;

        $rawPercentage = round(($saudiCount / $totalHeadcount) * 100, 2);

        // Determine Nitaqat Color Tier (Standard ICT & Services sector bands)
        // >= 40%: Platinum
        // 27% - 39.99%: High Green
        // 20% - 26.99%: Mid Green
        // 12% - 19.99%: Low Green
        // < 12%: Red
        if ($rawPercentage >= 40.0) {
            $tier = 'PLATINUM';
            $color = 'PLATINUM';
            $tierNameAr = 'النطاق البلاتيني';
            $canIssueVisas = true;
            $statusMessageAr = 'المنشأة في النطاق البلاتيني، يحق لها إصدار تأشيرات فورية ونقل خدمات العمالة بحرية كاملة.';
        } elseif ($rawPercentage >= 27.0) {
            $tier = 'HIGH_GREEN';
            $color = 'GREEN';
            $tierNameAr = 'الأخضر المرتفع';
            $canIssueVisas = true;
            $statusMessageAr = 'المنشأة في النطاق الأخضر المرتفع، مؤهلة للحصول على تأشيرات العمل وفق الرصيد المتاح.';
        } elseif ($rawPercentage >= 20.0) {
            $tier = 'MID_GREEN';
            $color = 'GREEN';
            $tierNameAr = 'الأخضر المتوسط';
            $canIssueVisas = true;
            $statusMessageAr = 'المنشأة في النطاق الأخضر المتوسط، مطابقة للحد الأدنى من نسب التوطين.';
        } elseif ($rawPercentage >= 12.0) {
            $tier = 'LOW_GREEN';
            $color = 'YELLOW';
            $tierNameAr = 'الأخضر المنخفض';
            $canIssueVisas = false;
            $statusMessageAr = 'المنشأة في النطاق الأخضر المنخفض؛ تم إيقاف إصدار التأشيرات الجديدة حتى تحسين نسبة التوطين.';
        } else {
            $tier = 'RED';
            $color = 'RED';
            $tierNameAr = 'النطاق الأحمر';
            $canIssueVisas = false;
            $statusMessageAr = 'تحذير: المنشأة في النطاق الأحمر. تم تجميد خدمات وزارة الموارد البشرية وإصدار وتجديد الرخص.';
        }

        return [
            'company_name' => $company->legal_name,
            'total_headcount' => $totalHeadcount,
            'saudi_count' => $saudiCount,
            'expat_count' => $expatCount,
            'saudization_percentage' => $rawPercentage,
            'nitaqat_tier' => $tier,
            'nitaqat_color' => $color,
            'tier_name_ar' => $tierNameAr,
            'can_issue_visas' => $canIssueVisas,
            'status_message_ar' => $statusMessageAr,
        ];
    }
}

