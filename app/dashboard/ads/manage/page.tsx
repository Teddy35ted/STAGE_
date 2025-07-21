'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiEdit3, 
  FiTrash2, 
  FiPause, 
  FiPlay,
  FiStop,
  FiSettings,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiBarChart,
  FiMessageCircle,
  FiAlertCircle,
  FiCheck,
  FiX
} from 'react-icons/fi';

interface ManagedAd {
  id: string;
  name: string;
  advertiser: string;
  type: 'display' | 'video' | 'sponsored_post' | 'story' | 'newsletter';
  status: 'active' | 'paused' | 'pending_approval' | 'needs_attention' | 'completed';
  budget: {
    allocated: number;
    spent: number;
    dailyLimit: number;
  };
  schedule: {
    startDate: string;
    endDate: string;
    timezone: string;
    activeDays: string[];
    activeHours: {
      start: string;
      end: string;
    };
  };
  targeting: {
    audience: string;
    demographics: string[];
    interests: string[];
    locations: string[];
  };
  performance: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    cpa: number;
  };
  content: {
    title: string;
    description: string;
    mediaUrl?: string;
    callToAction: string;
  };
  issues?: {
    type: 'budget_low' | 'performance_poor' | 'approval_needed' | 'content_update';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  lastModified: string;
  createdBy: string;
}

const managedAdsData: ManagedAd[] = [
  {
    id: '1',
    name: 'Campagne BioGlow - Feed Principal',
    advertiser: 'BioGlow Cosmetics',
    type: 'sponsored_post',
    status: 'active',
    budget: {
      allocated: 1500,
      spent: 890,
      dailyLimit: 50
    },
    schedule: {
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      timezone: 'Europe/Paris',
      activeDays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
      activeHours: {
        start: '08:00',
        end: '22:00'
      }
    },
    targeting: {
      audience: 'Femmes intéressées par la beauté bio',
      demographics: ['Femmes', '25-40 ans'],
      interests: ['Beauté', 'Bio', 'Lifestyle'],
      locations: ['France', 'Belgique']
    },
    performance: {
      impressions: 125000,
      clicks: 3750,
      ctr: 3.0,
      conversions: 89,
      cpa: 10.11
    },
    content: {
      title: 'Découvrez notre nouvelle gamme bio',
      description: 'Des cosmétiques naturels pour une beauté authentique',
      mediaUrl: '/images/bioglow-campaign.jpg',
      callToAction: 'Découvrir maintenant'
    },
    lastModified: '2024-01-18T14:30:00Z',
    createdBy: 'Marie Dubois'
  },
  {
    id: '2',
    name: 'FitGear - Vidéo YouTube',
    advertiser: 'FitGear Pro',
    type: 'video',
    status: 'needs_attention',
    budget: {
      allocated: 800,
      spent: 720,
      dailyLimit: 30
    },
    schedule: {
      startDate: '2024-01-10',
      endDate: '2024-01-31',
      timezone: 'Europe/Paris',
      activeDays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
      activeHours: {
        start: '06:00',
        end: '23:00'
      }
    },
    targeting: {
      audience: 'Passionnés de fitness',
      demographics: ['Hommes et Femmes', '20-35 ans'],
      interests: ['Fitness', 'Sport', 'Musculation'],
      locations: ['France']
    },
    performance: {
      impressions: 68000,
      clicks: 2040,
      ctr: 3.0,
      conversions: 45,
      cpa: 16.00
    },
    content: {
      title: 'Test équipement FitGear Pro',
      description: 'Découvrez mon avis sur les nouveaux équipements',
      mediaUrl: '/videos/fitgear-review.mp4',
      callToAction: 'Voir la gamme'
    },
    issues: [
      {
        type: 'budget_low',
        message: 'Budget presque épuisé (90% utilisé)',
        severity: 'high'
      },
      {
        type: 'performance_poor',
        message: 'CTR en baisse de 15% cette semaine',
        severity: 'medium'
      }
    ],
    lastModified: '2024-01-17T09:15:00Z',
    createdBy: 'Marie Dubois'
  },
  {
    id: '3',
    name: 'EcoHome - Newsletter',
    advertiser: 'EcoHome Solutions',
    type: 'newsletter',
    status: 'paused',
    budget: {
      allocated: 600,
      spent: 180,
      dailyLimit: 20
    },
    schedule: {
      startDate: '2024-01-08',
      endDate: '2024-02-08',
      timezone: 'Europe/Paris',
      activeDays: ['mardi', 'jeudi'],
      activeHours: {
        start: '10:00',
        end: '18:00'
      }
    },
    targeting: {
      audience: 'Propriétaires éco-responsables',
      demographics: ['Hommes et Femmes', '30-50 ans'],
      interests: ['Écologie', 'Maison', 'DIY'],
      locations: ['France']
    },
    performance: {
      impressions: 15000,
      clicks: 450,
      ctr: 3.0,
      conversions: 12,
      cpa: 15.00
    },
    content: {
      title: 'Solutions écologiques pour votre maison',
      description: 'Transformez votre habitat en espace durable',
      callToAction: 'En savoir plus'
    },
    lastModified: '2024-01-16T11:45:00Z',
    createdBy: 'Marie Dubois'
  },
  {
    id: '4',
    name: 'TechStart - Stories Instagram',
    advertiser: 'TechStart Academy',
    type: 'story',
    status: 'pending_approval',
    budget: {
      allocated: 400,
      spent: 0,
      dailyLimit: 25
    },
    schedule: {
      startDate: '2024-01-25',
      endDate: '2024-02-25',
      timezone: 'Europe/Paris',
      activeDays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
      activeHours: {
        start: '09:00',
        end: '19:00'
      }
    },
    targeting: {
      audience: 'Développeurs et étudiants tech',
      demographics: ['Hommes et Femmes', '22-35 ans'],
      interests: ['Technologie', 'Programmation', 'Formation'],
      locations: ['France']
    },
    performance: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0,
      cpa: 0
    },
    content: {
      title: 'Formations développement web',
      description: 'Apprenez les technologies les plus demandées',
      callToAction: 'S\'inscrire maintenant'
    },
    issues: [
      {
        type: 'approval_needed',
        message: 'En attente d\'approbation de l\'annonceur',
        severity: 'medium'
      }
    ],
    lastModified: '2024-01-19T16:20:00Z',
    createdBy: 'Marie Dubois'
  }
];

