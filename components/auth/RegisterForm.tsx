'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FiMail, FiLock, FiPhone, FiUser } from 'react-icons/fi';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    if (!firstName.trim()) {
      setError('Le prénom est requis');
      return false;
    }
    if (!lastName.trim()) {
      setError('Le nom est requis');
      return false;
    }
    if (!email.trim()) {
      setError('L\'email est requis');
      return false;
    }
    if (!password) {
      setError('Le mot de passe est requis');
      return false;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp(email, password);
      console.log('Registration successful, redirecting to dashboard...');
      // Redirection immédiate avec replace
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Register error:', error);
      setError(error.message || 'Erreur lors de l\'inscription');
      setLoading(false);
    }
    // Ne pas mettre setLoading(false) dans finally pour éviter le flash
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">La-a-La</h1>
        <p className="text-gray-600 mt-2">Inscription Animateur Pro</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-10"
              required
              disabled={loading}
            />
          </div>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="pl-10"
              required
              disabled={loading}
            />
          </div>
        </div>

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

        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="password"
            placeholder="Mot de passe (min. 6 caractères)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            disabled={loading}
            minLength={6}
          />
        </div>

        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10"
            required
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !firstName || !lastName || !email || !password || !confirmPassword}
          className="w-full bg-[#f01919] hover:bg-[#d01515] text-white disabled:opacity-50"
        >
          {loading ? 'Inscription...' : "S'inscrire"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Déjà un compte ?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-[#f01919] hover:underline font-medium"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};