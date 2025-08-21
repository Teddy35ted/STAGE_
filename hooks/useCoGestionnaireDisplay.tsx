'use client';

import { useAuth } from '../contexts/AuthContext';

export function useCoGestionnaireDisplay() {
  const { user } = useAuth();

  const getDisplayEmail = (defaultEmail: string): string => {
    return user?.email || defaultEmail;
  };

  const getDisplayRole = (defaultRole: string): string => {
    return defaultRole;
  };

  return {
    getDisplayEmail,
    getDisplayRole
  };
}
