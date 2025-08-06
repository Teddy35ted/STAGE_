'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MediaUpload } from '../ui/media-upload';
import { FiX, FiUpload, FiCalendar, FiImage, FiVideo } from 'react-icons/fi';
import { LaalaCore } from '../../app/models/laala';
import { MediaUploadResult } from '../../lib/appwrite/media-service';
import { useCRUDNotifications } from '../../contexts/NotificationContext';

interface LaalaCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (laalaData: LaalaCore & { coverUrl?: string; coverType?: 'image' | 'video' }) => void;
  creatorId: string;
}

export default function LaalaCreateForm({ isOpen, onClose, onSubmit, creatorId }: LaalaCreateFormProps) {
  const { notifyCreate } = useCRUDNotifications();
  const [formData, setFormData] = useState<LaalaCore>({
    nom: '',
    description: '',
    type: 'Laala freestyle',
    categorie: '',
    idCreateur: creatorId,
    isLaalaPublic: true,
    ismonetise: false,
    choosetext: true,
    chooseimg: true,
    choosevideo: false,
    chooselive: false,
    date_fin: '',
    jour_fin: 0,
    mois_fin: 0,
    annee_fin: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverMediaType, setCoverMediaType] = useState<'image' | 'video'>('image');
  const [coverUrl, setCoverUrl] = useState<string>('');

  const laalaTypes = [
    'Laala freestyle',
    'Laala planifié',
    'Laala groupe',
    'Laala personnel'
  ];

  const categories = [
    'Lifestyle',
    'Technologie',
    'Cuisine',
    'Sport',
    'Éducation',
    'Divertissement',
    'Art & Culture',
    'Business',
    'Santé & Bien-être',
    'Voyage',
    'Mode & Beauté',
    'Musique',
    'Gaming',
    'Science',
    'Autre'
  ];

  const handleInputChange = (field: keyof LaalaCore, value: any) => {
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

  const handleDateChange = (dateString: string) => {
    if (dateString) {
      const date = new Date(dateString);
      setFormData(prev => ({
        ...prev,
        date_fin: dateString,
        jour_fin: date.getDate(),
        mois_fin: date.getMonth() + 1,
        annee_fin: date.getFullYear()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        date_fin: '',
        jour_fin: 0,
        mois_fin: 0,
        annee_fin: 0
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du Laala est requis';
    } else if (formData.nom.length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }

    if (!formData.categorie) {
      newErrors.categorie = 'Veuillez sélectionner une catégorie';
    }

    // Validation pour Laala planifié
    if (formData.type === 'Laala planifié' && !formData.date_fin) {
      newErrors.date_fin = 'Une date de fin est requise pour un Laala planifié';
    }

    // Au moins un type de contenu doit être sélectionné
    if (!formData.choosetext && !formData.chooseimg && !formData.choosevideo && !formData.chooselive) {
      newErrors.content = 'Veuillez sélectionner au moins un type de contenu autorisé';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Inclure les données de couverture dans la soumission
      onSubmit({
        ...formData,
        coverUrl,
        coverType: coverMediaType
      });
      
      // Reset form
      setFormData({
        nom: '',
        description: '',
        type: 'Laala freestyle',
        categorie: '',
        idCreateur: creatorId,
        isLaalaPublic: true,
        ismonetise: false,
        choosetext: true,
        chooseimg: true,
        choosevideo: false,
        chooselive: false,
        date_fin: '',
        jour_fin: 0,
        mois_fin: 0,
        annee_fin: 0
      });
      setCoverUrl('');
      setCoverMediaType('image');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-indigo-500/20 rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Créer un nouveau Laala</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom du Laala */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du Laala *
            </label>
            <Input
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              placeholder="Ex: Mon Laala Lifestyle"
              className={errors.nom ? 'border-red-500' : ''}
            />
            {errors.nom && (
              <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Décrivez votre Laala et son contenu..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Type et Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de Laala *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as LaalaCore['type'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
              >
                {laalaTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                value={formData.categorie}
                onChange={(e) => handleInputChange('categorie', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] ${
                  errors.categorie ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.categorie && (
                <p className="text-red-500 text-sm mt-1">{errors.categorie}</p>
              )}
            </div>
          </div>

          {/* Date de fin (pour Laala planifié) */}
          {formData.type === 'Laala planifié' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.date_fin ? 'border-red-500' : ''}
                />
                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.date_fin && (
                <p className="text-red-500 text-sm mt-1">{errors.date_fin}</p>
              )}
            </div>
          )}

          {/* Types de contenu autorisés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Types de contenu autorisés *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.choosetext}
                  onChange={(e) => handleInputChange('choosetext', e.target.checked)}
                  className="rounded border-gray-300 text-[#f01919] focus:ring-[#f01919]"
                />
                <span className="text-sm text-gray-700">Texte</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.chooseimg}
                  onChange={(e) => handleInputChange('chooseimg', e.target.checked)}
                  className="rounded border-gray-300 text-[#f01919] focus:ring-[#f01919]"
                />
                <span className="text-sm text-gray-700">Images</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.choosevideo}
                  onChange={(e) => handleInputChange('choosevideo', e.target.checked)}
                  className="rounded border-gray-300 text-[#f01919] focus:ring-[#f01919]"
                />
                <span className="text-sm text-gray-700">Vidéos</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.chooselive}
                  onChange={(e) => handleInputChange('chooselive', e.target.checked)}
                  className="rounded border-gray-300 text-[#f01919] focus:ring-[#f01919]"
                />
                <span className="text-sm text-gray-700">Live</span>
              </label>
            </div>
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Couverture du Laala */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Couverture du Laala</h3>
            
            {/* Choix du type de couverture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de couverture
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="coverType"
                    value="image"
                    checked={coverMediaType === 'image'}
                    onChange={(e) => setCoverMediaType('image')}
                    className="text-[#f01919] focus:ring-[#f01919]"
                  />
                  <FiImage className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Image</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="coverType"
                    value="video"
                    checked={coverMediaType === 'video'}
                    onChange={(e) => setCoverMediaType('video')}
                    className="text-[#f01919] focus:ring-[#f01919]"
                  />
                  <FiVideo className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Vidéo</span>
                </label>
              </div>
            </div>

            {/* Upload de la couverture */}
            <div>
              <MediaUpload
                category="laala-cover"
                userId={creatorId}
                acceptedTypes={coverMediaType === 'image' ? 'image/*' : 'video/*'}
                maxSize={coverMediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024}
                label={`Sélectionner une ${coverMediaType === 'image' ? 'image' : 'vidéo'} de couverture`}
                description={`${coverMediaType === 'image' ? 'Image' : 'Vidéo'} qui représentera votre Laala (optionnel)`}
                onUploadSuccess={(result: MediaUploadResult) => {
                  setCoverUrl(result.url);
                  console.log('Couverture uploadée:', result);
                }}
                onUploadError={(error: string) => {
                  console.error('Erreur upload couverture:', error);
                  setErrors(prev => ({ ...prev, cover: error }));
                }}
                preview={true}
              />
              {errors.cover && (
                <p className="text-red-500 text-sm mt-1">{errors.cover}</p>
              )}
            </div>
          </div>

          {/* Paramètres de visibilité */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Paramètres de visibilité</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isLaalaPublic}
                  onChange={(e) => handleInputChange('isLaalaPublic', e.target.checked)}
                  className="rounded border-gray-300 text-[#f01919] focus:ring-[#f01919]"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Laala public</span>
                  <p className="text-xs text-gray-500">Visible par tous les utilisateurs</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ismonetise}
                  onChange={(e) => handleInputChange('ismonetise', e.target.checked)}
                  className="rounded border-gray-300 text-[#f01919] focus:ring-[#f01919]"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Monétisation activée</span>
                  <p className="text-xs text-gray-500">Permet de générer des revenus</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              Créer le Laala
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}