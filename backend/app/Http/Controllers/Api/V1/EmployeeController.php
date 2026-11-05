<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeProfile;
use App\Models\EmployeeSalary;
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
        $query = Employee::with(['department', 'designation', 'branch', 'company', 'currentSalary']);

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
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

        if ($request->get('per_page') === 'all') {
            $employees = $query->orderBy('first_name')->get();
            return response()->json([
                'success' => true,
                'data' => $employees,
            ]);
        }

        $employees = $query->latest()->paginate($request->integer('per_page', 15));

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
            'marital_status' => 'nullable|in:SINGLE,MARRIED,DIVORCED,WIDOWED',
            'social_insurance_no' => 'nullable|string|max:50',
            'residential_address' => 'nullable|string|max:255',

            // Salary structure (optional at creation)
            'base_salary' => 'nullable|numeric|min:0',
            'housing_allowance' => 'nullable|numeric|min:0',
            'transportation_allowance' => 'nullable|numeric|min:0',
            'other_allowances' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $tenantId = $request->user()->tenant_id;

            // 1. Create User account for employee
            $user = User::create([
                'tenant_id' => $tenantId,
                'role' => 'EMPLOYEE',
                'name' => trim("{$validated['first_name']} {$validated['last_name']}"),
                'email' => $validated['work_email'],
                'password' => Hash::make(Str::random(12)),
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
                'social_insurance_no' => $validated['social_insurance_no'] ?? null,
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'nationality' => $validated['nationality'],
                'marital_status' => $validated['marital_status'] ?? 'SINGLE',
                'residential_address' => $validated['residential_address'] ?? null,
            ]);

            // 4. Create Salary record if provided
            if (isset($validated['base_salary'])) {
                EmployeeSalary::create([
                    'tenant_id' => $tenantId,
                    'employee_id' => $employee->id,
                    'effective_from' => $validated['hire_date'],
                    'base_salary' => $validated['base_salary'],
                    'housing_allowance' => $validated['housing_allowance'] ?? 0.00,
                    'transportation_allowance' => $validated['transportation_allowance'] ?? 0.00,
                    'other_allowances' => $validated['other_allowances'] ?? 0.00,
                    'currency' => $validated['currency'] ?? 'SAR',
                    'is_current' => true,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Employee onboarded successfully with compliance records',
                'data' => $employee->load(['department', 'designation', 'branch', 'currentSalary']),
            ], 201);
        });
    }

    public function show(string $id): JsonResponse
    {
        $query = Employee::with([
            'department',
            'designation',
            'branch',
            'company',
            'manager',
            'currentSalary',
            'profile',
            'assetAssignments.asset',
            'okrGoals',
            'attendanceRecords' => fn($q) => $q->latest('date')->limit(15),
            'leaveRequests' => fn($q) => $q->with('leaveType')->latest()->limit(10),
            'payslips' => fn($q) => $q->with('payrollRun')->latest()->limit(6),
        ]);

        $employee = Str::isUuid($id)
            ? $query->findOrFail($id)
            : $query->where('employee_number', $id)->firstOrFail();

        // Safe display data for sensitive encrypted fields
        $decryptedNationalId = null;
        if ($employee->profile && $employee->profile->national_id_encrypted) {
            try {
                $rawId = decrypt($employee->profile->national_id_encrypted);
                $decryptedNationalId = substr($rawId, 0, 3) . '****' . substr($rawId, -4);
            } catch (\Exception $e) {
                $decryptedNationalId = '************';
            }
        }

        $employeeArray = $employee->toArray();
        if (isset($employeeArray['profile'])) {
            $employeeArray['profile']['national_id_display'] = $decryptedNationalId;
        }

        return response()->json([
            'success' => true,
            'data' => $employeeArray,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'string|max:100',
            'work_email' => 'email|max:191',
            'phone_number' => 'nullable|string|max:30',
            'department_id' => 'nullable|uuid|exists:departments,id',
            'designation_id' => 'nullable|uuid|exists:designations,id',
            'branch_id' => 'nullable|uuid|exists:branches,id',
            'allowed_attendance_mode' => 'in:DEFAULT,BIOMETRIC_ONLY,MOBILE_GEOFENCE_ONLY,BOTH',
            'employment_status' => 'in:ACTIVE,ON_LEAVE,SUSPENDED,TERMINATED',
        ]);

        $employee->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Employee details updated successfully',
            'data' => $employee->load(['department', 'designation', 'branch']),
        ]);
    }
}
