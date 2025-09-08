'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../app/firebase/config';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Users, 
  UserPlus, 
  Shield, 
  ChevronDown 
} from 'lucide-react';
import { CompleteRegistrationForm } from './CompleteRegistrationForm';

export const UnifiedAuthForm: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'animateur' | 'cogestionnaire'>('animateur');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Format d\'email invalide');
      return;
    }

    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (role === 'animateur') {
        // Connexion animateur via Firebase
        await signInWithEmailAndPassword(auth, email, password);
        
        // Stocker le rôle
        if (typeof window !== 'undefined') {
          localStorage.setItem('userRole', 'animateur');
          localStorage.setItem('selectedRole', 'animateur');
        }
        
        router.push('/dashboard');
      } else {
        // Connexion co-gestionnaire via API personnalisée
        const response = await fetch('/api/co-gestionnaires/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setError('Aucun co-gestionnaire trouvé avec cet email. Vérifiez que vous avez été invité(e) par un animateur.');
          } else if (response.status === 401) {
            setError('Mot de passe incorrect. Vérifiez vos identifiants.');
          } else {
            setError(data.details || data.error || 'Erreur de connexion');
          }
          return;
        }

        // Authentification Firebase avec token personnalisé
        const { signInWithCustomToken } = await import('firebase/auth');
        await signInWithCustomToken(auth, data.data.token);

        // Stocker les informations
        if (typeof window !== 'undefined') {
          localStorage.setItem('coGestionnaireInfo', JSON.stringify(data.data.user));
          localStorage.setItem('userRole', 'cogestionnaire');
          localStorage.setItem('selectedRole', 'cogestionnaire');
        }

        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      if (role === 'animateur') {
        switch (error.code) {
          case 'auth/user-not-found':
            setError('Aucun compte animateur trouvé avec ces identifiants');
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
      } else {
        setError(error instanceof Error ? error.message : 'Erreur de connexion co-gestionnaire');
      }
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'animateur',
      label: 'Animateur',
      icon: User,
      description: 'Créer et gérer votre compte',
      color: 'from-blue-500 to-purple-600'
    },
    {
      value: 'cogestionnaire',
      label: 'Co-gestionnaire', 
      icon: Users,
      description: 'Accès invité avec permissions limitées',
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  const selectedRoleOption = roleOptions.find(option => option.value === role);

  if (mode === 'register' && role === 'animateur') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
            <p className="text-white/80">Inscription en tant qu'animateur</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2">
            <CompleteRegistrationForm onToggleMode={() => setMode('login')} />
          </div>
          
          <div className="text-center mt-4">
            <button
              onClick={() => setMode('login')}
              className="text-white/80 hover:text-white transition-colors"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenue sur Laala</h1>
          <p className="text-white/80">Connectez-vous à votre compte</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Type de compte
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${selectedRoleOption?.color} rounded-full flex items-center justify-center`}>
                      {selectedRoleOption?.icon && (
                        <selectedRoleOption.icon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{selectedRoleOption?.label}</div>
                      <div className="text-xs text-gray-500">{selectedRoleOption?.description}</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setRole(option.value as 'animateur' | 'cogestionnaire');
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className={`w-8 h-8 bg-gradient-to-r ${option.color} rounded-full flex items-center justify-center`}>
                          <option.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            {/* Register Link - Only for Animateur */}
            {role === 'animateur' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Créer un compte animateur
                  </div>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Info Footer */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm">
            <span className="font-semibold">Animateur :</span> Créez et gérez votre compte<br />
            <span className="font-semibold">Co-gestionnaire :</span> Accès invité avec permissions limitées
          </p>
        </div>
      </div>
    </div>
  );
};
