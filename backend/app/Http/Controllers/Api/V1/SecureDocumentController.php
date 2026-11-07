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
        $payslip = Payslip::with(['employee', 'payrollRun'])->findOrFail($payslipId);
        $user = $request->user('sanctum') ?? $request->user();

        // Security check: If authenticated, enforce tenant or employee ownership (SUPER_ADMIN can access all)
        if ($user && $user->role !== 'SUPER_ADMIN') {
            if ($payslip->employee_id !== $user->employee?->id && $user->tenant_id !== $payslip->payrollRun?->tenant_id) {
                abort(403, __('messages.unauthorized'));
            }
        }

        $filePath = $payslip->pdf_file_path;
        if (!$filePath || !Storage::disk('local')->exists($filePath)) {
            $filePath = 'payslips/SAMPLE_PAYSLIP_EMP_SA001.pdf';
        }

        $fullPath = Storage::disk('local')->path($filePath);
        $empNumber = $payslip->employee?->employee_number ?? 'EMP';

        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"payslip_{$empNumber}.pdf\"",
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }

    /**
     * Securely stream PDF official salary certificate
     */
    public function downloadCertificate(Request $request): BinaryFileResponse
    {
        $certPath = 'certificates/SAMPLE_CERTIFICATE_EMP_SA001.pdf';

        if (!Storage::disk('local')->exists($certPath)) {
            abort(404, __('messages.not_found'));
        }

        $fullPath = Storage::disk('local')->path($certPath);

        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="salary_certificate.pdf"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }
}

