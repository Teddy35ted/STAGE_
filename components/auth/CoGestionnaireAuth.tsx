'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface CoGestionnaireAuthProps {
  onBack: () => void;
}

export const CoGestionnaireAuth: React.FC<CoGestionnaireAuthProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Connexion directe avec email et mot de passe en une seule étape
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Format d\'email invalide');
      return;
    }

    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Authentifier directement avec email + mot de passe
      const response = await fetch('/api/co-gestionnaires/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Aucun co-gestionnaire trouvé avec cet email. Vérifiez que vous avez été invité(e) par un animateur.');
        } else if (response.status === 401) {
          setError('Mot de passe incorrect. Vérifiez vos identifiants.');
        } else {
          setError(data.details || data.error || 'Erreur de connexion');
        }
        return;
      }

      console.log('✅ Connexion co-gestionnaire réussie');

      // Utiliser le token personnalisé pour s'authentifier via Firebase
      const { signInWithCustomToken } = await import('firebase/auth');
      const { auth: firebaseAuth } = await import('../../app/firebase/config');
      
      await signInWithCustomToken(firebaseAuth, data.data.token);

      // Stocker les informations du co-gestionnaire ET le rôle sélectionné
      if (typeof window !== 'undefined') {
        localStorage.setItem('coGestionnaireInfo', JSON.stringify(data.data.user));
        localStorage.setItem('userRole', 'cogestionnaire'); // IMPORTANT: Stocker le rôle
        localStorage.setItem('selectedRole', 'cogestionnaire'); // Pour la cohérence
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
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header avec retour */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Changer de rôle</span>
          </button>
        </div>

        {/* Mode Indicator */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full mb-4">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Mode Co-gestionnaire</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Connexion Co-gestionnaire
          </h1>
          <p className="text-white/90">
            Saisissez vos identifiants pour accéder au dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8">
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">🔐 Connexion unique - Email et mot de passe ensemble</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Formulaire unique avec email et mot de passe */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                📧 Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="votre.email@exemple.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                🔒 Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12"
                  placeholder="Votre mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Vous avez besoin d'aide ? <br />
              Contactez l'animateur pour vos permissions d'accès.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
