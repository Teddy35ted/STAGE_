'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { FiUser, FiPhone, FiMapPin, FiCalendar, FiSave } from 'react-icons/fi';

export default function CompleteProfilePage() {
  const { user } = useAuth();
  const { apiFetch } = useApi();
  const router = useRouter();

  // Données du profil
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Masculin' | 'Féminin' | 'Autre'>('Masculin');
  const [country, setCountry] = useState('Togo');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [countryCode, setCountryCode] = useState('+228');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const validateForm = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📝 Finalisation du profil utilisateur...');
      
      const profileData = {
        nom: lastName,
        prenom: firstName,
        email: user?.email || '',
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

      console.log('✅ Profil complété:', result);
      console.log('🚀 Redirection vers le dashboard...');
      
      // Redirection vers le dashboard
      router.replace('/dashboard');
      
    } catch (error: any) {
      console.error('❌ Erreur finalisation profil:', error);
      setError(error.message || 'Erreur lors de la finalisation du profil');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <Button onClick={() => router.push('/auth')} className="bg-[#f01919] hover:bg-[#d01515]">
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complétez votre profil</h1>
          <p className="text-gray-600 mt-2">
            Quelques informations supplémentaires pour finaliser votre inscription
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              onClick={() => router.push('/dashboard')}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Ignorer pour l'instant
            </Button>
            <Button
              type="submit"
              disabled={loading || !firstName || !lastName || !phone || !birthDate || !city}
              className="flex-1 bg-[#f01919] hover:bg-[#d01515] text-white disabled:opacity-50"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {loading ? 'Sauvegarde...' : 'Finaliser mon profil'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous pourrez modifier ces informations plus tard dans votre profil
          </p>
        </div>
      </div>
    </div>
  );
}