'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FiMail } from 'react-icons/fi';

export const AccountRequestForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('L\'email est requis');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/request-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setSubmitted(true);
        setEmail('');
      } else {
        setError(data.error || 'Erreur lors de la soumission');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">La-a-La</h1>
          <p className="text-gray-600 mt-2">Demande envoyée</p>
        </div>

        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="text-sm">{message}</p>
        </div>

        <div className="text-center">
          <Button
            onClick={() => setSubmitted(false)}
            className="text-[#f01919] hover:underline bg-transparent hover:bg-transparent p-0"
          >
            Faire une nouvelle demande
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">La-a-La</h1>
        <p className="text-gray-600 mt-2">Demande de création de compte</p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
        <p><strong>Comment ça marche :</strong></p>
        <ol className="mt-2 ml-4 list-decimal text-xs space-y-1">
          <li>Saisissez votre email</li>
          <li>Un administrateur validera votre demande</li>
          <li>Vous recevrez un mot de passe temporaire par email</li>
          <li>Connectez-vous et changez votre mot de passe</li>
        </ol>
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
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full bg-[#f01919] hover:bg-[#d01515] text-white disabled:opacity-50"
        >
          {loading ? 'Envoi en cours...' : 'Demander un compte'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Vous avez déjà un compte ?{' '}
          <a href="/auth" className="text-[#f01919] hover:underline font-medium">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
};
