<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExtractBearerTokenFromQuery
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($token = $request->query('token')) {
            if (!$request->headers->has('Authorization')) {
                $request->headers->set('Authorization', 'Bearer ' . $token);
            }
        }

        return $next($request);
    }
}
