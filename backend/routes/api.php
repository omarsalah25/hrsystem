<?php

use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\LeaveController;
use App\Http\Controllers\Api\V1\PayrollController;
use App\Http\Controllers\Api\V1\SecureDocumentController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public Authentication
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Authenticated Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Employees
        Route::apiResource('employees', EmployeeController::class)->only(['index', 'store', 'show']);

        // Attendance (Biometric & Mobile GPS Geofencing)
        Route::post('/attendance/punch', [AttendanceController::class, 'punch']);
        Route::get('/attendance/my-summary', [AttendanceController::class, 'mySummary']);

        // Leaves & Absence
        Route::get('/leaves', [LeaveController::class, 'index']);
        Route::post('/leaves', [LeaveController::class, 'store']);
        Route::patch('/leaves/{id}/approve', [LeaveController::class, 'approve']);
        Route::patch('/leaves/{id}/reject', [LeaveController::class, 'reject']);

        // Payroll & Statutory Engine (Egypt & Saudi Arabia)
        Route::post('/payroll/runs', [PayrollController::class, 'store']);
        Route::get('/payroll/runs/{id}/export-wps', [PayrollController::class, 'exportWpsSif']);

        // Secure Document Vault (Local Storage)
        Route::get('/documents/payslips/{id}/download', [SecureDocumentController::class, 'downloadPayslip']);
    });
});
