<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollRun extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'company_id',
        'cycle_name',
        'start_date',
        'end_date',
        'disbursement_date',
        'total_gross',
        'total_social_insurance',
        'total_income_tax',
        'total_net',
        'status',
        'wps_sif_file_path',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'disbursement_date' => 'date',
        'total_gross' => 'decimal:2',
        'total_social_insurance' => 'decimal:2',
        'total_income_tax' => 'decimal:2',
        'total_net' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }
}

