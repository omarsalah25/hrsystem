# Phase 07: Regional Labor Compliance & Statutory Formulas
## Egypt & Saudi Arabia / GCC Payroll, Tax & Labor Law Specifications

This document defines the exact statutory calculations, payroll rules, social insurance rates, tax deductions, and compliance workflows for **Egypt** and **Saudi Arabia (KSA / GCC)**.

---

## 🇪🇬 Pillar 1: Egypt Labor Law & Statutory Payroll Engine

### 1. Egyptian Legal Framework
- **Labor Law No. 12 of 2003** (and its pending reform amendments).
- **Social Insurance & Pensions Law No. 148 of 2019** (Effective Jan 1, 2020).
- **Personal Income Tax Law No. 91 of 2005**, as amended by **Law No. 30 of 2023** and the **2024 Presidential Decrees** (increased personal tax exemption to EGP 20,000 and total personal exemption threshold to EGP 60,000 annually).
- **Universal Health Insurance Law No. 2 of 2018**.
- **Labor Emergency Fund (Law 156 of 2002)** and **Martyrs Fund (Law 4 of 2021)**.

---

### 2. Egypt Social Insurance Engine (Law 148 of 2019)

Social insurance in Egypt is calculated on the **Comprehensive Insured Wage** (*الأجر التأميني الشامل*), which includes base salary and recurring fixed allowances, subject to government-mandated annual minimum and maximum caps.

```
2024 Statutory Caps:
- Minimum Insurable Monthly Wage: EGP 2,000
- Maximum Insurable Monthly Wage: EGP 12,600
(Note: Automatically indexed annually on January 1st by ~15%)
```

#### Contribution Rates:
- **Employee Share:** **11.0%** of the insurable wage.
- **Employer Share:** **18.75%** of the insurable wage (includes Old Age, Disability, Death: 12%, Work Injury: 1.5%–3.0%, Unemployment: 1.0%, Sickness: 3.25%).
- **Labor Emergency Fund (Employer):** **1.0%** of basic salary.
- **Martyrs & Victims of Terrorist Operations Fund:** **0.05%** of monthly wage.

```php
namespace App\Services\Payroll\Jurisdictions;

class EgyptSocialInsuranceCalculator
{
    private const MIN_INSURABLE_WAGE = 2000.00;
    private const MAX_INSURABLE_WAGE = 12600.00;
    private const EMPLOYEE_RATE = 0.11; // 11%
    private const EMPLOYER_RATE = 0.1875; // 18.75%

    public function calculate(float $grossSalary): array
    {
        // Clamp wage between statutory minimum and maximum
        $insurableWage = min(max($grossSalary, self::MIN_INSURABLE_WAGE), self::MAX_INSURABLE_WAGE);

        $employeeShare = round($insurableWage * self::EMPLOYEE_RATE, 2);
        $employerShare = round($insurableWage * self::EMPLOYER_RATE, 2);
        $emergencyFund = round($insurableWage * 0.01, 2); // 1%

        return [
            'insurable_wage' => $insurableWage,
            'employee_social_insurance' => $employeeShare,
            'employer_social_insurance' => $employerShare,
            'emergency_fund_employer' => $emergencyFund,
        ];
    }
}
```

---

### 3. Egypt Income Tax Engine (Law 30 of 2023 / 2024 Revisions)

Egypt uses an **Annual Progressive Bracket** system with a personal exemption deduction. The monthly salary must be annualized, subjected to brackets, and converted back to monthly withholding.

#### Annual Personal Exemption:
- **Personal Exemption Allowance:** EGP 20,000 annually.
- **Zero-Bracket (0% Rate):** First EGP 40,000 of taxable income.
- **Combined Non-Taxable Threshold:** EGP 60,000 annually (EGP 5,000 / month).

#### Progressive Annual Tax Brackets (For Net Income up to EGP 600,000):

