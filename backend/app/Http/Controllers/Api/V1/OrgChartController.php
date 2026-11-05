<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrgChartController extends Controller
{
    public function hierarchy(Request $request): JsonResponse
    {
        $companies = Company::with([
            'branches',
            'departments' => fn($q) => $q->withCount('employees')
        ])->get();

        $employees = Employee::with(['designation', 'department', 'branch'])
            ->where('employment_status', 'ACTIVE')
            ->get();

        // Build organizational tree nodes
        $nodes = $employees->map(function ($emp) {
            return [
                'id' => $emp->id,
                'name' => $emp->full_name,
                'employee_number' => $emp->employee_number,
                'role' => $emp->designation?->title ?? 'موظف',
                'department' => $emp->department?->name ?? 'العام',
                'branch' => $emp->branch?->name ?? 'المقر',
                'email' => $emp->work_email,
                'manager_id' => $emp->manager_id,
                'avatar_initials' => mb_substr($emp->first_name, 0, 1) . mb_substr($emp->last_name, 0, 1),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'companies' => $companies,
                'employees' => $nodes,
                'root_nodes' => $nodes->whereNull('manager_id')->values(),
            ],
        ]);
    }
}

