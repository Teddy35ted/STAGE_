'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CoGestionnaireLogin from '../../../components/auth/CoGestionnaireLogin';
import { useAuth } from '../../../contexts/AuthContext';

export default function CoGestionnaireAuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { } = useAuth(); // On réutilise le contexte d'auth existant

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Tentative de connexion co-gestionnaire...');

      // Appel API pour l'authentification co-gestionnaire
      const response = await fetch('/api/auth/co-gestionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Échec de la connexion');
      }

      console.log('✅ Connexion co-gestionnaire réussie');

      // Utiliser le token personnalisé pour s'authentifier via Firebase
      const { signInWithCustomToken } = await import('firebase/auth');
      const { auth: firebaseAuth } = await import('../../../app/firebase/config');
      
      await signInWithCustomToken(firebaseAuth, data.data.token);

      // Stocker les informations du co-gestionnaire
      if (typeof window !== 'undefined') {
        localStorage.setItem('coGestionnaireInfo', JSON.stringify(data.data.user));
      }

      console.log('✅ Token Firebase configuré pour co-gestionnaire');

      // Rediriger vers le dashboard
      router.push('/dashboard');

    } catch (error) {
      console.error('❌ Erreur connexion co-gestionnaire:', error);
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CoGestionnaireLogin
      onLogin={handleLogin}
      loading={loading}
      error={error || undefined}
    />
  );
}
