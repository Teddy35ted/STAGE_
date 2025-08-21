'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface CoGestionnairePermissions {
  laalas: boolean;
  contenus: boolean;
}

export interface CoGestionnaireInfo {
  id: string;
  email: string;
  permissions: CoGestionnairePermissions;
  animatorEmail: string; // Email de l'animateur qui a créé ce co-gestionnaire
  isCoGestionnaire: boolean;
}

export function useCoGestionnairePermissions() {
  const { user } = useAuth();
  const [coGestionnaireInfo, setCoGestionnaireInfo] = useState<CoGestionnaireInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoGestionnaireInfo = async () => {
      if (!user?.uid) {
        setCoGestionnaireInfo(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/co-gestionnaires/permissions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await user.getIdToken()}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCoGestionnaireInfo(data);
        } else {
          // L'utilisateur n'est pas un co-gestionnaire
          setCoGestionnaireInfo(null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des permissions:', error);
        setCoGestionnaireInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCoGestionnaireInfo();
  }, [user]);

  // Fonctions utilitaires pour vérifier les permissions
  const hasPermission = (section: keyof CoGestionnairePermissions): boolean => {
    return coGestionnaireInfo?.permissions[section] || false;
  };

  const isCoGestionnaire = (): boolean => {
    return coGestionnaireInfo?.isCoGestionnaire || false;
  };

  const getAnimatorEmail = (): string | null => {
    return coGestionnaireInfo?.animatorEmail || null;
  };

  const getUserDisplayEmail = (): string => {
    // Pour les co-gestionnaires, on affiche l'email de l'animateur
    // Pour les animateurs normaux, on affiche leur propre email
    if (isCoGestionnaire() && coGestionnaireInfo?.animatorEmail) {
      return coGestionnaireInfo.animatorEmail;
    }
    return user?.email || '';
  };

  return {
    coGestionnaireInfo,
    loading,
    hasPermission,
    isCoGestionnaire,
    getAnimatorEmail,
    getUserDisplayEmail,
    permissions: coGestionnaireInfo?.permissions || { laalas: false, contenus: false }
  };
}
