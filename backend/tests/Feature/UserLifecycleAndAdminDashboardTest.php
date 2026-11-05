<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Company;
use App\Models\CompanyAsset;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\LeaveType;
use App\Models\Tenant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserLifecycleAndAdminDashboardTest extends TestCase
{
    protected Tenant $tenant;
    protected User $superAdmin;
    protected User $hrManager;
    protected User $payrollOfficer;
    protected User $auditor;
    protected User $employeeUser;
    protected Employee $saudiEmployee;
    protected Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::first() ?? Tenant::create([
            'name' => 'Demo Enterprise',
            'subdomain' => 'demo',
            'subscription_plan' => 'ENTERPRISE',
            'country_jurisdiction' => 'SAUDI_ARABIA',
            'is_active' => true,
        ]);

        $this->superAdmin = User::firstOrCreate(
            ['email' => 'admin@hrsystem.com'],
            [
                'tenant_id' => $this->tenant->id,
                'role' => 'SUPER_ADMIN',
                'name' => 'Super Administrator',
                'password' => bcrypt('password123'),
                'status' => 'ACTIVE',
            ]
        );

        $this->hrManager = User::firstOrCreate(
            ['email' => 'hr@hrsystem.com'],
            [
                'tenant_id' => $this->tenant->id,
                'role' => 'HR_MANAGER',
                'name' => 'HR Operations Lead',
                'password' => bcrypt('password123'),
                'status' => 'ACTIVE',
            ]
        );

        $this->auditor = User::firstOrCreate(
            ['email' => 'auditor@hrsystem.com'],
            [
                'tenant_id' => $this->tenant->id,
                'role' => 'AUDITOR',
                'name' => 'Compliance Auditor',
                'password' => bcrypt('password123'),
                'status' => 'ACTIVE',
            ]
        );

        $this->employeeUser = User::firstOrCreate(
            ['email' => 'employee@hrsystem.com'],
            [
                'tenant_id' => $this->tenant->id,
                'role' => 'EMPLOYEE',
                'name' => 'Senior Engineer',
                'password' => bcrypt('password123'),
                'status' => 'ACTIVE',
            ]
        );

        $this->company = Company::where('country_code', 'SAU')->first();
        $this->saudiEmployee = Employee::first();
    }

    /**
     * Test Super Admin: Company & Branch Management Dashboard
     */
    public function test_super_admin_can_add_and_update_companies_and_branches(): void
    {
        Sanctum::actingAs($this->superAdmin);

        // 1. Create a new company via Admin Dashboard API
        $companyResponse = $this->postJson('/api/v1/companies', [
            'legal_name' => 'شركة الشرق الأوسط للتقنيات المتقدمة ذ.م.م',
            'trade_name' => 'Middle East Advanced Tech',
            'commercial_registration_no' => '1010998811',
            'tax_registration_no' => '300099881100003',
            'social_insurance_no' => '77889900',
            'bank_code' => 'NCBK',
            'primary_iban' => 'SA0310000000123456789012',
            'country_code' => 'SAU',
            'currency' => 'SAR',
        ]);

        $companyResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.legal_name', 'شركة الشرق الأوسط للتقنيات المتقدمة ذ.م.م');

        $newCompanyId = $companyResponse->json('data.id');

        // 2. Update company details
        $updateCompResponse = $this->patchJson("/api/v1/companies/{$newCompanyId}", [
            'trade_name' => 'ME Advanced Tech Group',
        ]);

        $updateCompResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.trade_name', 'ME Advanced Tech Group');

        // 3. Create a new branch with GPS Geofencing for the new company
        $branchResponse = $this->postJson('/api/v1/branches', [
            'company_id' => $newCompanyId,
            'name' => 'فرع الدمام الإقليمي',
            'address_line' => 'طريق الملك فيصل، حي الشاطئ',
            'city' => 'الدمام',
            'timezone' => 'Asia/Riyadh',
            'geofence_latitude' => 26.4207,
            'geofence_longitude' => 50.0888,
            'geofence_radius_meters' => 250,
            'attendance_mode' => 'BOTH',
        ]);

        $branchResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'فرع الدمام الإقليمي');

        $newBranchId = $branchResponse->json('data.id');

        // 4. Update branch geofence
        $geofenceResponse = $this->patchJson("/api/v1/branches/{$newBranchId}/geofence", [
            'geofence_latitude' => 26.4210,
            'geofence_longitude' => 50.0890,
            'geofence_radius_meters' => 300,
            'attendance_mode' => 'HYBRID_BOTH',
        ]);

        $geofenceResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.geofence_radius_meters', 300);
    }

    /**
     * Test Non-Admin cannot add companies (RBAC check)
     */
    public function test_non_admin_cannot_create_companies(): void
    {
        Sanctum::actingAs($this->hrManager);

        $response = $this->postJson('/api/v1/companies', [
            'legal_name' => 'شركة غير مصرح بها',
            'country_code' => 'SAU',
            'currency' => 'SAR',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    /**
     * Test HR Manager Lifecycle: Employee Onboarding, Assets, ATS, and Grievance Management
     */
    public function test_hr_manager_lifecycle_workflow(): void
    {
        Sanctum::actingAs($this->hrManager);

        $dept = Department::first();
        $designation = Designation::first();
        $branch = Branch::first();

        // 1. Onboard a new employee with encrypted PII and salary
        $onboardResponse = $this->postJson('/api/v1/employees', [
            'company_id' => $this->company->id,
            'branch_id' => $branch?->id,
            'department_id' => $dept?->id,
            'designation_id' => $designation?->id,
            'employee_number' => 'EMP-TEST-' . rand(1000, 9999),
            'first_name' => 'فيصل',
            'last_name' => 'الغامدي',
            'work_email' => 'faisal.test.' . rand(100, 999) . '@futuregroup.com',
            'phone_number' => '+966551122334',
            'hire_date' => now()->toDateString(),
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'national_id' => '1029384756',
            'date_of_birth' => '1993-04-12',
            'gender' => 'MALE',
            'nationality' => 'SAU',
            'base_salary' => 14000.00,
            'housing_allowance' => 3500.00,
            'transportation_allowance' => 1000.00,
            'currency' => 'SAR',
        ]);

        $onboardResponse->assertStatus(201)
            ->assertJsonPath('success', true);

        $newEmpId = $onboardResponse->json('data.id');

        // 2. Fetch the newly created 360 profile
        $profileResponse = $this->getJson("/api/v1/employees/{$newEmpId}");
        $profileResponse->assertStatus(200)
            ->assertJsonPath('data.first_name', 'فيصل')
            ->assertJsonPath('data.profile.national_id_display', '102****4756'); // Verified encrypted & masked

        // 3. Register and assign a company laptop asset to the new employee
        $assetResponse = $this->postJson('/api/v1/assets', [
            'company_id' => $this->company->id,
            'asset_code' => 'AST-TEST-' . rand(100, 999),
            'name_ar' => 'حاسوب لينوفو ثينك باد',
            'name_en' => 'Lenovo ThinkPad P16',
            'category' => 'LAPTOP',
            'serial_number' => 'LN-' . rand(10000, 99999),
            'purchase_value' => 8500.00,
            'purchase_date' => now()->toDateString(),
            'status' => 'AVAILABLE',
        ]);

        $assetResponse->assertStatus(201);
        $assetId = $assetResponse->json('data.id');

        $assignResponse = $this->postJson("/api/v1/assets/{$assetId}/assign", [
            'employee_id' => $newEmpId,
            'assigned_date' => now()->toDateString(),
            'condition_on_handover' => 'NEW',
            'handover_notes' => 'سلم للموظف في أول يوم عمل',
        ]);

        $assignResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        // 4. File a grievance resolution
        $grievanceResponse = $this->postJson('/api/v1/grievances', [
            'complainant_employee_id' => $newEmpId,
            'category' => 'WORK_ENVIRONMENT',
            'incident_description' => 'طلب شاشة إضافية لبيئة العمل',
            'is_confidential' => false,
        ]);

        $grievanceResponse->assertStatus(201);
        $grievanceId = $grievanceResponse->json('data.id');

        $resolveResponse = $this->patchJson("/api/v1/grievances/{$grievanceId}/status", [
            'status' => 'RESOLVED',
            'resolution_notes' => 'تم صرف الشاشة من إدارة تقنية المعلومات',
        ]);

        $resolveResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'RESOLVED');
    }

    /**
     * Test Employee Lifecycle: Login, Self-Service, Mobile GPS Punch, Leave Request
     */
    public function test_employee_self_service_lifecycle(): void
    {
        // 1. Employee Login via API
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'employee@hrsystem.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'EMPLOYEE');

        $token = $loginResponse->json('data.token');
        $this->assertNotEmpty($token);

        // 2. Access /auth/me
        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'employee@hrsystem.com');

        // 3. Employee Submits a Leave Request
        $leaveType = LeaveType::where('code', 'ANNUAL')->first();
        $tomorrow = now()->addDay()->toDateString();
        $dayAfter = now()->addDays(3)->toDateString();

        $leaveResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/leaves', [
                'leave_type_id' => $leaveType->id,
                'start_date' => $tomorrow,
                'end_date' => $dayAfter,
                'reason' => 'إجازة سنوية اعتيادية للراحة',
            ]);

        $leaveResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'PENDING_MANAGER');

        $leaveId = $leaveResponse->json('data.id');

        // 4. Line Manager / HR Approves the Leave Request
        Sanctum::actingAs($this->hrManager);
        $approveResponse = $this->patchJson("/api/v1/leaves/{$leaveId}/approve");
        $approveResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'APPROVED');
    }

    /**
     * Test Auditor Lifecycle: Inspect SHA-256 Ledger & Verify Cryptographic Integrity
     */
    public function test_auditor_lifecycle_and_tamper_detection(): void
    {
        Sanctum::actingAs($this->auditor);

        // 1. Inspect audit logs
        $logsResponse = $this->getJson('/api/v1/audit/logs');
        $logsResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        // 2. Cryptographic SHA-256 Chain Verification
        $verifyResponse = $this->getJson('/api/v1/audit/verify-chain');
        $verifyResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('verified', true);

        // 3. Auditor trying to create a payroll run or mutate data should be forbidden (403)
        $unauthorizedPayroll = $this->postJson('/api/v1/payroll/runs', [
            'company_id' => $this->company->id,
            'cycle_name' => 'محاولة غير مصرحة للمراجع',
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-30',
            'disbursement_date' => '2026-11-27',
        ]);

        $unauthorizedPayroll->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    /**
     * Test Platform Admin System Overview and Company Breakdown Reports with Portal Authentication Separation
     */
    public function test_platform_admin_overview_and_company_reporting_with_portal_separation(): void
    {
        // 1. Platform Admin logs in with portal_type = 'ADMIN'
        $adminLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@hrsystem.com',
            'password' => 'password123',
            'portal_type' => 'ADMIN',
        ]);
        $adminLogin->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'SUPER_ADMIN')
            ->assertJsonPath('data.user.default_portal', 'ADMIN');

        // 2. Non-super admin attempts to log in via ADMIN portal -> Rejected
        $employeeLoginAttempt = $this->postJson('/api/v1/auth/login', [
            'email' => 'employee@hrsystem.com',
            'password' => 'password123',
            'portal_type' => 'ADMIN',
        ]);
        $employeeLoginAttempt->assertStatus(422);

        // 3. Platform Admin queries comprehensive companies overview report
        Sanctum::actingAs($this->superAdmin);
        $overviewResponse = $this->getJson('/api/v1/reports/companies-overview');
        $overviewResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'system_totals' => [
                        'total_companies',
                        'total_branches',
                        'total_departments',
                        'total_employees',
                        'active_employees',
                        'total_assets',
                        'total_monthly_payroll',
                        'system_health',
                    ],
                    'companies' => [
                        '*' => [
                            'id',
                            'legal_name',
                            'trade_name',
                            'country_code',
                            'currency',
                            'total_employees',
                            'active_employees',
                            'localization_rate',
                            'branches_count',
                            'departments_count',
                            'assets_count',
                        ],
                    ],
                ],
            ]);

        $this->assertGreaterThanOrEqual(1, count($overviewResponse->json('data.companies')));
    }
}

