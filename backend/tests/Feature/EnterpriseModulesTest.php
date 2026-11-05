<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\CompanyAsset;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobOpening;
use App\Models\PayrollRun;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EnterpriseModulesTest extends TestCase
{
    protected User $user;
    protected Tenant $tenant;
    protected Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::first() ?? User::factory()->create();
        $this->tenant = Tenant::first();
        $this->company = Company::where('country_code', 'SAU')->first();

        Sanctum::actingAs($this->user);
    }

    public function test_can_fetch_employee_360_profile(): void
    {
        $employee = Employee::first();
        $response = $this->getJson("/api/v1/employees/{$employee->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $employee->id)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'current_salary',
                    'profile',
                    'asset_assignments',
                    'okr_goals',
                ]
            ]);
    }

    public function test_can_assign_and_return_asset(): void
    {
        $asset = CompanyAsset::where('status', 'AVAILABLE')->first() 
            ?? CompanyAsset::create([
                'tenant_id' => $this->tenant->id,
                'company_id' => $this->company->id,
                'asset_code' => 'TEST-AST-01',
                'name_ar' => 'جهاز اختباري',
                'name_en' => 'Test Asset',
                'category' => 'LAPTOP',
                'status' => 'AVAILABLE',
            ]);

        $employee = Employee::first();

        // Assign
        $assignResponse = $this->postJson("/api/v1/assets/{$asset->id}/assign", [
            'employee_id' => $employee->id,
            'assigned_date' => now()->toDateString(),
            'condition_on_handover' => 'NEW',
            'handover_notes' => 'Test handover',
        ]);

        $assignResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertEquals('ASSIGNED', $asset->fresh()->status);

        // Return
        $returnResponse = $this->postJson("/api/v1/assets/{$asset->id}/return", [
            'returned_date' => now()->toDateString(),
            'condition_on_return' => 'EXCELLENT',
            'handover_notes' => 'Test return',
        ]);

        $returnResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertEquals('AVAILABLE', $asset->fresh()->status);
    }

    public function test_recruitment_pipeline_workflow(): void
    {
        $opening = JobOpening::first();

        // Store candidate application
        $appResponse = $this->postJson("/api/v1/recruitment/openings/{$opening->id}/applications", [
            'candidate_name' => 'ياسر القحطاني',
            'candidate_email' => 'yasser@example.com',
            'candidate_phone' => '+966500000000',
            'expected_salary' => 15000.00,
        ]);

        $appResponse->assertStatus(201)
            ->assertJsonPath('success', true);

        $appId = $appResponse->json('data.id');

        // Update stage to INTERVIEW
        $stageResponse = $this->patchJson("/api/v1/recruitment/applications/{$appId}/stage", [
            'stage' => 'INTERVIEW',
        ]);
        $stageResponse->assertStatus(200)
            ->assertJsonPath('data.stage', 'INTERVIEW');

        // Update scorecard
        $scoreResponse = $this->patchJson("/api/v1/recruitment/applications/{$appId}/scorecard", [
            'scorecard_rating' => 5,
            'interviewer_feedback' => 'مرشح مؤهل جداً للمنصب',
        ]);
        $scoreResponse->assertStatus(200)
            ->assertJsonPath('data.scorecard_rating', 5);
    }

    public function test_cryptographic_audit_chain_verification(): void
    {
        $response = $this->getJson('/api/v1/audit/verify-chain');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('verified', true);
    }

    public function test_offboarding_esb_calculation_saudi_art_84_and_85(): void
    {
        // 24,000 SAR salary, 6 years, Resignation -> Base: (12,000 * 5) + (24,000 * 1) = 84,000. Factor: 2/3 -> 56,000
        $response = $this->postJson('/api/v1/offboarding/esb/calculate', [
            'last_full_salary' => 24000.00,
            'service_years' => 6.0,
            'separation_reason' => 'RESIGNATION',
            'is_female' => false,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.base_entitlement', 84000)
            ->assertJsonPath('data.final_award_amount', 56000);
    }

    public function test_saudization_and_egyptianization_compliance_reports(): void
    {
        // Saudization (Nitaqat)
        $sauResponse = $this->getJson('/api/v1/reports/saudization');
        $sauResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['saudization_percentage', 'nitaqat_tier', 'can_issue_visas']]);

        // Egyptianization
        $egyResponse = $this->getJson('/api/v1/reports/egyptianization');
        $egyResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['egyptian_headcount_percentage', 'is_headcount_compliant', 'is_wages_compliant']]);
    }

    public function test_payroll_run_gl_accounting_journal_voucher(): void
    {
        $run = PayrollRun::first();
        if ($run) {
            $response = $this->getJson("/api/v1/reports/payroll/{$run->id}/gl-voucher");
            $response->assertStatus(200)
                ->assertJsonPath('success', true)
                ->assertJsonPath('data.is_balanced', true)
                ->assertJsonPath('data.variance', 0);
        }
    }

    public function test_shift_rosters_and_ramadan_rules(): void
    {
        $response = $this->getJson('/api/v1/shifts');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => [['id', 'name_ar', 'daily_hours', 'is_ramadan_shift']]]);
    }

    public function test_org_chart_hierarchy_tree(): void
    {
        $response = $this->getJson('/api/v1/org-chart/hierarchy');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['companies', 'employees', 'root_nodes']]);
    }

    public function test_artisan_commands_execution(): void
    {
        // 1. Attendance Reconcile
        $attExit = \Illuminate\Support\Facades\Artisan::call('attendance:reconcile');
        $this->assertEquals(0, $attExit);

        // 2. Audit Chain Verify
        $auditExit = \Illuminate\Support\Facades\Artisan::call('audit:verify-chain');
        $this->assertEquals(0, $auditExit);

        // 3. Payroll Process
        $payExit = \Illuminate\Support\Facades\Artisan::call('payroll:process-monthly');
        $this->assertEquals(0, $payExit);
    }

    public function test_rbac_authorization_and_rejection(): void
    {
        $employeeUser = User::where('role', 'EMPLOYEE')->first();
        if ($employeeUser) {
            Sanctum::actingAs($employeeUser);

            // Attempting to post a job opening as EMPLOYEE should be rejected (403 Forbidden)
            $response = $this->postJson('/api/v1/recruitment/openings', [
                'title_ar' => 'محاولة غير مصرحة',
                'title_en' => 'Unauthorized Job Opening',
                'employment_type' => 'FULL_TIME',
            ]);

            $response->assertStatus(403)
                ->assertJsonPath('success', false);
        }

        // Acting as SUPER_ADMIN allows the action
        Sanctum::actingAs($this->user);
        $dept = Department::first();
        $adminResponse = $this->postJson('/api/v1/recruitment/openings', [
            'department_id' => $dept?->id,
            'title_ar' => 'مهندس بنية تحتية سحابية',
            'title_en' => 'Cloud Infrastructure Architect',
            'employment_type' => 'FULL_TIME',
            'min_budget' => 20000,
            'max_budget' => 30000,
            'job_description' => 'إدارة البنية السحابية',
        ]);

        $adminResponse->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    public function test_attendance_mobile_gps_clock_in_and_summary(): void
    {
        $employeeUser = User::where('role', 'EMPLOYEE')->first();
        if ($employeeUser) {
            Sanctum::actingAs($employeeUser);

            // Clock In with valid GPS within Riyadh geofence (24.7136, 46.6753)
            $punchResponse = $this->postJson('/api/v1/attendance/punch', [
                'source' => 'MOBILE_GPS',
                'latitude' => 24.7137,
                'longitude' => 46.6754,
            ]);

            $punchResponse->assertStatus(200)
                ->assertJsonPath('success', true);

            // Check My Summary
            $summaryResponse = $this->getJson('/api/v1/attendance/my-summary');
            $summaryResponse->assertStatus(200)
                ->assertJsonPath('success', true)
                ->assertJsonStructure(['data' => ['employee', 'records', 'punches']]);
        }
    }
}
