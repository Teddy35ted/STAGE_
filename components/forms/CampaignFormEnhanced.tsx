'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { CampaignCore } from '../../app/models/campaign';
import { 
  FiX, 
  FiPlus,
  FiCalendar,
  FiMessageCircle,
  FiUsers,
  FiSave,
  FiEdit3,
  FiTrash2,
  FiClock,
  FiType,
  FiFlag
} from 'react-icons/fi';

interface CampaignFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CampaignCore>) => void;
  loading?: boolean;
}

interface NewCommunication {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'update' | 'promotion' | 'event' | 'newsletter';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate?: string;
  scheduledTime?: string;
}

export const CampaignFormEnhanced: React.FC<CampaignFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'draft' as const,
    priority: 'medium' as const
  });

  const [communications, setCommunications] = useState<NewCommunication[]>([
    {
      id: '1',
      title: '',
      content: '',
      type: 'announcement',
      priority: 'medium',
      scheduledDate: '',
      scheduledTime: '10:00'
    }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation de l'étape 1
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le nom de la campagne est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La date de fin est requise';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation de l'étape 2
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    // Vérifier que chaque communication a un titre et du contenu
    const invalidComms = communications.filter(comm => 
      !comm.title.trim() || !comm.content.trim()
    );
    
    if (invalidComms.length > 0) {
      newErrors.communications = 'Toutes les communications doivent avoir un titre et du contenu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ajouter une nouvelle communication
  const addCommunication = () => {
    const newId = (communications.length + 1).toString();
    setCommunications(prev => [...prev, {
      id: newId,
      title: '',
      content: '',
      type: 'announcement',
      priority: 'medium',
      scheduledDate: '',
      scheduledTime: '10:00'
    }]);
  };

  // Supprimer une communication
  const removeCommunication = (id: string) => {
    if (communications.length > 1) {
      setCommunications(prev => prev.filter(comm => comm.id !== id));
    }
  };

  // Mettre à jour une communication
  const updateCommunication = (id: string, field: keyof NewCommunication, value: string) => {
    setCommunications(prev => 
      prev.map(comm => 
        comm.id === id 
          ? { ...comm, [field]: value }
          : comm
      )
    );
  };

  // Programmation automatique des communications
  const autoScheduleCommunications = () => {
    if (!formData.startDate || !formData.endDate || communications.length === 0) return;

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const daysBetween = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const interval = Math.max(1, Math.floor(daysBetween / communications.length));

    setCommunications(prev => 
      prev.map((comm, index) => {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(startDate.getDate() + (index * interval));
        
        return {
          ...comm,
          scheduledDate: scheduledDate.toISOString().split('T')[0],
          scheduledTime: comm.scheduledTime || '10:00'
        };
      })
    );
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (activeStep === 1) {
      if (validateStep1()) {
        setActiveStep(2);
      }
    }
  };

  const prevStep = () => {
    if (activeStep === 2) {
      setActiveStep(1);
    }
  };

  // Soumission finale
  const handleSubmit = () => {
    if (!validateStep2()) return;

    const campaignData: Partial<CampaignCore> = {
      name: formData.title.trim(),
      description: formData.description.trim(),
      status: 'draft',
      startDate: formData.startDate,
      endDate: formData.endDate,
      communications: communications.map(comm => ({
        messageId: `msg_${comm.id}`,
        title: comm.title,
        content: comm.content,
        type: 'text' as const,
        scheduledDate: comm.scheduledDate,
        status: 'pending' as const,
        recipients: [], // Sera rempli lors de l'envoi
        metadata: {
          priority: comm.priority === 'urgent' ? 'high' : comm.priority as 'low' | 'medium' | 'high',
          tags: [comm.type],
          subject: comm.title
        }
      })),
      stats: {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0
      }
    };

    onSubmit(campaignData);
    
    // Reset du formulaire
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'draft',
      priority: 'medium'
    });
    setCommunications([{
      id: '1',
      title: '',
      content: '',
      type: 'announcement',
      priority: 'medium',
      scheduledDate: '',
      scheduledTime: '10:00'
    }]);
    setActiveStep(1);
    setErrors({});
  };

  if (!isOpen) return null;

  const communicationTypes = [
    { value: 'announcement', label: 'Annonce' },
    { value: 'update', label: 'Mise à jour' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'event', label: 'Événement' },
    { value: 'newsletter', label: 'Newsletter' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Faible', color: 'text-green-600' },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-600' },
    { value: 'high', label: 'Élevée', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50/90 via-indigo-50/90 to-blue-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-purple-500/20 rounded-2xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiMessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Campagne</h2>
              <p className="text-sm text-gray-500">
                Étape {activeStep} sur 2 - {activeStep === 1 ? 'Informations générales' : 'Créer les communications'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-2">
          <div className="flex items-center">
            <div className={`flex-1 h-2 rounded-full ${activeStep >= 1 ? 'bg-purple-500' : 'bg-gray-200'}`} />
            <div className="mx-2 text-xs text-gray-500">•</div>
            <div className={`flex-1 h-2 rounded-full ${activeStep >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeStep === 1 ? (
            // Étape 1: Informations de base
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la campagne *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Campagne promotion été 2024"
                  className={`w-full ${errors.title ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez l'objectif et le contenu de votre campagne..."
                  rows={4}
                  className={`w-full ${errors.description ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline w-4 h-4 mr-1" />
                    Date de début *
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`w-full ${errors.startDate ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline w-4 h-4 mr-1" />
                    Date de fin *
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className={`w-full ${errors.endDate ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiFlag className="inline w-4 h-4 mr-1" />
                  Priorité de la campagne
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                >
                  {priorityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">
                  <FiUsers className="inline w-4 h-4 mr-1" />
                  Prochaine étape
                </h4>
                <p className="text-purple-700 text-sm">
                  Vous pourrez créer les communications de votre campagne à l'étape suivante. 
                  Chaque communication peut avoir son propre contenu, type et programmation.
                </p>
              </div>
            </div>
          ) : (
            // Étape 2: Création des communications
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Créer les communications
                </h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {communications.length} communication{communications.length > 1 ? 's' : ''}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={autoScheduleCommunications}
                    disabled={loading || !formData.startDate || !formData.endDate}
                  >
                    <FiClock className="w-4 h-4 mr-2" />
                    Programmer auto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCommunication}
                    disabled={loading}
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>

              {errors.communications && (
                <p className="text-red-500 text-sm">{errors.communications}</p>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {communications.map((comm, index) => (
                  <div
                    key={comm.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Communication #{index + 1}
                      </h4>
                      {communications.length > 1 && (
                        <button
                          onClick={() => removeCommunication(comm.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          disabled={loading}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre *
                        </label>
                        <Input
                          value={comm.title}
                          onChange={(e) => updateCommunication(comm.id, 'title', e.target.value)}
                          placeholder="Titre de la communication"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FiType className="inline w-4 h-4 mr-1" />
                          Type
                        </label>
                        <select
                          value={comm.type}
                          onChange={(e) => updateCommunication(comm.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={loading}
                        >
                          {communicationTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contenu *
                      </label>
                      <Textarea
                        value={comm.content}
                        onChange={(e) => updateCommunication(comm.id, 'content', e.target.value)}
                        placeholder="Rédigez le contenu de votre communication..."
                        rows={3}
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FiFlag className="inline w-4 h-4 mr-1" />
                          Priorité
                        </label>
                        <select
                          value={comm.priority}
                          onChange={(e) => updateCommunication(comm.id, 'priority', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={loading}
                        >
                          {priorityLevels.map(level => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de diffusion
                        </label>
                        <Input
                          type="date"
                          value={comm.scheduledDate || ''}
                          onChange={(e) => updateCommunication(comm.id, 'scheduledDate', e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Heure
                        </label>
                        <Input
                          type="time"
                          value={comm.scheduledTime || '10:00'}
                          onChange={(e) => updateCommunication(comm.id, 'scheduledTime', e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  <FiMessageCircle className="inline w-4 h-4 mr-1" />
                  Diffusion automatique
                </h4>
                <p className="text-blue-700 text-sm">
                  Toutes les communications seront diffusées automatiquement à tous les fans selon la programmation définie.
                  Utilisez le bouton "Programmer auto" pour répartir automatiquement les communications sur la période de la campagne.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
            {activeStep === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={loading}
              >
                Retour
              </Button>
            )}
            
            <div className="flex space-x-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </Button>
              
              <Button
                type="button"
                onClick={activeStep === 1 ? nextStep : handleSubmit}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {activeStep === 1 ? (
                  <>
                    Suivant
                    <FiEdit3 className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 mr-2" />
                    Créer la campagne
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};