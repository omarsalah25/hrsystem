import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers for Enterprise Compliance (ISO 27001 & SOC 2)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Extract Multi-Tenant Subdomain if present
  const hostname = request.headers.get('host') || '';
  const parts = hostname.split('.');
  if (parts.length > 2 && parts[0] !== 'www') {
    response.headers.set('x-tenant-subdomain', parts[0]);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

