<?php

namespace Tests\Unit;

use App\Services\Payroll\EgyptPayrollService;
use App\Services\Payroll\EndOfServiceService;
use App\Services\Payroll\SaudiPayrollService;
use PHPUnit\Framework\TestCase;

class PayrollStatutoryTest extends TestCase
{
    public function test_saudi_citizen_gosi_and_net_calculation(): void
    {
        $service = new SaudiPayrollService();
        $result = $service->computeMonthlyPayroll(18000, 4500, 1500, true);

        $this->assertEquals(24000.00, $result['gross_salary']);
        $this->assertEquals(22500.00, $result['contributory_wage']);
        $this->assertEquals(2193.75, $result['employee_gosi']);
        $this->assertEquals(2643.75, $result['employer_gosi']);
        $this->assertEquals(21806.25, $result['net_salary']);
    }

    public function test_saudi_expat_hazard_only_calculation(): void
    {
        $service = new SaudiPayrollService();
        $result = $service->computeMonthlyPayroll(14000, 3000, 1000, false);

        $this->assertEquals(18000.00, $result['gross_salary']);
        $this->assertEquals(0.00, $result['employee_gosi']);
        $this->assertEquals(340.00, $result['employer_gosi']);
        $this->assertEquals(18000.00, $result['net_salary']);
    }

    public function test_egypt_social_insurance_and_progressive_tax_calculation(): void
    {
        $service = new EgyptPayrollService();
        $result = $service->computeMonthlyPayroll(15000, 3000, 2000);

        $this->assertEquals(20000.00, $result['gross_salary']);
        $this->assertEquals(12600.00, $result['insurable_wage']);
        $this->assertEquals(1386.00, $result['employee_social_insurance']);
        $this->assertEquals(2362.50, $result['employer_social_insurance']);
        $this->assertEquals(2542.32, $result['income_tax']);
        $this->assertEquals(10.00, $result['martyrs_fund']);
        $this->assertEquals(15861.68, $result['net_salary']);
    }

    public function test_saudi_end_of_service_articles_84_and_85(): void
    {
        $service = new EndOfServiceService();

        // 4.5 years resignation -> 1/3 award
        $resignation = $service->calculate(18000, 4.5, 'RESIGNATION');
        $this->assertEquals(40500.00, $resignation['base_entitlement']);
        $this->assertEquals(13500.00, $resignation['final_award_amount']);

        // 7 years termination -> 100% full award
        $termination = $service->calculate(20000, 7.0, 'TERMINATION');
        $this->assertEquals(90000.00, $termination['base_entitlement']);
        $this->assertEquals(90000.00, $termination['final_award_amount']);
    }
}
