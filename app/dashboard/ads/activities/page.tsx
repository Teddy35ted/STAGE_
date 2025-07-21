'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiPlay, 
  FiPause, 
  FiStop, 
  FiEye,
  FiBarChart,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiTarget,
  FiEdit3,
  FiRefreshCw
} from 'react-icons/fi';

interface ActiveCampaign {
  id: string;
  name: string;
  advertiser: string;
  status: 'running' | 'paused' | 'scheduled' | 'completed';
  startDate: string;
  endDate: string;
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  performance: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    revenue: number;
  };
  targeting: {
    audience: string;
    reach: number;
    demographics: string[];
  };
  content: {
    type: string;
    placements: string[];
    deliverables: {
      completed: number;
      total: number;
    };
  };
  nextDeliverable?: {
    type: string;
    dueDate: string;
    description: string;
  };
  priority: 'low' | 'medium' | 'high';
}

const activeCampaignsData: ActiveCampaign[] = [
  {
    id: '1',
    name: 'Campagne BioGlow Printemps',
    advertiser: 'BioGlow Cosmetics',
    status: 'running',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    budget: {
      total: 2500,
      spent: 1650,
      remaining: 850
    },
    performance: {
      impressions: 125000,
      clicks: 3750,
      ctr: 3.0,
      conversions: 89,
      revenue: 1650
    },
    targeting: {
      audience: 'Femmes 25-40 ans intéressées par la beauté bio',
      reach: 45000,
      demographics: ['Femmes', '25-40 ans', 'France']
    },
    content: {
      type: 'Contenu sponsorisé',
      placements: ['Feed Instagram', 'Stories'],
      deliverables: {
        completed: 5,
        total: 8
      }
    },
    nextDeliverable: {
      type: 'Story sponsorisée',
      dueDate: '2024-01-20',
      description: 'Story avec démonstration produit'
    },
    priority: 'high'
  },
  {
    id: '2',
    name: 'Promo FitGear Hiver',
    advertiser: 'FitGear Pro',
    status: 'running',
    startDate: '2024-01-10',
    endDate: '2024-01-31',
    budget: {
      total: 1200,
      spent: 800,
      remaining: 400
    },
    performance: {
      impressions: 68000,
      clicks: 2040,
      ctr: 3.0,
      conversions: 45,
      revenue: 800
    },
    targeting: {
      audience: 'Passionnés de fitness',
      reach: 28000,
      demographics: ['Hommes et Femmes', '20-35 ans', 'France']
    },
    content: {
      type: 'Vidéo démo',
      placements: ['YouTube', 'Instagram Reels'],
      deliverables: {
        completed: 3,
        total: 5
      }
    },
    nextDeliverable: {
      type: 'Vidéo YouTube',
      dueDate: '2024-01-22',
      description: 'Test et avis équipement fitness'
    },
    priority: 'medium'
  },
  {
    id: '3',
    name: 'EcoHome Solutions',
    advertiser: 'EcoHome',
    status: 'paused',
    startDate: '2024-01-08',
    endDate: '2024-02-08',
    budget: {
      total: 1800,
      spent: 450,
      remaining: 1350
    },
    performance: {
      impressions: 32000,
      clicks: 960,
      ctr: 3.0,
      conversions: 18,
      revenue: 450
    },
    targeting: {
      audience: 'Propriétaires éco-responsables',
      reach: 22000,
      demographics: ['Hommes et Femmes', '30-50 ans', 'France']
    },
    content: {
      type: 'Tutoriel DIY',
      placements: ['Blog', 'YouTube'],
      deliverables: {
        completed: 1,
        total: 4
      }
    },
    nextDeliverable: {
      type: 'Article blog',
      dueDate: '2024-01-25',
      description: 'Guide isolation écologique'
    },
    priority: 'low'
  },
  {
    id: '4',
    name: 'TechStart Formation',
    advertiser: 'TechStart Academy',
    status: 'scheduled',
    startDate: '2024-01-25',
    endDate: '2024-02-25',
    budget: {
      total: 900,
      spent: 0,
      remaining: 900
    },
    performance: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0,
      revenue: 0
    },
    targeting: {
      audience: 'Développeurs et étudiants tech',
      reach: 15000,
      demographics: ['Hommes et Femmes', '22-35 ans', 'France']
    },
    content: {
      type: 'Article éducatif',
      placements: ['LinkedIn', 'Blog personnel'],
      deliverables: {
        completed: 0,
        total: 3
      }
    },
    nextDeliverable: {
      type: 'Article LinkedIn',
      dueDate: '2024-01-26',
      description: 'Retour d\'expérience formation'
    },
    priority: 'medium'
  }
];

