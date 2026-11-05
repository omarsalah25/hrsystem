<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GrievanceCase extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'complainant_employee_id',
        'respondent_employee_id',
        'case_number',
        'category',
        'incident_description',
        'is_confidential',
        'status',
        'resolution_notes',
    ];

    protected $casts = [
        'is_confidential' => 'boolean',
    ];

    public function complainant(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'complainant_employee_id');
    }

    public function respondent(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'respondent_employee_id');
    }
}

