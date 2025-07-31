'use client';

import { auth } from '../app/firebase/config';

// Fonction utilitaire pour obtenir le token d'authentification
const getAuthToken = async (): Promise<string | null> => {
  if (auth.currentUser) {
    return auth.currentUser.getIdToken();
  }
  return null;
};

// Export direct de apiFetch
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
    throw new Error(errorData.error || 'API request failed');
  }

  return response.json();
};

// Hook pour la compatibilité avec les composants qui l'utilisent déjà
export function useApi() {
  return { apiFetch };
}
