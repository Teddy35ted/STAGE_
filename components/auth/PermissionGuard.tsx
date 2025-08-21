'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCoGestionnairePermissions } from '../../hooks/useCoGestionnairePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: 'laalas' | 'contenus';
  redirectTo?: string;
}

export function PermissionGuard({ 
  children, 
  requiredPermission, 
  redirectTo = '/dashboard' 
}: PermissionGuardProps) {
  const { hasPermission, isCoGestionnaire, loading } = useCoGestionnairePermissions();
  const router = useRouter();

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (loading) return;

    // Si pas de permission requise, toujours autoriser
    if (!requiredPermission) return;

    // Si l'utilisateur n'est pas un co-gestionnaire (donc animateur principal), toujours autoriser
    if (!isCoGestionnaire()) return;

    // Si l'utilisateur est un co-gestionnaire et n'a pas la permission requise, rediriger
    if (!hasPermission(requiredPermission)) {
      console.warn(`Access denied: Co-gestionnaire ne peut pas accéder à la section ${requiredPermission}`);
      router.push(redirectTo);
    }
  }, [loading, isCoGestionnaire, hasPermission, requiredPermission, router, redirectTo]);

  // Pendant le chargement, afficher un placeholder
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f01919] mx-auto"></div>
          <p className="text-gray-600 mt-2">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Si c'est un co-gestionnaire et qu'il n'a pas la permission, ne rien afficher
  // (la redirection sera gérée par useEffect)
  if (requiredPermission && isCoGestionnaire() && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 font-medium">Accès non autorisé</p>
          <p className="text-gray-600 mt-1">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  // Sinon, afficher le contenu normalement
  return <>{children}</>;
}
