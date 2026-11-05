<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantId = null;

            if (request()->hasHeader('X-Tenant-ID')) {
                $tenantId = request()->header('X-Tenant-ID');
            } elseif (request()->user()) {
                $tenantId = request()->user()->tenant_id;
            } elseif (app()->bound('current_tenant_id')) {
                $tenantId = app('current_tenant_id');
            }

            if ($tenantId) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
            }
        });

        static::creating(function ($model) {
            if (!$model->tenant_id) {
                $tenantId = null;

                if (request()->hasHeader('X-Tenant-ID')) {
                    $tenantId = request()->header('X-Tenant-ID');
                } elseif (request()->user()) {
                    $tenantId = request()->user()->tenant_id;
                } elseif (app()->bound('current_tenant_id')) {
                    $tenantId = app('current_tenant_id');
                }

                if ($tenantId) {
                    $model->tenant_id = $tenantId;
                }
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
