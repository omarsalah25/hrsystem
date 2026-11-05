<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\AuditLog;
use Illuminate\Console\Command;

class VerifyAuditChainCommand extends Command
{
    protected $signature = 'audit:verify-chain';
    protected $description = 'Cryptographically verify the SHA-256 hash chain integrity of all audit log blocks';

    public function handle(): int
    {
        $this->info('Starting SHA-256 cryptographic audit chain verification...');

        $logs = AuditLog::orderBy('created_at', 'asc')->get();

        if ($logs->isEmpty()) {
            $this->warn('Audit ledger is currently empty.');
            return Command::SUCCESS;
        }

        $expectedPrevHash = str_repeat('0', 64);
        $isValid = true;
        $corruptedBlock = null;
        $tableRows = [];

        foreach ($logs as $index => $log) {
            $calculatedHash = AuditLog::calculateHash(
                $log->prev_hash,
                $log->log_number,
                $log->actor_name,
                $log->action_type,
                $log->target_resource,
                $log->payload_diff ?? []
            );

            $hashMatches = ($calculatedHash === $log->current_hash);
            $linkMatches = ($index === 0 || $log->prev_hash === $expectedPrevHash);

            $blockValid = $hashMatches && $linkMatches;

            $tableRows[] = [
                $log->log_number,
                $log->actor_name,
                $log->action_type,
                $log->target_resource,
                substr($log->current_hash, 0, 16) . '...',
                $blockValid ? '<fg=green>VALID</>' : '<fg=red>COMPROMISED</>',
            ];

            if (!$blockValid) {
                $isValid = false;
                $corruptedBlock = $log->log_number;
                break;
            }

            $expectedPrevHash = $log->current_hash;
        }

        $this->table(['Block #', 'Actor', 'Action', 'Target', 'SHA-256 Hash', 'Integrity'], $tableRows);

        if ($isValid) {
            $this->info("✓ All {$logs->count()} blocks verified successfully. Zero tampering detected.");
            return Command::SUCCESS;
        } else {
            $this->error("✗ Cryptographic verification FAILED at block {$corruptedBlock}!");
            return Command::FAILURE;
        }
    }
}

