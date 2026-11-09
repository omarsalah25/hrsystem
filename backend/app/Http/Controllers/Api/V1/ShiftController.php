<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ShiftController extends Controller
{
    /**
     * Standard enterprise shifts for Saudi Arabia and Egypt
     */
    protected array $defaultShifts = [
        [
            'id' => 'SHIFT-STD-01',
            'name_ar' => 'الوردية الصباحية القياسية (09:00 - 17:00)',
            'name_en' => 'Standard Morning Shift',
            'start_time' => '09:00',
            'end_time' => '17:00',
            'daily_hours' => 8,
            'grace_period_minutes' => 15,
            'is_ramadan_shift' => false,
            'overtime_multiplier' => 1.5,
        ],
        [
            'id' => 'SHIFT-RAM-02',
            'name_ar' => 'وردية رمضان المبارك النظامية (10:00 - 16:00)',
            'name_en' => 'Statutory Ramadan 6-Hour Shift',
            'start_time' => '10:00',
            'end_time' => '16:00',
            'daily_hours' => 6,
            'grace_period_minutes' => 20,
            'is_ramadan_shift' => true,
            'overtime_multiplier' => 1.5,
        ],
        [
            'id' => 'SHIFT-NGT-03',
            'name_ar' => 'الوردية المسائية / الليلية (16:00 - 00:00)',
            'name_en' => 'Evening / Night Shift',
            'start_time' => '16:00',
            'end_time' => '00:00',
            'daily_hours' => 8,
            'grace_period_minutes' => 15,
            'is_ramadan_shift' => false,
            'overtime_multiplier' => 1.7, // Higher statutory rate for night shift (Egypt Law 12)
        ],
    ];

    public function index(Request $request): JsonResponse
    {
        $custom = Cache::get('hr_custom_shifts', []);
        return response()->json([
            'success' => true,
            'data' => array_merge($custom, $this->defaultShifts),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:150',
            'name_en' => 'nullable|string|max:150',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'daily_hours' => 'required|numeric|min:4|max:12',
            'grace_period_minutes' => 'integer|min:0|max:60',
            'is_ramadan_shift' => 'boolean',
            'overtime_multiplier' => 'numeric|min:1.0',
        ]);

        $newShift = array_merge([
            'name_en' => $validated['name_en'] ?: $validated['name_ar'],
            'grace_period_minutes' => 15,
            'is_ramadan_shift' => false,
            'overtime_multiplier' => 1.5,
        ], $validated, ['id' => 'SHIFT-CUST-' . time()]);

        $custom = Cache::get('hr_custom_shifts', []);
        array_unshift($custom, $newShift);
        Cache::put('hr_custom_shifts', $custom, now()->addDays(30));

        return response()->json([
            'success' => true,
            'message' => 'Shift roster created successfully',
            'data' => $newShift,
        ], 201);
    }
}

