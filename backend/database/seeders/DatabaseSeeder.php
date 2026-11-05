<?php

namespace Database\Seeders;

use App\Models\AssetAssignment;
use App\Models\AttendancePunch;
use App\Models\AttendanceRecord;
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
use App\Models\LeaveRequest;
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
        // 1. Create Enterprise Tenant
        $tenant = Tenant::create([
            'name' => 'مجموعة المستقبل القابضة | Future Group Holding',
            'subdomain' => 'demo',
            'subscription_plan' => 'ENTERPRISE',
            'country_jurisdiction' => 'SAUDI_ARABIA',
            'is_active' => true,
        ]);

        // 2. Core Operational RBAC Users
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

        // 3. Legal Entities (Saudi Arabia, Egypt, UAE)
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
            'wps_employer_id' => 'EG-WPS-452109',
            'bank_code' => 'CIBE',
            'primary_iban' => 'EG380002000100000012345678901',
            'country_code' => 'EGY',
            'currency' => 'EGP',
        ]);

        $uaeCompany = Company::create([
            'tenant_id' => $tenant->id,
            'legal_name' => 'شركة الخليج للابتكار الرقمي ش.ذ.م.م',
            'trade_name' => 'Gulf Digital LLC',
            'commercial_registration_no' => 'CN-2948102',
            'tax_registration_no' => '100456789000003',
            'social_insurance_no' => 'AE-GPSSA-8901',
            'wps_employer_id' => '3009876543',
            'bank_code' => 'FAB',
            'primary_iban' => 'AE070030000001234567890',
            'country_code' => 'UAE',
            'currency' => 'AED',
        ]);

        // 4. Branches with Verified Geofencing Boundaries
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

        $jeddahBranch = Branch::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'name' => 'فرع المنطقة الغربية - جدة (Al-Shati)',
            'address_line' => 'طريق الملك عبدالعزيز، حي الشاطئ',
            'city' => 'جدة',
            'timezone' => 'Asia/Riyadh',
            'geofence_latitude' => 21.5433,
            'geofence_longitude' => 39.1728,
            'geofence_radius_meters' => 300,
            'attendance_mode' => 'BOTH',
        ]);

        $cairoBranch = Branch::create([
            'tenant_id' => $tenant->id,
            'company_id' => $egyCompany->id,
            'name' => 'مركز التطوير والابتكار - القاهرة (القرية الذكية)',
            'address_line' => 'الكيلو 28 طريق مصر الإسكندرية الصحراوي',
            'city' => 'الجيزة / القاهرة',
            'timezone' => 'Africa/Cairo',
            'geofence_latitude' => 30.0754,
            'geofence_longitude' => 31.0205,
            'geofence_radius_meters' => 350,
            'attendance_mode' => 'BOTH',
        ]);

        $dubaiBranch = Branch::create([
            'tenant_id' => $tenant->id,
            'company_id' => $uaeCompany->id,
            'name' => 'المكتب الإقليمي - دبي (Internet City)',
            'address_line' => 'المبنى 3، مدينة دبي للإنترنت',
            'city' => 'دبي',
            'timezone' => 'Asia/Dubai',
            'geofence_latitude' => 25.0931,
            'geofence_longitude' => 55.1585,
            'geofence_radius_meters' => 200,
            'attendance_mode' => 'BOTH',
        ]);

        // 5. Departments
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

        $finDept = Department::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'name' => 'الشؤون المالية والمحاسبة',
            'code' => 'FIN',
            'cost_center_code' => 'CC-FIN-01',
        ]);

        $opsDept = Department::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'name' => 'العمليات والامتثال الحكومي',
            'code' => 'OPS',
            'cost_center_code' => 'CC-OPS-01',
        ]);

        $salesDept = Department::create([
            'tenant_id' => $tenant->id,
            'company_id' => $uaeCompany->id,
            'name' => 'المبيعات وتطوير الأعمال الإقليمية',
            'code' => 'SALES',
            'cost_center_code' => 'CC-SALES-01',
        ]);

        // 6. Designations
        $devRole = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'كبير مهندسي البرمجيات | Senior Software Engineer',
            'job_level' => 'L4',
            'min_salary' => 15000.00,
            'max_salary' => 28000.00,
        ]);

        $feRole = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'مهندس واجهات أمامية أول | Senior Frontend Engineer',
            'job_level' => 'L3',
            'min_salary' => 14000.00,
            'max_salary' => 24000.00,
        ]);

        $hrRole = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'مدير الموارد البشرية | HR Director',
            'job_level' => 'L5',
            'min_salary' => 18000.00,
            'max_salary' => 32000.00,
        ]);

        $finRole = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'مراقب مالي أول | Senior Financial Controller',
            'job_level' => 'L4',
            'min_salary' => 16000.00,
            'max_salary' => 26000.00,
        ]);

        $payrollRole = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'أخصائي رواتب وامتثال | Payroll & Compliance Specialist',
            'job_level' => 'L3',
            'min_salary' => 10000.00,
            'max_salary' => 18000.00,
        ]);

        $govRole = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'مسؤول علاقات حكومية (معقب) | Government Relations Officer',
            'job_level' => 'L3',
            'min_salary' => 9000.00,
            'max_salary' => 16000.00,
        ]);

        $salesRole = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'مدير المبيعات الإقليمي | Regional Sales Director',
            'job_level' => 'L5',
            'min_salary' => 20000.00,
            'max_salary' => 35000.00,
        ]);

        // 7. Statutory Leave Types
        $annualLeave = LeaveType::create([
            'tenant_id' => $tenant->id,
            'code' => 'ANNUAL',
            'name' => 'إجازة سنوية | Annual Leave',
            'annual_quota_days' => 21,
            'is_paid' => true,
            'allow_carryover' => true,
            'max_carryover_days' => 5,
        ]);

        $sickLeave = LeaveType::create([
            'tenant_id' => $tenant->id,
            'code' => 'SICK',
            'name' => 'إجازة مرضية | Sick Leave',
            'annual_quota_days' => 15,
            'is_paid' => true,
        ]);

        $hajjLeave = LeaveType::create([
            'tenant_id' => $tenant->id,
            'code' => 'HAJJ',
            'name' => 'إجازة حج مدفوعة | Statutory Hajj Leave',
            'annual_quota_days' => 10,
            'is_paid' => true,
        ]);

        $emergencyLeave = LeaveType::create([
            'tenant_id' => $tenant->id,
            'code' => 'EMERGENCY',
            'name' => 'إجازة طارئة | Emergency Leave',
            'annual_quota_days' => 5,
            'is_paid' => true,
        ]);

        // 8. Seed Comprehensive Employee Workforce
        // -------------------------------------------------------------
        // Employee 1: Abdullah Al-Otaibi (Saudi Arabia - Tech)
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
            'social_insurance_no' => '987654321',
            'date_of_birth' => '1992-06-15',
            'gender' => 'MALE',
            'nationality' => 'SAU',
            'marital_status' => 'MARRIED',
            'residential_address' => 'الرياض - حي النرجس، شارع أنس بن مالك',
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

        // Employee 2: Sara Al-Qahtani (Saudi Arabia - HR Director)
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
            'biometric_device_user_id' => '1002',
            'employment_status' => 'ACTIVE',
        ]);
        EmployeeProfile::create([
            'employee_id' => $saraEmp->id,
            'national_id_encrypted' => encrypt('1087654321'),
            'social_insurance_no' => '876543210',
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

        // Employee 3: Faisal Al-Shammari (Saudi Arabia - Finance Controller)
        $faisalEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'branch_id' => $riyadhBranch->id,
            'department_id' => $finDept->id,
            'designation_id' => $finRole->id,
            'employee_number' => 'EMP-SA-003',
            'first_name' => 'فيصل',
            'middle_name' => 'عبدالرحمن',
            'last_name' => 'الشمري',
            'work_email' => 'faisal.shammari@futuregroup.com',
            'phone_number' => '+966542233445',
            'hire_date' => '2023-03-01',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1003',
            'employment_status' => 'ACTIVE',
        ]);
        EmployeeProfile::create([
            'employee_id' => $faisalEmp->id,
            'national_id_encrypted' => encrypt('1076543210'),
            'social_insurance_no' => '765432109',
            'date_of_birth' => '1990-04-12',
            'gender' => 'MALE',
            'nationality' => 'SAU',
            'marital_status' => 'MARRIED',
            'residential_address' => 'الرياض - حي الياسمين',
        ]);
        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $faisalEmp->id,
            'effective_from' => '2023-03-01',
            'base_salary' => 16000.00,
            'housing_allowance' => 4000.00,
            'transportation_allowance' => 1500.00,
            'other_allowances' => 0.00,
            'currency' => 'SAR',
            'is_current' => true,
        ]);

        // Employee 4: Reem Al-Dossary (Saudi Arabia - Engineering)
        $reemEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'branch_id' => $riyadhBranch->id,
            'department_id' => $techDept->id,
            'designation_id' => $feRole->id,
            'employee_number' => 'EMP-SA-004',
            'first_name' => 'ريم',
            'middle_name' => 'خالد',
            'last_name' => 'الدوسري',
            'work_email' => 'reem.dossary@futuregroup.com',
            'phone_number' => '+966567788990',
            'hire_date' => '2023-09-15',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1004',
            'employment_status' => 'ACTIVE',
        ]);
        EmployeeProfile::create([
            'employee_id' => $reemEmp->id,
            'national_id_encrypted' => encrypt('1065432109'),
            'social_insurance_no' => '654321098',
            'date_of_birth' => '1996-07-25',
            'gender' => 'FEMALE',
            'nationality' => 'SAU',
            'marital_status' => 'SINGLE',
            'residential_address' => 'الرياض - حي الصحافة',
        ]);
        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $reemEmp->id,
            'effective_from' => '2023-09-15',
            'base_salary' => 14000.00,
            'housing_allowance' => 3500.00,
            'transportation_allowance' => 1000.00,
            'other_allowances' => 0.00,
            'currency' => 'SAR',
            'is_current' => true,
        ]);

        // Employee 5: Turki Al-Ghamdi (Saudi Arabia - Jeddah Branch Operations)
        $turkiEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'branch_id' => $jeddahBranch->id,
            'department_id' => $opsDept->id,
            'designation_id' => $govRole->id,
            'employee_number' => 'EMP-SA-005',
            'first_name' => 'تركي',
            'middle_name' => 'فهد',
            'last_name' => 'الغامدي',
            'work_email' => 'turki.ghamdi@futuregroup.com',
            'phone_number' => '+966509988776',
            'hire_date' => '2022-11-01',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1005',
            'employment_status' => 'ACTIVE',
        ]);
        EmployeeProfile::create([
            'employee_id' => $turkiEmp->id,
            'national_id_encrypted' => encrypt('1054321098'),
            'social_insurance_no' => '543210987',
            'date_of_birth' => '1989-02-18',
            'gender' => 'MALE',
            'nationality' => 'SAU',
            'marital_status' => 'MARRIED',
            'residential_address' => 'جدة - حي الحمراء',
        ]);
        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $turkiEmp->id,
            'effective_from' => '2022-11-01',
            'base_salary' => 11000.00,
            'housing_allowance' => 2500.00,
            'transportation_allowance' => 1500.00,
            'other_allowances' => 0.00,
            'currency' => 'SAR',
            'is_current' => true,
        ]);

        // Employee 6: Ahmed El-Shafey (Egypt - Lead Backend Engineer)
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
            'biometric_device_user_id' => '1006',
            'employment_status' => 'ACTIVE',
        ]);
        EmployeeProfile::create([
            'employee_id' => $egyEmp->id,
            'national_id_encrypted' => encrypt('29408150102345'),
            'social_insurance_no' => '55443322',
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

        // Employee 7: Nourhan El-Manshawy (Egypt - Senior Payroll Specialist)
        $nourhanEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $egyCompany->id,
            'branch_id' => $cairoBranch->id,
            'department_id' => $finDept->id,
            'designation_id' => $payrollRole->id,
            'employee_number' => 'EMP-EG-002',
            'first_name' => 'نورهان',
            'middle_name' => 'طارق',
            'last_name' => 'المنشاوي',
            'work_email' => 'nourhan.t@futuregroup.com',
            'phone_number' => '+201287654321',
            'hire_date' => '2024-02-01',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1007',
            'employment_status' => 'ACTIVE',
        ]);
        EmployeeProfile::create([
            'employee_id' => $nourhanEmp->id,
            'national_id_encrypted' => encrypt('29603120109876'),
            'social_insurance_no' => '33221199',
            'date_of_birth' => '1996-03-12',
            'gender' => 'FEMALE',
            'nationality' => 'EGY',
            'marital_status' => 'SINGLE',
            'residential_address' => 'المعادي - شارع النصر، القاهرة',
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

        // Employee 8: Youssef El-Sharkawy (Egypt - Product Designer)
        $youssefEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $egyCompany->id,
            'branch_id' => $cairoBranch->id,
            'department_id' => $techDept->id,
            'designation_id' => $feRole->id,
            'employee_number' => 'EMP-EG-003',
            'first_name' => 'يوسف',
            'middle_name' => 'حسن',
            'last_name' => 'الشرقاوي',
            'work_email' => 'youssef.s@futuregroup.com',
            'phone_number' => '+201155443322',
            'hire_date' => '2023-10-01',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1008',
            'employment_status' => 'ACTIVE',
        ]);
        EmployeeProfile::create([
            'employee_id' => $youssefEmp->id,
            'national_id_encrypted' => encrypt('29505200104567'),
            'social_insurance_no' => '44332211',
            'date_of_birth' => '1995-05-20',
            'gender' => 'MALE',
            'nationality' => 'EGY',
            'marital_status' => 'MARRIED',
            'residential_address' => 'الدقي - الجيزة',
        ]);
        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $youssefEmp->id,
            'effective_from' => '2023-10-01',
            'base_salary' => 21000.00,
            'housing_allowance' => 0.00,
            'transportation_allowance' => 2500.00,
            'other_allowances' => 0.00,
            'currency' => 'EGP',
            'is_current' => true,
        ]);

        // Employee 9: Mariam Abdel-Salam (Egypt - HR Specialist)
        $mariamEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $egyCompany->id,
            'branch_id' => $cairoBranch->id,
            'department_id' => $hrDept->id,
            'designation_id' => $payrollRole->id,
            'employee_number' => 'EMP-EG-004',
            'first_name' => 'مريم',
            'middle_name' => 'عصام',
            'last_name' => 'عبدالسلام',
            'work_email' => 'mariam.a@futuregroup.com',
            'phone_number' => '+201099881122',
            'hire_date' => '2024-04-15',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1009',
            'employment_status' => 'ACTIVE',
        ]);
        EmployeeProfile::create([
            'employee_id' => $mariamEmp->id,
            'national_id_encrypted' => encrypt('29709110103456'),
            'social_insurance_no' => '22110099',
            'date_of_birth' => '1997-09-11',
            'gender' => 'FEMALE',
            'nationality' => 'EGY',
            'marital_status' => 'SINGLE',
            'residential_address' => 'مدينة نصر - القاهرة',
        ]);
        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $mariamEmp->id,
            'effective_from' => '2024-04-15',
            'base_salary' => 16000.00,
            'housing_allowance' => 0.00,
            'transportation_allowance' => 2000.00,
            'other_allowances' => 0.00,
            'currency' => 'EGP',
            'is_current' => true,
        ]);

        // Employee 10: Omar Al-Farooq (UAE - Regional Sales Director)
        $uaeEmp = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $uaeCompany->id,
            'branch_id' => $dubaiBranch->id,
            'department_id' => $salesDept->id,
            'designation_id' => $salesRole->id,
            'employee_number' => 'EMP-AE-001',
            'first_name' => 'عمر',
            'middle_name' => 'عبدالعزيز',
            'last_name' => 'الفاروق',
            'work_email' => 'omar.farooq@futuregroup.com',
            'phone_number' => '+971501234567',
            'hire_date' => '2023-04-01',
            'is_national' => true,
            'allowed_attendance_mode' => 'BOTH',
            'biometric_device_user_id' => '1010',
            'employment_status' => 'ACTIVE',
        ]);
        EmployeeProfile::create([
            'employee_id' => $uaeEmp->id,
            'national_id_encrypted' => encrypt('784-1991-1234567-1'),
            'social_insurance_no' => 'AE-GPSSA-8901',
            'date_of_birth' => '1991-03-10',
            'gender' => 'MALE',
            'nationality' => 'UAE',
            'marital_status' => 'MARRIED',
            'residential_address' => 'دبي - مارينا، برج الأفق',
        ]);
        EmployeeSalary::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $uaeEmp->id,
            'effective_from' => '2023-04-01',
            'base_salary' => 22000.00,
            'housing_allowance' => 6000.00,
            'transportation_allowance' => 2000.00,
            'other_allowances' => 0.00,
            'currency' => 'AED',
            'is_current' => true,
        ]);

        // 9. Seed Company Hardware Assets & Assignments
        $macbook = CompanyAsset::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'asset_code' => 'AST-LAP-001',
            'name_ar' => 'جهاز ماك بوك برو M3 Max 16"',
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
            'handover_notes' => 'تم تسليم الجهاز بكامل ملحقاته وشاحن أصلي 140W',
        ]);

        $dell = CompanyAsset::create([
            'tenant_id' => $tenant->id,
            'company_id' => $egyCompany->id,
            'asset_code' => 'AST-LAP-002',
            'name_ar' => 'حاسوب ديل بريسيجن 5570 i7',
            'name_en' => 'Dell Precision 5570 i7 32GB',
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
            'handover_notes' => 'تسليم للمهندس أحمد الشافعي للعمل على معمارية السحابة',
        ]);

        $iphone = CompanyAsset::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'asset_code' => 'AST-PHN-001',
            'name_ar' => 'هاتف آيفون 15 برو تنفيذي',
            'name_en' => 'iPhone 15 Pro 256GB Titanium',
            'category' => 'PHONE',
            'serial_number' => 'F2LW8990P3',
            'purchase_value' => 4800.00,
            'purchase_date' => '2024-03-01',
            'status' => 'ASSIGNED',
        ]);
        AssetAssignment::create([
            'tenant_id' => $tenant->id,
            'asset_id' => $iphone->id,
            'employee_id' => $saraEmp->id,
            'assigned_date' => '2024-03-05',
            'condition_on_handover' => 'NEW',
            'handover_notes' => 'تسليم هاتف للتواصل وإدارة اتصالات الإدارة العليا',
        ]);

        CompanyAsset::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'asset_code' => 'AST-LAP-003',
            'name_ar' => 'حاسوب ماك بوك إير M2 15"',
            'name_en' => 'MacBook Air 15" M2',
            'category' => 'LAPTOP',
            'serial_number' => 'C02H8912KL3P',
            'purchase_value' => 5800.00,
            'purchase_date' => '2024-02-15',
            'status' => 'AVAILABLE',
        ]);

        // 10. Seed Active Leave Requests (Pending, Approved)
        LeaveRequest::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saudiEmp->id,
            'leave_type_id' => $annualLeave->id,
            'start_date' => '2026-11-15',
            'end_date' => '2026-11-20',
            'total_days' => 5,
            'reason' => 'إجازة عائلية سنوية معتمدة',
            'status' => 'APPROVED',
            'approved_by_manager_id' => $saraEmp->id,
            'approved_by_hr_id' => $saraEmp->id,
        ]);

        LeaveRequest::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $faisalEmp->id,
            'leave_type_id' => $emergencyLeave->id,
            'start_date' => '2026-11-08',
            'end_date' => '2026-11-09',
            'total_days' => 2,
            'reason' => 'ظرف عائلي طارئ يتطلب السفر إلى حائل',
            'status' => 'PENDING_MANAGER',
        ]);

        LeaveRequest::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $egyEmp->id,
            'leave_type_id' => $sickLeave->id,
            'start_date' => '2026-10-10',
            'end_date' => '2026-10-12',
            'total_days' => 3,
            'reason' => 'وعكة صحية وإجازة مرضية معتمدة بالتقرير الطبي',
            'status' => 'APPROVED',
            'approved_by_manager_id' => $saraEmp->id,
        ]);

        LeaveRequest::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $reemEmp->id,
            'leave_type_id' => $annualLeave->id,
            'start_date' => '2026-12-01',
            'end_date' => '2026-12-07',
            'total_days' => 5,
            'reason' => 'إجازة سنوية للاستجمام',
            'status' => 'PENDING_HR',
        ]);

        // 11. Seed Attendance Punches & Reconciled Records
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        // Abdullah Today punches
        AttendancePunch::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saudiEmp->id,
            'punch_time' => $today . ' 08:52:00',
            'punch_type' => 'IN',
            'source' => 'BIOMETRIC_ADMS',
            'device_serial' => 'ZKT-BIO-RIYADH-01',
            'is_within_geofence' => true,
        ]);
        AttendancePunch::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saudiEmp->id,
            'punch_time' => $today . ' 17:15:00',
            'punch_type' => 'OUT',
            'source' => 'BIOMETRIC_ADMS',
            'device_serial' => 'ZKT-BIO-RIYADH-01',
            'is_within_geofence' => true,
        ]);
        AttendanceRecord::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saudiEmp->id,
            'date' => $yesterday,
            'first_punch_in' => $yesterday . ' 08:50:00',
            'last_punch_out' => $yesterday . ' 17:30:00',
            'total_hours_worked' => 8.67,
            'late_minutes' => 0,
            'overtime_hours' => 0.67,
            'status' => 'PRESENT',
            'source' => 'BIOMETRIC',
        ]);

        // Sara Today punches (Mobile GPS)
        AttendancePunch::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saraEmp->id,
            'punch_time' => $today . ' 09:05:00',
            'punch_type' => 'IN',
            'source' => 'MOBILE_GPS',
            'latitude' => 24.7137,
            'longitude' => 46.6754,
            'is_within_geofence' => true,
        ]);
        AttendanceRecord::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saraEmp->id,
            'date' => $yesterday,
            'first_punch_in' => $yesterday . ' 09:00:00',
            'last_punch_out' => $yesterday . ' 17:00:00',
            'total_hours_worked' => 8.00,
            'late_minutes' => 0,
            'overtime_hours' => 0.00,
            'status' => 'PRESENT',
            'source' => 'MOBILE_GEOFENCE',
        ]);

        // Ahmed Today punches (Cairo Smart Village)
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

        // 12. Seed Payroll Run & Payslips for Saudi Arabia (October 2026)
        $payrollRunKsa = PayrollRun::create([
            'tenant_id' => $tenant->id,
            'company_id' => $ksaCompany->id,
            'cycle_name' => 'مسير رواتب أكتوبر 2026 - فرع الرياض وجدة',
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-31',
            'disbursement_date' => '2026-10-27',
            'total_gross' => 93000.00,
            'total_social_insurance' => 8677.50,
            'total_income_tax' => 0.00,
            'total_net' => 84322.50,
            'status' => 'FINANCE_APPROVED',
        ]);

        Payslip::create([
            'payroll_run_id' => $payrollRunKsa->id,
            'employee_id' => $saudiEmp->id,
            'gross_earnings' => 24000.00,
            'employee_social_insurance' => 2193.75, // 9.75%
            'employer_social_insurance' => 2643.75, // 11.75%
            'income_tax' => 0.00,
            'unpaid_leave_deductions' => 0.00,
            'other_deductions' => 0.00,
            'net_pay' => 21806.25,
        ]);

        Payslip::create([
            'payroll_run_id' => $payrollRunKsa->id,
            'employee_id' => $saraEmp->id,
            'gross_earnings' => 19500.00,
            'employee_social_insurance' => 1803.75,
            'employer_social_insurance' => 2173.75,
            'income_tax' => 0.00,
            'unpaid_leave_deductions' => 0.00,
            'other_deductions' => 0.00,
            'net_pay' => 17696.25,
        ]);

        Payslip::create([
            'payroll_run_id' => $payrollRunKsa->id,
            'employee_id' => $faisalEmp->id,
            'gross_earnings' => 21500.00,
            'employee_social_insurance' => 1950.00,
            'employer_social_insurance' => 2350.00,
            'income_tax' => 0.00,
            'unpaid_leave_deductions' => 0.00,
            'other_deductions' => 0.00,
            'net_pay' => 19550.00,
        ]);

        // 13. Seed Recruitment & Open Positions
        $jobCloud = JobOpening::create([
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
            'job_opening_id' => $jobCloud->id,
            'candidate_name' => 'خالد العجمي',
            'candidate_email' => 'khaled.ajmi@outlook.com',
            'candidate_phone' => '+966541112233',
            'expected_salary' => 26000.00,
            'stage' => 'OFFER',
            'scorecard_rating' => 5,
            'interviewer_feedback' => 'أداء متميز في المقابلة التقنية، إتقان كامل لمعمارية Laravel 11 ومطابقة أنظمة مدد وGOSI.',
        ]);

        JobApplication::create([
            'tenant_id' => $tenant->id,
            'job_opening_id' => $jobCloud->id,
            'candidate_name' => 'محمد رضوان',
            'candidate_email' => 'm.radwan@gmail.com',
            'candidate_phone' => '+201123456789',
            'expected_salary' => 22000.00,
            'stage' => 'INTERVIEW',
            'scorecard_rating' => 4,
            'interviewer_feedback' => 'خبرة قوية في Next.js 15 وTypeScript، جاري التنسيق للمقابلة الفنية الثانية.',
        ]);

        // 14. Seed OKR Strategic Goals
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

        OkrGoal::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $saraEmp->id,
            'title' => 'رفع مؤشر التوطين (نطاقات) إلى النطاق البلاتيني المتقدم في كافة الفروع',
            'cycle_period' => 'Q4-2026',
            'progress_percentage' => 92,
            'status' => 'IN_PROGRESS',
        ]);

        // 15. Seed Grievances & Employee Relations
        GrievanceCase::create([
            'tenant_id' => $tenant->id,
            'complainant_employee_id' => $saudiEmp->id,
            'case_number' => 'GRC-2026-0001',
            'category' => 'WORK_ENVIRONMENT',
            'incident_description' => 'طلب مراجعة درجات التكييف والإضاءة في قاعة العمليات بالرياض لتحسين بيئة العمل ومطابقة معايير الصحة المهنية.',
            'is_confidential' => true,
            'status' => 'RESOLVED',
            'resolution_notes' => 'تم التنسيق مع إدارة المرافق وصيانة أنظمة التبريد وضبط الحساسات المركزية.',
        ]);

        // 16. Seed Tamper-Evident SHA-256 Audit Trail
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
    }
}
