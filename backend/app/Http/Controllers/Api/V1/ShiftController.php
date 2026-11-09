<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WorkShift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $shifts = WorkShift::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $shifts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:150',
            'name_en' => 'nullable|string|max:150',
            'start_time' => 'required|string|max:10',
            'end_time' => 'required|string|max:10',
            'daily_hours' => 'nullable|numeric|min:4|max:12',
            'grace_period_minutes' => 'nullable|integer|min:0|max:60',
            'grace_minutes' => 'nullable|integer|min:0|max:60',
            'is_ramadan_shift' => 'nullable|boolean',
            'overtime_multiplier' => 'nullable|numeric|min:1.0',
        ]);

        $isRamadan = (bool) ($validated['is_ramadan_shift'] ?? false);
        $shift = WorkShift::create([
            'tenant_id' => $request->user()->tenant_id,
            'code' => 'SHIFT-' . strtoupper(substr(md5((string) microtime(true)), 0, 5)),
            'name_ar' => $validated['name_ar'],
            'name_en' => $validated['name_en'] ?: $validated['name_ar'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'break_minutes' => $isRamadan ? 0 : 60,
            'daily_hours' => $validated['daily_hours'] ?? ($isRamadan ? 6 : 8),
            'grace_period_minutes' => $validated['grace_period_minutes'] ?? $validated['grace_minutes'] ?? 15,
            'is_ramadan_shift' => $isRamadan,
            'overtime_multiplier' => $validated['overtime_multiplier'] ?? 1.5,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shift roster created successfully',
            'data' => $shift,
        ], 201);
    }

    public function destroy(string $id): JsonResponse
    {
        $shift = WorkShift::findOrFail($id);
        $shift->delete();

        return response()->json([
            'success' => true,
            'message' => 'Shift deleted successfully',
        ]);
    }
}
