<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Employee;
use App\Models\JobOpening;
use App\Models\Tenant;
use App\Models\User;
use Tests\TestCase;

class RecruitmentAndPerformanceWorkflowTest extends TestCase
{
    private User $admin;
    private User $hrManager;
    private Department $department;
    private Employee $employee;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::where('email', 'admin@hrsystem.com')->firstOrFail();
        $this->hrManager = User::where('email', 'hr@hrsystem.com')->firstOrFail();
        $this->department = Department::firstOrFail();
        $this->employee = Employee::firstOrFail();
    }

    public function test_recruitment_opening_and_application_lifecycle(): void
    {
        // 1. Create Job Opening
        $openingRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/recruitment/openings', [
                'department_id' => $this->department->id,
                'title_ar' => 'مطور واجهات أمامية Next.js',
                'title_en' => 'Frontend Next.js Developer',
                'job_description' => 'تطوير لوحات التحكم التفاعلية للأنظمة المؤسسية.',
                'employment_type' => 'FULL_TIME',
                'min_budget' => 14000.00,
                'max_budget' => 20000.00,
                'status' => 'OPEN',
            ]);

        $openingRes->assertStatus(201);
        $openingId = $openingRes->json('data.id');

        // 2. Submit Application
        $appRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson("/api/v1/recruitment/openings/{$openingId}/applications", [
                'candidate_name' => 'طارق الزهراني',
                'candidate_email' => 'tariq.zahrani@gmail.com',
                'candidate_phone' => '+966501122334',
                'expected_salary' => 18000.00,
            ]);

        $appRes->assertStatus(201);
        $appId = $appRes->json('data.id');

        // 3. Move Stage to INTERVIEW
        $stageRes = $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/recruitment/applications/{$appId}/stage", [
                'stage' => 'INTERVIEW',
            ]);

        $stageRes->assertStatus(200);
        $this->assertDatabaseHas('job_applications', [
            'id' => $appId,
            'stage' => 'INTERVIEW',
        ]);

        // 4. Rate Interview
        $scoreRes = $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/recruitment/applications/{$appId}/scorecard", [
                'scorecard_rating' => 5,
                'interviewer_feedback' => 'مرشح متميز بخبرة عالية في React 19 وNext.js 15',
            ]);

        $scoreRes->assertStatus(200);

        // 5. Delete Opening (Cascades)
        $delRes = $this->actingAs($this->hrManager, 'sanctum')
            ->deleteJson("/api/v1/recruitment/openings/{$openingId}");

        $delRes->assertStatus(200);
        $this->assertDatabaseMissing('job_openings', ['id' => $openingId]);
    }

    public function test_okr_goal_lifecycle(): void
    {
        // 1. Create OKR Goal
        $createRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/performance/goals', [
                'employee_id' => $this->employee->id,
                'title' => 'تحسين مؤشرات الأداء الوظيفي وتقليل زمن المعالجة',
                'cycle_period' => 'Q4-2026',
                'progress_percentage' => 20,
                'status' => 'IN_PROGRESS',
            ]);

        $createRes->assertStatus(201);
        $goalId = $createRes->json('data.id');

        // 2. Update Progress to 100%
        $progressRes = $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/performance/goals/{$goalId}/progress", [
                'progress_percentage' => 100,
                'status' => 'ACHIEVED',
            ]);

        $progressRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'progress_percentage' => 100,
                    'status' => 'ACHIEVED',
                ],
            ]);

        // 3. Delete Goal
        $delRes = $this->actingAs($this->hrManager, 'sanctum')
            ->deleteJson("/api/v1/performance/goals/{$goalId}");

        $delRes->assertStatus(200);
        $this->assertDatabaseMissing('okr_goals', ['id' => $goalId]);
    }

    public function test_grievance_case_lifecycle(): void
    {
        // 1. File Grievance Case
        $fileRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/grievances', [
                'complainant_employee_id' => $this->employee->id,
                'category' => 'WORK_ENVIRONMENT',
                'incident_description' => 'ملاحظات تتعلق ببيئة العمل وطلب تحسين الإضاءة في المكاتب الهندسية.',
                'is_confidential' => true,
            ]);

        $fileRes->assertStatus(201);
        $caseId = $fileRes->json('data.id');

        // 2. Update Status to RESOLVED
        $statusRes = $this->actingAs($this->hrManager, 'sanctum')
            ->patchJson("/api/v1/grievances/{$caseId}/status", [
                'status' => 'RESOLVED',
                'resolution_notes' => 'تم استبدال وحدات الإضاءة والتأكد من مطابقة المعايير.',
            ]);

        $statusRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'RESOLVED',
                ],
            ]);

        // 3. Delete Grievance
        $delRes = $this->actingAs($this->hrManager, 'sanctum')
            ->deleteJson("/api/v1/grievances/{$caseId}");

        $delRes->assertStatus(200);
        $this->assertDatabaseMissing('grievance_cases', ['id' => $caseId]);
    }
}
