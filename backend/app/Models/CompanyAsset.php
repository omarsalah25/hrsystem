<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanyAsset extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'company_id',
        'asset_code',
        'name_ar',
        'name_en',
        'category',
        'serial_number',
        'purchase_value',
        'purchase_date',
        'status',
    ];

    protected $casts = [
        'purchase_value' => 'decimal:2',
        'purchase_date' => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(AssetAssignment::class, 'asset_id');
    }

    public function activeAssignment()
    {
        return $this->hasOne(AssetAssignment::class, 'asset_id')->whereNull('returned_date')->latestOfMany();
    }
}

