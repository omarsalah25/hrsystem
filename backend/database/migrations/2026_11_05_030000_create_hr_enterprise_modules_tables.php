<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Assets & Hardware Custody
        Schema::create('company_assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('asset_code', 50); // e.g. AST-LAP-001
            $table->string('name_ar', 150);
            $table->string('name_en', 150);
            $table->enum('category', ['LAPTOP', 'PHONE', 'VEHICLE', 'KEYCARD', 'EQUIPMENT']);
            $table->string('serial_number', 100)->nullable();
            $table->decimal('purchase_value', 10, 2)->default(0.00);
            $table->date('purchase_date')->nullable();
            $table->enum('status', ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED'])->default('AVAILABLE');
            $table->timestamps();

            $table->unique(['tenant_id', 'asset_code']);
        });

        Schema::create('asset_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('asset_id')->constrained('company_assets')->cascadeOnDelete();
            $table->foreignUuid('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('assigned_date');
            $table->date('returned_date')->nullable();
            $table->enum('condition_on_handover', ['NEW', 'EXCELLENT', 'GOOD', 'FAIR']);
            $table->enum('condition_on_return', ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'])->nullable();
            $table->text('handover_notes')->nullable();
            $table->timestamps();
        });

        // 2. Talent Acquisition (ATS)
        Schema::create('job_openings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('department_id')->constrained('departments')->cascadeOnDelete();
            $table->string('title_ar', 150);
            $table->string('title_en', 150);
            $table->text('job_description');
            $table->enum('employment_type', ['FULL_TIME', 'PART_TIME', 'REMOTE', 'CONTRACT']);
            $table->decimal('min_budget', 12, 2)->nullable();
            $table->decimal('max_budget', 12, 2)->nullable();
            $table->enum('status', ['DRAFT', 'OPEN', 'INTERVIEWING', 'FILLED', 'CANCELLED'])->default('OPEN');
            $table->timestamps();
        });

        Schema::create('job_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('job_opening_id')->constrained('job_openings')->cascadeOnDelete();
            $table->string('candidate_name', 150);
            $table->string('candidate_email', 150);
            $table->string('candidate_phone', 50);
            $table->string('cv_document_path', 255)->nullable();
            $table->enum('stage', ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'])->default('APPLIED');
            $table->unsignedTinyInteger('scorecard_rating')->default(0); // 1 to 5 stars
            $table->decimal('expected_salary', 12, 2)->nullable();
            $table->text('interviewer_feedback')->nullable();
            $table->timestamps();
        });

        // 3. Employee Relations & Grievances
        Schema::create('grievance_cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('complainant_employee_id')->constrained('employees')->cascadeOnDelete();
            $table->uuid('respondent_employee_id')->nullable();
            $table->string('case_number', 50); // e.g. GRC-2026-001
            $table->enum('category', ['HARASSMENT', 'WAGE_DISPUTE', 'WORK_ENVIRONMENT', 'DISCRIMINATION', 'SAFETY']);
            $table->text('incident_description');
            $table->boolean('is_confidential')->default(true);
            $table->enum('status', ['FILED', 'UNDER_INVESTIGATION', 'HEARING_SCHEDULED', 'RESOLVED', 'DISMISSED'])->default('FILED');
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'case_number']);
        });

        // 4. Performance & OKRs
        Schema::create('okr_goals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('title', 200);
            $table->string('cycle_period', 50); // e.g. Q4-2026
            $table->unsignedTinyInteger('progress_percentage')->default(0);
            $table->enum('status', ['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'DEFERRED'])->default('IN_PROGRESS');
            $table->timestamps();
        });

        // 5. Cryptographic SHA-256 Hash Chained Audit Trail
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('log_number', 50);
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_name', 150);
            $table->string('actor_role', 50);
            $table->string('action_type', 50); // SALARY_UPDATE, MANUAL_PUNCH, PII_ACCESS, ROLE_CHANGE
            $table->string('target_resource', 150);
            $table->string('ip_address', 45);
            $table->string('user_agent', 255)->nullable();
            $table->json('payload_diff');
            $table->char('prev_hash', 64);
            $table->char('current_hash', 64);
            $table->timestamps();

            $table->unique(['tenant_id', 'log_number']);
            $table->index(['tenant_id', 'current_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('okr_goals');
        Schema::dropIfExists('grievance_cases');
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('job_openings');
        Schema::dropIfExists('asset_assignments');
        Schema::dropIfExists('company_assets');
    }
};
