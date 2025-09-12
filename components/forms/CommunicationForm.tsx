'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  PublicCommunication, 
  AUDIENCE_TYPES, 
  COMMUNICATION_TYPES, 
  PRIORITY_LEVELS 
} from '../../app/models/communication';
import { 
  FiX, 
  FiSend, 
  FiSave, 
  FiUsers, 
  FiMessageSquare, 
  FiTrendingUp,
  FiCalendar,
  FiTag
} from 'react-icons/fi';

interface CommunicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<PublicCommunication>, publishNow: boolean) => void;
  loading?: boolean;
}

export const CommunicationForm: React.FC<CommunicationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as keyof typeof COMMUNICATION_TYPES,
    audienceType: 'followers' as keyof typeof AUDIENCE_TYPES,
    priority: 'medium' as keyof typeof PRIORITY_LEVELS,
    category: '',
    tags: '' // String qui sera convertie en array
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est requis';
    }

    if (formData.content.length > 2000) {
      newErrors.content = 'Le contenu ne peut dépasser 2000 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (publishNow: boolean) => {
    if (!validateForm()) return;

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const communicationData: Partial<PublicCommunication> = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      type: formData.type,
      format: 'text',
      targetAudience: {
        type: formData.audienceType,
        description: AUDIENCE_TYPES[formData.audienceType].description
      },
      priority: formData.priority,
      category: formData.category.trim() || COMMUNICATION_TYPES[formData.type].label,
      tags: tagsArray,
      status: publishNow ? 'published' : 'draft'
    };

    onSubmit(communicationData, publishNow);
    
    // Reset form
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      audienceType: 'followers',
      priority: 'medium',
      category: '',
      tags: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-blue-500/20 rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiMessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Nouvelle Communication</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la communication *
            </label>
            <Input
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Nouvelle fonctionnalité disponible !"
              className={`w-full ${errors.title ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Type et Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de communication
              </label>
              <select
                value={formData.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as keyof typeof COMMUNICATION_TYPES 
                }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={loading}
              >
                {Object.entries(COMMUNICATION_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>
                    {(type as any).label} - {(type as any).description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ 
                  ...prev, 
                  priority: e.target.value as keyof typeof PRIORITY_LEVELS 
                }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={loading}
              >
                {Object.entries(PRIORITY_LEVELS).map(([key, priority]) => (
                  <option key={key} value={key}>
                    {(priority as any).label} - {(priority as any).description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audience cible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiUsers className="inline w-4 h-4 mr-1" />
              Audience cible
            </label>
            <select
              value={formData.audienceType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ 
                ...prev, 
                audienceType: e.target.value as keyof typeof AUDIENCE_TYPES 
              }))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={loading}
            >
              {Object.entries(AUDIENCE_TYPES).map(([key, audience]) => (
                <option key={key} value={key}>
                  {(audience as any).label} - {(audience as any).description}
                </option>
              ))}
            </select>
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu de la communication *
            </label>
            <Textarea
              value={formData.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Rédigez votre message ici..."
              rows={6}
              className={`w-full resize-none ${errors.content ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
              <p className="text-gray-400 text-sm ml-auto">
                {formData.content.length}/2000 caractères
              </p>
            </div>
          </div>

          {/* Catégorie et Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie (optionnel)
              </label>
              <Input
                value={formData.category}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ex: Annonces produit"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiTag className="inline w-4 h-4 mr-1" />
                Tags (séparés par des virgules)
              </label>
              <Input
                value={formData.tags}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Ex: nouveau, important, mise-à-jour"
                disabled={loading}
              />
            </div>
          </div>

          {/* Aperçu de l'audience */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Aperçu de la diffusion</h4>
            <p className="text-blue-700 text-sm">
              <strong>Audience :</strong> {AUDIENCE_TYPES[formData.audienceType].label}
            </p>
            <p className="text-blue-700 text-sm">
              <strong>Priorité :</strong> {PRIORITY_LEVELS[formData.priority].label}
            </p>
            <p className="text-blue-700 text-sm">
              <strong>Type :</strong> {COMMUNICATION_TYPES[formData.type].label}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="flex-1"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Sauvegarder en brouillon
            </Button>
            
            <Button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <FiSend className="w-4 h-4 mr-2" />
              Publier maintenant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};