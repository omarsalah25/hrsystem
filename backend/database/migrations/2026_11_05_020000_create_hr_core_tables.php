<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tenants
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 150);
            $table->string('subdomain', 63)->unique();
            $table->enum('subscription_plan', ['STARTER', 'GROWTH', 'ENTERPRISE'])->default('ENTERPRISE');
            $table->enum('country_jurisdiction', ['EGYPT', 'SAUDI_ARABIA', 'GCC_OTHER', 'GLOBAL'])->default('EGYPT');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('subdomain');
        });

        // Add tenant_id to users
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('tenant_id')->nullable()->after('id');
            $table->string('status', 20)->default('ACTIVE')->after('remember_token');
            $table->boolean('is_two_factor_enabled')->default(false)->after('status');
            $table->string('two_factor_secret')->nullable()->after('is_two_factor_enabled');
            $table->timestamp('last_login_at')->nullable()->after('two_factor_secret');
            
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // 2. Companies
        Schema::create('companies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('legal_name', 200);
            $table->string('trade_name', 150)->nullable();
            $table->string('commercial_registration_no', 50)->nullable();
            $table->string('tax_registration_no', 50)->nullable();
            $table->string('social_insurance_no', 50)->nullable();
            $table->string('wps_employer_id', 50)->nullable();
            $table->string('bank_code', 20)->nullable();
            $table->string('primary_iban', 34)->nullable();
            $table->char('country_code', 3)->default('EGY');
            $table->char('currency', 3)->default('EGP');
            $table->timestamps();

            $table->index('tenant_id');
        });

        // 3. Branches
        Schema::create('branches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('address_line', 255);
            $table->string('city', 100);
            $table->string('timezone', 50)->default('Africa/Cairo');
            $table->decimal('geofence_latitude', 10, 8)->nullable();
            $table->decimal('geofence_longitude', 11, 8)->nullable();
            $table->integer('geofence_radius_meters')->default(200);
            $table->enum('attendance_mode', ['BIOMETRIC_ONLY', 'MOBILE_GEOFENCE_ONLY', 'BOTH', 'ANY'])->default('BOTH');
            $table->timestamps();
        });

        // 4. Departments
        Schema::create('departments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('company_id')->constrained('companies')->cascadeOnDelete();
            $table->uuid('parent_id')->nullable();
            $table->string('name', 100);
            $table->string('code', 30);
            $table->string('cost_center_code', 50)->nullable();
            $table->uuid('manager_employee_id')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'company_id', 'code']);
        });

        // 5. Designations
        Schema::create('designations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('title', 100);
            $table->string('job_level', 20)->default('L1');
            $table->string('grade', 20)->nullable();
            $table->decimal('min_salary', 14, 2)->nullable();
            $table->decimal('max_salary', 14, 2)->nullable();
            $table->timestamps();
        });

        // 6. Employees
        Schema::create('employees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('company_id')->constrained('companies')->restrictOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignUuid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignUuid('designation_id')->nullable()->constrained('designations')->nullOnDelete();
            $table->unsignedBigInteger('user_id')->nullable()->unique();
            $table->uuid('manager_id')->nullable();

            $table->string('employee_number', 50);
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->string('work_email', 191);
            $table->string('phone_number', 30)->nullable();

            $table->date('hire_date');
            $table->date('probation_end_date')->nullable();
            $table->date('confirmation_date')->nullable();
            $table->date('separation_date')->nullable();

            $table->boolean('is_national')->default(true);
            $table->enum('allowed_attendance_mode', ['DEFAULT', 'BIOMETRIC_ONLY', 'MOBILE_GEOFENCE_ONLY', 'BOTH'])->default('DEFAULT');
            $table->string('biometric_device_user_id', 50)->nullable();

            $table->enum('employment_type', ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN'])->default('FULL_TIME');
            $table->enum('employment_status', ['PROSPECT', 'ONBOARDING', 'PROBATIONARY', 'ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'NOTICE_PERIOD', 'OFFBOARDED'])->default('PROBATIONARY');

            $table->timestamps();

            $table->unique(['tenant_id', 'employee_number']);
            $table->unique(['tenant_id', 'work_email']);
            $table->index(['tenant_id', 'biometric_device_user_id']);
        });

        // 7. Employee Profiles
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->uuid('employee_id')->primary();
            $table->string('national_id_encrypted', 255);
            $table->string('iqama_number_encrypted', 255)->nullable();
            $table->date('iqama_expiry_date')->nullable();
            $table->string('passport_number_encrypted', 255)->nullable();
            $table->string('social_insurance_no', 50)->nullable();
            $table->date('date_of_birth');
            $table->enum('gender', ['MALE', 'FEMALE']);
            $table->char('nationality', 3)->default('EGY');
            $table->string('marital_status', 20)->default('SINGLE');
            $table->text('residential_address')->nullable();
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
            $table->index('iqama_expiry_date');
        });

        // 8. Attendance Records & Punches
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('date');
            $table->uuid('shift_id')->nullable();
            $table->dateTime('first_punch_in')->nullable();
            $table->dateTime('last_punch_out')->nullable();
            $table->decimal('total_hours_worked', 5, 2)->default(0.00);
            $table->integer('late_minutes')->default(0);
            $table->decimal('overtime_hours', 5, 2)->default(0.00);
            $table->enum('status', ['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'ON_LEAVE', 'WEEKEND', 'HOLIDAY'])->default('PRESENT');
            $table->enum('source', ['BIOMETRIC', 'MOBILE_GEOFENCE', 'HYBRID', 'MANUAL_REGULARIZATION'])->default('BIOMETRIC');
            $table->boolean('is_regularized')->default(false);
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
            $table->index(['tenant_id', 'date']);
        });

        Schema::create('attendance_punches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->dateTime('punch_time');
            $table->enum('punch_type', ['IN', 'OUT', 'UNKNOWN'])->default('UNKNOWN');
            $table->enum('source', ['BIOMETRIC_ADMS', 'MOBILE_GPS', 'WEB_PORTAL']);
            $table->string('device_serial', 100)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('is_within_geofence')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['employee_id', 'punch_time']);
        });

        // 9. Leave Types & Requests
        Schema::create('leave_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code', 30);
            $table->string('name', 100);
            $table->integer('annual_quota_days')->default(21);
            $table->boolean('is_paid')->default(true);
            $table->boolean('allow_carryover')->default(false);
            $table->integer('max_carryover_days')->default(0);
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
        });

        Schema::create('leave_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignUuid('leave_type_id')->constrained('leave_types')->restrictOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_days', 4, 2);
            $table->text('reason');
            $table->string('medical_document_path', 255)->nullable();
            $table->enum('status', ['PENDING_MANAGER', 'PENDING_HR', 'APPROVED', 'REJECTED', 'CANCELLED'])->default('PENDING_MANAGER');
            $table->uuid('approved_by_manager_id')->nullable();
            $table->uuid('approved_by_hr_id')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        // 10. Salaries & Payroll
        Schema::create('employee_salaries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->decimal('base_salary', 14, 2);
            $table->decimal('housing_allowance', 14, 2)->default(0.00);
            $table->decimal('transportation_allowance', 14, 2)->default(0.00);
            $table->decimal('other_allowances', 14, 2)->default(0.00);
            $table->char('currency', 3)->default('SAR');
            $table->boolean('is_current')->default(true);
            $table->timestamps();
        });

        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('company_id')->constrained('companies')->restrictOnDelete();
            $table->string('cycle_name', 150);
            $table->date('start_date');
            $table->date('end_date');
            $table->date('disbursement_date');
            $table->decimal('total_gross', 16, 2)->default(0.00);
            $table->decimal('total_social_insurance', 16, 2)->default(0.00);
            $table->decimal('total_income_tax', 16, 2)->default(0.00);
            $table->decimal('total_net', 16, 2)->default(0.00);
            $table->enum('status', ['DRAFT', 'INGESTED', 'CALCULATED', 'AUDIT_LOCKED', 'FINANCE_APPROVED', 'DISBURSED', 'CLOSED'])->default('DRAFT');
            $table->string('wps_sif_file_path', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('payslips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->foreignUuid('employee_id')->constrained('employees')->restrictOnDelete();
            $table->decimal('gross_earnings', 14, 2);
            $table->decimal('employee_social_insurance', 14, 2)->default(0.00);
            $table->decimal('employer_social_insurance', 14, 2)->default(0.00);
            $table->decimal('income_tax', 14, 2)->default(0.00);
            $table->decimal('unpaid_leave_deductions', 14, 2)->default(0.00);
            $table->decimal('other_deductions', 14, 2)->default(0.00);
            $table->decimal('net_pay', 14, 2);
            $table->string('pdf_file_path', 255)->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->unique(['payroll_run_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('payroll_runs');
        Schema::dropIfExists('employee_salaries');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_types');
        Schema::dropIfExists('attendance_punches');
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('employee_profiles');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('designations');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('companies');
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn(['tenant_id', 'status', 'is_two_factor_enabled', 'two_factor_secret', 'last_login_at']);
        });
        Schema::dropIfExists('tenants');
    }
};

