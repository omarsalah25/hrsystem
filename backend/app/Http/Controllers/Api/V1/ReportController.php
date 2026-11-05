<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\PayrollRun;
use App\Services\Compliance\BradfordFactorService;
use App\Services\Compliance\EgyptianizationService;
use App\Services\Compliance\SaudizationNitaqatService;
use App\Services\Payroll\AccountingLedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        protected SaudizationNitaqatService $saudizationService,
        protected EgyptianizationService $egyptianizationService,
        protected BradfordFactorService $bradfordService,
        protected AccountingLedgerService $glService
    ) {}

    public function saudization(Request $request): JsonResponse
    {
        $companyId = $request->query('company_id');
        if (!$companyId) {
            $company = Company::where('country_code', 'SAU')->first();
            $companyId = $company?->id;
        }

        if (!$companyId) {
            return response()->json(['success' => false, 'message' => 'Saudi company not found.'], 404);
        }

        $report = $this->saudizationService->compute($companyId);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    public function egyptianization(Request $request): JsonResponse
    {
        $companyId = $request->query('company_id');
        if (!$companyId) {
            $company = Company::where('country_code', 'EGY')->first();
            $companyId = $company?->id;
        }

        if (!$companyId) {
            return response()->json(['success' => false, 'message' => 'Egyptian company not found.'], 404);
        }

        $report = $this->egyptianizationService->compute($companyId);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    public function bradfordFactor(Request $request): JsonResponse
    {
        $employeeId = $request->query('employee_id');
        if ($employeeId) {
            $data = $this->bradfordService->computeForEmployee($employeeId);
            return response()->json(['success' => true, 'data' => $data]);
        }

        // Return summary for first 10 employees
        $employees = Employee::where('employment_status', 'ACTIVE')->limit(10)->get();
        $results = [];
        foreach ($employees as $emp) {
            $results[] = $this->bradfordService->computeForEmployee($emp->id);
        }

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }

    public function glJournal(string $runId): JsonResponse
    {
        $run = PayrollRun::findOrFail($runId);
        $voucher = $this->glService->generateJournalVoucher($run);

        return response()->json([
            'success' => true,
            'data' => $voucher,
        ]);
    }

    public function headcount(): JsonResponse
    {
        $total = Employee::count();
        $active = Employee::where('employment_status', 'ACTIVE')->count();
        $saudiNationals = Employee::where('is_national', true)->whereHas('company', fn($q) => $q->where('country_code', 'SAU'))->count();
        $egyptianNationals = Employee::where('is_national', true)->whereHas('company', fn($q) => $q->where('country_code', 'EGY'))->count();

        $byDepartment = Department::withCount('employees')->get();
        $byBranch = Branch::withCount('employees')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_headcount' => $total,
                'active_headcount' => $active,
                'saudi_nationals' => $saudiNationals,
                'egyptian_nationals' => $egyptianNationals,
                'by_department' => $byDepartment,
                'by_branch' => $byBranch,
            ],
        ]);
    }
}

