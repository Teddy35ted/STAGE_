'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter,
  FiEdit3,
  FiTrash2,
  FiPlay,
  FiPause,
  FiClock,
  FiCheck,
  FiMessageCircle,
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiX,
  FiType,
  FiFlag,
  FiEye
} from 'react-icons/fi';
import { CampaignCore, CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS, MAX_COMMUNICATIONS } from '../../../models/campaign';
import { ValidationMessageT } from '../../../models';
import { ContenuDashboard } from '../../../models/contenu';

// Simple Badge component
const Badge: React.FC<{ 
  variant?: 'default' | 'secondary'; 
  children: React.ReactNode;
  className?: string;
}> = ({ variant = 'default', children, className = '' }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClasses = variant === 'default' 
    ? 'bg-blue-100 text-blue-800' 
    : 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

interface CampaignCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaignData: Partial<CampaignCore>) => void;
  availableCommunications: ValidationMessageT[];
}

// Composant formulaire de création de campagne
const CampaignCreateForm: React.FC<CampaignCreateFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableCommunications
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

  interface NewCommunication {
    id: string;
    title: string;
    content: string;
    type: 'announcement' | 'update' | 'promotion' | 'event' | 'newsletter';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduledDate?: string;
    scheduledTime?: string;
  }

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
    onClose();
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
    <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 via-pink-50/90 to-rose-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-red-500/20 rounded-2xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiMessageCircle className="w-5 h-5 text-red-600" />
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
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-2">
          <div className="flex items-center">
            <div className={`flex-1 h-2 rounded-full ${activeStep >= 1 ? 'bg-red-500' : 'bg-gray-200'}`} />
            <div className="mx-2 text-xs text-gray-500">•</div>
            <div className={`flex-1 h-2 rounded-full ${activeStep >= 2 ? 'bg-red-500' : 'bg-gray-200'}`} />
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
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez l'objectif et le contenu de votre campagne..."
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.description ? 'border-red-500' : ''}`}
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
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">
                  <FiUsers className="inline w-4 h-4 mr-1" />
                  Prochaine étape
                </h4>
                <p className="text-red-700 text-sm">
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
                    disabled={!formData.startDate || !formData.endDate}
                  >
                    <FiClock className="w-4 h-4 mr-2" />
                    Programmer auto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCommunication}
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
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={comm.type}
                          onChange={(e) => updateCommunication(comm.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      <textarea
                        value={comm.content}
                        onChange={(e) => updateCommunication(comm.id, 'content', e.target.value)}
                        placeholder="Rédigez le contenu de votre communication..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priorité
                        </label>
                        <select
                          value={comm.priority}
                          onChange={(e) => updateCommunication(comm.id, 'priority', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
              >
                Retour
              </Button>
            )}
            
            <div className="flex space-x-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Annuler
              </Button>
              
              <Button
                type="button"
                onClick={activeStep === 1 ? nextStep : handleSubmit}
                className="bg-gradient-to-r from-[#f01919] to-[#d01515] hover:from-[#d01515] hover:to-[#b01010] text-white"
              >
                {activeStep === 1 ? (
                  <>
                    Suivant
                    <FiPlus className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    <FiPlus className="w-4 h-4 mr-2" />
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

// Composant principal des campagnes
const CampaignsPage: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignCore[]>([]);
  const [communications, setCommunications] = useState<ValidationMessageT[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignCore | null>(null);

  // Récupérer les campagnes
  const fetchCampaigns = async () => {
    if (!user) {
      console.warn('⚠️ Impossible de récupérer les campagnes: utilisateur non connecté');
      return;
    }

    try {
      console.log('🔄 Début récupération campagnes...');
      const token = await user.getIdToken();
      console.log('🔑 Token obtenu, longueur:', token.length);
      
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Réponse API campaigns:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données campagnes reçues:', data);
        
        const campaignsData = data.data || data.campaigns || [];
        setCampaigns(campaignsData);
        console.log(`🎯 ${campaignsData.length} campagnes chargées`);
      } else {
        const errorData = await response.text();
        console.error('❌ Erreur response campaigns:', response.status, errorData);
        console.error('Erreur lors de la récupération des campagnes');
        setCampaigns([]); // Assurer qu'on a un tableau vide en cas d'erreur
      }
    } catch (error) {
      console.error('❌ Erreur fetch campagnes:', error);
      console.error('Erreur:', error);
      setCampaigns([]); // Assurer qu'on a un tableau vide en cas d'erreur
    }
  };

  // Récupérer les communications disponibles
  const fetchCommunications = async () => {
    if (!user) return;

    try {
      console.log('🔄 Début récupération communications...');
      const token = await user.getIdToken();
      console.log('🔑 Token obtenu pour communications, longueur:', token.length);
      
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Réponse API messages:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données communications reçues:', data);
        
        // L'API messages retourne directement un tableau ou un objet avec data
        const communicationsData = Array.isArray(data) ? data : (data.data || data.messages || []);
        setCommunications(communicationsData);
        console.log(`📨 ${communicationsData.length} communications chargées`);
      } else {
        const errorData = await response.text();
        console.error('❌ Erreur response communications:', response.status, errorData);
        console.error('Erreur lors de la récupération des communications');
        setCommunications([]); // Assurer qu'on a un tableau vide en cas d'erreur
      }
    } catch (error) {
      console.error('❌ Erreur fetch communications:', error);
      console.error('Erreur:', error);
      setCommunications([]); // Assurer qu'on a un tableau vide en cas d'erreur
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCampaigns(), fetchCommunications()]);
      setLoading(false);
    };
    
    loadData();
  }, [user]);

  // Créer une nouvelle campagne
  const handleCreateCampaign = async (campaignData: Partial<CampaignCore>) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(prev => [data.data, ...prev]);
        console.log('Campagne créée avec succès');
      } else {
        console.error('Erreur lors de la création de la campagne');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Supprimer une campagne
  const handleDeleteCampaign = async (campaignId: string) => {
    if (!user || !confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/campaigns?id=${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        console.log('Campagne supprimée avec succès');
      } else {
        console.error('Erreur lors de la suppression de la campagne');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Mettre à jour le statut d'une campagne
  const handleUpdateCampaignStatus = async (campaignId: string, newStatus: CampaignCore['status']) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: campaignId, status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(prev => prev.map(c => c.id === campaignId ? data.data : c));
        console.log('Statut de la campagne mis à jour');
      } else {
        console.error('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Voir les détails d'une campagne
  const handleViewCampaign = (campaign: CampaignCore) => {
    setSelectedCampaign(campaign);
    setIsViewModalOpen(true);
  };

  // Filtrer les campagnes
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status: CampaignCore['status']) => {
    switch (status) {
      case 'draft': return <FiEdit3 className="w-4 h-4" />;
      case 'active': return <FiPlay className="w-4 h-4" />;
      case 'paused': return <FiPause className="w-4 h-4" />;
      case 'completed': return <FiCheck className="w-4 h-4" />;
      case 'scheduled': return <FiClock className="w-4 h-4" />;
      default: return <FiEdit3 className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campagnes</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos campagnes de communication - rassemblement de communications (max {MAX_COMMUNICATIONS})
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouvelle Campagne
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{campaigns.length}</p>
              <p className="text-sm text-blue-600 mt-1">Campagnes</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiMessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actives</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {campaigns.filter(c => c.status === 'active').length}
              </p>
              <p className="text-sm text-green-600 mt-1">En cours</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiPlay className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Brouillons</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {campaigns.filter(c => c.status === 'draft').length}
              </p>
              <p className="text-sm text-orange-600 mt-1">En préparation</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500">
              <FiEdit3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {campaigns.filter(c => c.status === 'completed').length}
              </p>
              <p className="text-sm text-blue-600 mt-1">Finalisées</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Rechercher une campagne..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="active">Active</option>
              <option value="paused">En pause</option>
              <option value="completed">Terminée</option>
              <option value="scheduled">Planifiée</option>
            </select>
          </div>
          <div>
            <Button 
              onClick={() => { fetchCampaigns(); fetchCommunications(); }} 
              variant="outline" 
              className="w-full"
              disabled={loading}
            >
              <FiSearch className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
          <div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Nouvelle
            </Button>
          </div>
        </div>
      </div>

      {/* Liste des campagnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FiMessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {campaigns.length === 0 
                ? 'Aucune campagne' 
                : 'Aucune campagne trouvée'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {campaigns.length === 0 
                ? "Créez votre première campagne pour rassembler vos communications"
                : "Aucune campagne ne correspond à vos critères de recherche"
              }
            </p>
            {campaigns.length === 0 && (
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#f01919] hover:bg-[#d01515] text-white"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Créer ma première campagne
              </Button>
            )}
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(campaign.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {CAMPAIGN_STATUS_LABELS[campaign.status]}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{campaign.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <FiMessageCircle className="w-4 h-4 mr-2" />
                      {campaign.communications?.length || 0} / {MAX_COMMUNICATIONS} communications
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      {new Date(campaign.startDate).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center">
                      <FiTrendingUp className="w-4 h-4 mr-2" />
                      {campaign.stats?.totalSent || 0} envoyés
                    </div>
                    <div className="flex items-center">
                      <FiUsers className="w-4 h-4 mr-2" />
                      {campaign.stats && campaign.stats.totalSent > 0 
                        ? `${Math.round((campaign.stats.totalOpened / campaign.stats.totalSent) * 100)}%`
                        : '0%'
                      } d'ouverture
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions de la campagne */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    ID: {campaign.id?.slice(-8)}
                  </span>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewCampaign(campaign)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Voir les détails de la campagne"
                    >
                      <FiEye className="w-4 h-4" />
                    </Button>

                    {campaign.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateCampaignStatus(campaign.id!, 'active')}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Démarrer la campagne"
                      >
                        <FiPlay className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {campaign.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateCampaignStatus(campaign.id!, 'paused')}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        title="Mettre en pause"
                      >
                        <FiPause className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {campaign.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateCampaignStatus(campaign.id!, 'active')}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Reprendre la campagne"
                      >
                        <FiPlay className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      title="Modifier la campagne"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCampaign(campaign.id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer la campagne"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de visualisation */}
      {isViewModalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-blue-500/20 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getStatusIcon(selectedCampaign.status)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCampaign.name}</h2>
                  <p className="text-sm text-gray-500">
                    Détails de la campagne • {CAMPAIGN_STATUS_LABELS[selectedCampaign.status]}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Informations générales */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations générales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                      {selectedCampaign.description}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <Badge variant={selectedCampaign.status === 'active' ? 'default' : 'secondary'}>
                      {CAMPAIGN_STATUS_LABELS[selectedCampaign.status]}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedCampaign.startDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedCampaign.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistiques</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedCampaign.stats?.totalSent || 0}</div>
                    <div className="text-sm text-gray-600">Envoyés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedCampaign.stats?.totalDelivered || 0}</div>
                    <div className="text-sm text-gray-600">Délivrés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedCampaign.stats?.totalOpened || 0}</div>
                    <div className="text-sm text-gray-600">Ouverts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedCampaign.stats?.totalClicked || 0}</div>
                    <div className="text-sm text-gray-600">Cliqués</div>
                  </div>
                </div>
              </div>

              {/* Communications */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Communications ({selectedCampaign.communications?.length || 0})
                </h3>
                
                {selectedCampaign.communications && selectedCampaign.communications.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCampaign.communications.map((comm, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{comm.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{comm.content}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Type: {comm.type}</span>
                              <span>Statut: {comm.status}</span>
                              {comm.scheduledDate && (
                                <span>Programmé: {new Date(comm.scheduledDate).toLocaleDateString('fr-FR')}</span>
                              )}
                            </div>
                          </div>
                          <Badge variant={comm.status === 'sent' ? 'default' : 'secondary'}>
                            {comm.status === 'sent' ? 'Envoyé' : comm.status === 'pending' ? 'En attente' : 'Échoué'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiMessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune communication dans cette campagne</p>
                  </div>
                )}
              </div>

            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
              >
                Fermer
              </Button>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FiEdit3 className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création */}
      <CampaignCreateForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
        availableCommunications={communications}
      />
    </div>
  );
};

// Export par défaut du composant React
export default CampaignsPage;
