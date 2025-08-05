'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FiMail, FiLock, FiPhone, FiUser, FiMapPin, FiCalendar } from 'react-icons/fi';

interface CompleteRegistrationFormProps {
  onToggleMode: () => void;
}

export const CompleteRegistrationForm: React.FC<CompleteRegistrationFormProps> = ({ onToggleMode }) => {
  // Données d'authentification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Données personnelles
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Masculin' | 'Féminin' | 'Autre'>('Masculin');
  
  // Localisation
  const [country, setCountry] = useState('Togo');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [countryCode, setCountryCode] = useState('+228');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Auth, 2: Profil

  const { signUp } = useAuth();
  const { apiFetch } = useApi();
  const router = useRouter();

  const validateStep1 = () => {
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

  const validateStep2 = () => {
    if (!firstName.trim()) {
      setError('Le prénom est requis');
      return false;
    }
    if (!lastName.trim()) {
      setError('Le nom est requis');
      return false;
    }
    if (!phone.trim()) {
      setError('Le numéro de téléphone est requis');
      return false;
    }
    if (!birthDate) {
      setError('La date de naissance est requise');
      return false;
    }
    if (!city.trim()) {
      setError('La ville est requise');
      return false;
    }
    return true;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Création compte Firebase Auth...');
      await signUp(email, password);
      console.log('✅ Compte Firebase créé, passage à l\'étape 2');
      setStep(2);
    } catch (error: any) {
      console.error('❌ Erreur création compte:', error);
      setError(error.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📝 Finalisation du profil utilisateur...');
      
      const profileData = {
        nom: lastName,
        prenom: firstName,
        email: email,
        tel: phone,
        date_de_naissance: birthDate,
        sexe: gender,
        pays: country,
        ville: city,
        quartier: district,
        region: '',
        codePays: countryCode
      };

      const result = await apiFetch('/api/auth/complete-registration', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });

      console.log('✅ Profil créé:', result);
      console.log('🚀 Redirection vers le dashboard...');
      
      // Redirection vers le dashboard
      router.replace('/dashboard');
      
    } catch (error: any) {
      console.error('❌ Erreur finalisation profil:', error);
      setError(error.message || 'Erreur lors de la finalisation du profil');
      setLoading(false);
    }
  };

  const countries = [
    { name: 'Togo', code: '+228' },
    { name: 'Bénin', code: '+229' },
    { name: 'Ghana', code: '+233' },
    { name: 'Côte d\'Ivoire', code: '+225' },
    { name: 'Nigeria', code: '+234' },
    { name: 'France', code: '+33' }
  ];

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    const countryData = countries.find(c => c.name === selectedCountry);
    if (countryData) {
      setCountryCode(countryData.code);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">La-a-La</h1>
        <p className="text-gray-600 mt-2">
          {step === 1 ? 'Inscription Animateur Pro - Étape 1/2' : 'Finalisation du Profil - Étape 2/2'}
        </p>
        
        {/* Indicateur de progression */}
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-[#f01919]' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-[#f01919]' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {step === 1 ? (
        // Étape 1: Authentification
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Créer votre compte</h2>
            <p className="text-gray-600 text-sm mt-1">Commencez par définir vos identifiants de connexion</p>
          </div>

          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              placeholder="Adresse email"
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
            disabled={loading || !email || !password || !confirmPassword}
            className="w-full bg-[#f01919] hover:bg-[#d01515] text-white disabled:opacity-50"
          >
            {loading ? 'Création du compte...' : 'Continuer'}
          </Button>
        </form>
      ) : (
        // Étape 2: Profil complet
        <form onSubmit={handleStep2Submit} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Complétez votre profil</h2>
            <p className="text-gray-600 text-sm mt-1">Ces informations nous aideront à personnaliser votre expérience</p>
          </div>

          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Informations personnelles</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Prénom *"
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
                  placeholder="Nom *"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="Numéro de téléphone *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  placeholder="Date de naissance *"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sexe *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Masculin' | 'Féminin' | 'Autre')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Localisation</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pays *</label>
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:border-transparent"
                  required
                  disabled={loading}
                >
                  {countries.map((c) => (
                    <option key={c.name} value={c.name}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Ville *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Quartier (optionnel)"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Retour
            </Button>
            <Button
              type="submit"
              disabled={loading || !firstName || !lastName || !phone || !birthDate || !city}
              className="flex-1 bg-[#f01919] hover:bg-[#d01515] text-white disabled:opacity-50"
            >
              {loading ? 'Finalisation...' : 'Créer mon profil'}
            </Button>
          </div>
        </form>
      )}

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