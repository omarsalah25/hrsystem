<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payslip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SecureDocumentController extends Controller
{
    /**
     * Securely stream PDF payslips from local private storage
     */
    public function downloadPayslip(string $payslipId, Request $request): BinaryFileResponse
    {
        $payslip = Payslip::with('employee')->findOrFail($payslipId);
        $user = $request->user();

        // Security check: Employee can only download their own payslip
        if ($payslip->employee_id !== $user->employee?->id && $user->tenant_id !== $payslip->payrollRun?->tenant_id) {
            abort(403, __('messages.unauthorized'));
        }

        if (!$payslip->pdf_file_path || !Storage::disk('local')->exists($payslip->pdf_file_path)) {
            abort(404, __('messages.not_found'));
        }

        $fullPath = Storage::disk('local')->path($payslip->pdf_file_path);

        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"payslip_{$payslip->employee->employee_number}.pdf\"",
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }
}