export default function ManageAdsPage() {
  const [ads, setAds] = useState<ManagedAd[]>(managedAdsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAd, setSelectedAd] = useState<ManagedAd | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.advertiser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ad.status === filterStatus;
    const matchesType = filterType === 'all' || ad.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'pending_approval': return 'bg-blue-100 text-blue-800';
      case 'needs_attention': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'En pause';
      case 'pending_approval': return 'En attente';
      case 'needs_attention': return 'Attention requise';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'display': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'sponsored_post': return 'bg-purple-100 text-purple-800';
      case 'story': return 'bg-pink-100 text-pink-800';
      case 'newsletter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'display': return 'Display';
      case 'video': return 'Vidéo';
      case 'sponsored_post': return 'Post Sponsorisé';
      case 'story': return 'Story';
      case 'newsletter': return 'Newsletter';
      default: return type;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateBudgetProgress = (spent: number, allocated: number) => {
    return allocated > 0 ? (spent / allocated) * 100 : 0;
  };

  const handleStatusChange = (adId: string, newStatus: string) => {
    setAds(ads.map(ad => 
      ad.id === adId ? { ...ad, status: newStatus as any } : ad
    ));
  };

  const handleDeleteAd = (adId: string) => {
    setAds(ads.filter(ad => ad.id !== adId));
  };

  // Stats calculations
  const activeAds = ads.filter(ad => ad.status === 'active').length;
  const totalSpent = ads.reduce((sum, ad) => sum + ad.budget.spent, 0);
  const adsNeedingAttention = ads.filter(ad => ad.status === 'needs_attention' || ad.issues?.length).length;
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.performance.impressions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gérer les Publicités</h1>
          <p className="text-gray-600 mt-1">
            Administrez et optimisez vos campagnes publicitaires
          </p>
        </div>
        <Button className="bg-[#f01919] hover:bg-[#d01515] text-white">
          <FiSettings className="w-4 h-4 mr-2" />
          Paramètres globaux
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Publicités Actives</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeAds}</p>
              <p className="text-sm text-green-600 mt-1">En cours d'exécution</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiPlay className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Dépensé</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalSpent)}</p>
              <p className="text-sm text-blue-600 mt-1">Ce mois</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attention Requise</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{adsNeedingAttention}</p>
              <p className="text-sm text-red-600 mt-1">Publicités à vérifier</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500">
              <FiAlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Impressions Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalImpressions.toLocaleString()}</p>
              <p className="text-sm text-purple-600 mt-1">Portée globale</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiBarChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Rechercher une publicité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Active</option>
              <option value="paused">En pause</option>
              <option value="pending_approval">En attente</option>
              <option value="needs_attention">Attention requise</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les types</option>
              <option value="display">Display</option>
              <option value="video">Vidéo</option>
              <option value="sponsored_post">Post Sponsorisé</option>
              <option value="story">Story</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ads List */}
      <div className="space-y-6">
        {filteredAds.map((ad) => (
          <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{ad.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ad.status)}`}>
                    {getStatusLabel(ad.status)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(ad.type)}`}>
                    {getTypeLabel(ad.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{ad.content.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>🏢 {ad.advertiser}</span>
                  <span>📅 {formatDate(ad.schedule.startDate)} - {formatDate(ad.schedule.endDate)}</span>
                  <span>👤 {ad.createdBy}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(ad.budget.spent)}</p>
                <p className="text-sm text-gray-500">sur {formatCurrency(ad.budget.allocated)}</p>
                <p className="text-xs text-gray-400">
                  {calculateBudgetProgress(ad.budget.spent, ad.budget.allocated).toFixed(1)}% utilisé
                </p>
              </div>
            </div>

            {/* Issues Alert */}
            {ad.issues && ad.issues.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start space-x-2">
                  <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900 mb-1">Problèmes détectés</h4>
                    {ad.issues.map((issue, index) => (
                      <div key={index} className="flex items-center justify-between mb-1">
                        <p className="text-sm text-red-700">{issue.message}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Budget Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Budget</span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(ad.budget.spent)} / {formatCurrency(ad.budget.allocated)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    calculateBudgetProgress(ad.budget.spent, ad.budget.allocated) > 90 
                      ? 'bg-red-500' 
                      : calculateBudgetProgress(ad.budget.spent, ad.budget.allocated) > 75 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${calculateBudgetProgress(ad.budget.spent, ad.budget.allocated)}%` }}
                ></div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{ad.performance.impressions.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Impressions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{ad.performance.clicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Clics</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{ad.performance.ctr.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">CTR</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{ad.performance.conversions}</p>
                <p className="text-xs text-gray-500">Conversions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(ad.performance.cpa)}</p>
                <p className="text-xs text-gray-500">CPA</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                {ad.status === 'active' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(ad.id, 'paused')}
                  >
                    <FiPause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                )}
                {ad.status === 'paused' && (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusChange(ad.id, 'active')}
                  >
                    <FiPlay className="w-4 h-4 mr-1" />
                    Reprendre
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedAd(ad);
                    setShowEditModal(true);
                  }}
                >
                  <FiEdit3 className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button size="sm" variant="outline">
                  <FiBarChart className="w-4 h-4 mr-1" />
                  Analytics
                </Button>
                <Button size="sm" variant="outline">
                  <FiMessageCircle className="w-4 h-4 mr-1" />
                  Discuter
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteAd(ad.id)}
                >
                  <FiTrash2 className="w-4 h-4 mr-1" />
                  Supprimer
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Modifié le {formatDate(ad.lastModified)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Modifier la publicité</h2>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Fermer
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la campagne
                </label>
                <Input defaultValue={selectedAd.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget quotidien
                  </label>
                  <Input 
                    type="number" 
                    defaultValue={selectedAd.budget.dailyLimit}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget total
                  </label>
                  <Input 
                    type="number" 
                    defaultValue={selectedAd.budget.allocated}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                  rows={3}
                  defaultValue={selectedAd.content.description}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call-to-Action
                </label>
                <Input defaultValue={selectedAd.content.callToAction} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <Input 
                    type="date" 
                    defaultValue={selectedAd.schedule.startDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <Input 
                    type="date" 
                    defaultValue={selectedAd.schedule.endDate}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowEditModal(false)}
              >
                Annuler
              </Button>
              <Button 
                className="bg-[#f01919] hover:bg-[#d01515] text-white"
                onClick={() => setShowEditModal(false)}
              >
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      )}

      {filteredAds.length === 0 && (
        <div className="text-center py-12">
          <FiSettings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publicité trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Aucune publicité ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore de publicités à gérer.'
            }
          </p>
        </div>
      )}

      {/* Management Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiSettings className="w-6 h-6 text-yellow-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-yellow-900 mb-2">
              Conseils de gestion
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
              <div>
                <p className="font-medium mb-1">Optimisation continue</p>
                <ul className="space-y-1">
                  <li>• Surveillez les budgets quotidiennement</li>
                  <li>• Analysez les performances hebdomadaires</li>
                  <li>• Ajustez les audiences sous-performantes</li>
                  <li>• Testez différents créatifs</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Bonnes pratiques</p>
                <ul className="space-y-1">
                  <li>• Répondez rapidement aux annonceurs</li>
                  <li>• Respectez les d��lais de livraison</li>
                  <li>• Maintenez la qualité du contenu</li>
                  <li>• Documentez les modifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}