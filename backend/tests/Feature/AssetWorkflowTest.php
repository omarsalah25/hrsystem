<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CompanyAsset;
use App\Models\Employee;
use App\Models\Tenant;
use App\Models\User;
use Tests\TestCase;

class AssetWorkflowTest extends TestCase
{
    private User $admin;
    private User $hrManager;
    private Company $company;
    private Employee $employee;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::where('email', 'admin@hrsystem.com')->firstOrFail();
        $this->hrManager = User::where('email', 'hr@hrsystem.com')->firstOrFail();
        $this->company = Company::firstOrFail();
        $this->employee = Employee::firstOrFail();
    }

    public function test_asset_lifecycle_create_assign_return_and_delete(): void
    {
        $uniqueCode = 'AST-TEST-' . rand(1000, 9999);

        // 1. Create Asset
        $createRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson('/api/v1/assets', [
                'company_id' => $this->company->id,
                'asset_code' => $uniqueCode,
                'name_ar' => 'شاشة ديل ألترا شارب 27 بوصة',
                'name_en' => 'Dell UltraSharp 27" 4K',
                'category' => 'EQUIPMENT',
                'serial_number' => 'DL-US-' . rand(1000, 9999),
                'purchase_value' => 2800.00,
                'purchase_date' => '2026-10-01',
                'status' => 'AVAILABLE',
            ]);

        $createRes->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Asset registered successfully',
            ]);

        $assetId = $createRes->json('data.id');

        // 2. Assign Asset to Employee
        $assignRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson("/api/v1/assets/{$assetId}/assign", [
                'employee_id' => $this->employee->id,
                'assigned_date' => '2026-11-01',
                'condition_on_handover' => 'NEW',
                'handover_notes' => 'تسليم بحالة المصنع الجديدة',
            ]);

        $assignRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Asset assigned to employee successfully',
            ]);

        $this->assertDatabaseHas('company_assets', [
            'id' => $assetId,
            'status' => 'ASSIGNED',
        ]);

        // 3. Return Asset
        $returnRes = $this->actingAs($this->hrManager, 'sanctum')
            ->postJson("/api/v1/assets/{$assetId}/return", [
                'returned_date' => '2026-11-05',
                'condition_on_return' => 'EXCELLENT',
                'handover_notes' => 'تم الاستلام وإعادة الإدخال للمستودع',
            ]);

        $returnRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Asset returned successfully',
            ]);

        $this->assertDatabaseHas('company_assets', [
            'id' => $assetId,
            'status' => 'AVAILABLE',
        ]);

        // 4. Delete Asset
        $deleteRes = $this->actingAs($this->hrManager, 'sanctum')
            ->deleteJson("/api/v1/assets/{$assetId}");

        $deleteRes->assertStatus(200);
        $this->assertDatabaseMissing('company_assets', ['id' => $assetId]);
    }
}
