<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Employee::with(['department', 'designation', 'branch', 'currentSalary']);

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('status')) {
            $query->where('employment_status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                  ->orWhere('last_name', 'like', "%{$s}%")
                  ->orWhere('employee_number', 'like', "%{$s}%")
                  ->orWhere('work_email', 'like', "%{$s}%");
            });
        }

        $employees = $query->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $employees,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|uuid|exists:companies,id',
            'branch_id' => 'nullable|uuid|exists:branches,id',
            'department_id' => 'nullable|uuid|exists:departments,id',
            'designation_id' => 'nullable|uuid|exists:designations,id',
            'employee_number' => 'required|string|max:50',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'work_email' => 'required|email|max:191',
            'phone_number' => 'nullable|string|max:30',
            'hire_date' => 'required|date',
            'is_national' => 'boolean',
            'allowed_attendance_mode' => 'in:DEFAULT,BIOMETRIC_ONLY,MOBILE_GEOFENCE_ONLY,BOTH',
            'biometric_device_user_id' => 'nullable|string|max:50',
            'employment_type' => 'in:FULL_TIME,PART_TIME,CONTRACTOR,INTERN',
            'national_id' => 'required|string|max:50',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:MALE,FEMALE',
            'nationality' => 'required|string|size:3',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $tenantId = $request->user()->tenant_id;

            // 1. Create User account for employee
            $user = User::create([
                'tenant_id' => $tenantId,
                'email' => $validated['work_email'],
                'password' => Hash::make(Str::random(12)), // Initial temporary password
                'status' => 'ACTIVE',
            ]);

            // 2. Create Employee Master
            $employee = Employee::create([
                'tenant_id' => $tenantId,
                'company_id' => $validated['company_id'],
                'branch_id' => $validated['branch_id'] ?? null,
                'department_id' => $validated['department_id'] ?? null,
                'designation_id' => $validated['designation_id'] ?? null,
                'user_id' => $user->id,
                'employee_number' => $validated['employee_number'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'work_email' => $validated['work_email'],
                'phone_number' => $validated['phone_number'] ?? null,
                'hire_date' => $validated['hire_date'],
                'is_national' => $validated['is_national'] ?? true,
                'allowed_attendance_mode' => $validated['allowed_attendance_mode'] ?? 'DEFAULT',
                'biometric_device_user_id' => $validated['biometric_device_user_id'] ?? null,
                'employment_type' => $validated['employment_type'] ?? 'FULL_TIME',
                'employment_status' => 'ACTIVE',
            ]);

            // 3. Create Sensitive Profile (Encrypted PII)
            EmployeeProfile::create([
                'employee_id' => $employee->id,
                'national_id_encrypted' => encrypt($validated['national_id']),
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'nationality' => $validated['nationality'],
            ]);

            return response()->json([
                'success' => true,
                'message' => __('messages.created'),
                'data' => $employee->load(['department', 'designation']),
            ], 201);
        });
    }

    public function show(string $id): JsonResponse
    {
        $employee = Employee::with([
            'department',
            'designation',
            'branch',
            'currentSalary',
            'profile',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $employee,
        ]);
    }
}

