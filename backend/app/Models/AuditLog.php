<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'log_number',
        'actor_user_id',
        'actor_name',
        'actor_role',
        'action_type',
        'target_resource',
        'ip_address',
        'user_agent',
        'payload_diff',
        'prev_hash',
        'current_hash',
    ];

    protected $casts = [
        'payload_diff' => 'array',
    ];

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    /**
     * Compute SHA-256 hash based on entry content and previous block hash
     */
    public static function calculateHash(string $prevHash, string $logNumber, string $actorName, string $actionType, string $targetResource, array $payload): string
    {
        $payloadJson = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $raw = "{$prevHash}|{$logNumber}|{$actorName}|{$actionType}|{$targetResource}|{$payloadJson}";
        return hash('sha256', $raw);
    }
}

