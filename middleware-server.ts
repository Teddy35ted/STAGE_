import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './app/lib/firebase-admin';

// Email du propriétaire principal (à configurer)
const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'teddy@laala.app';

// Routes et leurs permissions requises
const ROUTE_PERMISSIONS: Record<string, 'laalas' | 'contenus' | 'owner-only' | 'public'> = {
  // Routes publiques
  '/dashboard': 'public',
  
  // Routes Laalas
  '/dashboard/laalas': 'laalas',
  '/dashboard/laalas/schedule': 'laalas',
  '/dashboard/laalas/spaces': 'laalas',
  '/dashboard/stats/laalas': 'laalas',
  
  // Routes Contenus
  '/dashboard/laalas/content': 'contenus',
  '/dashboard/stats/content': 'contenus',
  
  // Routes réservées au propriétaire
  '/dashboard/profile': 'owner-only',
  '/dashboard/boutiques': 'owner-only',
  '/dashboard/profile/contribution': 'owner-only',
  '/dashboard/profile/managers': 'owner-only',
  '/dashboard/co-gestionnaires': 'owner-only',
  '/dashboard/fans': 'owner-only',
  '/dashboard/earnings': 'owner-only',
  '/dashboard/retraits': 'owner-only',
  '/dashboard/ads': 'owner-only',
  '/dashboard/stats/revenue': 'owner-only',
  '/dashboard/stats/profile': 'owner-only',
  '/dashboard/stats/ads': 'owner-only',
  '/dashboard/laalas/boost': 'owner-only',

  // Routes de test et debug (owner-only)
  '/dashboard/permissions-test': 'owner-only',
  '/dashboard/create-test-cogestion': 'owner-only',
};

// Fonction pour obtenir la permission requise pour une route
function getRequiredPermission(pathname: string): 'laalas' | 'contenus' | 'owner-only' | 'public' | undefined {
  // Vérification exacte d'abord
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Vérification par préfixe pour les routes dynamiques
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + '/')) {
      return permission;
    }
  }

  // Par défaut, traiter comme nécessitant les permissions propriétaire pour les routes dashboard
  if (pathname.startsWith('/dashboard/')) {
    return 'owner-only';
  }

  return undefined;
}

// Cache simple pour éviter trop d'appels à la base de données
const permissionsCache = new Map<string, { permissions: any; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getUserPermissions(userId: string, userEmail: string): Promise<{ isOwner: boolean; permissions: any }> {
  // Vérifier le cache
  const cached = permissionsCache.get(userId);
  if (cached && cached.expiry > Date.now()) {
    return cached.permissions;
  }

  try {
    // Vérifier si c'est le propriétaire
    const isOwner = userEmail === OWNER_EMAIL;
    
    if (isOwner) {
      const result = { isOwner: true, permissions: { laalas: true, contenus: true } };
      permissionsCache.set(userId, { permissions: result, expiry: Date.now() + CACHE_DURATION });
      return result;
    }

    // Vérifier si c'est un co-gestionnaire (simulation d'appel à la base de données)
    // Dans un vrai projet, vous feriez un appel direct à votre base de données ici
    const coGestionnaireResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/co-gestionnaires/check-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (coGestionnaireResponse.ok) {
      const cgData = await coGestionnaireResponse.json();
      if (cgData.isCoGestionnaire) {
        // Récupérer les permissions spécifiques
        const permissionsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/co-gestionnaires/permissions`, {
          headers: { 'Authorization': `Bearer ${userId}` } // Simplified for middleware
        });
        
        if (permissionsResponse.ok) {
          const permData = await permissionsResponse.json();
          const result = { isOwner: false, permissions: permData.permissions };
          permissionsCache.set(userId, { permissions: result, expiry: Date.now() + CACHE_DURATION });
          return result;
        }
      }
    }

    // Par défaut, aucune permission
    const result = { isOwner: false, permissions: { laalas: false, contenus: false } };
    permissionsCache.set(userId, { permissions: result, expiry: Date.now() + CACHE_DURATION });
    return result;

  } catch (error) {
    console.error('Error getting user permissions:', error);
    // En cas d'erreur, vérifier si c'est le propriétaire
    const isOwner = userEmail === OWNER_EMAIL;
    return { 
      isOwner, 
      permissions: isOwner ? { laalas: true, contenus: true } : { laalas: false, contenus: false } 
    };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔍 Server Middleware checking:', pathname);
  
  // Pour les APIs, garde la logique existante
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    if (pathname.startsWith('/api/co-gestionnaires') || 
        pathname.startsWith('/api/laalas') || 
        pathname.startsWith('/api/contenus')) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('🔒 API access denied - no token:', pathname);
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized - Token required' }), 
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    return NextResponse.next();
  }

  // Pour les pages dashboard, vérifier les permissions côté serveur
  if (pathname.startsWith('/dashboard/')) {
    const requiredPermission = getRequiredPermission(pathname);
    
    if (requiredPermission && requiredPermission !== 'public') {
      console.log('🔍 Server checking permission:', requiredPermission, 'for', pathname);
      
      // Récupérer le token depuis les cookies Firebase Auth
      const sessionCookie = request.cookies.get('__session')?.value;
      const authToken = request.headers.get('authorization')?.replace('Bearer ', '') ||
                       request.cookies.get('firebase-auth-token')?.value;
      
      if (!authToken && !sessionCookie) {
        console.log('🔒 No auth token found for protected route');
        return NextResponse.redirect(new URL('/auth', request.url));
      }

      try {
        // Vérifier le token Firebase
        const token = authToken || sessionCookie;
        if (!token) throw new Error('No token available');
        
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const userEmail = decodedToken.email || '';
        
        console.log('🔍 Server verified user:', userEmail);
        
        // Obtenir les permissions de l'utilisateur
        const { isOwner, permissions } = await getUserPermissions(userId, userEmail);
        
        console.log('🔍 Server permissions check:', { isOwner, permissions, requiredPermission });
        
        // Vérifier l'accès selon la permission requise
        let hasAccess = false;
        
        if (requiredPermission === 'owner-only') {
          hasAccess = isOwner;
        } else if (requiredPermission === 'laalas') {
          hasAccess = isOwner || permissions.laalas === true;
        } else if (requiredPermission === 'contenus') {
          hasAccess = isOwner || permissions.contenus === true;
        }
        
        if (!hasAccess) {
          console.log('🚫 SERVER BLOCKING ACCESS to', pathname, '- Required:', requiredPermission);
          
          // Rediriger vers le dashboard principal ou une page d'accès refusé
          const redirectUrl = new URL('/dashboard', request.url);
          redirectUrl.searchParams.set('access_denied', 'true');
          redirectUrl.searchParams.set('required_permission', requiredPermission);
          
          return NextResponse.redirect(redirectUrl);
        }
        
        console.log('✅ SERVER ALLOWING ACCESS to', pathname);
        
      } catch (error) {
        console.error('❌ Server error verifying permissions:', error);
        return NextResponse.redirect(new URL('/auth', request.url));
      }
    }
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