| Bracket Tier | Net Taxable Annual Income (EGP) | Tax Rate | Bracket Width (EGP) | Max Tax in Tier (EGP) |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | 1 to 40,000 | **0%** | 40,000 | 0.00 |
| **Tier 2** | 40,001 to 55,000 | **10%** | 15,000 | 1,500.00 |
| **Tier 3** | 55,001 to 70,000 | **15%** | 15,000 | 2,250.00 |
| **Tier 4** | 70,001 to 200,000 | **20%** | 130,000 | 26,000.00 |
| **Tier 5** | 200,001 to 400,000 | **22.5%** | 200,000 | 45,000.00 |
| **Tier 6** | 400,001 to 1,200,000 | **25%** | 800,000 | 200,000.00 |
| **Tier 7** | Exceeding 1,200,000 | **27.5%** | Unlimited | — |

*Note: For individuals whose annual income exceeds EGP 600,000, 700,000, etc., Egyptian law phases out the lower brackets (Tier 1 0% is removed, then Tier 2 10% is removed).*

#### Comprehensive Health Insurance (التأمين الصحي الشامل):
- **Employee Withholding:** 1.0% of total gross salary (plus 3% for non-working spouse, 1% per child if applicable).
- **Company Takaful Contribution:** 0.25% of company's total annual revenues (calculated at corporate finance level).

```php
namespace App\Services\Payroll\Jurisdictions;

class EgyptIncomeTaxCalculator
{
    private const ANNUAL_PERSONAL_EXEMPTION = 20000.00;

    public function calculateMonthlyTax(float $annualGross, float $annualEmployeeSocialInsurance): float
    {
        // Net Taxable Income = Annual Gross - Employee Social Insurance - Personal Exemption
        $taxableIncome = $annualGross - $annualEmployeeSocialInsurance - self::ANNUAL_PERSONAL_EXEMPTION;

        if ($taxableIncome <= 0) {
            return 0.00;
        }

        $tax = 0.00;

        // Bracket 1: 0 to 40,000 @ 0%
        // Bracket 2: 40,001 to 55,000 @ 10%
        if ($taxableIncome > 40000) {
            $tax += min($taxableIncome - 40000, 15000) * 0.10;
        }
        // Bracket 3: 55,001 to 70,000 @ 15%
        if ($taxableIncome > 55000) {
            $tax += min($taxableIncome - 55000, 15000) * 0.15;
        }
        // Bracket 4: 70,001 to 200,000 @ 20%
        if ($taxableIncome > 70000) {
            $tax += min($taxableIncome - 70000, 130000) * 0.20;
        }
        // Bracket 5: 200,001 to 400,000 @ 22.5%
        if ($taxableIncome > 200000) {
            $tax += min($taxableIncome - 200000, 200000) * 0.225;
        }
        // Bracket 6: 400,001 to 1,200,000 @ 25%
        if ($taxableIncome > 400000) {
            $tax += min($taxableIncome - 400000, 800000) * 0.25;
        }
        // Bracket 7: > 1,200,000 @ 27.5%
        if ($taxableIncome > 1200000) {
            $tax += ($taxableIncome - 1200000) * 0.275;
        }

        return round($tax / 12, 2); // Convert back to monthly withholding
    }
}
```

---

### 4. Egypt Statutory Leave Rules
- **Annual Leave:** 21 days for the first 10 years of service; increased to **30 days** once continuous service exceeds 10 years OR the employee reaches 50 years of age.
- **Sick Leave:**
  - First 90 days: 75% of insurable wage.
  - Next 90 days: 85% of insurable wage.
  - Paid via General Authority for Health Insurance.
- **Maternity Leave:** 90 days (under current law) / 120 days (under recent civil service / draft amendments) with 100% compensation, up to 3 times in employment life.

---

## 🇸🇦 Pillar 2: Saudi Arabia & GCC Labor Compliance Engine

### 1. Saudi Legal & Regulatory Framework
- **Saudi Labor Law (Royal Decree No. M/51)** as amended.
- **GOSI (General Organization for Social Insurance)** regulations.
- **Wage Protection System (WPS / نظام حماية الأجور)** via **Mudad (منصة مَدَد)**.
- **Qiwa (قوى)**: Unified Ministry of Human Resources platform for employment contracts, probation management, and transfers.
- **Muqeem (مقيم)**: Resident expatriate tracking (Iqama status, exit-re-entry visas).

---

### 2. Saudi GOSI Social Insurance Engine

Contributions depend directly on whether the employee is a **Saudi National** or an **Expatriate**:

