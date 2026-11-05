<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Tenant;
use App\Models\User;
use Tests\TestCase;

class CompanyAndBranchCrudTest extends TestCase
{
    private User $admin;
    private User $hrManager;
    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::first() ?? Tenant::create([
            'name' => 'Demo Tenant',
            'subdomain' => 'demo',
            'subscription_plan' => 'ENTERPRISE',
            'country_jurisdiction' => 'SAUDI_ARABIA',
            'is_active' => true,
        ]);

        $this->admin = User::where('email', 'admin@hrsystem.com')->first();
        $this->hrManager = User::where('email', 'hr@hrsystem.com')->first();
    }

    public function test_create_and_delete_new_legal_entity(): void
    {
        $payload = [
            'legal_name' => 'شركة البحر الأحمر للتقنية ذ.م.م',
            'trade_name' => 'Red Sea Tech',
            'commercial_registration_no' => '4030198273',
            'tax_registration_no' => '300998877600003',
            'country_code' => 'SAU',
            'currency' => 'SAR',
        ];

        // 1. Create Company
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/companies', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Company registered successfully',
            ]);

        $companyId = $response->json('data.id');

        // 2. Create Branch for this Company
        $branchResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/branches', [
                'company_id' => $companyId,
                'name' => 'فرع ينبع الصناعية',
                'address_line' => 'طريق الميناء',
                'city' => 'ينبع',
                'geofence_latitude' => 24.0232,
                'geofence_longitude' => 38.1900,
                'geofence_radius_meters' => 250,
                'attendance_mode' => 'BOTH',
            ]);

        $branchResponse->assertStatus(201);
        $branchId = $branchResponse->json('data.id');

        // 3. Update Geofence
        $geofenceRes = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/branches/{$branchId}/geofence", [
                'geofence_latitude' => 24.0240,
                'geofence_longitude' => 38.1910,
                'geofence_radius_meters' => 300,
                'attendance_mode' => 'MOBILE_GEOFENCE_ONLY',
            ]);

        $geofenceRes->assertStatus(200);

        // 4. Delete Branch
        $delBranchRes = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/branches/{$branchId}");

        $delBranchRes->assertStatus(200);
        $this->assertDatabaseMissing('branches', ['id' => $branchId]);

        // 5. Delete Company
        $delCompRes = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/companies/{$companyId}");

        $delCompRes->assertStatus(200);
        $this->assertDatabaseMissing('companies', ['id' => $companyId]);
    }
}
