'use client';

import React, { useState } from 'react';
import { CoGestionnaire } from '../../app/models/co_gestionnaire';
import { useApi } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiShield } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface CoGestionnaireFormProps {
  coGestionnaire?: CoGestionnaire;
  onSuccess: () => void;
}

export function CoGestionnaireForm({ coGestionnaire, onSuccess }: CoGestionnaireFormProps) {
  const [formData, setFormData] = useState({
    nom: coGestionnaire?.nom || '',
    email: coGestionnaire?.email || '',
    tel: coGestionnaire?.tel || '',
    pays: coGestionnaire?.pays || '',
    ville: coGestionnaire?.ville || '',
    ACCES: coGestionnaire?.ACCES || 'consulter'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { apiFetch } = useApi();

  const accessLevels = [
    { value: 'consulter', label: 'Consulter', description: 'Peut uniquement consulter les données' },
    { value: 'gerer', label: 'Gérer', description: 'Peut modifier et gérer le contenu' },
    { value: 'Ajouter', label: 'Ajouter', description: 'Peut ajouter de nouveaux éléments' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.tel.trim()) {
      newErrors.tel = 'Le téléphone est requis';
    } else if (!/^[\d\s\-\+\(\)]{8,}$/.test(formData.tel)) {
      newErrors.tel = 'Format de téléphone invalide';
    }

    if (!formData.pays.trim()) {
      newErrors.pays = 'Le pays est requis';
    }

    if (!formData.ville.trim()) {
      newErrors.ville = 'La ville est requise';
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
      const method = coGestionnaire ? 'PUT' : 'POST';
      const url = coGestionnaire ? `/api/co-gestionnaires/${coGestionnaire.id}` : '/api/co-gestionnaires';
      await apiFetch(url, {
        method,
        body: JSON.stringify(formData),
      });
      
      onSuccess();
      setIsOpen(false);
      
      // Reset form if creating new
      if (!coGestionnaire) {
        setFormData({
          nom: '',
          email: '',
          tel: '',
          pays: '',
          ville: '',
          ACCES: 'consulter'
        });
      }
      setErrors({});
    } catch (err) {
      setErrors({ submit: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#f01919] hover:bg-[#d01515] text-white">
          {coGestionnaire ? 'Modifier' : 'Ajouter un co-gestionnaire'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {coGestionnaire ? 'Modifier le co-gestionnaire' : 'Ajouter un co-gestionnaire'}
            </DialogTitle>
          </DialogHeader>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Error message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Ex: Jean Dupont"
                    className={`pl-10 ${errors.nom ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.nom && (
                  <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Ex: jean.dupont@email.com"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={formData.tel}
                  onChange={(e) => handleInputChange('tel', e.target.value)}
                  placeholder="Ex: +33 1 23 45 67 89"
                  className={`pl-10 ${errors.tel ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.tel && (
                <p className="text-red-500 text-sm mt-1">{errors.tel}</p>
              )}
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Localisation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays *
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={formData.pays}
                    onChange={(e) => handleInputChange('pays', e.target.value)}
                    placeholder="Ex: France"
                    className={`pl-10 ${errors.pays ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.pays && (
                  <p className="text-red-500 text-sm mt-1">{errors.pays}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={formData.ville}
                    onChange={(e) => handleInputChange('ville', e.target.value)}
                    placeholder="Ex: Paris"
                    className={`pl-10 ${errors.ville ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.ville && (
                  <p className="text-red-500 text-sm mt-1">{errors.ville}</p>
                )}
              </div>
            </div>
          </div>

          {/* Niveau d'accès */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'accès *
              </label>
              <div className="relative">
                <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={formData.ACCES}
                  onChange={(e) => handleInputChange('ACCES', e.target.value)}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] appearance-none bg-white"
                >
                  {accessLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Description du niveau d'accès */}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {accessLevels.find(level => level.value === formData.ACCES)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Informations importantes</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Le co-gestionnaire recevra un email de notification</p>
              <p>• Les permissions peuvent être modifiées à tout moment</p>
              <p>• L'accès peut être révoqué depuis le tableau de bord</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              {loading ? 'Sauvegarde...' : (coGestionnaire ? 'Modifier' : 'Ajouter')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
