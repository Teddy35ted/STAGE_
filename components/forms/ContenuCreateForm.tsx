'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FiX, FiUpload, FiImage, FiVideo, FiFileText, FiHash, FiUser } from 'react-icons/fi';
import { ContenuCore } from '../../app/models/contenu';

interface ContenuCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contenuData: ContenuCore) => void;
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
  const [hashtagInput, setHashtagInput] = useState('');
  const [personneInput, setPersonneInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulation d'upload - remplacer par votre logique d'upload réelle
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulation de progression
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Ici vous feriez l'upload réel vers votre service (Firebase, AWS S3, etc.)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setUploadProgress(100);
      
      // URL simulée - remplacer par l'URL réelle retournée par votre service
      const uploadedUrl = `https://example.com/uploads/${file.name}`;
      
      setFormData(prev => ({
        ...prev,
        src: uploadedUrl
      }));

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setErrors(prev => ({
        ...prev,
        src: 'Erreur lors de l\'upload du fichier'
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation du type de fichier
      const allowedTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        video: ['video/mp4', 'video/avi', 'video/mov', 'video/webm'],
        album: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      };

      const currentAllowedTypes = allowedTypes[formData.type as keyof typeof allowedTypes] || [];
      
      if (formData.type !== 'texte' && !currentAllowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          src: `Type de fichier non supporté pour ${formData.type}`
        }));
        return;
      }

      // Validation de la taille (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          src: 'Le fichier ne doit pas dépasser 50MB'
        }));
        return;
      }

      handleFileUpload(file);
    }
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !formData.htags.includes(hashtagInput.trim())) {
      const newTag = hashtagInput.trim().startsWith('#') 
        ? hashtagInput.trim() 
        : `#${hashtagInput.trim()}`;
      
      setFormData(prev => ({
        ...prev,
        htags: [...prev.htags, newTag]
      }));
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      htags: prev.htags.filter(t => t !== tag)
    }));
  };

  const addPersonne = () => {
    if (personneInput.trim() && !formData.personnes.includes(personneInput.trim())) {
      setFormData(prev => ({
        ...prev,
        personnes: [...prev.personnes, personneInput.trim()]
      }));
      setPersonneInput('');
    }
  };

  const removePersonne = (personne: string) => {
    setFormData(prev => ({
      ...prev,
      personnes: prev.personnes.filter(p => p !== personne)
    }));
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
    if (formData.type !== 'texte' && !formData.src) {
      newErrors.src = 'Un fichier est requis pour ce type de contenu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
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
      setErrors({});
      setHashtagInput('');
      setPersonneInput('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
              placeholder="Ex: Les 5 habitudes matinales qui changent la vie"
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

          {/* Upload de fichier */}
          {formData.type !== 'texte' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier {formData.type === 'album' ? '(images)' : `(${formData.type})`} *
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#f01919] transition-colors">
                {isUploading ? (
                  <div className="space-y-2">
                    <FiUpload className="w-8 h-8 text-[#f01919] mx-auto animate-pulse" />
                    <p className="text-sm text-gray-600">Upload en cours...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#f01919] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">{uploadProgress}%</p>
                  </div>
                ) : formData.src ? (
                  <div className="space-y-2">
                    <div className="text-green-600">
                      <FiUpload className="w-8 h-8 mx-auto" />
                    </div>
                    <p className="text-sm text-green-600">Fichier uploadé avec succès</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Changer le fichier
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FiUpload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Cliquez pour sélectionner ou glissez votre fichier ici
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.type === 'image' && 'JPG, PNG, GIF, WebP - Max 50MB'}
                      {formData.type === 'video' && 'MP4, AVI, MOV, WebM - Max 50MB'}
                      {formData.type === 'album' && 'Images JPG, PNG, GIF, WebP - Max 50MB par image'}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Sélectionner un fichier
                    </Button>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept={
                  formData.type === 'image' ? 'image/*' :
                  formData.type === 'video' ? 'video/*' :
                  formData.type === 'album' ? 'image/*' : '*/*'
                }
                multiple={formData.type === 'album'}
                className="hidden"
              />

              {errors.src && (
                <p className="text-red-500 text-sm mt-1">{errors.src}</p>
              )}
            </div>
          )}

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtags
            </label>
            <div className="flex space-x-2 mb-2">
              <div className="flex-1 relative">
                <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  placeholder="Ajouter un hashtag"
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                onClick={addHashtag}
                variant="outline"
                size="sm"
              >
                Ajouter
              </Button>
            </div>
            
            {formData.htags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.htags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#f01919] text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="ml-1 hover:text-gray-200"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Personnes taguées */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personnes taguées
            </label>
            <div className="flex space-x-2 mb-2">
              <div className="flex-1 relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={personneInput}
                  onChange={(e) => setPersonneInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPersonne())}
                  placeholder="ID ou nom d'utilisateur"
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                onClick={addPersonne}
                variant="outline"
                size="sm"
              >
                Taguer
              </Button>
            </div>
            
            {formData.personnes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.personnes.map((personne, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    @{personne}
                    <button
                      type="button"
                      onClick={() => removePersonne(personne)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Paramètres */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Paramètres</h3>
            
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