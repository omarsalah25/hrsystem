<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeCrudTest extends TestCase
{
    private User $admin;
    private User $hrManager;
    private User $regularEmp;
    private Tenant $tenant;
    private Company $company;
    private Branch $branch;
    private Department $department;
    private Designation $designation;

    protected function setUp(): void
    {
        parent::setUp();

        // Retrieve seeded entities or create fixtures
        $this->tenant = Tenant::first() ?? Tenant::create([
            'name' => 'Demo Tenant',
            'subdomain' => 'demo',
            'subscription_plan' => 'ENTERPRISE',
            'country_jurisdiction' => 'SAUDI_ARABIA',
            'is_active' => true,
        ]);

        $this->admin = User::where('email', 'admin@hrsystem.com')->first();
        $this->hrManager = User::where('email', 'hr@hrsystem.com')->first();
        $this->regularEmp = User::where('email', 'employee@hrsystem.com')->first();

        $this->company = Company::where('country_code', 'SAU')->first();
        $this->branch = Branch::where('company_id', $this->company->id)->first();
        $this->department = Department::first();
        $this->designation = Designation::first();
    }

    public function test_read_employee_list(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/employees');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'employee_number',
                            'first_name',
                            'last_name',
                            'work_email',
                            'employment_status',
                        ],
                    ],
                ],
            ]);

        $this->assertGreaterThanOrEqual(10, count($response->json('data.data')));
    }

    public function test_read_single_employee_360_dossier(): void
    {
        $employee = Employee::where('employee_number', 'EMP-SA-001')->firstOrFail();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/employees/{$employee->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $employee->id,
                    'employee_number' => 'EMP-SA-001',
                    'first_name' => 'عبدالله',
                    'last_name' => 'العتيبي',
                ],
            ]);

        // Verify encrypted PII is masked for display
        $this->assertStringContainsString('****', $response->json('data.profile.national_id_display'));
    }

    public function test_create_new_employee_full_onboarding(): void
    {
        $uniqueEmpNo = 'EMP-NEW-' . rand(1000, 9999);
        $uniqueEmail = 'new.hire.' . rand(100, 999) . '@futuregroup.com';

        $payload = [
            'company_id' => $this->company->id,
            'branch_id' => $this->branch->id,
            'department_id' => $this->department->id,
            'designation_id' => $this->designation->id,
            'employee_number' => $uniqueEmpNo,
            'first_name' => 'سلطان',
            'middle_name' => 'محمد',
            'last_name' => 'الغامدي',
            'work_email' => $uniqueEmail,
            'phone_number' => '+966505554433',
            'hire_date' => '2026-11-01',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'employment_type' => 'FULL_TIME',
            'national_id' => '1022334455',
            'date_of_birth' => '1993-05-10',
            'gender' => 'MALE',
            'nationality' => 'SAU',
            'marital_status' => 'MARRIED',
            'residential_address' => 'الرياض - حي الروضة',
            'base_salary' => 15000.00,
            'housing_allowance' => 3750.00,
            'transportation_allowance' => 1000.00,
            'currency' => 'SAR',
        ];

        $response = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/employees', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Employee onboarded successfully with compliance records',
            ]);

        $this->assertDatabaseHas('employees', [
            'employee_number' => $uniqueEmpNo,
            'work_email' => $uniqueEmail,
            'employment_status' => 'ACTIVE',
        ]);

        $this->assertDatabaseHas('employee_salaries', [
            'base_salary' => 15000.00,
            'currency' => 'SAR',
        ]);
    }

    public function test_update_employee_details(): void
    {
        $employee = Employee::where('employee_number', 'EMP-SA-003')->firstOrFail();

        $updatePayload = [
            'phone_number' => '+966599998888',
            'allowed_attendance_mode' => 'MOBILE_GEOFENCE_ONLY',
            'employment_status' => 'ON_LEAVE',
        ];

        $response = $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/employees/{$employee->id}", $updatePayload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Employee details updated successfully',
                'data' => [
                    'phone_number' => '+966599998888',
                    'allowed_attendance_mode' => 'MOBILE_GEOFENCE_ONLY',
                    'employment_status' => 'ON_LEAVE',
                ],
            ]);

        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'phone_number' => '+966599998888',
            'allowed_attendance_mode' => 'MOBILE_GEOFENCE_ONLY',
            'employment_status' => 'ON_LEAVE',
        ]);
    }

    public function test_delete_deactivate_employee(): void
    {
        $employee = Employee::where('employee_number', 'EMP-EG-004')->firstOrFail();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/employees/{$employee->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $employee->id,
                    'employment_status' => 'OFFBOARDED',
                ],
            ]);

        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'employment_status' => 'OFFBOARDED',
        ]);
    }

    public function test_regular_employee_cannot_create_or_delete_employees(): void
    {
        $createResponse = $this->actingAs($this->regularEmp, 'sanctum')
            ->postJson('/api/v1/employees', ['first_name' => 'Hacker']);

        $createResponse->assertStatus(403);

        $deleteResponse = $this->actingAs($this->regularEmp, 'sanctum')
            ->deleteJson('/api/v1/employees/EMP-SA-001');

        $deleteResponse->assertStatus(403);
    }
}
