<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companies = Company::with(['branches', 'departments'])
            ->withCount('employees')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $companies,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $company = Company::with([
            'branches.employees',
            'departments.employees'
        ])->withCount('employees')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $company,
        ]);
    }
}

