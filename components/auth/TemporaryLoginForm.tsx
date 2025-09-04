'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export const TemporaryLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(true);

  const router = useRouter();

  const validateForm = () => {
    if (!email.trim()) {
      setError('L\'email est requis');
      return false;
    }
    if (!temporaryPassword.trim()) {
      setError('Le mot de passe temporaire est requis');
      return false;
    }
    if (isFirstLogin) {
      if (!newPassword) {
        setError('Le nouveau mot de passe est requis');
        return false;
      }
      if (newPassword.length < 6) {
        setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
        return false;
      }
      if (newPassword !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login-temporary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          temporaryPassword,
          newPassword: isFirstLogin ? newPassword : undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresProfileCompletion) {
          // Rediriger vers la completion du profil
          router.push('/complete-profile');
        } else {
          // Rediriger vers le dashboard
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Erreur lors de la connexion');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">La-a-La</h1>
        <p className="text-gray-600 mt-2">Connexion avec mot de passe temporaire</p>
      </div>

      {isFirstLogin && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm">
          <p><strong>Première connexion :</strong></p>
          <p className="mt-1">Vous devez changer votre mot de passe temporaire pour des raisons de sécurité.</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            disabled={loading}
          />
        </div>

        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type={showTempPassword ? 'text' : 'password'}
            placeholder="Mot de passe temporaire"
            value={temporaryPassword}
            onChange={(e) => setTemporaryPassword(e.target.value)}
            className="pl-10 pr-10"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowTempPassword(!showTempPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showTempPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {isFirstLogin && (
          <>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                placeholder="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#f01919] hover:bg-[#d01515] text-white disabled:opacity-50"
        >
          {loading ? 'Connexion...' : (isFirstLogin ? 'Créer mon compte' : 'Se connecter')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Pas encore de compte ?{' '}
          <a href="/request-account" className="text-[#f01919] hover:underline font-medium">
            Faire une demande
          </a>
        </p>
      </div>
    </div>
  );
};