export default function ActivitiesPage() {
  const [campaigns, setCampaigns] = useState<ActiveCampaign[]>(activeCampaignsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<ActiveCampaign | null>(null);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.advertiser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return 'En cours';
      case 'paused': return 'En pause';
      case 'scheduled': return 'Programmée';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  // Stats calculations
  const runningCampaigns = campaigns.filter(c => c.status === 'running').length;
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.performance.revenue, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.performance.impressions, 0);
  const averageCTR = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + c.performance.ctr, 0) / campaigns.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activités Publicitaires</h1>
          <p className="text-gray-600 mt-1">
            Suivez et gérez vos campagnes publicitaires en cours
          </p>
        </div>
        <Button className="bg-[#f01919] hover:bg-[#d01515] text-white">
          <FiRefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campagnes Actives</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{runningCampaigns}</p>
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
              <p className="text-sm font-medium text-gray-600">Revenus Générés</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-green-600 mt-1">Ce mois</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Impressions Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalImpressions.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">Portée globale</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiEye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CTR Moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{averageCTR.toFixed(1)}%</p>
              <p className="text-sm text-purple-600 mt-1">Performance</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Rechercher une campagne..."
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
              <option value="running">En cours</option>
              <option value="paused">En pause</option>
              <option value="scheduled">Programmée</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                    {getStatusLabel(campaign.status)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(campaign.priority)}`}>
                    {campaign.priority}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  <span>🏢 {campaign.advertiser}</span>
                  <span>📅 {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                  <span>👥 {campaign.targeting.reach.toLocaleString()} personnes</span>
                  {getDaysRemaining(campaign.endDate) > 0 && (
                    <span>⏰ {getDaysRemaining(campaign.endDate)} jours restants</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{campaign.targeting.audience}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(campaign.performance.revenue)}</p>
                <p className="text-sm text-gray-500">Revenus générés</p>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Budget</span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.total)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#f01919] h-2 rounded-full" 
                  style={{ width: `${(campaign.budget.spent / campaign.budget.total) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Deliverables Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Livrables</span>
                <span className="text-sm text-gray-600">
                  {campaign.content.deliverables.completed} / {campaign.content.deliverables.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${calculateProgress(campaign.content.deliverables.completed, campaign.content.deliverables.total)}%` }}
                ></div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{campaign.performance.impressions.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Impressions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{campaign.performance.clicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Clics</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{campaign.performance.ctr.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">CTR</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{campaign.performance.conversions}</p>
                <p className="text-xs text-gray-500">Conversions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(campaign.performance.revenue)}</p>
                <p className="text-xs text-gray-500">Revenus</p>
              </div>
            </div>

            {/* Next Deliverable */}
            {campaign.nextDeliverable && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Prochain livrable</h4>
                    <p className="text-sm text-blue-700">{campaign.nextDeliverable.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-900">{campaign.nextDeliverable.type}</p>
                    <p className="text-xs text-blue-600">Échéance: {formatDate(campaign.nextDeliverable.dueDate)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                {campaign.status === 'running' && (
                  <Button size="sm" variant="outline">
                    <FiPause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                )}
                {campaign.status === 'paused' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <FiPlay className="w-4 h-4 mr-1" />
                    Reprendre
                  </Button>
                )}
                {campaign.status === 'scheduled' && (
                  <Button size="sm" variant="outline">
                    <FiEdit3 className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <FiBarChart className="w-4 h-4 mr-1" />
                  Analytics
                </Button>
                <Button size="sm" variant="outline">
                  <FiEye className="w-4 h-4 mr-1" />
                  Détails
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Restant: {formatCurrency(campaign.budget.remaining)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Analytics Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Analytics - {selectedCampaign.name}</h2>
                <Button variant="outline" onClick={() => setSelectedCampaign(null)}>
                  Fermer
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Performance Overview */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Performance globale</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedCampaign.performance.impressions.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Impressions</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedCampaign.performance.clicks.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Clics</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedCampaign.performance.ctr.toFixed(2)}%</p>
                    <p className="text-sm text-gray-500">CTR</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedCampaign.performance.conversions}</p>
                    <p className="text-sm text-gray-500">Conversions</p>
                  </div>
                </div>
              </div>

              {/* Budget Analysis */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Analyse budgétaire</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(selectedCampaign.budget.total)}</p>
                    <p className="text-sm text-blue-600">Budget total</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-xl font-bold text-red-900">{formatCurrency(selectedCampaign.budget.spent)}</p>
                    <p className="text-sm text-red-600">Dépensé</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-900">{formatCurrency(selectedCampaign.budget.remaining)}</p>
                    <p className="text-sm text-green-600">Restant</p>
                  </div>
                </div>
              </div>

              {/* Content Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Détails du contenu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Type de contenu</h4>
                    <p className="text-sm text-gray-600">{selectedCampaign.content.type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Placements</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCampaign.content.placements.map((placement, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {placement}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <FiPlay className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité publicitaire</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Aucune campagne ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas de campagnes publicitaires en cours.'
            }
          </p>
        </div>
      )}

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTrendingUp className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-2">
              Résumé des performances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
              <div>
                <p className="font-medium mb-1">Métriques clés</p>
                <ul className="space-y-1">
                  <li>• {runningCampaigns} campagnes actives</li>
                  <li>• {formatCurrency(totalRevenue)} de revenus générés</li>
                  <li>• {totalImpressions.toLocaleString()} impressions totales</li>
                  <li>• {averageCTR.toFixed(1)}% de CTR moyen</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Optimisations</p>
                <ul className="space-y-1">
                  <li>• Surveillez les échéances des livrables</li>
                  <li>• Optimisez les campagnes peu performantes</li>
                  <li>• Analysez les audiences les plus engagées</li>
                  <li>• Ajustez les budgets selon les performances</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}