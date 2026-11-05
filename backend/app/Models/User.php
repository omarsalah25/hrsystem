<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'tenant_id',
        'role',
        'name',
        'email',
        'password',
        'status',
        'is_two_factor_enabled',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'is_two_factor_enabled' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    /**
     * Role-Based Access Control (RBAC) helpers
     */
    public function hasRole(string|array $roles): bool
    {
        $roleList = is_array($roles) ? $roles : explode(',', $roles);
        $roleList = array_map('trim', $roleList);

        if ($this->role === 'SUPER_ADMIN') {
            return true; // Super admin has universal access
        }

        return in_array($this->role, $roleList, true);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'SUPER_ADMIN';
    }

    public function isHrManager(): bool
    {
        return $this->role === 'HR_MANAGER' || $this->role === 'SUPER_ADMIN';
    }

    public function isPayrollOfficer(): bool
    {
        return $this->role === 'PAYROLL_OFFICER' || $this->role === 'SUPER_ADMIN';
    }
}
