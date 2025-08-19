'use client';

import { useState, useEffect } from 'react';
import { useApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function usePasswordChangeRequired() {
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coGestionnaireId, setCoGestionnaireId] = useState<string | null>(null);
  const { apiFetch } = useApi();
  const { user, loading: authLoading } = useAuth();

  const checkPasswordChangeRequired = async () => {
    // Ne pas faire l'appel API si l'utilisateur n'est pas authentifié
    if (!user) {
      console.log('🔐 Utilisateur non authentifié - pas de vérification mot de passe');
      setRequiresPasswordChange(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Vérification changement mot de passe pour:', user.uid);
      const response = await apiFetch('/api/auth/check-password-change');
      setRequiresPasswordChange(response.requiresPasswordChange || false);
      setCoGestionnaireId(response.coGestionnaireId || null);
    } catch (error) {
      console.error('Erreur vérification changement mot de passe:', error);
      setRequiresPasswordChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attendre que l'authentification soit terminée
    if (!authLoading) {
      checkPasswordChangeRequired();
    }
  }, [user, authLoading]);

  const markPasswordChanged = () => {
    setRequiresPasswordChange(false);
  };

  return {
    requiresPasswordChange,
    loading,
    coGestionnaireId,
    checkPasswordChangeRequired,
    markPasswordChanged
  };
}
