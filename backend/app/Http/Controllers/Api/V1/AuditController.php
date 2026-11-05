<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('actor');

        if ($request->filled('action_type')) {
            $query->where('action_type', $request->action_type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('log_number', 'like', "%{$s}%")
                  ->orWhere('actor_name', 'like', "%{$s}%")
                  ->orWhere('target_resource', 'like', "%{$s}%");
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Cryptographically verify the SHA-256 hash chain
     */
    public function verifyChain(Request $request): JsonResponse
    {
        $logs = AuditLog::orderBy('created_at', 'asc')->get();

        if ($logs->isEmpty()) {
            return response()->json([
                'success' => true,
                'verified' => true,
                'message' => 'Audit ledger is currently empty. Chain integrity is nominal.',
                'total_blocks' => 0,
            ]);
        }

        $isValid = true;
        $corruptedBlock = null;
        $expectedPrevHash = str_repeat('0', 64); // Genesis hash

        foreach ($logs as $index => $log) {
            if ($index > 0 && $log->prev_hash !== $expectedPrevHash) {
                $isValid = false;
                $corruptedBlock = $log->log_number;
                break;
            }

            $calculatedHash = AuditLog::calculateHash(
                $log->prev_hash,
                $log->log_number,
                $log->actor_name,
                $log->action_type,
                $log->target_resource,
                $log->payload_diff ?? []
            );

            if ($calculatedHash !== $log->current_hash) {
                $isValid = false;
                $corruptedBlock = $log->log_number;
                break;
            }

            $expectedPrevHash = $log->current_hash;
        }

        return response()->json([
            'success' => true,
            'verified' => $isValid,
            'total_blocks' => $logs->count(),
            'corrupted_block' => $corruptedBlock,
            'message' => $isValid
                ? 'All cryptographic SHA-256 blocks verified successfully. Zero tampering detected.'
                : "Integrity breach detected at block {$corruptedBlock}.",
        ]);
    }
}

