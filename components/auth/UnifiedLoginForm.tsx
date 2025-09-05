'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiMail, FiLock, FiUser, FiUsers, FiShield } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

type UserRole = 'animateur' | 'cogestionnaire' | 'admin';

export const UnifiedLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('animateur');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequestAccount, setShowRequestAccount] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const router = useRouter();

  const handleAccountRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestEmail.trim()) {
      setError('L\'email est requis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/request-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: requestEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setRequestSubmitted(true);
        setRequestEmail('');
      } else {
        setError(data.error || 'Erreur lors de la soumission');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Email et mot de passe requis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Redirection selon le rôle
      if (role === 'admin') {
        // Connexion administrateur
        const response = await fetch('/api/admin/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (data.success) {
          localStorage.setItem('adminToken', data.token);
          router.push('/admin/dashboard');
        } else {
          setError(data.error || 'Erreur de connexion administrateur');
        }
      } else if (role === 'cogestionnaire') {
        // Connexion co-gestionnaire (existant)
        router.push('/auth/co-gestionnaire');
      } else {
        // Connexion animateur (existant) 
        router.push('/auth');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin': return <FiShield className="w-5 h-5" />;
      case 'cogestionnaire': return <FiUsers className="w-5 h-5" />;
      default: return <FiUser className="w-5 h-5" />;
    }
  };

  const getRoleDescription = () => {
    switch (role) {
      case 'admin': return 'Gestion des demandes de comptes et administration';
      case 'cogestionnaire': return 'Collaboration sur un compte existant';
      default: return 'Création et gestion de votre propre compte';
    }
  };

  if (showRequestAccount) {
    if (requestSubmitted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
                  <FiUser className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Demande envoyée !</h1>
                <p className="text-gray-600 mt-2">Votre demande a été transmise à un administrateur</p>
              </div>

              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded text-sm">
                <p><strong>Prochaines étapes :</strong></p>
                <ol className="mt-2 ml-4 list-decimal text-xs space-y-1">
                  <li>Un administrateur va examiner votre demande</li>
                  <li>Vous recevrez un email de confirmation</li>
                  <li>Connectez-vous avec le mot de passe temporaire fourni</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setRequestSubmitted(false);
                    setRequestEmail('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Faire une nouvelle demande
                </Button>
                
                <Button
                  onClick={() => setShowRequestAccount(false)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Retour à la connexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Demander un compte</h1>
              <p className="text-gray-600 mt-2">Saisissez votre email pour faire une demande</p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
              <p><strong>Processus :</strong></p>
              <ol className="mt-2 ml-4 list-decimal text-xs space-y-1">
                <li>Soumettez votre email</li>
                <li>Un administrateur validera votre demande</li>
                <li>Vous recevrez un mot de passe temporaire</li>
                <li>Connectez-vous et changez votre mot de passe</li>
              </ol>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAccountRequest} className="space-y-4">
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit"
                disabled={loading || !requestEmail.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowRequestAccount(false)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              {getRoleIcon()}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Connexion Laala</h1>
            <p className="text-gray-600 mt-2">Accédez à votre espace</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Sélection du rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de compte
              </label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    {getRoleIcon()}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="animateur">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      <span>Animateur</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cogestionnaire">
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-4 h-4" />
                      <span>Co-gestionnaire</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <FiShield className="w-4 h-4" />
                      <span>Administrateur</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">{getRoleDescription()}</p>
            </div>

            {/* Email */}
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Options selon le rôle */}
          <div className="mt-6 space-y-3">
            {role === 'animateur' && (
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Pas encore de compte ?{' '}
                  <button
                    onClick={() => setShowRequestAccount(true)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Faire une demande
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Vous avez un mot de passe temporaire ?{' '}
                  <a href="/login-temporary" className="text-blue-600 hover:underline">
                    Cliquez ici
                  </a>
                </p>
              </div>
            )}

            {role === 'cogestionnaire' && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Vous devez être invité(e) par un animateur pour accéder à cette section
                </p>
              </div>
            )}

            {role === 'admin' && (
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                  Accès réservé aux administrateurs autorisés
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/admin/auto-init');
                      if (response.ok) {
                        setError('✅ Admin auto-initialisé ! Reconnectez-vous.');
                      }
                    } catch (err) {
                      setError('❌ Erreur auto-init');
                    }
                  }}
                >
                  🚀 Auto-init Admin
                </Button>
              </div>
            )}
          </div>

          {/* Lien vers demande de compte */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <a 
                href="/request-account" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Demander un accès
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
