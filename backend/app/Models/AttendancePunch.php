<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendancePunch extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    const UPDATED_AT = null;

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'punch_time',
        'punch_type',
        'source',
        'device_serial',
        'latitude',
        'longitude',
        'is_within_geofence',
    ];

    protected $casts = [
        'punch_time' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_within_geofence' => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}

