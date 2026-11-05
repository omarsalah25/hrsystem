<?php

use App\Http\Controllers\Api\V1\AssetController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuditController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\CompanyController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\GrievanceController;
use App\Http\Controllers\Api\V1\LeaveController;
use App\Http\Controllers\Api\V1\PayrollController;
use App\Http\Controllers\Api\V1\PerformanceController;
use App\Http\Controllers\Api\V1\RecruitmentController;
use App\Http\Controllers\Api\V1\SecureDocumentController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public Authentication
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Authenticated Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Companies & Branches
        Route::get('/companies', [CompanyController::class, 'index']);
        Route::get('/companies/{id}', [CompanyController::class, 'show']);
        Route::get('/branches', [BranchController::class, 'index']);
        Route::get('/branches/{id}', [BranchController::class, 'show']);
        Route::patch('/branches/{id}/geofence', [BranchController::class, 'updateGeofence']);

        // Employees & Dossier 360
        Route::apiResource('employees', EmployeeController::class)->only(['index', 'store', 'show', 'update']);

        // Attendance (Biometric & Mobile GPS Geofencing)
        Route::post('/attendance/punch', [AttendanceController::class, 'punch']);
        Route::get('/attendance/my-summary', [AttendanceController::class, 'mySummary']);

        // Leaves & Absence Management
        Route::get('/leaves', [LeaveController::class, 'index']);
        Route::post('/leaves', [LeaveController::class, 'store']);
        Route::patch('/leaves/{id}/approve', [LeaveController::class, 'approve']);
        Route::patch('/leaves/{id}/reject', [LeaveController::class, 'reject']);

        // Payroll & Statutory Engine (Egypt & Saudi Arabia)
        Route::get('/payroll/runs', [PayrollController::class, 'index']);
        Route::post('/payroll/runs', [PayrollController::class, 'store']);
        Route::get('/payroll/runs/{id}', [PayrollController::class, 'show']);
        Route::patch('/payroll/runs/{runId}/payslips/{payslipId}/adjust', [PayrollController::class, 'adjustPayslip']);
        Route::patch('/payroll/runs/{id}/approve', [PayrollController::class, 'approve']);
        Route::get('/payroll/runs/{id}/export-wps', [PayrollController::class, 'exportWpsSif']);

        // Assets & Hardware Custody
        Route::get('/assets', [AssetController::class, 'index']);
        Route::post('/assets', [AssetController::class, 'store']);
        Route::get('/assets/{id}', [AssetController::class, 'show']);
        Route::post('/assets/{id}/assign', [AssetController::class, 'assign']);
        Route::post('/assets/{id}/return', [AssetController::class, 'returnAsset']);

        // Recruitment & ATS Pipeline
        Route::get('/recruitment/openings', [RecruitmentController::class, 'index']);
        Route::post('/recruitment/openings', [RecruitmentController::class, 'store']);
        Route::get('/recruitment/openings/{id}', [RecruitmentController::class, 'show']);
        Route::post('/recruitment/openings/{id}/applications', [RecruitmentController::class, 'storeApplication']);
        Route::patch('/recruitment/applications/{id}/stage', [RecruitmentController::class, 'updateStage']);
        Route::patch('/recruitment/applications/{id}/scorecard', [RecruitmentController::class, 'updateScorecard']);

        // Employee Relations & Grievances
        Route::get('/grievances', [GrievanceController::class, 'index']);
        Route::post('/grievances', [GrievanceController::class, 'store']);
        Route::get('/grievances/{id}', [GrievanceController::class, 'show']);
        Route::patch('/grievances/{id}/status', [GrievanceController::class, 'updateStatus']);

        // Performance & OKR Goals
        Route::get('/performance/goals', [PerformanceController::class, 'index']);
        Route::post('/performance/goals', [PerformanceController::class, 'store']);
        Route::patch('/performance/goals/{id}/progress', [PerformanceController::class, 'updateProgress']);

        // Cryptographic Hash-Chained Audit Trail
        Route::get('/audit/logs', [AuditController::class, 'index']);
        Route::get('/audit/verify-chain', [AuditController::class, 'verifyChain']);

        // Secure Document Vault (Local Storage)
        Route::get('/documents/payslips/{id}/download', [SecureDocumentController::class, 'downloadPayslip']);
        Route::get('/documents/certificates/{id}/download', [SecureDocumentController::class, 'downloadCertificate']);
    });
});
