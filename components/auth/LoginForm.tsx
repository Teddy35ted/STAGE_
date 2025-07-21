'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FiMail, FiLock, FiPhone } from 'react-icons/fi';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signInWithPhone } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      console.log('Login successful, redirecting to dashboard...');
      // Redirection immédiate avec replace pour éviter l'historique
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Erreur lors de la connexion');
      setLoading(false);
    }
    // Ne pas mettre setLoading(false) dans finally pour éviter le flash
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!confirmationResult) {
        if (!phoneNumber) {
          setError('Veuillez entrer un numéro de téléphone');
          return;
        }
        
        const result = await signInWithPhone(phoneNumber);
        setConfirmationResult(result);
        setError('');
      } else {
        if (!verificationCode) {
          setError('Veuillez entrer le code de vérification');
          return;
        }
        
        await confirmationResult.confirm(verificationCode);
        console.log('Phone login successful, redirecting to dashboard...');
        // Redirection immédiate avec replace
        router.replace('/dashboard');
      }
    } catch (error: any) {
      console.error('Phone login error:', error);
      setError(error.message || 'Erreur lors de la connexion par téléphone');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setVerificationCode('');
    setConfirmationResult(null);
    setError('');
  };

  const handleTabSwitch = (isPhone: boolean) => {
    setIsPhoneLogin(isPhone);
    resetForm();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">La-à-La</h1>
        <p className="text-gray-600 mt-2">Connexion Animateur Pro</p>
      </div>

      <div className="flex mb-6">
        <button
          type="button"
          onClick={() => handleTabSwitch(false)}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border transition-colors ${
            !isPhoneLogin
              ? 'bg-[#f01919] text-white border-[#f01919]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch(true)}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border transition-colors ${
            isPhoneLogin
              ? 'bg-[#f01919] text-white border-[#f01919]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Téléphone
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {!isPhoneLogin ? (
        <form onSubmit={handleEmailLogin} className="space-y-4">
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
            disabled={loading || !email || !password}
            className="w-full bg-[#f01919] hover:bg-[#d01515] text-white disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handlePhoneLogin} className="space-y-4">
          {!confirmationResult ? (
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: +33 6 12 34 56 78
              </p>
            </div>
          ) : (
            <div>
              <Input
                type="text"
                placeholder="Code de vérification"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                disabled={loading}
                maxLength={6}
              />
              <p className="text-sm text-gray-600 mt-2">
                Entrez le code reçu par SMS au {phoneNumber}
              </p>
              <button
                type="button"
                onClick={() => setConfirmationResult(null)}
                className="text-sm text-[#f01919] hover:underline mt-2"
              >
                Changer de numéro
              </button>
            </div>
          )}
          <Button
            type="submit"
            disabled={loading || (!confirmationResult && !phoneNumber) || (confirmationResult && !verificationCode)}
            className="w-full bg-[#f01919] hover:bg-[#d01515] text-white disabled:opacity-50"
          >
            {loading
              ? 'Envoi...'
              : confirmationResult
              ? 'Vérifier le code'
              : 'Envoyer le code'}
          </Button>
        </form>
      )}

      <div id="recaptcha-container" className="mt-4"></div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Pas encore de compte ?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-[#f01919] hover:underline font-medium"
          >
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
};