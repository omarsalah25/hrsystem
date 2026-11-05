<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Company;
use App\Models\CompanyAsset;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\JobApplication;
use App\Models\JobOpening;
use App\Models\LeaveType;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class FullLifecycleHireToRetireTest extends TestCase
{
    private User $admin;
    private User $hrManager;
    private User $payrollOfficer;
    private Tenant $tenant;
    private Company $company;
    private Branch $branch;
    private Department $department;
    private Designation $designation;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::first() ?? Tenant::create([
            'name' => 'Future Group Holding',
            'subdomain' => 'demo',
            'subscription_plan' => 'ENTERPRISE',
            'country_jurisdiction' => 'SAUDI_ARABIA',
            'is_active' => true,
        ]);

        $this->admin = User::where('email', 'admin@hrsystem.com')->firstOrFail();
        $this->hrManager = User::where('email', 'hr@hrsystem.com')->firstOrFail();
        $this->payrollOfficer = User::where('email', 'payroll@hrsystem.com')->firstOrFail();

        $this->company = Company::where('country_code', 'SAU')->firstOrFail();
        $this->branch = Branch::where('company_id', $this->company->id)->firstOrFail();
        $this->department = Department::firstOrFail();
        $this->designation = Designation::firstOrFail();
    }

    public function test_complete_hire_to_retire_9_pillar_lifecycle(): void
    {
        // -------------------------------------------------------------
        // PILLAR 1: Talent Acquisition (Recruitment & ATS)
        // -------------------------------------------------------------
        $openingRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/recruitment/openings', [
                'department_id' => $this->department->id,
                'title_ar' => 'كبير مهندسي الذكاء الاصطناعي',
                'title_en' => 'Lead AI & Systems Architect',
                'job_description' => 'بناء وتطوير نماذج الذكاء الاصطناعي والأتمتة المؤسسية.',
                'employment_type' => 'FULL_TIME',
                'min_budget' => 20000.00,
                'max_budget' => 30000.00,
                'status' => 'OPEN',
            ]);
        $openingRes->assertStatus(201);
        $openingId = $openingRes->json('data.id');

        // Candidate Application
        $appRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson("/api/v1/recruitment/openings/{$openingId}/applications", [
                'candidate_name' => 'ماجد بن عبدالعزيز السالم',
                'candidate_email' => 'majed.salem.' . rand(100, 999) . '@gmail.com',
                'candidate_phone' => '+966509988112',
                'expected_salary' => 24000.00,
            ]);
        $appRes->assertStatus(201);
        $appId = $appRes->json('data.id');

        // Interview Scoring
        $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/recruitment/applications/{$appId}/stage", ['stage' => 'INTERVIEW'])
            ->assertStatus(200);

        $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/recruitment/applications/{$appId}/scorecard", [
                'scorecard_rating' => 5,
                'interviewer_feedback' => 'مرشح استثنائي بمعايير تقنية وقيادية عالية.',
            ])->assertStatus(200);

        // Offer & Hire
        $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/recruitment/applications/{$appId}/stage", ['stage' => 'HIRED'])
            ->assertStatus(200);

        // -------------------------------------------------------------
        // PILLAR 2: Pre-Boarding & Onboarding (Core HR Creation)
        // -------------------------------------------------------------
        $uniqueEmpNo = 'EMP-CYCLE-' . rand(1000, 9999);
        $uniqueEmail = 'majed.salem.' . rand(100, 999) . '@futuregroup.com';

        $onboardRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/employees', [
                'company_id' => $this->company->id,
                'branch_id' => $this->branch->id,
                'department_id' => $this->department->id,
                'designation_id' => $this->designation->id,
                'employee_number' => $uniqueEmpNo,
                'first_name' => 'ماجد',
                'middle_name' => 'عبدالعزيز',
                'last_name' => 'السالم',
                'work_email' => $uniqueEmail,
                'phone_number' => '+966509988112',
                'hire_date' => now()->subMonths(24)->toDateString(), // 2 years of service
                'is_national' => true,
                'allowed_attendance_mode' => 'BOTH',
                'employment_type' => 'FULL_TIME',
                'national_id' => '1088776655',
                'date_of_birth' => '1991-04-15',
                'gender' => 'MALE',
                'nationality' => 'SAU',
                'marital_status' => 'MARRIED',
                'residential_address' => 'الرياض - حي حطين',
                'base_salary' => 20000.00,
                'housing_allowance' => 5000.00,
                'transportation_allowance' => 1500.00,
                'currency' => 'SAR',
            ]);
        $onboardRes->assertStatus(201);
        $employeeId = $onboardRes->json('data.id');

        // Verify 360 Dossier display masking
        $dossierRes = $this->actingAs($this->hrManager, 'sanctum')
            ->getJson("/api/v1/employees/{$employeeId}");
        $dossierRes->assertStatus(200);
        $this->assertStringContainsString('****', $dossierRes->json('data.profile.national_id_display'));

        // -------------------------------------------------------------
        // PILLAR 3: Asset Custody Allocation
        // -------------------------------------------------------------
        $asset = CompanyAsset::create([
            'tenant_id' => $this->tenant->id,
            'company_id' => $this->company->id,
            'asset_code' => 'AST-MAC-' . rand(100, 999),
            'name_ar' => 'حاسوب ماك بوك برو M3 Max 16"',
            'name_en' => 'MacBook Pro 16" M3 Max',
            'category' => 'LAPTOP',
            'serial_number' => 'C02G' . rand(10000, 99999),
            'purchase_value' => 16500.00,
            'purchase_date' => now()->subMonths(6)->toDateString(),
            'status' => 'AVAILABLE',
        ]);

        $assignRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson("/api/v1/assets/{$asset->id}/assign", [
                'employee_id' => $employeeId,
                'assigned_date' => now()->subMonths(1)->toDateString(),
                'condition_on_handover' => 'NEW',
                'handover_notes' => 'تسليم بحالة جديدة مع الشاحن والملحقات',
            ]);
        $assignRes->assertStatus(200);
        $this->assertDatabaseHas('company_assets', ['id' => $asset->id, 'status' => 'ASSIGNED']);

        // -------------------------------------------------------------
        // PILLAR 4: Time & Attendance Punches (Hardware & GPS)
        // -------------------------------------------------------------
        $today = now()->toDateString();
        \App\Models\AttendancePunch::create([
            'tenant_id' => $this->tenant->id,
            'employee_id' => $employeeId,
            'punch_time' => $today . ' 08:50:00',
            'punch_type' => 'IN',
            'source' => 'BIOMETRIC_ADMS',
            'device_serial' => 'ZKT-BIO-RIYADH-01',
            'is_within_geofence' => true,
        ]);
        \App\Models\AttendancePunch::create([
            'tenant_id' => $this->tenant->id,
            'employee_id' => $employeeId,
            'punch_time' => $today . ' 17:15:00',
            'punch_type' => 'OUT',
            'source' => 'MOBILE_GPS',
            'latitude' => 24.7136,
            'longitude' => 46.6753,
            'is_within_geofence' => true,
        ]);

        // Run attendance reconciliation
        Artisan::call('attendance:reconcile', ['--date' => $today]);
        $this->assertDatabaseHas('attendance_records', [
            'employee_id' => $employeeId,
            'date' => $today,
            'status' => 'PRESENT',
        ]);

        // -------------------------------------------------------------
        // PILLAR 5: Statutory Leave Management
        // -------------------------------------------------------------
        $annualLeaveType = LeaveType::where('code', 'ANNUAL')->firstOrFail();
        $leaveRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/leaves', [
                'leave_type_id' => $annualLeaveType->id,
                'start_date' => now()->addDays(5)->toDateString(),
                'end_date' => now()->addDays(8)->toDateString(),
                'reason' => 'إجازة سنوية اعتيادية للراحة',
            ]);
        $leaveRes->assertStatus(201);
        $leaveId = $leaveRes->json('data.id');

        // Approve leave
        $approveRes = $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/leaves/{$leaveId}/approve");
        $approveRes->assertStatus(200);
        $this->assertDatabaseHas('leave_requests', ['id' => $leaveId, 'status' => 'APPROVED']);

        // -------------------------------------------------------------
        // PILLAR 6: Performance & OKR Goals
        // -------------------------------------------------------------
        $okrRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/performance/goals', [
                'employee_id' => $employeeId,
                'title' => 'تطوير وتفعيل محرك المطابقة الآلي للرواتب',
                'cycle_period' => 'Q4-2026',
                'progress_percentage' => 40,
                'status' => 'IN_PROGRESS',
            ]);
        $okrRes->assertStatus(201);
        $goalId = $okrRes->json('data.id');

        $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/performance/goals/{$goalId}/progress", [
                'progress_percentage' => 100,
                'status' => 'ACHIEVED',
            ])->assertStatus(200);

        // -------------------------------------------------------------
        // PILLAR 7: Employee Relations & Confidential Grievances
        // -------------------------------------------------------------
        $grcRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/grievances', [
                'complainant_employee_id' => $employeeId,
                'category' => 'WORK_ENVIRONMENT',
                'incident_description' => 'طلب ترقية تصريح الدخول لمركز البيانات السحابي.',
                'is_confidential' => true,
            ]);
        $grcRes->assertStatus(201);
        $caseId = $grcRes->json('data.id');

        $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/grievances/{$caseId}/status", [
                'status' => 'RESOLVED',
                'resolution_notes' => 'تم إصدار البطاقة البيومترية وتفعيل الصلاحية.',
            ])->assertStatus(200);

        // -------------------------------------------------------------
        // PILLAR 8: Multi-Department Offboarding & Clearance Check
        // -------------------------------------------------------------
        // Before asset return: IT clearance must fail
        $clearance1 = $this->actingAs($this->hrManager, 'sanctum')
            ->getJson("/api/v1/offboarding/clearance/{$employeeId}");
        $clearance1->assertStatus(200);
        $this->assertFalse($clearance1->json('data.is_fully_cleared'));
        $this->assertFalse($clearance1->json('data.departments.it_hardware.cleared'));

        // Return the asset in EXCELLENT condition
        $returnRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson("/api/v1/assets/{$asset->id}/return", [
                'returned_date' => now()->toDateString(),
                'condition_on_return' => 'EXCELLENT',
                'handover_notes' => 'استلام نظيف وسليم بكامل الملحقات',
            ]);
        $returnRes->assertStatus(200);

        // After asset return: IT clearance passes!
        $clearance2 = $this->actingAs($this->hrManager, 'sanctum')
            ->getJson("/api/v1/offboarding/clearance/{$employeeId}");
        $clearance2->assertStatus(200);
        $this->assertTrue($clearance2->json('data.is_fully_cleared'));
        $this->assertTrue($clearance2->json('data.departments.it_hardware.cleared'));

        // Statutory End of Service Award (ESB) calculation preview (Article 84 Saudi Labor Law)
        // 2 years of service with SAR 26,500 total salary (half month per year for first 5 years = 1 month full pay)
        $esbRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/offboarding/esb/calculate', [
                'last_full_salary' => 26500.00,
                'service_years' => 2.0,
                'separation_reason' => 'TERMINATION',
            ]);
        $esbRes->assertStatus(200);
        $this->assertGreaterThan(0, $esbRes->json('data.final_award_amount'));

        // Final Separation Execution
        $sepRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/offboarding/initiate', [
                'employee_id' => $employeeId,
                'separation_date' => now()->toDateString(),
                'separation_reason' => 'CONTRACT_EXPIRED',
                'notes' => 'انتهاء مدة العقد وإجراء براءة الذمة النظامية بالكامل',
            ]);
        $sepRes->assertStatus(200);

        $this->assertDatabaseHas('employees', [
            'id' => $employeeId,
            'employment_status' => 'OFFBOARDED',
        ]);

        // -------------------------------------------------------------
        // PILLAR 9: Audit Trail Integrity Verification
        // -------------------------------------------------------------
        $auditExitCode = Artisan::call('audit:verify-chain');
        $this->assertEquals(0, $auditExitCode);
    }
}
