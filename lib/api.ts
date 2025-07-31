'use client';

import { useAuth } from '../contexts/AuthContext';

export function useApi() {
  const { getAuthToken } = useAuth();

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getAuthToken();
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return response.json();
  };

  return { apiFetch };
}
