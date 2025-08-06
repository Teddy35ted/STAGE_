'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave } from 'react-icons/fi';

import { useAuth } from '../../../contexts/AuthContext';
import { useCRUDNotifications } from '../../../contexts/NotificationContext';
import { UserDashboard } from '../../models/user';
import { useApi } from '../../../lib/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const { notifyUpdate } = useCRUDNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { apiFetch } = useApi();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          console.log('📖 Récupération profil pour UID:', user.uid);
          const data = await apiFetch(`/api/users/${user.uid}`);
          console.log('✅ Profil récupéré:', data);
          setProfile(data);
        } catch (err) {
          console.error('❌ Erreur récupération profil:', err);
          setError('Impossible de charger le profil');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (profile) {
      try {
        await apiFetch(`/api/users/${profile.id}`, {
          method: 'PUT',
          body: JSON.stringify(profile),
        });
        notifyUpdate('Profil', profile.nom || 'Utilisateur', true);
        setIsEditing(false);
      } catch (err) {
        notifyUpdate('Profil', profile.nom || 'Utilisateur', false);
        setError('Failed to save profile');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gérez vos informations personnelles et préférences
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white w-full sm:w-auto"
        >
          {isEditing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-[#f01919] to-[#d01515] relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        {/* Profile Info */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Avatar */}
          <div className="relative -mt-12 sm:-mt-16 mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FiUser className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 sm:p-2 bg-[#f01919] text-white rounded-full hover:bg-[#d01515] transition-colors">
                <FiCamera className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              {isEditing ? (
                <Input
                  value={profile.prenom}
                  onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                  className="w-full"
                />
              ) : (
                <p className="text-gray-900 py-2">{profile.prenom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              {isEditing ? (
                <Input
                  value={profile.nom}
                  onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                  className="w-full"
                />
              ) : (
                <p className="text-gray-900 py-2">{profile.nom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center space-x-2">
                <FiMail className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="flex-1"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="flex items-center space-x-2">
                <FiPhone className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <Input
                    type="tel"
                    value={profile.tel}
                    onChange={(e) => setProfile({ ...profile, tel: e.target.value })}
                    className="flex-1"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.tel}</p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <div className="flex items-center space-x-2">
                <FiMapPin className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <Input
                    value={`${profile.quartier || ''} ${profile.ville} ${profile.pays}`.trim()}
                    onChange={(e) => {
                      const parts = e.target.value.split(' ');
                      setProfile({ 
                        ...profile, 
                        quartier: parts[0] || '',
                        ville: parts[1] || profile.ville,
                        pays: parts[2] || profile.pays
                      });
                    }}
                    className="flex-1"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{`${profile.quartier || ''} ${profile.ville} ${profile.pays}`.trim()}</p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biographie
              </label>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 py-2">{profile.bio}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                className="bg-[#f01919] hover:bg-[#d01515] text-white"
              >
                <FiSave className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-[#f01919]">12,847</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Fans/Friends</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-[#f01919]">8</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Laalas Actifs</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-[#f01919]">2,450 €</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Revenus ce mois</p>
          </div>
        </div>
      </div>
    </div>
  );
}