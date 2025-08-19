'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  FiMail, 
  FiLock, 
  FiArrowRight, 
  FiArrowLeft, 
  FiEye, 
  FiEyeOff,
  FiShield,
  FiUser,
  FiAlertCircle
} from 'react-icons/fi';
import { useApi } from '../../lib/api';

interface CoGestionnaireLoginFormProps {
  onSuccess: (data: {
    coGestionnaire: any;
    proprietaireId: string;
    authToken: string;
    requiresPasswordChange: boolean;
  }) => void;
  onError?: (error: string) => void;
}

export function CoGestionnaireLoginForm({ onSuccess, onError }: CoGestionnaireLoginFormProps) {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  
  const { apiFetch } = useApi();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de l'email
    if (!email.trim()) {
      setErrors({ email: 'L\'email est requis' });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: 'Format d\'email invalide' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Vérifier que l'email existe dans le système
      const response = await apiFetch('/api/co-gestionnaires/check-email', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (response.exists) {
        setStep('password');
      } else {
        setErrors({ 
          email: 'Aucun co-gestionnaire trouvé avec cet email. Vérifiez votre adresse email ou contactez l\'administrateur.' 
        });
      }
    } catch (error: any) {
      setErrors({ 
        email: error.message || 'Erreur lors de la vérification de l\'email' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du mot de passe
    if (!password.trim()) {
      setErrors({ password: 'Le mot de passe est requis' });
      return;
    }

    if (password.length < 6) {
      setErrors({ password: 'Le mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await apiFetch('/api/auth/co-gestionnaire-login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.success) {
        onSuccess({
          coGestionnaire: response.coGestionnaire,
          proprietaireId: response.proprietaireId,
          authToken: response.authToken,
          requiresPasswordChange: response.requiresPasswordChange
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la connexion';
      
      // Analyser le type d'erreur pour donner un message spécifique
      if (errorMessage.includes('Mot de passe incorrect') || errorMessage.includes('password')) {
        setErrors({ 
          password: 'Mot de passe incorrect. Vérifiez votre mot de passe ou contactez l\'administrateur pour le réinitialiser.' 
        });
      } else if (errorMessage.includes('inactif') || errorMessage.includes('suspendu')) {
        setErrors({ 
          general: 'Votre compte est inactif ou suspendu. Contactez l\'administrateur pour réactiver votre accès.' 
        });
      } else if (errorMessage.includes('non trouvé')) {
        setErrors({ 
          general: 'Co-gestionnaire non trouvé. Contactez l\'administrateur.' 
        });
      } else {
        setErrors({ 
          password: errorMessage 
        });
      }
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setPassword('');
    setErrors({});
  };

  const clearEmailError = () => {
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const clearPasswordError = () => {
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header avec progression */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#f01919] rounded-full flex items-center justify-center mx-auto mb-4">
          {step === 'email' ? (
            <FiMail className="w-8 h-8 text-white" />
          ) : (
            <FiLock className="w-8 h-8 text-white" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Connexion Co-gestionnaire
        </h1>
        
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className={`w-8 h-1 rounded-full transition-colors ${
            step === 'email' ? 'bg-[#f01919]' : 'bg-green-500'
          }`}></div>
          <div className={`w-8 h-1 rounded-full transition-colors ${
            step === 'password' ? 'bg-[#f01919]' : 'bg-gray-300'
          }`}></div>
        </div>
        
        <p className="text-gray-600">
          {step === 'email' 
            ? 'Entrez votre adresse email pour commencer' 
            : `Mot de passe pour ${email}`
          }
        </p>
      </div>

      {/* Erreur générale */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">
                Erreur de connexion
              </h3>
              <p className="text-sm text-red-700">
                {errors.general}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Étape 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email *
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  clearEmailError();
                }}
                placeholder="votre.email@entreprise.com"
                className={`pl-12 h-12 text-lg ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoComplete="email"
                autoFocus
              />
            </div>
            {errors.email && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm flex items-start">
                  <FiAlertCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                  {errors.email}
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full h-12 bg-[#f01919] hover:bg-[#d01515] text-white text-lg font-medium"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Vérification...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Continuer
                <FiArrowRight className="w-5 h-5 ml-2" />
              </div>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Vous êtes un utilisateur principal ?{' '}
              <a href="/auth" className="text-[#f01919] hover:text-[#d01515] font-medium">
                Connexion principale
              </a>
            </p>
          </div>
        </form>
      )}

      {/* Étape 2: Mot de passe */}
      {step === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  clearPasswordError();
                }}
                placeholder="Votre mot de passe"
                className={`pl-12 pr-12 h-12 text-lg ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm flex items-start">
                  <FiAlertCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                  {errors.password}
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToEmail}
              disabled={loading}
              className="flex-1 h-12 text-lg"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            
            <Button
              type="submit"
              disabled={loading || !password.trim()}
              className="flex-2 h-12 bg-[#f01919] hover:bg-[#d01515] text-white text-lg font-medium"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Connexion...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FiShield className="w-5 h-5 mr-2" />
                  Se connecter
                </div>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiUser className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Connexion en tant que co-gestionnaire
                </h4>
                <p className="text-sm text-blue-700">
                  Vous accédez au tableau de bord avec vos permissions de co-gestionnaire.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
