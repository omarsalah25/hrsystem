<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'date',
        'shift_id',
        'first_punch_in',
        'last_punch_out',
        'total_hours_worked',
        'late_minutes',
        'overtime_hours',
        'status',
        'source',
        'is_regularized',
    ];

    protected $casts = [
        'date' => 'date',
        'first_punch_in' => 'datetime',
        'last_punch_out' => 'datetime',
        'total_hours_worked' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'is_regularized' => 'boolean',
        'late_minutes' => 'integer',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}

