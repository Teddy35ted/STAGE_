'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MediaUpload } from '../ui/media-upload';
import { FiX, FiImage, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';
import { Boutique } from '../../app/models/boutiques';
import { MediaUploadResult } from '../../lib/appwrite/media-service';

interface BoutiqueCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (boutiqueData: Partial<Boutique> & { images?: string[] }) => void;
  ownerId: string;
}

export default function BoutiqueCreateForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  ownerId 
}: BoutiqueCreateFormProps) {
  const [formData, setFormData] = useState({
    nom: '',
    desc: '',
    type: 'Boutique',
    adresse: '',
    proprietaire: '',
    idCompte: ownerId
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');

  const boutiqueTypes = [
    'Boutique',
    'Restaurant',
    'Service',
    'Artisanat',
    'Mode & Beauté',
    'Électronique',
    'Alimentation',
    'Santé & Bien-être',
    'Éducation',
    'Autre'
  ];

  const handleInputChange = (field: string, value: any) => {
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
      newErrors.nom = 'Le nom de la boutique est requis';
    } else if (formData.nom.length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.desc.trim()) {
      newErrors.desc = 'La description est requise';
    } else if (formData.desc.length < 10) {
      newErrors.desc = 'La description doit contenir au moins 10 caractères';
    }

    if (!formData.proprietaire.trim()) {
      newErrors.proprietaire = 'Le nom du propriétaire est requis';
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const boutiqueData = {
        ...formData,
        cover: coverImage,
        images: uploadedImages,
        isvideo: false, // Par défaut, les images ne sont pas des vidéos
        isdelete: false,
        isdesactive: false,
        iscert: false,
        isPromoted: false,
        isboosted: false,
        top: false,
        isLoyerPaid: true,
        gererSAV: true,
        balance: 0,
        likes: 0,
        etoile: 0,
        nbrConsultes: 0,
        nbrArticle: 0,
        duree: 30, // 30 jours par défaut
        date: new Date().toLocaleDateString('fr-FR'),
        a_date: new Date().toLocaleDateString('fr-FR'),
        annee: new Date().getFullYear(),
        mois: new Date().getMonth() + 1,
        jour: new Date().getDate(),
        a_annee: new Date().getFullYear(),
        a_mois: new Date().getMonth() + 1,
        a_jour: new Date().getDate(),
        nom_l: formData.nom.toLowerCase(),
        horaires: [
          { jour: "Lundi", start: 8, end: 18 },
          { jour: "Mardi", start: 8, end: 18 },
          { jour: "Mercredi", start: 8, end: 18 },
          { jour: "Jeudi", start: 8, end: 18 },
          { jour: "Vendredi", start: 8, end: 18 },
          { jour: "Samedi", start: 8, end: 16 },
          { jour: "Dimanche", start: 0, end: 0 }
        ],
        lePersonnel: [],
        lesClients: [],
        lesCategories: [],
        alaune: [],
        likees: [],
        lesConsultes: [],
        lesServices: [],
        lesArticles: [],
        lat: 0,
        long: 0,
        idpartner: ""
      };
      
      onSubmit(boutiqueData);
      
      // Reset form
      setFormData({
        nom: '',
        desc: '',
        type: 'Boutique',
        adresse: '',
        proprietaire: '',
        idCompte: ownerId
      });
      setUploadedImages([]);
      setCoverImage('');
      setErrors({});
      onClose();
    }
  };

  const handleImageUpload = (result: MediaUploadResult) => {
    setUploadedImages(prev => [...prev, result.url]);
    console.log('Image ajoutée:', result);
  };

  const handleCoverUpload = (result: MediaUploadResult) => {
    setCoverImage(result.url);
    console.log('Image de couverture définie:', result);
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header rouge avec icône */}
        <div className="bg-[#f01919] text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FiImage className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Nouvelle Boutique</h2>
                <p className="text-red-100 text-sm">Créez votre point de vente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la boutique *
              </label>
              <Input
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                placeholder="Ex: Ma Super Boutique"
                className={errors.nom ? 'border-red-500' : ''}
              />
              {errors.nom && (
                <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de boutique *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
              >
                {boutiqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.desc}
              onChange={(e) => handleInputChange('desc', e.target.value)}
              placeholder="Décrivez votre boutique, vos produits et services..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] ${
                errors.desc ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.desc && (
              <p className="text-red-500 text-sm mt-1">{errors.desc}</p>
            )}
          </div>

          {/* Propriétaire et Adresse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du propriétaire *
              </label>
              <Input
                value={formData.proprietaire}
                onChange={(e) => handleInputChange('proprietaire', e.target.value)}
                placeholder="Nom du propriétaire"
                className={errors.proprietaire ? 'border-red-500' : ''}
              />
              {errors.proprietaire && (
                <p className="text-red-500 text-sm mt-1">{errors.proprietaire}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  placeholder="Adresse complète de la boutique"
                  className={`pl-10 ${errors.adresse ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.adresse && (
                <p className="text-red-500 text-sm mt-1">{errors.adresse}</p>
              )}
            </div>
          </div>

          {/* Image de couverture */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Image de couverture</h3>
            <MediaUpload
              category="boutique-image"
              userId={ownerId}
              acceptedTypes="image/*"
              maxSize={10 * 1024 * 1024}
              label="Sélectionner l'image principale"
              description="Image qui représentera votre boutique (recommandé)"
              onUploadSuccess={handleCoverUpload}
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

          {/* Images de présentation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Images de présentation</h3>
            <p className="text-sm text-gray-600">
              Ajoutez des images pour présenter vos produits, votre espace, votre équipe...
            </p>
            
            <MediaUpload
              category="boutique-image"
              userId={ownerId}
              acceptedTypes="image/*"
              maxSize={10 * 1024 * 1024}
              label="Ajouter une image"
              description="Images JPG, PNG ou GIF de moins de 10MB"
              onUploadSuccess={handleImageUpload}
              onUploadError={(error: string) => {
                console.error('Erreur upload image:', error);
              }}
              preview={false}
            />

            {/* Galerie des images uploadées */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations complémentaires */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Informations complémentaires</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4" />
                <span>Horaires par défaut : Lun-Ven 8h-18h, Sam 8h-16h</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiDollarSign className="w-4 h-4" />
                <span>Abonnement : 30 jours gratuits</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Vous pourrez modifier ces paramètres après la création de votre boutique.
            </p>
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
              Créer la boutique
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}