'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../app/firebase/config';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Eye, EyeOff, Mail, Phone } from 'lucide-react';

interface LoginFormProps {
  onToggleMode?: () => void;
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (loginMethod === 'email') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // TODO: Implémenter la connexion par téléphone
        setError('Connexion par téléphone non encore implémentée');
        setIsLoading(false);
        return;
      }
      
      // Redirection vers le dashboard après connexion réussie
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Aucun compte trouvé avec ces identifiants');
          break;
        case 'auth/wrong-password':
          setError('Mot de passe incorrect');
          break;
        case 'auth/invalid-email':
          setError('Format d\'email invalide');
          break;
        case 'auth/too-many-requests':
          setError('Trop de tentatives. Veuillez réessayer plus tard');
          break;
        default:
          setError('Erreur de connexion. Veuillez réessayer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
        <p className="mt-2 text-sm text-gray-600">
          Connectez-vous à votre compte animateur
        </p>
      </div>

      {/* Sélecteur de méthode de connexion */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          type="button"
          onClick={() => setLoginMethod('email')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
            loginMethod === 'email'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-red-600'
          }`}
        >
          <Mail size={16} />
          <span>Email</span>
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
            loginMethod === 'phone'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-red-600'
          }`}
        >
          <Phone size={16} />
          <span>Téléphone</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Email ou Téléphone */}
        {loginMethod === 'email' ? (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +237
              </span>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6XXXXXXXX"
                required
                className="flex-1 rounded-l-none"
              />
            </div>
          </div>
        )}

        {/* Champ Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Bouton de soumission */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      {/* Liens */}
      <div className="mt-6 space-y-3">
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-red-600 hover:text-red-500 underline"
            onClick={() => {
              // TODO: Implémenter la réinitialisation de mot de passe
              alert('Fonctionnalité de réinitialisation à implémenter');
            }}
          >
            Mot de passe oublié ?
          </button>
        </div>
        
        <div className="text-center">
          <span className="text-sm text-gray-600">Pas encore de compte ? </span>
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-red-600 hover:text-red-500 font-medium"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}