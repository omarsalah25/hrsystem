<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payslip extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'payroll_run_id',
        'employee_id',
        'gross_earnings',
        'employee_social_insurance',
        'employer_social_insurance',
        'income_tax',
        'unpaid_leave_deductions',
        'other_deductions',
        'net_pay',
        'pdf_file_path',
        'is_published',
    ];

    protected $casts = [
        'gross_earnings' => 'decimal:2',
        'employee_social_insurance' => 'decimal:2',
        'employer_social_insurance' => 'decimal:2',
        'income_tax' => 'decimal:2',
        'unpaid_leave_deductions' => 'decimal:2',
        'other_deductions' => 'decimal:2',
        'net_pay' => 'decimal:2',
        'is_published' => 'boolean',
    ];

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}

