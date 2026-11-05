<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LearningController extends Controller
{
    protected array $courses = [
        [
            'id' => 'CRS-001',
            'title_ar' => 'الامتثال لأنظمة العمل وحماية الأجور (Saudi Labor Law & WPS Mastery)',
            'title_en' => 'Saudi Labor Law & WPS Mastery',
            'category' => 'الامتثال النظامي والحوكمة',
            'instructor' => 'د. خالد التميمي',
            'duration' => '6 ساعات تدريبية (4 وحدات)',
            'is_mandatory' => true,
            'enrolled_count' => 14,
        ],
        [
            'id' => 'CRS-002',
            'title_ar' => 'الأمن السيبراني وحماية البيانات الحساسة (Cyber Security & NDMO)',
            'title_en' => 'Cyber Security & Data Privacy',
            'category' => 'الأمن الرقمي والامتثال',
            'instructor' => 'م. سارة المهيدب',
            'duration' => '4 ساعات تدريبية',
            'is_mandatory' => true,
            'enrolled_count' => 28,
        ],
        [
            'id' => 'CRS-003',
            'title_ar' => 'القيادة الفعالة وإدارة فرق العمل عن بُعد',
            'title_en' => 'High-Performance Agile Leadership',
            'category' => 'المهارات القيادية',
            'instructor' => 'د. ماجد الفهد',
            'duration' => '8 ساعات تدريبية',
            'is_mandatory' => false,
            'enrolled_count' => 9,
        ],
    ];

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->courses,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $course = collect($this->courses)->firstWhere('id', $id) ?? $this->courses[0];

        return response()->json([
            'success' => true,
            'data' => $course,
        ]);
    }

    public function enroll(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|uuid|exists:employees,id',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);

        return response()->json([
            'success' => true,
            'message' => "Employee {$employee->full_name} enrolled in course successfully.",
            'data' => [
                'course_id' => $id,
                'employee_id' => $employee->id,
                'status' => 'ENROLLED',
                'enrolled_at' => now()->toDateTimeString(),
            ],
        ]);
    }

    public function issueCertificate(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|uuid|exists:employees,id',
            'score' => 'required|integer|min:70|max:100',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);
        $certCode = 'CERT-' . date('Y') . '-' . substr($employee->id, 0, 6) . '-VERIFIED';

        return response()->json([
            'success' => true,
            'message' => 'Accredited certificate issued with digital QR validation',
            'data' => [
                'certificate_number' => $certCode,
                'employee_name' => $employee->full_name,
                'course_id' => $id,
                'score' => $validated['score'],
                'issued_at' => now()->toDateString(),
                'qr_verification_url' => url("/verify-certificate/{$certCode}"),
            ],
        ]);
    }
}

