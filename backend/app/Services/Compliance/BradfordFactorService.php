<?php

declare(strict_types=1);

namespace App\Services\Compliance;

use App\Models\AttendanceRecord;
use App\Models\Employee;

class BradfordFactorService
{
    /**
     * Calculate Bradford Factor for an employee or company
     * Formula: B = S^2 * D
     */
    public function computeForEmployee(string $employeeId): array
    {
        $employee = Employee::with(['department', 'designation'])->findOrFail($employeeId);

        // Fetch absent records over the last 365 days
        $absences = AttendanceRecord::where('employee_id', $employeeId)
            ->where('status', 'ABSENT')
            ->where('date', '>=', now()->subDays(365)->toDateString())
            ->orderBy('date', 'asc')
            ->get();

        $totalAbsentDays = $absences->count();

        // Calculate consecutive absence spells (S)
        $spells = 0;
        $prevDate = null;

        foreach ($absences as $record) {
            $currentDate = new \DateTime($record->date);
            if ($prevDate === null) {
                $spells = 1;
            } else {
                $interval = $prevDate->diff($currentDate)->days;
                if ($interval > 1) {
                    $spells++;
                }
            }
            $prevDate = $currentDate;
        }

        $bradfordScore = ($spells * $spells) * $totalAbsentDays;

        if ($bradfordScore >= 500) {
            $riskTier = 'CRITICAL';
            $recommendedActionAr = 'إحالة إلى التحقيق الإداري ومراجعة الاستمرار في التعاقد (مستوى حرج).';
        } elseif ($bradfordScore >= 201) {
            $riskTier = 'DISCIPLINARY';
            $recommendedActionAr = 'إنذار كتابي رسمي وتدقيق أسباب الانقطاع المتكرر.';
        } elseif ($bradfordScore >= 51) {
            $riskTier = 'CAUTION';
            $recommendedActionAr = 'جلسة استماع ومناقشة الدوافع مع المدير المباشر.';
        } else {
            $riskTier = 'NORMAL';
            $recommendedActionAr = 'سجل انتظام طبيعي ومقبول.';
        }

        return [
            'employee_id' => $employee->id,
            'employee_name' => $employee->full_name,
            'employee_number' => $employee->employee_number,
            'department' => $employee->department?->name ?? 'العام',
            'absence_spells_count' => $spells,
            'total_absent_days' => $totalAbsentDays,
            'bradford_score' => $bradfordScore,
            'risk_tier' => $riskTier,
            'recommended_action_ar' => $recommendedActionAr,
        ];
    }
}

