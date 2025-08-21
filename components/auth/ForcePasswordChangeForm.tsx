'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { useNotifications } from '../../contexts/NotificationContext';

interface PasswordChangeFormProps {
  onPasswordChanged: () => void;
  coGestionnaireId: string;
}

export default function ForcePasswordChangeForm({ onPasswordChanged, coGestionnaireId }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { apiFetch } = useApi();
  const { addNotification } = useNotifications();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'La confirmation est requise';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/co-gestionnaires/change-password', {
        method: 'POST',
        body: JSON.stringify({
          coGestionnaireId,
          currentPassword,
          newPassword
        })
      });

      addNotification({
        title: 'Succès',
        message: 'Mot de passe modifié avec succès !',
        type: 'success'
      });
      onPasswordChanged();
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      addNotification({
        title: 'Erreur',
        message: error.message || 'Erreur lors du changement de mot de passe',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Changement de mot de passe requis
        </h2>
        
        <p className="text-gray-600 mb-6 text-center">
          Pour des raisons de sécurité, vous devez changer votre mot de passe lors de votre première connexion.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Entrez votre mot de passe actuel"
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Entrez votre nouveau mot de passe"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirmez votre nouveau mot de passe"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Modification...' : 'Changer le mot de passe'}
          </Button>
        </form>

        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>Conseils pour un mot de passe sécurisé :</p>
          <ul className="text-xs mt-2 space-y-1">
            <li>• Au moins 8 caractères</li>
            <li>• Mélange de lettres, chiffres et symboles</li>
            <li>• Évitez les informations personnelles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
