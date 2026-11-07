<?php

use App\Http\Controllers\Api\V1\AssetController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuditController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\CompanyController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\GrievanceController;
use App\Http\Controllers\Api\V1\LearningController;
use App\Http\Controllers\Api\V1\LeaveController;
use App\Http\Controllers\Api\V1\OffboardingController;
use App\Http\Controllers\Api\V1\OrgChartController;
use App\Http\Controllers\Api\V1\PayrollController;
use App\Http\Controllers\Api\V1\PerformanceController;
use App\Http\Controllers\Api\V1\RecruitmentController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SecureDocumentController;
use App\Http\Controllers\Api\V1\ShiftController;
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
        Route::post('/companies', [CompanyController::class, 'store'])->middleware('role:SUPER_ADMIN');
        Route::match(['put', 'patch'], '/companies/{id}', [CompanyController::class, 'update'])->middleware('role:SUPER_ADMIN');
        Route::delete('/companies/{id}', [CompanyController::class, 'destroy'])->middleware('role:SUPER_ADMIN');

        Route::get('/departments', function () {
            return response()->json(['success' => true, 'data' => \App\Models\Department::with('company')->get()]);
        });

        Route::get('/branches', [BranchController::class, 'index']);
        Route::get('/branches/{id}', [BranchController::class, 'show']);
        Route::post('/branches', [BranchController::class, 'store'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::match(['put', 'patch'], '/branches/{id}', [BranchController::class, 'update'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::patch('/branches/{id}/geofence', [BranchController::class, 'updateGeofence'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::delete('/branches/{id}', [BranchController::class, 'destroy'])->middleware('role:SUPER_ADMIN,HR_MANAGER');

        // Dynamic Org Hierarchy Canvas
        Route::get('/org-chart/hierarchy', [OrgChartController::class, 'hierarchy']);

        // Employees & Dossier 360
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
        Route::post('/employees', [EmployeeController::class, 'store'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::match(['put', 'patch'], '/employees/{employee}', [EmployeeController::class, 'update'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])->middleware('role:SUPER_ADMIN,HR_MANAGER');

        // Attendance (Biometric & Mobile GPS Geofencing)
        Route::post('/attendance/punch', [AttendanceController::class, 'punch']);
        Route::get('/attendance/my-summary', [AttendanceController::class, 'mySummary']);

        // Shift Rostering & Ramadan Rules
        Route::get('/shifts', [ShiftController::class, 'index']);
        Route::post('/shifts', [ShiftController::class, 'store'])->middleware('role:SUPER_ADMIN,HR_MANAGER');

        // Leaves & Absence Management
        Route::get('/leaves', [LeaveController::class, 'index']);
        Route::post('/leaves', [LeaveController::class, 'store']);
        Route::patch('/leaves/{id}/approve', [LeaveController::class, 'approve'])->middleware('role:SUPER_ADMIN,HR_MANAGER,DEPARTMENT_MANAGER,LINE_MANAGER');
        Route::patch('/leaves/{id}/reject', [LeaveController::class, 'reject'])->middleware('role:SUPER_ADMIN,HR_MANAGER,DEPARTMENT_MANAGER,LINE_MANAGER');

        // Payroll & Statutory Engine (Egypt & Saudi Arabia)
        Route::get('/payroll/runs', [PayrollController::class, 'index']);
        Route::post('/payroll/runs', [PayrollController::class, 'store'])->middleware('role:SUPER_ADMIN,PAYROLL_OFFICER,HR_MANAGER');
        Route::get('/payroll/runs/{id}', [PayrollController::class, 'show']);
        Route::patch('/payroll/runs/{runId}/payslips/{payslipId}/adjust', [PayrollController::class, 'adjustPayslip'])->middleware('role:SUPER_ADMIN,PAYROLL_OFFICER');
        Route::patch('/payroll/runs/{id}/approve', [PayrollController::class, 'approve'])->middleware('role:SUPER_ADMIN,PAYROLL_OFFICER');
        Route::get('/payroll/runs/{id}/export-wps', [PayrollController::class, 'exportWpsSif']);

        // Offboarding & End of Service Award (ESB)
        Route::post('/offboarding/esb/calculate', [OffboardingController::class, 'calculateEsb']);
        Route::get('/offboarding/clearance/{employeeId}', [OffboardingController::class, 'clearanceStatus']);
        Route::post('/offboarding/initiate', [OffboardingController::class, 'initiate'])->middleware('role:SUPER_ADMIN,HR_MANAGER');

        // Executive Analytics & Compliance Reports
        Route::get('/reports/companies-overview', [ReportController::class, 'companiesOverview']);
        Route::get('/reports/saudization', [ReportController::class, 'saudization']);
        Route::get('/reports/egyptianization', [ReportController::class, 'egyptianization']);
        Route::get('/reports/bradford-factor', [ReportController::class, 'bradfordFactor']);
        Route::get('/reports/payroll/{runId}/gl-voucher', [ReportController::class, 'glJournal']);
        Route::get('/reports/headcount', [ReportController::class, 'headcount']);

        // Learning & Development (L&D)
        Route::get('/learning/courses', [LearningController::class, 'index']);
        Route::get('/learning/courses/{id}', [LearningController::class, 'show']);
        Route::post('/learning/courses/{id}/enroll', [LearningController::class, 'enroll']);
        Route::post('/learning/courses/{id}/certificate', [LearningController::class, 'issueCertificate']);

        // Assets & Hardware Custody
        Route::get('/assets', [AssetController::class, 'index']);
        Route::post('/assets', [AssetController::class, 'store'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::get('/assets/{id}', [AssetController::class, 'show']);
        Route::post('/assets/{id}/assign', [AssetController::class, 'assign'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::post('/assets/{id}/return', [AssetController::class, 'returnAsset'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::delete('/assets/{id}', [AssetController::class, 'destroy'])->middleware('role:SUPER_ADMIN,HR_MANAGER');

        // Recruitment & ATS Pipeline
        Route::get('/recruitment/openings', [RecruitmentController::class, 'index']);
        Route::post('/recruitment/openings', [RecruitmentController::class, 'store'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::get('/recruitment/openings/{id}', [RecruitmentController::class, 'show']);
        Route::delete('/recruitment/openings/{id}', [RecruitmentController::class, 'destroy'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::post('/recruitment/openings/{id}/applications', [RecruitmentController::class, 'storeApplication']);
        Route::patch('/recruitment/applications/{id}/stage', [RecruitmentController::class, 'updateStage'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::patch('/recruitment/applications/{id}/scorecard', [RecruitmentController::class, 'updateScorecard'])->middleware('role:SUPER_ADMIN,HR_MANAGER,DEPARTMENT_MANAGER');

        // Employee Relations & Grievances
        Route::get('/grievances', [GrievanceController::class, 'index']);
        Route::post('/grievances', [GrievanceController::class, 'store']);
        Route::get('/grievances/{id}', [GrievanceController::class, 'show']);
        Route::patch('/grievances/{id}/status', [GrievanceController::class, 'updateStatus'])->middleware('role:SUPER_ADMIN,HR_MANAGER');
        Route::delete('/grievances/{id}', [GrievanceController::class, 'destroy'])->middleware('role:SUPER_ADMIN,HR_MANAGER');

        // Performance & OKR Goals
        Route::get('/performance/goals', [PerformanceController::class, 'index']);
        Route::post('/performance/goals', [PerformanceController::class, 'store']);
        Route::patch('/performance/goals/{id}/progress', [PerformanceController::class, 'updateProgress']);
        Route::delete('/performance/goals/{id}', [PerformanceController::class, 'destroy']);

        // Cryptographic Hash-Chained Audit Trail
        Route::get('/audit/logs', [AuditController::class, 'index'])->middleware('role:SUPER_ADMIN,AUDITOR,HR_MANAGER');
        Route::get('/audit/verify-chain', [AuditController::class, 'verifyChain'])->middleware('role:SUPER_ADMIN,AUDITOR,HR_MANAGER');
    });

    // Secure Document Vault (Local Private Storage with Optional / Query Token Support)
    Route::get('/documents/payslips/{id}/download', [SecureDocumentController::class, 'downloadPayslip']);
    Route::get('/documents/certificates/{id}/download', [SecureDocumentController::class, 'downloadCertificate']);
});
