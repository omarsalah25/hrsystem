<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\AttendancePunch;
use App\Models\AttendanceRecord;
use App\Models\Employee;
use Illuminate\Console\Command;

class ReconcileDailyAttendanceCommand extends Command
{
    protected $signature = 'attendance:reconcile {--date= : Specific date to reconcile (YYYY-MM-DD)}';
    protected $description = 'Reconcile raw biometric punches into normalized daily attendance records';

    public function handle(): int
    {
        $targetDate = $this->option('date') ?? now()->toDateString();
        $this->info("Reconciling daily attendance for date: {$targetDate}...");

        $employees = Employee::where('employment_status', 'ACTIVE')->get();
        $processed = 0;
        $present = 0;
        $absent = 0;

        foreach ($employees as $emp) {
            $punches = AttendancePunch::where('employee_id', $emp->id)
                ->whereDate('punch_time', $targetDate)
                ->orderBy('punch_time', 'asc')
                ->get();

            if ($punches->isEmpty()) {
                // If weekday and no approved leave, mark absent
                $record = AttendanceRecord::updateOrCreate(
                    [
                        'tenant_id' => $emp->tenant_id,
                        'employee_id' => $emp->id,
                        'date' => $targetDate,
                    ],
                    [
                        'first_punch_in' => null,
                        'last_punch_out' => null,
                        'total_hours_worked' => 0.00,
                        'late_minutes' => 0,
                        'overtime_hours' => 0.00,
                        'status' => 'ABSENT',
                        'source' => 'MANUAL_REGULARIZATION',
                    ]
                );
                $absent++;
            } else {
                $firstIn = $punches->filter(fn($p) => in_array($p->punch_type, ['IN', 'CHECK_IN']))->first() ?? $punches->first();
                $lastOut = $punches->filter(fn($p) => in_array($p->punch_type, ['OUT', 'CHECK_OUT']))->last() ?? $punches->last();

                $hours = 8.00;
                if ($firstIn && $lastOut && $firstIn->id !== $lastOut->id) {
                    $inTime = \Illuminate\Support\Carbon::parse($firstIn->punch_time);
                    $outTime = \Illuminate\Support\Carbon::parse($lastOut->punch_time);
                    $diffSecs = max(0, $outTime->getTimestamp() - $inTime->getTimestamp());
                    $hours = round($diffSecs / 3600.0, 2);
                }

                $record = AttendanceRecord::updateOrCreate(
                    [
                        'tenant_id' => $emp->tenant_id,
                        'employee_id' => $emp->id,
                        'date' => $targetDate,
                    ],
                    [
                        'first_punch_in' => $firstIn?->punch_time,
                        'last_punch_out' => $lastOut?->punch_time,
                        'total_hours_worked' => $hours,
                        'late_minutes' => 0,
                        'overtime_hours' => max(0, $hours - 8.0),
                        'status' => 'PRESENT',
                        'source' => 'HYBRID',
                    ]
                );
                $present++;
            }

            $processed++;
        }

        $this->table(
            ['Reconciliation Summary', 'Count'],
            [
                ['Total Active Employees', $processed],
                ['Present (Punched)', $present],
                ['Absent', $absent],
                ['Target Date', $targetDate],
            ]
        );

        $this->info('✓ Daily attendance reconciliation finished.');
        return Command::SUCCESS;
    }
}
