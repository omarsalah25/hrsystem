<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\EmployeeProfile;
use App\Models\EmployeeSalary;
use App\Models\LeaveType;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Tenant
        $tenant = Tenant::create([
            'name' => 'مجموعة المستقبل القابضة | Future Group',
            'subdomain' => 'demo',
            'subscription_plan' => 'ENTERPRISE',
            'country_jurisdiction' => 'SAUDI_ARABIA',
            'is_active' => true,
        ]);

        // 2. Admin User
        $admin = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'مدير النظام | System Admin',
            'email' => 'admin@hrsystem.com',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        // 3. Companies (Egypt & Saudi Branches)
        $ksaCompany = Company::create([
            'tenant_id' => $tenant->id,
            'legal_name' => 'شركة الرياض للحلول الرقمية ذ.م.م',
            'trade_name' => 'Riyadh Tech',
            'commercial_registration_no' => '1010892341',
            'tax_registration_no' => '300123456700003',
            'social_insurance_no' => '987654321',
            'wps_employer_id' => '7001234567',
            'bank_code' => 'RJHI',
            'primary_iban' => 'SA0380000000608010167519',
            'country_code' => 'SAU',
            'currency' => 'SAR',
        ]);

        $egyCompany = Company::create([
            'tenant_id' => $tenant->id,
            'legal_name' => 'شركة القاهرة للبرمجيات ش.م.م',
            'trade_name' => 'Cairo Soft',
            'commercial_registration_no' => '452109',
            'tax_registration_no' => '982-114-873',
            'social_insurance_no' => '55443322',
            'country_code' => 'EGY',
            'currency' => 'EGP',
        ]);

        // 4. Branches with GPS Geofencing
        $riyadhBranch = Branch::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'name' => 'المقر الرئيسي - الرياض (Olaya)',
            'address_line' => 'طريق الملك فهد، حي العليا',
            'city' => 'الرياض',
            'timezone' => 'Asia/Riyadh',
            'geofence_latitude' => 24.7136,
            'geofence_longitude' => 46.6753,
            'geofence_radius_meters' => 250,
            'attendance_mode' => 'BOTH',
        ]);

        $cairoBranch = Branch::create([
            'tenant_id' => $tenant->id,
            'company_id' => $egyCompany->id,
            'name' => 'فرع القاهرة - القرية الذكية',
            'address_line' => 'الكيلو 28 طريق مصر الإسكندرية الصحراوي',
            'city' => 'الجيزة / القاهرة',
            'timezone' => 'Africa/Cairo',
            'geofence_latitude' => 30.0754,
            'geofence_longitude' => 31.0205,
            'geofence_radius_meters' => 300,
            'attendance_mode' => 'BOTH',
        ]);

        // 5. Departments & Designations
        $techDept = Department::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'name' => 'إدارة تقنية المعلومات والهندسة',
            'code' => 'ENG',
            'cost_center_code' => 'CC-TECH-01',
        ]);

        $devRole = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'كبير مهندسي البرمجيات | Senior Software Engineer',
            'job_level' => 'L4',
            'min_salary' => 15000.00,
            'max_salary' => 28000.00,
        ]);

        // 6. Leave Types
        LeaveType::create([
            'tenant_id' => $tenant->id,
            'code' => 'ANNUAL',
            'name' => 'إجازة سنوية | Annual Leave',
            'annual_quota_days' => 21,
            'is_paid' => true,
            'allow_carryover' => true,
            'max_carryover_days' => 5,
        ]);

        LeaveType::create([
            'tenant_id' => $tenant->id,
            'code' => 'SICK',
            'name' => 'إجازة مرضية | Sick Leave',
            'annual_quota_days' => 15,
            'is_paid' => true,
        ]);

        // 7. Seed Sample Employees
        // Saudi Employee
        $saudiEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'branch_id' => $riyadhBranch->id,
            'department_id' => $techDept->id,
            'designation_id' => $devRole->id,
            'employee_number' => 'EMP-SA-001',
            'first_name' => 'عبدالله',
            'middle_name' => 'سعد',
            'last_name' => 'العتيبي',
            'work_email' => 'abdullah@futuregroup.com',
            'phone_number' => '+966501234567',
            'hire_date' => '2023-01-15',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1001',
            'employment_status' => 'ACTIVE',
        ]);

        EmployeeProfile::create([
            'employee_id' => $saudiEmp->id,
            'national_id_encrypted' => encrypt('1098765432'),
            'date_of_birth' => '1992-06-15',
            'gender' => 'MALE',
            'nationality' => 'SAU',
        ]);

        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saudiEmp->id,
            'effective_from' => '2023-01-15',
            'base_salary' => 18000.00,
            'housing_allowance' => 4500.00,
            'transportation_allowance' => 1500.00,
            'currency' => 'SAR',
            'is_current' => true,
        ]);

        // Egyptian Employee
        $egyEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $egyCompany->id,
            'branch_id' => $cairoBranch->id,
            'department_id' => $techDept->id,
            'designation_id' => $devRole->id,
            'employee_number' => 'EMP-EG-001',
            'first_name' => 'أحمد',
            'middle_name' => 'محمود',
            'last_name' => 'الشافعي',
            'work_email' => 'ahmed.elshafey@futuregroup.com',
            'phone_number' => '+201012345678',
            'hire_date' => '2023-05-01',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1002',
            'employment_status' => 'ACTIVE',
        ]);

        EmployeeProfile::create([
            'employee_id' => $egyEmp->id,
            'national_id_encrypted' => encrypt('29408150102345'),
            'date_of_birth' => '1994-08-15',
            'gender' => 'MALE',
            'nationality' => 'EGY',
        ]);

        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $egyEmp->id,
            'effective_from' => '2023-05-01',
            'base_salary' => 25000.00,
            'housing_allowance' => 0.00,
            'transportation_allowance' => 3000.00,
            'currency' => 'EGP',
            'is_current' => true,
        ]);
    }
}
