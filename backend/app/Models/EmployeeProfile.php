<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeProfile extends Model
{
    use HasFactory;

    protected $primaryKey = 'employee_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'employee_id',
        'national_id_encrypted',
        'iqama_number_encrypted',
        'iqama_expiry_date',
        'passport_number_encrypted',
        'social_insurance_no',
        'date_of_birth',
        'gender',
        'nationality',
        'marital_status',
        'residential_address',
    ];

    protected $casts = [
        'iqama_expiry_date' => 'date',
        'date_of_birth' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}

