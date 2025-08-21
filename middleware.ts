import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware pour la protection des routes sensibles
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔍 Middleware checking:', pathname);
  
  // Routes protégées nécessitant une authentification
  const protectedRoutes = [
    '/dashboard',
    '/api/co-gestionnaires',
    '/api/laalas', 
    '/api/contenus',
    '/api/audit-logs'
  ];

  // Vérifier si la route nécessite une protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Pour les APIs, vérifier la présence d'un token
    if (pathname.startsWith('/api/')) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('🔒 Accès API refusé - Token manquant:', pathname);
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized - Token required' }), 
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log('🔍 Route protégée accédée:', pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};