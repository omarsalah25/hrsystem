<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkShift extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'code',
        'name_ar',
        'name_en',
        'start_time',
        'end_time',
        'break_minutes',
        'daily_hours',
        'grace_period_minutes',
        'is_ramadan_shift',
        'overtime_multiplier',
    ];

    protected $casts = [
        'is_ramadan_shift' => 'boolean',
        'daily_hours' => 'float',
        'overtime_multiplier' => 'float',
    ];
}

