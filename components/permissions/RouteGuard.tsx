'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions } from '../../hooks/usePermissions';

interface RouteGuardProps {
  children: React.ReactNode;
}

// Mapping des routes vers les permissions requises
const ROUTE_PERMISSIONS: Record<string, 'laalas' | 'contenus' | 'owner-only' | 'public'> = {
  // Routes publiques (accessibles à tous)
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
};

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { check, loading, permissions } = usePermissions();

  useEffect(() => {
    if (loading || !pathname) {
      console.log('🔍 RouteGuard: Still loading or no pathname');
      return; // Attendre le chargement des permissions
    }

    console.log('🔍 RouteGuard: Checking path:', pathname);
    console.log('🔍 Permissions state:', { permissions, check });

    // Vérifier si la route actuelle nécessite des permissions
    const requiredPermission = getRequiredPermission(pathname);
    console.log('🔍 Required permission for', pathname, ':', requiredPermission);
    
    if (!requiredPermission || requiredPermission === 'public') {
      console.log('✅ Public route - access granted');
      return; // Route publique, accès autorisé
    }

    // Vérifier si l'utilisateur a les permissions requises
    let hasAccess = false;

    switch (requiredPermission) {
      case 'owner-only':
        hasAccess = check.isOwner;
        console.log('🔍 Owner-only check:', hasAccess);
        break;
      case 'laalas':
        hasAccess = check.canAccess('laalas');
        console.log('🔍 Laalas access check:', hasAccess);
        break;
      case 'contenus':
        hasAccess = check.canAccess('contenus');
        console.log('🔍 Contenus access check:', hasAccess);
        break;
    }

    if (!hasAccess) {
      console.log(`🚫 ACCÈS REFUSÉ à ${pathname} - Permission requise: ${requiredPermission}`);
      
      // Rediriger vers une page accessible
      const redirectPath = getRedirectPath(permissions);
      console.log('🔄 Redirecting to:', redirectPath);
      if (redirectPath !== pathname) {
        router.replace(redirectPath);
      }
    } else {
      console.log(`✅ ACCÈS AUTORISÉ à ${pathname}`);
    }
  }, [pathname, check, loading, permissions, router]);

  return <>{children}</>;
}

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

  // Par défaut, traiter comme nécessitant les permissions propriétaire
  return 'owner-only';
}

function getRedirectPath(permissions: any): string {
  if (!permissions) {
    return '/dashboard';
  }

  if (!permissions.isCoGestionnaire) {
    return '/dashboard'; // Propriétaire - dashboard principal
  }

  // Co-gestionnaire - rediriger vers la première section accessible
  if (permissions.permissions.laalas) {
    return '/dashboard/laalas';
  }
  
  if (permissions.permissions.contenus) {
    return '/dashboard/laalas/content';
  }

  // Aucune permission - rester sur le dashboard de base
  return '/dashboard';
}