```
2024 Insurable Wage Scope:
- Base Salary + Housing Allowance (or 2 months basic salary equivalent if company provides accommodation).
- Minimum Insurable Monthly Wage: SAR 1,500 (Saudi) / SAR 400 (Non-Saudi)
- Maximum Insurable Monthly Wage: SAR 45,000
```

#### Contribution Rates:

| Component | Saudi National Employee | Saudi Employer (For Saudis) | Expatriate Employee | Saudi Employer (For Expats) |
| :--- | :---: | :---: | :---: | :---: |
| **Annuities (Pension)** | **9.0%** | **9.0%** | 0.0% | 0.0% |
| **SANED (Unemployment)** | **0.75%** | **0.75%** | 0.0% | 0.0% |
| **Occupational Hazards** | 0.0% | **2.0%** | 0.0% | **2.0%** |
| **Total Contribution** | **9.75%** | **11.75%** | **0.0%** | **2.0%** |

```php
namespace App\Services\Payroll\Jurisdictions;

class SaudiGOSICalculator
{
    private const MIN_SAUDI_WAGE = 1500.00;
    private const MIN_EXPAT_WAGE = 400.00;
    private const MAX_WAGE = 45000.00;

    public function calculate(float $basicSalary, float $housingAllowance, bool $isSaudiNational): array
    {
        $contributoryWage = $basicSalary + $housingAllowance;
        $minWage = $isSaudiNational ? self::MIN_SAUDI_WAGE : self::MIN_EXPAT_WAGE;
        $cappedWage = min(max($contributoryWage, $minWage), self::MAX_WAGE);

        if ($isSaudiNational) {
            // Employee pays 9% Pension + 0.75% SANED = 9.75%
            $employeeShare = round($cappedWage * 0.0975, 2);
            // Employer pays 9% Pension + 0.75% SANED + 2% Hazards = 11.75%
            $employerShare = round($cappedWage * 0.1175, 2);
        } else {
            // Expatriate employee pays 0%
            $employeeShare = 0.00;
            // Employer pays 2% Occupational Hazards
            $employerShare = round($cappedWage * 0.02, 2);
        }

        return [
            'contributory_wage' => $cappedWage,
            'employee_gosi' => $employeeShare,
            'employer_gosi' => $employerShare,
        ];
    }
}
```

---

### 3. Saudi End of Service Award / Gratuity (ESB - مكافأة نهاية الخدمة)

Calculated strictly under **Article 84 & 85 of Saudi Labor Law**:
$$\text{ESB Base} = \text{Half Month's Last Salary per year for first 5 years} + \text{Full Month's Last Salary per year thereafter}$$

#### Separation Reductions (Article 85):
When an employee **resigns** voluntarily (unlike termination by company, contract expiry, or redundancy where 100% is paid):

| Continuous Tenure | Resignation Entitlement | Article Reference |
| :--- | :--- | :--- |
| **Less than 2 years** | **0% (Zero)** | Art. 85 |
| **2 to 5 years** | **One-Third (33.33%)** of the calculated award | Art. 85 |
| **5 to 10 years** | **Two-Thirds (66.66%)** of the calculated award | Art. 85 |
| **10+ years** | **100% (Full Award)** | Art. 85 |
| *Female employee leaving within 6 months of marriage or 3 months of childbirth* | **100% (Full Award regardless of tenure)** | Art. 87 |

