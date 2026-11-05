<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'job_opening_id',
        'candidate_name',
        'candidate_email',
        'candidate_phone',
        'cv_document_path',
        'stage',
        'scorecard_rating',
        'expected_salary',
        'interviewer_feedback',
    ];

    protected $casts = [
        'scorecard_rating' => 'integer',
        'expected_salary' => 'decimal:2',
    ];

    public function jobOpening(): BelongsTo
    {
        return $this->belongsTo(JobOpening::class);
    }
}

