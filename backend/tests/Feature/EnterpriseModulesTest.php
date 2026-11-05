<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\CompanyAsset;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobOpening;
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
}

