<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\V1\PayrollController;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Tests\TestCase;

class PayrollRunDatabaseTest extends TestCase
{
    public function test_end_to_end_saudi_payroll_run_and_wps_export(): void
    {
        $company = Company::where('country_code', 'SAU')->first();
        if (!$company) {
            $this->markTestSkipped('Database not seeded yet');
        }

        $user = User::first();
        $controller = app(PayrollController::class);

        $request = new Request([
            'company_id' => $company->id,
            'cycle_name' => 'مسير اختبار الآلي لنظام حماية الأجور',
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-30',
            'disbursement_date' => '2026-11-27',
        ]);
        $request->setUserResolver(fn() => $user);

        $response = $controller->store($request);
        $this->assertEquals(201, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertTrue($data['success']);
        $this->assertGreaterThan(0, $data['data']['total_net']);

        // Test SIF export stream
        ob_start();
        $sifResponse = $controller->exportWpsSif($data['data']['id']);
        $sifResponse->sendContent();
        $sif = ob_get_clean();

        $this->assertStringContainsString('SCR', $sif);
        $this->assertStringContainsString('EDR', $sif);
        $this->assertStringContainsString('RJHI', $sif);
    }
}

