'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoGestionnaireLoginForm } from '../../../components/auth/CoGestionnaireLoginForm';
import { ForcePasswordChange } from '../../../components/auth/ForcePasswordChange';
import { FiArrowLeft, FiUsers, FiShield } from 'react-icons/fi';

export default function CoGestionnaireAuthPage() {
  const [authData, setAuthData] = useState<{
    coGestionnaire: any;
    proprietaireId: string;
    authToken: string;
    requiresPasswordChange: boolean;
  } | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = (data: {
    coGestionnaire: any;
    proprietaireId: string;
    authToken: string;
    requiresPasswordChange: boolean;
  }) => {
    setAuthData(data);
    
    if (data.requiresPasswordChange) {
      setShowPasswordChange(true);
    } else {
      // Rediriger vers le dashboard
      // Ici vous pouvez aussi sauvegarder le token dans le localStorage ou un contexte
      localStorage.setItem('authToken', data.authToken);
      localStorage.setItem('user', JSON.stringify(data.coGestionnaire));
      router.push('/dashboard');
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChange(false);
    if (authData) {
      // Sauvegarder les données d'authentification et rediriger
      localStorage.setItem('authToken', authData.authToken);
      localStorage.setItem('user', JSON.stringify(authData.coGestionnaire));
      router.push('/dashboard');
    }
  };

  const handleLoginError = (error: string) => {
    console.error('Erreur de connexion:', error);
    // L'erreur est déjà gérée dans le composant de connexion
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            
            <div className="flex items-center space-x-2">
              <FiUsers className="w-6 h-6 text-[#f01919]" />
              <span className="text-lg font-semibold text-gray-900">
                Espace Co-gestionnaire
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#f01919] to-[#d01515] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25">
                <FiShield className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Espace Co-gestionnaire
              </h1>
              
              <p className="text-lg text-gray-600 mb-2">
                Connectez-vous pour accéder à votre tableau de bord
              </p>
              
              <p className="text-sm text-gray-500">
                Connexion sécurisée en deux étapes pour les membres de l'équipe
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-900/10 p-8 border border-gray-100">
              <CoGestionnaireLoginForm
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
              />
            </div>

            {/* Additional Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-start">
                  <FiShield className="w-6 h-6 text-[#f01919] mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Connexion Sécurisée
                    </h3>
                    <p className="text-sm text-gray-600">
                      Authentification en deux étapes pour protéger votre accès
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-start">
                  <FiUsers className="w-6 h-6 text-[#f01919] mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Accès Collaboratif
                    </h3>
                    <p className="text-sm text-gray-600">
                      Permissions personnalisées selon votre rôle
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Besoin d'aide ou problème de connexion ?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:support@laala.com"
                  className="text-[#f01919] hover:text-[#d01515] text-sm font-medium"
                >
                  Contacter le support
                </a>
                <span className="hidden sm:inline text-gray-400">•</span>
                <button
                  onClick={() => router.push('/auth')}
                  className="text-[#f01919] hover:text-[#d01515] text-sm font-medium"
                >
                  Connexion utilisateur principal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-sm text-gray-500">
              © 2025 Laala Platform. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>

      {/* Force Password Change Modal */}
      {showPasswordChange && authData && (
        <ForcePasswordChange
          isOpen={showPasswordChange}
          onClose={() => {}} // Ne peut pas être fermé
          onSuccess={handlePasswordChangeSuccess}
          userId={authData.coGestionnaire.id}
        />
      )}
    </div>
  );
}
