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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Cache::forget('hr_custom_shifts');
        Cache::forget('hr_custom_courses');

        // 1. Single Enterprise Tenant
        $tenant = Tenant::create([
            'name' => 'مجموعة المستقبل القابضة | Future Group Holding',
            'subdomain' => 'demo',
            'subscription_plan' => 'ENTERPRISE',
            'country_jurisdiction' => 'SAUDI_ARABIA',
            'is_active' => true,
        ]);

        // 2. All System Roles (Preserved as requested)
        $admin = User::create([
            'tenant_id' => $tenant->id,
            'role' => 'SUPER_ADMIN',
            'name' => 'مدير النظام التنفيذي | Super Admin',
            'email' => 'admin@hrsystem.com',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'role' => 'HR_MANAGER',
            'name' => 'سارة القحطاني | HR Director',
            'email' => 'hr@hrsystem.com',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'role' => 'PAYROLL_OFFICER',
            'name' => 'مسؤول الرواتب والعمليات | Payroll Officer',
            'email' => 'payroll@hrsystem.com',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'role' => 'AUDITOR',
            'name' => 'مراقب الامتثال والحوكمة | Compliance Auditor',
            'email' => 'auditor@hrsystem.com',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'role' => 'DEPARTMENT_MANAGER',
            'name' => 'مدير القسم | Department Manager',
            'email' => 'dept@hrsystem.com',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'role' => 'LINE_MANAGER',
            'name' => 'المدير المباشر | Line Manager',
            'email' => 'manager@hrsystem.com',
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

        // 3. Single Legal Entity (1 Company)
        $company = Company::create([
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

        // 4. Single Branch (1 Branch)
        $branch = Branch::create([
            'tenant_id' => $tenant->id,
            'company_id' => $company->id,
            'name' => 'المقر الرئيسي - الرياض (Olaya)',
            'address_line' => 'طريق الملك فهد، حي العليا',
            'city' => 'الرياض',
            'timezone' => 'Asia/Riyadh',
            'geofence_latitude' => 24.7136,
            'geofence_longitude' => 46.6753,
            'geofence_radius_meters' => 250,
            'attendance_mode' => 'BOTH',
        ]);

        // 5. Single Department (1 Department)
        $department = Department::create([
            'tenant_id' => $tenant->id,
            'company_id' => $company->id,
            'name' => 'إدارة تقنية المعلومات والهندسة',
            'code' => 'ENG',
            'cost_center_code' => 'CC-TECH-01',
        ]);

        // 6. Single Designation (1 Designation)
        $designation = Designation::create([
            'tenant_id' => $tenant->id,
            'title' => 'كبير مهندسي البرمجيات | Senior Software Engineer',
            'job_level' => 'L4',
            'min_salary' => 15000.00,
            'max_salary' => 28000.00,
        ]);

        // 7. Single Leave Type (1 Leave Type)
        $annualLeave = LeaveType::create([
            'tenant_id' => $tenant->id,
            'code' => 'ANNUAL',
            'name' => 'إجازة سنوية | Annual Leave',
            'annual_quota_days' => 21,
            'is_paid' => true,
            'allow_carryover' => true,
            'max_carryover_days' => 5,
        ]);

        // 8. Single Employee (1 Employee + 1 Profile + 1 Salary)
        $employee = Employee::create([
            'tenant_id' => $tenant->id,
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'department_id' => $department->id,
            'designation_id' => $designation->id,
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
            'employee_id' => $employee->id,
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
            'employee_id' => $employee->id,
            'effective_from' => '2023-01-15',
            'base_salary' => 18000.00,
            'housing_allowance' => 4500.00,
            'transportation_allowance' => 1500.00,
            'other_allowances' => 0.00,
            'currency' => 'SAR',
            'is_current' => true,
        ]);

        // 9. Single Hardware Asset & Assignment (1 Asset)
        $asset = CompanyAsset::create([
            'tenant_id' => $tenant->id,
            'company_id' => $company->id,
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
            'asset_id' => $asset->id,
            'employee_id' => $employee->id,
            'assigned_date' => '2024-01-15',
            'condition_on_handover' => 'NEW',
            'handover_notes' => 'تم تسليم الجهاز بكامل ملحقاته وشاحن أصلي 140W',
        ]);

        // 10. Single Leave Request (1 Leave Request)
        LeaveRequest::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $employee->id,
            'leave_type_id' => $annualLeave->id,
            'start_date' => '2026-11-15',
            'end_date' => '2026-11-20',
            'total_days' => 5,
            'reason' => 'إجازة عائلية سنوية',
            'status' => 'PENDING_MANAGER',
        ]);

        // 11. Single Attendance Punch & Single Reconciled Record (1 Punch + 1 Record)
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        AttendancePunch::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $employee->id,
            'punch_time' => $today . ' 08:52:00',
            'punch_type' => 'IN',
            'source' => 'BIOMETRIC_ADMS',
            'device_serial' => 'ZKT-BIO-RIYADH-01',
            'is_within_geofence' => true,
        ]);

        AttendanceRecord::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $employee->id,
            'date' => $yesterday,
            'first_punch_in' => $yesterday . ' 08:50:00',
            'last_punch_out' => $yesterday . ' 17:30:00',
            'total_hours_worked' => 8.67,
            'late_minutes' => 0,
            'overtime_hours' => 0.67,
            'status' => 'PRESENT',
            'source' => 'BIOMETRIC',
        ]);

        // 12. Single Payroll Run & Single Payslip (1 Payroll Run + 1 Payslip)
        $payrollRun = PayrollRun::create([
            'tenant_id' => $tenant->id,
            'company_id' => $company->id,
            'cycle_name' => 'مسير رواتب أكتوبر 2026 - المقر الرئيسي',
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-31',
            'disbursement_date' => '2026-10-27',
            'total_gross' => 24000.00,
            'total_social_insurance' => 2193.75,
            'total_income_tax' => 0.00,
            'total_net' => 21806.25,
            'status' => 'FINANCE_APPROVED',
        ]);

        Payslip::create([
            'payroll_run_id' => $payrollRun->id,
            'employee_id' => $employee->id,
            'gross_earnings' => 24000.00,
            'employee_social_insurance' => 2193.75,
            'employer_social_insurance' => 2643.75,
            'income_tax' => 0.00,
            'unpaid_leave_deductions' => 0.00,
            'other_deductions' => 0.00,
            'net_pay' => 21806.25,
        ]);

        // 13. Single Job Opening & Single Job Application (1 Opening + 1 Candidate)
        $jobOpening = JobOpening::create([
            'tenant_id' => $tenant->id,
            'department_id' => $department->id,
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
            'job_opening_id' => $jobOpening->id,
            'candidate_name' => 'خالد العجمي',
            'candidate_email' => 'khaled.ajmi@outlook.com',
            'candidate_phone' => '+966541112233',
            'expected_salary' => 26000.00,
            'stage' => 'OFFER',
            'scorecard_rating' => 5,
            'interviewer_feedback' => 'أداء متميز في المقابلة التقنية، إتقان كامل لمعمارية Laravel 11 ومطابقة أنظمة مدد وGOSI.',
        ]);

        // 14. Single OKR Strategic Goal (1 Goal)
        OkrGoal::create([
            'tenant_id' => $tenant->id,
            'employee_id' => $employee->id,
            'title' => 'أتمتة تكامل منصة مدد ونظام حماية الأجور بنسبة 100%',
            'cycle_period' => 'Q4-2026',
            'progress_percentage' => 85,
            'status' => 'IN_PROGRESS',
        ]);

        // 15. Single Grievance Case (1 Grievance)
        GrievanceCase::create([
            'tenant_id' => $tenant->id,
            'complainant_employee_id' => $employee->id,
            'case_number' => 'GRC-2026-0001',
            'category' => 'WORK_ENVIRONMENT',
            'incident_description' => 'طلب مراجعة درجات التكييف والإضاءة في قاعة العمليات بالرياض لتحسين بيئة العمل ومطابقة معايير الصحة المهنية.',
            'is_confidential' => true,
            'status' => 'RESOLVED',
            'resolution_notes' => 'تم التنسيق مع إدارة المرافق وصيانة أنظمة التبريد وضبط الحساسات المركزية.',
        ]);

        // 16. Single Tamper-Evident SHA-256 Audit Log (1 Audit Log)
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

        // 17. Single Work Shift (1 Shift)
        \App\Models\WorkShift::create([
            'tenant_id' => $tenant->id,
            'code' => 'SHIFT-STD-01',
            'name_ar' => 'الوردية الصباحية القياسية (08:00 - 17:00)',
            'name_en' => 'Standard Morning Shift',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'break_minutes' => 60,
            'daily_hours' => 8.00,
            'grace_period_minutes' => 15,
            'is_ramadan_shift' => false,
            'overtime_multiplier' => 1.50,
        ]);

        // 18. Single Training Course & Single Enrollment (1 Course + 1 Enrollment)
        $course = \App\Models\TrainingCourse::create([
            'tenant_id' => $tenant->id,
            'code' => 'CRS-001',
            'title_ar' => 'الامتثال لأنظمة العمل وحماية الأجور (Saudi Labor Law & WPS Mastery)',
            'title_en' => 'Saudi Labor Law & WPS Mastery',
            'category' => 'الامتثال النظامي والحوكمة',
            'instructor' => 'د. خالد التميمي',
            'duration' => '6 ساعات تدريبية (4 وحدات)',
            'description' => 'برنامج تدريبي تطبيقي يغطي أحكام نظام العمل السعودي، ضوابط احتساب مكافأة نهاية الخدمة، وإجراءات تدقيق ملفات حماية الأجور (مدد).',
            'is_mandatory' => true,
            'enrolled_count' => 1,
            'completion_rate' => 100,
        ]);

        \App\Models\CourseEnrollment::create([
            'tenant_id' => $tenant->id,
            'course_id' => $course->id,
            'employee_id' => $employee->id,
            'progress_percentage' => 100,
            'score' => 96,
            'is_certified' => true,
            'certificate_number' => 'CERT-2026-' . substr($employee->id, 0, 6) . '-VERIFIED',
            'issued_at' => '2026-10-15',
        ]);
    }
}
