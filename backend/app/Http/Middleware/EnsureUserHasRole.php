<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request and ensure user possesses required RBAC role
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated access.',
            ], 401);
        }

        if (!$user->hasRole($roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Insufficient permissions for this operational domain.',
                'required_roles' => $roles,
                'user_role' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}

