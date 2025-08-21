'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../lib/api';

interface CoGestionnaireStatus {
  isCoGestionnaire: boolean;
  requiresPasswordChange: boolean;
  coGestionnaireInfo: any;
  permissions: {
    laalas: string[];
    contenus: string[];
  };
  loading: boolean;
  error: string | null;
}

export function useCoGestionnaireStatus(): CoGestionnaireStatus {
  const [status, setStatus] = useState<CoGestionnaireStatus>({
    isCoGestionnaire: false,
    requiresPasswordChange: false,
    coGestionnaireInfo: null,
    permissions: { laalas: [], contenus: [] },
    loading: true,
    error: null
  });

  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  useEffect(() => {
    async function checkCoGestionnaireStatus() {
      if (authLoading || !user) {
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        setStatus(prev => ({ ...prev, loading: true, error: null }));

        // Vérifier les informations stockées localement (depuis la connexion)
        const coGestionnaireInfo = localStorage.getItem('coGestionnaireInfo');
        
        if (coGestionnaireInfo) {
          const info = JSON.parse(coGestionnaireInfo);
          
          // Vérifier si changement de mot de passe requis
          const passwordCheck = await apiFetch('/api/auth/check-password-change');
          
          setStatus({
            isCoGestionnaire: true,
            requiresPasswordChange: passwordCheck.requiresPasswordChange || false,
            coGestionnaireInfo: info,
            permissions: info.permissions || { laalas: [], contenus: [] },
            loading: false,
            error: null
          });
        } else {
          // Utilisateur propriétaire normal
          setStatus({
            isCoGestionnaire: false,
            requiresPasswordChange: false,
            coGestionnaireInfo: null,
            permissions: { laalas: [], contenus: [] },
            loading: false,
            error: null
          });
        }
      } catch (error: any) {
        console.error('Erreur vérification statut co-gestionnaire:', error);
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erreur de vérification du statut'
        }));
      }
    }

    checkCoGestionnaireStatus();
  }, [user, authLoading, apiFetch]);

  return status;
}

/**
 * Hook pour vérifier les permissions d'une ressource
 */
export function useCoGestionnairePermissions(resource: 'laalas' | 'contenus') {
  const status = useCoGestionnaireStatus();

  const hasPermission = (action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    // Les propriétaires ont toutes les permissions
    if (!status.isCoGestionnaire) {
      return true;
    }

    // Vérifier les permissions du co-gestionnaire
    const resourcePermissions = status.permissions[resource] || [];
    return resourcePermissions.includes(action);
  };

  const canCreate = hasPermission('create');
  const canRead = hasPermission('read');
  const canUpdate = hasPermission('update');
  const canDelete = hasPermission('delete');

  return {
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    permissions: status.permissions[resource] || [],
    loading: status.loading,
    error: status.error
  };
}
