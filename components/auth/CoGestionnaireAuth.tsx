'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface CoGestionnaireAuthProps {
  onBack: () => void;
}

export const CoGestionnaireAuth: React.FC<CoGestionnaireAuthProps> = ({ onBack }) => {
  const [step, setStep] = useState<'email-check' | 'login'>('email-check');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coGestionnaireInfo, setCoGestionnaireInfo] = useState<any>(null);
  const router = useRouter();

  // Vérifier si l'email correspond à un co-gestionnaire
  const checkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Format d\'email invalide');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Vérifier si l'email existe en tant que co-gestionnaire
      const response = await fetch('/api/co-gestionnaires/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Aucun co-gestionnaire trouvé avec cet email. Vérifiez que vous avez été invité(e) par un animateur.');
        } else {
          setError(data.details || data.error || 'Erreur lors de la vérification');
        }
        return;
      }

      // Email trouvé, passer à l'étape de connexion
      setCoGestionnaireInfo(data.coGestionnaire);
      setStep('login');
      setError(null);

    } catch (error) {
      console.error('Erreur vérification email:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Connexion co-gestionnaire
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Authentifier le co-gestionnaire
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
      const { auth: firebaseAuth } = await import('../../app/firebase/config');
      
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

  const handleBackToEmailCheck = () => {
    setStep('email-check');
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f01919] to-[#d01515] flex items-center justify-center p-4">
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
            {step === 'email-check' ? 'Vérification Email' : 'Connexion Sécurisée'}
          </h1>
          <p className="text-white/90">
            {step === 'email-check' 
              ? 'Vérifiez que vous avez été invité(e) en tant que co-gestionnaire'
              : `Bienvenue ${coGestionnaireInfo?.prenom} ${coGestionnaireInfo?.nom}`
            }
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8">
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Accès sécurisé avec permissions limitées</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {step === 'email-check' ? (
            /* Étape 1: Vérification Email */
            <form onSubmit={checkEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="votre.email@exemple.com"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    Vérifier mon email
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Étape 2: Connexion */
            <>
              {/* Info Co-gestionnaire */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-800 font-medium">Email vérifié avec succès</p>
                  <p className="text-emerald-700 text-sm mt-1">
                    Vous êtes invité(e) en tant que co-gestionnaire par{' '}
                    <span className="font-medium">{coGestionnaireInfo?.proprietaireNom}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email (lecture seule) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Adresse email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={handleBackToEmailCheck}
                      className="px-3 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Changer d'email"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors pr-12"
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
            </>
          )}

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              {step === 'email-check' ? (
                <>
                  Vous n'avez pas encore été invité(e) ? <br />
                  Contactez l'animateur qui doit vous ajouter comme co-gestionnaire.
                </>
              ) : (
                <>
                  Vos actions sont limitées selon les permissions qui vous ont été accordées. <br />
                  Problème de connexion ? Contactez le propriétaire du compte.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
