<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'SUPER_ADMIN',
                'HR_MANAGER',
                'PAYROLL_OFFICER',
                'DEPARTMENT_MANAGER',
                'LINE_MANAGER',
                'EMPLOYEE',
                'AUDITOR'
            ])->default('EMPLOYEE')->after('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