```php
namespace App\Services\Payroll\Jurisdictions;

class SaudiEndofServiceCalculator
{
    public function calculate(
        float $lastFullSalary,
        float $serviceYears,
        string $separationReason, // 'TERMINATED_BY_EMPLOYER', 'CONTRACT_EXPIRED', 'RESIGNATION', 'MARRIAGE_FEMALE'
        bool $isFemale = false
    ): float {
        if ($serviceYears < (1.0 / 12.0)) { // Less than 1 month
            return 0.00;
        }

        // 1. Calculate Base Entitlement
        $baseAward = 0.00;
        if ($serviceYears <= 5.0) {
            $baseAward = ($lastFullSalary / 2) * $serviceYears;
        } else {
            $firstFiveYears = ($lastFullSalary / 2) * 5.0;
            $remainingYears = $serviceYears - 5.0;
            $baseAward = $firstFiveYears + ($lastFullSalary * $remainingYears);
        }

        // 2. Apply Separation Factor
        if (in_array($separationReason, ['TERMINATED_BY_EMPLOYER', 'CONTRACT_EXPIRED', 'FORCE_MAJEURE', 'RETIREMENT'])) {
            return round($baseAward, 2);
        }

        if ($separationReason === 'MARRIAGE_FEMALE' && $isFemale) {
            return round($baseAward, 2); // 100% under Art 87
        }

        if ($separationReason === 'RESIGNATION') {
            if ($serviceYears < 2.0) {
                return 0.00;
            } elseif ($serviceYears <= 5.0) {
                return round($baseAward * (1.0 / 3.0), 2); // 1/3
            } elseif ($serviceYears <= 10.0) {
                return round($baseAward * (2.0 / 3.0), 2); // 2/3
            } else {
                return round($baseAward, 2); // Full
            }
        }

        return round($baseAward, 2);
    }
}
```

---

### 4. Saudi Wage Protection System (WPS / Mudad SIF File Generator)

Saudi regulations require monthly payroll submissions through the **Wage Protection System (WPS)** via **Mudad** or directly to corporate banks (e.g. Al Rajhi, NCB/SNB, Riyad Bank). The file format is the standardized **Standard Interface File (SIF)** CSV:

#### Header Record Format:
`SCR,CorporateEmployerNumber,BankCode,FileCreationDate,FileCreationTime,FileReferenceNumber,PayerAccountIBAN,TotalAmount,TotalRecordCount,Currency`

#### Employee Record Format:
`EDR,EmployeeNationalOrIqamaID,EmployeeName,EmployeeAccountIBAN,EmployeeBankCode,BasicSalary,HousingAllowance,OtherAllowances,Deductions,ReferenceNumber`

```php
namespace App\Services\Payroll\Export;

use App\Models\PayrollRun;

class SaudiMudadWpsExporter
{
    public function generateSifCsv(PayrollRun $run): string
    {
        $rows = [];
        $company = $run->company;

        // Header (SCR)
        $date = now()->format('Ymd');
        $time = now()->format('Hi');
        $ref = 'PAY' . $run->id;
        
        $rows[] = implode(',', [
            'SCR',
            $company->tax_registration_number,
            $company->bank_code,
            $date,
            $time,
            $ref,
            $company->primary_iban,
            number_format($run->total_net, 2, '.', ''),
            $run->payslips()->count(),
            'SAR'
        ]);

        // Employee Records (EDR)
        foreach ($run->payslips as $payslip) {
            $employee = $payslip->employee;
            $bank = $employee->primaryBankAccount;
            $profile = $employee->profile;

            $rows[] = implode(',', [
                'EDR',
                $profile->national_id_number, // National ID for Saudis, Iqama for Expats
                str_replace(',', ' ', $employee->full_name),
                $bank->iban,
                $bank->swift_bic,
                number_format($payslip->basic_salary, 2, '.', ''),
                number_format($payslip->housing_allowance, 2, '.', ''),
                number_format($payslip->other_allowances, 2, '.', ''),
                number_format($payslip->total_deductions, 2, '.', ''),
                'EMP' . $employee->id
            ]);
        }

        return implode("\r\n", $rows);
    }
}
```

---

### 5. Expatriate Muqeem & Iqama Expiry Lifecycle

In Saudi Arabia & GCC, managing expatriates requires strict tracking of legal permits:
1. **Iqama (Residence Permit) Expiry Alerts:**
   - Automated alerts at 90 days, 60 days, and 30 days before expiration.
   - If expired, bank accounts are frozen by Saudi central bank (SAMA), preventing payroll payout.
2. **Qiwa Contract Verification:**
   - Integration status tracking: Probation period limit (maximum 90 days, extendable by mutual written agreement up to 180 days).
   - Contract authentication status (`AUTHENTICATED`, `PENDING_EMPLOYEE_APPROVAL`, `TERMINATED`).
3. **Exit-Re-Entry Visa Tracking:**
   - Single / Multiple exit-re-entry tracking for expatriates taking annual vacation abroad.

