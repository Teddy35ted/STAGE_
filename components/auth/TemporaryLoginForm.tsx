'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export const TemporaryLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);

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
          temporaryPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Stocker les informations utilisateur pour l'authentification
        if (data.user) {
          localStorage.setItem('tempUser', JSON.stringify(data.user));
        }
        
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

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
        <p><strong>Étape 1 :</strong> Validation de votre mot de passe temporaire</p>
        <p className="mt-1">Après validation, vous pourrez compléter votre profil et définir votre nouveau mot de passe.</p>
      </div>

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

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#f01919] hover:bg-[#d01515] text-white disabled:opacity-50"
        >
          {loading ? 'Valider le mot de passe temporaire' : 'Valider'}
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
