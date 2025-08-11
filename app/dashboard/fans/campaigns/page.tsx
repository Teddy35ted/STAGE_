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
  FiX
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedMessages: [] as string[],
    startDate: '',
    endDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la campagne est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.selectedMessages.length === 0) {
      newErrors.messages = 'Au moins une communication doit être sélectionnée';
    }

    if (formData.selectedMessages.length > MAX_COMMUNICATIONS) {
      newErrors.messages = `Maximum ${MAX_COMMUNICATIONS} communications par campagne`;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Créer l'objet campagne (simplifié pour la création)
    const campaignData: Partial<CampaignCore> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: 'draft',
      startDate: formData.startDate,
      endDate: formData.endDate,
      communications: [], // Sera rempli côté backend
      createdBy: '', // Sera rempli côté backend
      stats: {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0
      }
    };

    // Ajouter les IDs des messages sélectionnés comme propriété temporaire
    (campaignData as any).selectedMessageIds = formData.selectedMessages;

    onSubmit(campaignData);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      selectedMessages: [],
      startDate: '',
      endDate: ''
    });
    setErrors({});
    onClose();
  };

  const toggleMessageSelection = (messageId: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedMessages.includes(messageId);
      
      if (isSelected) {
        return {
          ...prev,
          selectedMessages: prev.selectedMessages.filter(id => id !== messageId)
        };
      } else if (prev.selectedMessages.length < MAX_COMMUNICATIONS) {
        return {
          ...prev,
          selectedMessages: [...prev.selectedMessages, messageId]
        };
      }
      
      return prev;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 via-pink-50/90 to-rose-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-red-500/20 rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Nouvelle Campagne</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom de la campagne */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la campagne *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Campagne promotion été 2024"
              className={`w-full ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez l'objectif et le contenu de votre campagne..."
              rows={4}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:border-transparent ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Sélection des communications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communications à inclure * (max {MAX_COMMUNICATIONS})
            </label>
            <div className="bg-gray-50/50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {availableCommunications.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  Aucune communication disponible
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {availableCommunications.map((message) => {
                    const messageId = message.id || '';
                    const isSelected = formData.selectedMessages.includes(messageId);
                    const isDisabled = !isSelected && formData.selectedMessages.length >= MAX_COMMUNICATIONS;
                    
                    // Récupérer le contenu du message
                    const messageText = message.messages && message.messages[0] ? 
                      message.messages[0].text || 'Message sans texte' : 
                      'Message vide';
                    
                    return (
                      <div
                        key={messageId}
                        className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 shadow-sm' 
                            : isDisabled 
                              ? 'bg-gray-100/50 cursor-not-allowed opacity-60' 
                              : 'bg-white/70 hover:bg-white/90 hover:shadow-sm cursor-pointer border border-transparent hover:border-gray-200'
                        }`}
                        onClick={() => !isDisabled && toggleMessageSelection(messageId)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          readOnly
                          className="mr-3 h-4 w-4 text-[#f01919] focus:ring-[#f01919] border-gray-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {message.nomsend || 'Utilisateur inconnu'}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {messageText}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {message.date || 'Date inconnue'}
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2 bg-white/80">
                          {message.messages ? message.messages.length : 0} msg
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {formData.selectedMessages.length} / {MAX_COMMUNICATIONS} communications sélectionnées
              </p>
              {formData.selectedMessages.length >= MAX_COMMUNICATIONS && (
                <p className="text-xs text-amber-600 font-medium">
                  Limite atteinte
                </p>
              )}
            </div>
            {errors.messages && <p className="text-red-500 text-sm mt-1">{errors.messages}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-[#f01919] to-[#d01515] hover:from-[#d01515] hover:to-[#b01010] text-white shadow-lg"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Créer la campagne
            </Button>
          </div>
        </form>
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

  // Récupérer les campagnes
  const fetchCampaigns = async () => {
    if (!user) return;

    try {
      console.log('🔄 Début récupération campagnes...');
      const token = await user.getIdToken();
      console.log('🔑 Token obtenu, longueur:', token.length);
      
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Réponse API campaigns:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données campagnes reçues:', data);
        setCampaigns(data.data || []);
      } else {
        const errorData = await response.text();
        console.error('❌ Erreur response:', response.status, errorData);
        console.error('Erreur lors de la récupération des campagnes');
      }
    } catch (error) {
      console.error('❌ Erreur fetch campagnes:', error);
      console.error('Erreur:', error);
    }
  };

  // Récupérer les communications disponibles
  const fetchCommunications = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCommunications(data.data || []);
      } else {
        console.error('Erreur lors de la récupération des communications');
      }
    } catch (error) {
      console.error('Erreur:', error);
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
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
