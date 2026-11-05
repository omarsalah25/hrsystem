<?php

namespace Database\Seeders;

use App\Models\AssetAssignment;
use App\Models\AttendancePunch;
use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Company;
use App\Models\CompanyAsset;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\EmployeeProfile;
use App\Models\EmployeeSalary;
use App\Models\GrievanceCase;
use App\Models\JobApplication;
use App\Models\JobOpening;
use App\Models\LeaveType;
use App\Models\OkrGoal;
use App\Models\PayrollRun;
use App\Models\Payslip;
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

        // 2. Core Users (RBAC)
        $admin = User::create([
            'tenant_id' => $tenant->id,
            'role' => 'SUPER_ADMIN',
            'name' => 'مدير النظام التنفيذي | Super Admin',
            'email' => 'admin@hrsystem.com',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        $hrManager = User::create([
            'tenant_id' => $tenant->id,
            'role' => 'HR_MANAGER',
            'name' => 'سارة القحطاني | HR Director',
            'email' => 'hr@hrsystem.com',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        $payrollOfficer = User::create([
            'tenant_id' => $tenant->id,
            'role' => 'PAYROLL_OFFICER',
            'name' => 'مسؤول الرواتب والعمليات | Payroll Officer',
            'email' => 'payroll@hrsystem.com',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        $auditor = User::create([
            'tenant_id' => $tenant->id,
            'role' => 'AUDITOR',
            'name' => 'مراقب الامتثال والحوكمة | Compliance Auditor',
            'email' => 'auditor@hrsystem.com',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        $employeeUser = User::create([
            'tenant_id' => $tenant->id,
            'role' => 'EMPLOYEE',
            'name' => 'عبدالله العتيبي | Senior Engineer',
            'email' => 'employee@hrsystem.com',
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

        $hrDept = Department::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'name' => 'الموارد البشرية والشؤون الإدارية',
            'code' => 'HR',
            'cost_center_code' => 'CC-HR-01',
        ]);

        $devRole = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'كبير مهندسي البرمجيات | Senior Software Engineer',
            'job_level' => 'L4',
            'min_salary' => 15000.00,
            'max_salary' => 28000.00,
        ]);

        $hrRole = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'مسؤول عمليات الموارد البشرية | HR Operations Lead',
            'job_level' => 'L3',
            'min_salary' => 12000.00,
            'max_salary' => 20000.00,
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

        LeaveType::create([
            'tenant_id' => $tenant->id,
            'code' => 'HAJJ',
            'name' => 'إجازة حج مدفوعة | Statutory Hajj Leave',
            'annual_quota_days' => 10,
            'is_paid' => true,
        ]);

        // 7. Seed Sample Employees
        // Saudi Employee 1: Abdullah Al-Otaibi
        $saudiEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'branch_id' => $riyadhBranch->id,
            'department_id' => $techDept->id,
            'designation_id' => $devRole->id,
            'user_id' => $employeeUser->id,
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
            'marital_status' => 'MARRIED',
            'residential_address' => 'الرياض - حي النرجس',
        ]);

        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saudiEmp->id,
            'effective_from' => '2023-01-15',
            'base_salary' => 18000.00,
            'housing_allowance' => 4500.00,
            'transportation_allowance' => 1500.00,
            'other_allowances' => 0.00,
            'currency' => 'SAR',
            'is_current' => true,
        ]);

        // Egyptian Employee 1: Ahmed El-Shafey
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
            'marital_status' => 'SINGLE',
            'residential_address' => 'القاهرة الجديدة - التجمع الخامس',
        ]);

        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $egyEmp->id,
            'effective_from' => '2023-05-01',
            'base_salary' => 25000.00,
            'housing_allowance' => 0.00,
            'transportation_allowance' => 3000.00,
            'other_allowances' => 0.00,
            'currency' => 'EGP',
            'is_current' => true,
        ]);

        // Saudi Employee 2: Sara Al-Qahtani
        $saraEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'branch_id' => $riyadhBranch->id,
            'department_id' => $hrDept->id,
            'designation_id' => $hrRole->id,
            'user_id' => $hrManager->id,
            'employee_number' => 'EMP-SA-002',
            'first_name' => 'سارة',
            'middle_name' => 'محمد',
            'last_name' => 'القحطاني',
            'work_email' => 'sara.qahtani@futuregroup.com',
            'phone_number' => '+966559876543',
            'hire_date' => '2023-08-10',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1003',
            'employment_status' => 'ACTIVE',
        ]);

        EmployeeProfile::create([
            'employee_id' => $saraEmp->id,
            'national_id_encrypted' => encrypt('1087654321'),
            'date_of_birth' => '1995-11-20',
            'gender' => 'FEMALE',
            'nationality' => 'SAU',
            'marital_status' => 'SINGLE',
            'residential_address' => 'الرياض - حي الملقا',
        ]);

        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saraEmp->id,
            'effective_from' => '2023-08-10',
            'base_salary' => 15000.00,
            'housing_allowance' => 3500.00,
            'transportation_allowance' => 1000.00,
            'other_allowances' => 0.00,
            'currency' => 'SAR',
            'is_current' => true,
        ]);

        // Egyptian Employee 2: Nourhan El-Manshawy
        $nourhanEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $egyCompany->id,
            'branch_id' => $cairoBranch->id,
            'department_id' => $hrDept->id,
            'designation_id' => $hrRole->id,
            'employee_number' => 'EMP-EG-002',
            'first_name' => 'نورهان',
            'middle_name' => 'طارق',
            'last_name' => 'المنشاوي',
            'work_email' => 'nourhan.t@futuregroup.com',
            'phone_number' => '+201287654321',
            'hire_date' => '2024-02-01',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1004',
            'employment_status' => 'ACTIVE',
        ]);

        EmployeeProfile::create([
            'employee_id' => $nourhanEmp->id,
            'national_id_encrypted' => encrypt('29603120109876'),
            'date_of_birth' => '1996-03-12',
            'gender' => 'FEMALE',
            'nationality' => 'EGY',
            'marital_status' => 'SINGLE',
            'residential_address' => 'المعادي - القاهرة',
        ]);

        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $nourhanEmp->id,
            'effective_from' => '2024-02-01',
            'base_salary' => 19000.00,
            'housing_allowance' => 0.00,
            'transportation_allowance' => 3000.00,
            'other_allowances' => 0.00,
            'currency' => 'EGP',
            'is_current' => true,
        ]);

        // 8. Seed Company Assets
        $macbook = CompanyAsset::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'asset_code' => 'AST-LAP-001',
            'name_ar' => 'جهاز ماك بوك برو M3 Max',
            'name_en' => 'MacBook Pro 16" M3 Max',
            'category' => 'LAPTOP',
            'serial_number' => 'C02G4590MD6R',
            'purchase_value' => 14500.00,
            'purchase_date' => '2024-01-10',
            'status' => 'ASSIGNED',
        ]);

        AssetAssignment::create([
            'tenant_id' => $tenant->id,
            'asset_id' => $macbook->id,
            'employee_id' => $saudiEmp->id,
            'assigned_date' => '2024-01-15',
            'condition_on_handover' => 'NEW',
            'handover_notes' => 'سلم للمهندس عبدالله بكامل الملحقات وشاحن 140W',
        ]);

        $dell = CompanyAsset::create([
            'tenant_id' => $tenant->id,
            'company_id' => $egyCompany->id,
            'asset_code' => 'AST-LAP-002',
            'name_ar' => 'حاسوب ديل بريسيجن 5570',
            'name_en' => 'Dell Precision 5570 i7',
            'category' => 'LAPTOP',
            'serial_number' => 'DL9876210A',
            'purchase_value' => 62000.00,
            'purchase_date' => '2023-06-01',
            'status' => 'ASSIGNED',
        ]);

        AssetAssignment::create([
            'tenant_id' => $tenant->id,
            'asset_id' => $dell->id,
            'employee_id' => $egyEmp->id,
            'assigned_date' => '2023-06-05',
            'condition_on_handover' => 'NEW',
            'handover_notes' => 'تسليم للمهندس أحمد الشافعي للعمل على مشاريع البنية السحابية',
        ]);

        CompanyAsset::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'asset_code' => 'AST-PHN-001',
            'name_ar' => 'هاتف آيفون 15 برو تنفيذي',
            'name_en' => 'iPhone 15 Pro 256GB',
            'category' => 'PHONE',
            'serial_number' => 'F2LW8990P3',
            'purchase_value' => 4800.00,
            'purchase_date' => '2024-03-01',
            'status' => 'AVAILABLE',
        ]);

        // 9. Seed Recruitment & ATS
        $jobDev = JobOpening::create([
            'tenant_id' => $tenant->id,
            'department_id' => $techDept->id,
            'title_ar' => 'مهندس أول حلول سحابية ولارافيل',
            'title_en' => 'Senior Cloud & Laravel Architect',
            'job_description' => 'المسؤولية عن معمارية الأنظمة السحابية الموزعة وربط أجهزة البصمة البيومترية ومحركات الرواتب الإقليمية.',
            'employment_type' => 'FULL_TIME',
            'min_budget' => 20000.00,
            'max_budget' => 30000.00,
            'status' => 'OPEN',
        ]);

        JobApplication::create([
            'tenant_id' => $tenant->id,
            'job_opening_id' => $jobDev->id,
            'candidate_name' => 'خالد العجمي',
            'candidate_email' => 'khaled.ajmi@outlook.com',
            'candidate_phone' => '+966541112233',
            'expected_salary' => 26000.00,
            'stage' => 'OFFER',
            'scorecard_rating' => 5,
            'interviewer_feedback' => 'أداء متميز في المقابلة التقنية، إتقان كامل لمعمارية Laravel 11 وBullMQ ومطابقة أنظمة مدد وGOSI.',
        ]);

        JobApplication::create([
            'tenant_id' => $tenant->id,
            'job_opening_id' => $jobDev->id,
            'candidate_name' => 'محمد رضوان',
            'candidate_email' => 'm.radwan@gmail.com',
            'candidate_phone' => '+201123456789',
            'expected_salary' => 22000.00,
            'stage' => 'INTERVIEW',
            'scorecard_rating' => 4,
            'interviewer_feedback' => 'خبرة قوية في Next.js 15 وTypeScript، جاري التنسيق للمقابلة الفنية الثانية.',
        ]);

        // 10. Seed Grievances
        GrievanceCase::create([
            'tenant_id' => $tenant->id,
            'complainant_employee_id' => $saraEmp->id,
            'respondent_employee_id' => null,
            'case_number' => 'GRC-2026-0001',
            'category' => 'WORK_ENVIRONMENT',
            'incident_description' => 'طلب مراجعة درجات التكييف والإضاءة في قاعة العمليات بالرياض لتحسين بيئة العمل ومطابقة معايير الصحة المهنية.',
            'is_confidential' => true,
            'status' => 'RESOLVED',
            'resolution_notes' => 'تم التنسيق مع إدارة المرافق وصيانة أنظمة التبريد وضبط الحساسات المركزية.',
        ]);

        // 11. Seed OKR Goals
        OkrGoal::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saudiEmp->id,
            'title' => 'أتمتة تكامل منصة مدد ونظام حماية الأجور بنسبة 100%',
            'cycle_period' => 'Q4-2026',
            'progress_percentage' => 85,
            'status' => 'IN_PROGRESS',
        ]);

        OkrGoal::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $egyEmp->id,
            'title' => 'تقليص زمن استجابة محرك حساب ضرائب الدخل والتأمينات إلى أقل من 200ms',
            'cycle_period' => 'Q4-2026',
            'progress_percentage' => 100,
            'status' => 'ACHIEVED',
        ]);

        // 12. Seed Cryptographic SHA-256 Audit Trail
        $genesisHash = str_repeat('0', 64);
        $payload1 = ['action' => 'INITIAL_SYSTEM_BOOTSTRAP', 'tenant' => 'demo', 'timestamp' => '2026-11-05 00:00:00'];
        $hash1 = AuditLog::calculateHash($genesisHash, 'LOG-0001', 'System Admin', 'BOOTSTRAP', 'SYSTEM', $payload1);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'log_number' => 'LOG-0001',
            'actor_user_id' => $admin->id,
            'actor_name' => 'System Admin',
            'actor_role' => 'SUPER_ADMIN',
            'action_type' => 'BOOTSTRAP',
            'target_resource' => 'SYSTEM',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Internal Seed / CLI',
            'payload_diff' => $payload1,
            'prev_hash' => $genesisHash,
            'current_hash' => $hash1,
        ]);

        $payload2 = ['action' => 'EMPLOYEE_SALARY_CONFIG', 'employee' => 'EMP-SA-001', 'base_salary' => 18000.00];
        $hash2 = AuditLog::calculateHash($hash1, 'LOG-0002', 'System Admin', 'SALARY_CONFIG', 'EMP-SA-001', $payload2);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'log_number' => 'LOG-0002',
            'actor_user_id' => $admin->id,
            'actor_name' => 'System Admin',
            'actor_role' => 'SUPER_ADMIN',
            'action_type' => 'SALARY_CONFIG',
            'target_resource' => 'EMP-SA-001',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Internal Seed / CLI',
            'payload_diff' => $payload2,
            'prev_hash' => $hash1,
            'current_hash' => $hash2,
        ]);

        // 13. Seed Payroll Run & Payslips for Saudi Arabia
        $payrollRun = PayrollRun::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'cycle_name' => 'مسير رواتب أكتوبر 2026 - فرع الرياض',
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-31',
            'disbursement_date' => '2026-10-27',
            'total_gross' => 43500.00,
            'total_social_insurance' => 4001.25,
            'total_income_tax' => 0.00,
            'total_net' => 39498.75,
            'status' => 'FINANCE_APPROVED',
        ]);

        Payslip::create([
            'payroll_run_id' => $payrollRun->id,
            'employee_id' => $saudiEmp->id,
            'gross_earnings' => 24000.00,
            'employee_social_insurance' => 2193.75, // 9.75% on basic+housing
            'employer_social_insurance' => 2643.75, // 11.75%
            'income_tax' => 0.00,
            'unpaid_leave_deductions' => 0.00,
            'other_deductions' => 0.00,
            'net_pay' => 21806.25,
        ]);

        Payslip::create([
            'payroll_run_id' => $payrollRun->id,
            'employee_id' => $saraEmp->id,
            'gross_earnings' => 19500.00,
            'employee_social_insurance' => 1803.75,
            'employer_social_insurance' => 2173.75,
            'income_tax' => 0.00,
            'unpaid_leave_deductions' => 0.00,
            'other_deductions' => 0.00,
            'net_pay' => 17696.25,
        ]);

        // 14. Seed Attendance Punches (Biometric & Mobile GPS)
        $today = now()->toDateString();
        AttendancePunch::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saudiEmp->id,
            'punch_time' => $today . ' 08:55:00',
            'punch_type' => 'IN',
            'source' => 'BIOMETRIC_ADMS',
            'device_serial' => 'ZKT-BIO-RIYADH-01',
            'is_within_geofence' => true,
        ]);

        AttendancePunch::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saudiEmp->id,
            'punch_time' => $today . ' 17:30:00',
            'punch_type' => 'OUT',
            'source' => 'BIOMETRIC_ADMS',
            'device_serial' => 'ZKT-BIO-RIYADH-01',
            'is_within_geofence' => true,
        ]);

        AttendancePunch::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $egyEmp->id,
            'punch_time' => $today . ' 09:12:00',
            'punch_type' => 'IN',
            'source' => 'MOBILE_GPS',
            'latitude' => 30.0755,
            'longitude' => 31.0206,
            'is_within_geofence' => true,
        ]);

        AttendancePunch::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $egyEmp->id,
            'punch_time' => $today . ' 18:05:00',
            'punch_type' => 'OUT',
            'source' => 'MOBILE_GPS',
            'latitude' => 30.0754,
            'longitude' => 31.0205,
            'is_within_geofence' => true,
        ]);
    }
}
