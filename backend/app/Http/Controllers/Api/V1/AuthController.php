<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'subdomain' => 'nullable|string',
            'portal_type' => 'nullable|in:ADMIN,COMPANY',
        ]);

        $query = User::where('email', $request->email);

        if ($request->filled('subdomain')) {
            $tenant = Tenant::where('subdomain', $request->subdomain)->first();
            if ($tenant) {
                $query->where('tenant_id', $tenant->id);
            }
        }

        $user = $query->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('messages.login_failed')],
            ]);
        }

        if ($request->portal_type === 'ADMIN' && $user->role !== 'SUPER_ADMIN') {
            throw ValidationException::withMessages([
                'email' => ['هذا الحساب لا يمتلك صلاحيات إدارة النظام المركزية (Platform Owner / Super Admin). يرجى تسجيل الدخول عبر بوابة الشركات والموظفين.'],
            ]);
        }

        $token = $user->createToken('api_access_token')->plainTextToken;
        $user->update(['last_login_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => __('messages.login_success'),
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'tenant_id' => $user->tenant_id,
                    'accessible_portals' => $user->role === 'SUPER_ADMIN' ? ['ADMIN', 'COMPANY'] : ['COMPANY'],
                    'default_portal' => $user->role === 'SUPER_ADMIN' ? 'ADMIN' : 'COMPANY',
                ],
                'tenant' => $user->tenant ? [
                    'id' => $user->tenant->id,
                    'name' => $user->tenant->name,
                    'subdomain' => $user->tenant->subdomain,
                    'jurisdiction' => $user->tenant->country_jurisdiction,
                ] : null,
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'employee_number' => $user->employee->employee_number,
                    'full_name' => $user->employee->full_name,
                ] : null,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['tenant', 'employee.department', 'employee.designation']);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.success'),
        ]);
    }
}

