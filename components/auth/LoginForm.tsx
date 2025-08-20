'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../app/firebase/config';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Eye, EyeOff, Mail, Phone, ArrowLeft, CheckCircle } from 'lucide-react';

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
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs
    if (!resetEmail) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!newPassword) {
      setError('Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setResetLoading(true);
    setError('');

    try {
      // Appeler l'API pour vérifier l'email et changer le mot de passe
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: resetEmail,
          newPassword: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
      } else {
        setError(data.error || 'Erreur lors de la modification du mot de passe');
      }
      
    } catch (error: any) {
      console.error('Erreur lors de la modification du mot de passe:', error);
      setError('Erreur lors de la modification du mot de passe. Veuillez réessayer.');
    } finally {
      setResetLoading(false);
    }
  };

  const resetPasswordForm = () => {
    setShowResetPassword(false);
    setResetEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setResetSuccess(false);
    setError('');
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-2xl">
      {showResetPassword ? (
        // Interface de réinitialisation de mot de passe
        <div>
          <div className="mb-6">
            <button
              onClick={resetPasswordForm}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Réinitialiser le mot de passe</h2>
            <p className="text-gray-600 mt-2">
              Entrez votre adresse email et choisissez un nouveau mot de passe
            </p>
          </div>

          {resetSuccess ? (
            // Message de succès
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mot de passe modifié !</h3>
              <p className="text-gray-600 mb-6">
                Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Button
                onClick={resetPasswordForm}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                Retour à la connexion
              </Button>
            </div>
          ) : (
            // Formulaire de réinitialisation
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {error && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Entrez votre nouveau mot de passe"
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={resetLoading || !resetEmail || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                {resetLoading ? 'Modification en cours...' : 'Modifier le mot de passe'}
              </Button>
            </form>
          )}
        </div>
      ) : (
        // Interface de connexion normale
        <div>
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
                className="text-sm text-slate-600 hover:text-slate-800 underline"
                onClick={() => setShowResetPassword(true)}
              >
                Mot de passe oublié ?
              </button>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-gray-600">Pas encore de compte ? </span>
              <button
                type="button"
                onClick={onToggleMode}
                className="text-sm text-slate-600 hover:text-slate-800 font-medium"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}