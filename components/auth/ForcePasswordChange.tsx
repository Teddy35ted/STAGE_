'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { useApi } from '../../lib/api';

interface ForcePasswordChangeProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function ForcePasswordChange({ isOpen, onClose, onSuccess, userId }: ForcePasswordChangeProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { apiFetch } = useApi();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe doit être différent de l\'actuel';
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
      await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });
      
      onSuccess();
      // Ne pas appeler onClose() car le modal doit être fermé seulement après succès complet
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (err: any) {
      setErrors({ submit: err.message || 'Erreur lors du changement de mot de passe' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.stopPropagation()} // Empêche la fermeture par clic
    >
      <div 
        className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture par clic
      >
        {/* Header obligatoire - AUCUN bouton de fermeture */}
        <div className="bg-red-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FiLock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Changement de mot de passe obligatoire
              </h2>
              <p className="text-red-100 text-sm">
                ATTENTION : Vous devez impérativement modifier votre mot de passe pour continuer
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Information importante */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiShield className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 mb-1">
                  Première connexion
                </h4>
                <p className="text-sm text-amber-700">
                  Vous devez changer votre mot de passe temporaire pour continuer à utiliser la plateforme.
                </p>
              </div>
            </div>
          </div>

          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel *
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="Votre mot de passe temporaire"
                className={`pl-10 pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe *
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Votre nouveau mot de passe"
                className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Min. 8 caractères avec majuscule, minuscule et chiffre
            </p>
          </div>

          {/* Confirmer le nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le nouveau mot de passe *
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Exigences de sécurité */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Exigences de sécurité :</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center space-x-2">
                <span className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>•</span>
                <span>Au moins 8 caractères</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>•</span>
                <span>Au moins une lettre minuscule</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>•</span>
                <span>Au moins une lettre majuscule</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={/\d/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>•</span>
                <span>Au moins un chiffre</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={loading}
              className="bg-slate-600 hover:bg-slate-700 text-white w-full"
            >
              {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
