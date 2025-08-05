'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MediaUpload } from '../ui/media-upload';
import { FiX, FiUpload, FiImage, FiVideo, FiFileText, FiHash, FiUser } from 'react-icons/fi';
import { ContenuCore } from '../../app/models/contenu';
import { MediaUploadResult } from '../../lib/appwrite/media-service';

interface ContenuCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contenuData: ContenuCore & { mediaUrl?: string }) => void;
  creatorId: string;
  availableLaalas: { id: string; name: string }[];
}

export default function ContenuCreateForm({
  isOpen,
  onClose,
  onSubmit,
  creatorId,
  availableLaalas
}: ContenuCreateFormProps) {
  const [formData, setFormData] = useState<ContenuCore>({
    nom: '',
    idCreateur: creatorId,
    idLaala: '',
    type: 'image',
    src: '',
    cover: '',
    allowComment: true,
    htags: [],
    personnes: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [hashtagInput, setHashtagInput] = useState<string>('');

  const contentTypes = [
    { value: 'image', label: 'Image', icon: FiImage },
    { value: 'video', label: 'Vidéo', icon: FiVideo },
    { value: 'texte', label: 'Texte', icon: FiFileText },
    { value: 'album', label: 'Album', icon: FiImage }
  ];

  const handleInputChange = (field: keyof ContenuCore, value: any) => {
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

  const handleHashtagChange = (value: string) => {
    setHashtagInput(value);
    // Convertir la chaîne en tableau de hashtags
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('htags', tags);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le titre du contenu est requis';
    } else if (formData.nom.length < 3) {
      newErrors.nom = 'Le titre doit contenir au moins 3 caractères';
    }

    if (!formData.idLaala) {
      newErrors.idLaala = 'Veuillez sélectionner un Laala';
    }

    // Validation selon le type de contenu
    if (formData.type !== 'texte' && !formData.src && !mediaUrl) {
      newErrors.src = 'Un fichier est requis pour ce type de contenu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Inclure l'URL du média uploadé
      const finalData = {
        ...formData,
        src: mediaUrl || formData.src,
        cover: coverUrl || formData.cover,
        mediaUrl
      };
      
      onSubmit(finalData);
      
      // Reset form
      setFormData({
        nom: '',
        idCreateur: creatorId,
        idLaala: '',
        type: 'image',
        src: '',
        cover: '',
        allowComment: true,
        htags: [],
        personnes: []
      });
      setMediaUrl('');
      setCoverUrl('');
      setHashtagInput('');
      setErrors({});
      onClose();
    }
  };

  const renderMediaUpload = () => {
    if (formData.type === 'texte') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenu texte *
          </label>
          <textarea
            value={formData.src}
            onChange={(e) => handleInputChange('src', e.target.value)}
            placeholder="Écrivez votre contenu ici..."
            rows={6}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] ${
              errors.src ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.src && (
            <p className="text-red-500 text-sm mt-1">{errors.src}</p>
          )}
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {formData.type === 'image' ? 'Image' : formData.type === 'video' ? 'Vidéo' : 'Fichiers'} *
        </label>
        <MediaUpload
          category="contenu-media"
          userId={creatorId}
          entityId={formData.idLaala}
          acceptedTypes={formData.type === 'image' ? 'image/*' : formData.type === 'video' ? 'video/*' : 'image/*,video/*'}
          maxSize={formData.type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024}
          label={`Sélectionner ${formData.type === 'image' ? 'une image' : formData.type === 'video' ? 'une vidéo' : 'des fichiers'}`}
          description={`Fichier ${formData.type} pour votre contenu`}
          onUploadSuccess={(result: MediaUploadResult) => {
            setMediaUrl(result.url);
            handleInputChange('src', result.url);
            console.log('Média uploadé:', result);
          }}
          onUploadError={(error: string) => {
            console.error('Erreur upload média:', error);
            setErrors(prev => ({ ...prev, src: error }));
          }}
          preview={true}
        />
        {errors.src && (
          <p className="text-red-500 text-sm mt-1">{errors.src}</p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50/90 via-teal-50/90 to-cyan-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-emerald-500/20 rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Créer un nouveau contenu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre du contenu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du contenu *
            </label>
            <Input
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              placeholder="Ex: Ma nouvelle création"
              className={errors.nom ? 'border-red-500' : ''}
            />
            {errors.nom && (
              <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
            )}
          </div>

          {/* Laala et Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Laala de destination *
              </label>
              <select
                value={formData.idLaala}
                onChange={(e) => handleInputChange('idLaala', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] ${
                  errors.idLaala ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un Laala</option>
                {availableLaalas.map(laala => (
                  <option key={laala.id} value={laala.id}>{laala.name}</option>
                ))}
              </select>
              {errors.idLaala && (
                <p className="text-red-500 text-sm mt-1">{errors.idLaala}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de contenu *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as ContenuCore['type'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload de média ou saisie de texte */}
          {renderMediaUpload()}

          {/* Couverture pour vidéos */}
          {formData.type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de couverture (optionnel)
              </label>
              <MediaUpload
                category="contenu-media"
                userId={creatorId}
                entityId={formData.idLaala}
                acceptedTypes="image/*"
                maxSize={5 * 1024 * 1024}
                label="Sélectionner une image de couverture"
                description="Image qui s'affichera avant la lecture de la vidéo"
                onUploadSuccess={(result: MediaUploadResult) => {
                  setCoverUrl(result.url);
                  handleInputChange('cover', result.url);
                  console.log('Couverture uploadée:', result);
                }}
                onUploadError={(error: string) => {
                  console.error('Erreur upload couverture:', error);
                }}
                preview={true}
              />
            </div>
          )}

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtags
            </label>
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={hashtagInput}
                onChange={(e) => handleHashtagChange(e.target.value)}
                placeholder="#exemple, #contenu, #laala"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Séparez les hashtags par des virgules
            </p>
          </div>

          {/* Paramètres */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Paramètres</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowComment}
                  onChange={(e) => handleInputChange('allowComment', e.target.checked)}
                  className="rounded border-gray-300 text-[#f01919] focus:ring-[#f01919]"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Autoriser les commentaires</span>
                  <p className="text-xs text-gray-500">Les utilisateurs pourront commenter ce contenu</p>
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
              disabled={isUploading}
            >
              {isUploading ? 'Upload en cours...' : 'Créer le contenu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}