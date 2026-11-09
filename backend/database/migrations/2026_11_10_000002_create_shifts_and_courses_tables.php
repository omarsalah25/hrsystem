<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name_ar', 150);
            $table->string('name_en', 150);
            $table->string('start_time', 10)->default('08:00');
            $table->string('end_time', 10)->default('17:00');
            $table->integer('break_minutes')->default(60);
            $table->decimal('daily_hours', 4, 2)->default(8.00);
            $table->integer('grace_period_minutes')->default(15);
            $table->boolean('is_ramadan_shift')->default(false);
            $table->decimal('overtime_multiplier', 4, 2)->default(1.50);
            $table->timestamps();
        });

        Schema::create('training_courses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('title_ar', 200);
            $table->string('title_en', 200);
            $table->string('category', 100);
            $table->string('instructor', 120);
            $table->string('duration', 100);
            $table->text('description')->nullable();
            $table->boolean('is_mandatory')->default(true);
            $table->integer('enrolled_count')->default(0);
            $table->integer('completion_rate')->default(100);
            $table->timestamps();
        });

        Schema::create('course_enrollments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('course_id')->constrained('training_courses')->cascadeOnDelete();
            $table->foreignUuid('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->unsignedTinyInteger('progress_percentage')->default(100);
            $table->unsignedTinyInteger('score')->nullable();
            $table->boolean('is_certified')->default(false);
            $table->string('certificate_number', 80)->nullable();
            $table->date('issued_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_enrollments');
        Schema::dropIfExists('training_courses');
        Schema::dropIfExists('work_shifts');
    }
};

