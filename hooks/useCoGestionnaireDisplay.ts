'use client';

import { useCoGestionnairePermissions } from './useCoGestionnairePermissions';

export function useCoGestionnaireDisplay() {
  const { getUserDisplayEmail, isCoGestionnaire, loading } = useCoGestionnairePermissions();

  const getDisplayEmail = (fallbackEmail: string) => {
    // Si on est en cours de chargement, utiliser l'email de fallback
    if (loading) return fallbackEmail;
    
    try {
      // Essayer de récupérer l'email de l'animateur si c'est un co-gestionnaire
      const displayEmail = getUserDisplayEmail();
      return displayEmail || fallbackEmail;
    } catch (error) {
      // En cas d'erreur, utiliser l'email de fallback
      console.warn('Erreur lors de la récupération de l\'email d\'affichage:', error);
      return fallbackEmail;
    }
  };

  const getDisplayRole = (fallbackRole: string = 'Animateur Pro') => {
    // Si on est en cours de chargement, utiliser le rôle de fallback
    if (loading) return fallbackRole;
    
    try {
      return isCoGestionnaire() ? 'Co-gestionnaire' : fallbackRole;
    } catch (error) {
      // En cas d'erreur, utiliser le rôle de fallback
      console.warn('Erreur lors de la récupération du rôle d\'affichage:', error);
      return fallbackRole;
    }
  };

  return {
    getDisplayEmail,
    getDisplayRole,
    loading
  };
}
