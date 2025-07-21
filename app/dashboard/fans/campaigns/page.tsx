'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiTarget, 
  FiUsers, 
  FiTrendingUp, 
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiCalendar,
  FiPlay,
  FiPause,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiBarChart,
  FiDollarSign
} from 'react-icons/fi';

interface Campaign {
  id: string;
  name: string;
  type: 'engagement' | 'acquisition' | 'retention' | 'conversion';
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'scheduled';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  targetAudience: {
    size: number;
    criteria: string[];
    demographics: {
      ageRange: string;
      gender: string[];
      interests: string[];
      location: string[];
    };
  };
  objectives: {
    primary: string;
    kpis: {
      name: string;
      target: number;
      current: number;
      unit: string;
    }[];
  };
  content: {
    posts: number;
    emails: number;
    notifications: number;
  };
  performance: {
    reach: number;
    impressions: number;
    engagement: number;
    clicks: number;
    conversions: number;
    newFollowers: number;
    revenue: number;
  };
  channels: string[];
  createdAt: string;
}

const campaignsData: Campaign[] = [
  {
    id: '1',
    name: 'Campagne Lifestyle Printemps',
    type: 'engagement',
    description: 'Augmenter l\'engagement sur le contenu lifestyle avec focus sur les routines printanières',
    status: 'active',
    budget: 500.00,
    spent: 287.50,
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    targetAudience: {
      size: 2847,
      criteria: ['Fans actifs', 'Intérêt lifestyle', 'Engagement élevé'],
      demographics: {
        ageRange: '25-40 ans',
        gender: ['Femmes'],
        interests: ['Lifestyle', 'Bien-être', 'Mode'],
        location: ['France', 'Belgique', 'Suisse']
      }
    },
    objectives: {
      primary: 'Augmenter l\'engagement de 25%',
      kpis: [
        { name: 'Taux d\'engagement', target: 8.5, current: 7.2, unit: '%' },
        { name: 'Nouveaux followers', target: 500, current: 234, unit: 'followers' },
        { name: 'Partages', target: 200, current: 156, unit: 'partages' }
      ]
    },
    content: {
      posts: 15,
      emails: 3,
      notifications: 8
    },
    performance: {
      reach: 15420,
      impressions: 45680,
      engagement: 3290,
      clicks: 892,
      conversions: 67,
      newFollowers: 234,
      revenue: 1250.00
    },
    channels: ['Instagram', 'Email', 'Push'],
    createdAt: '2024-01-08'
  },
  {
    id: '2',
    name: 'Acquisition Tech Audience',
    type: 'acquisition',
    description: 'Attirer de nouveaux fans intéressés par la technologie et l\'innovation',
    status: 'active',
    budget: 750.00,
    spent: 445.20,
    startDate: '2024-01-05',
    endDate: '2024-01-25',
    targetAudience: {
      size: 5600,
      criteria: ['Lookalike tech', 'Développeurs', 'Entrepreneurs'],
      demographics: {
        ageRange: '22-35 ans',
        gender: ['Hommes', 'Femmes'],
        interests: ['Tech', 'Innovation', 'Business'],
        location: ['France', 'Canada']
      }
    },
    objectives: {
      primary: 'Acquérir 1000 nouveaux followers qualifiés',
      kpis: [
        { name: 'Nouveaux followers', target: 1000, current: 567, unit: 'followers' },
        { name: 'Coût par acquisition', target: 0.75, current: 0.78, unit: '€' },
        { name: 'Taux de conversion', target: 3.5, current: 2.8, unit: '%' }
      ]
    },
    content: {
      posts: 12,
      emails: 2,
      notifications: 5
    },
    performance: {
      reach: 28900,
      impressions: 67800,
      engagement: 1890,
      clicks: 1456,
      conversions: 89,
      newFollowers: 567,
      revenue: 890.00
    },
    channels: ['LinkedIn', 'Twitter', 'Email'],
    createdAt: '2024-01-03'
  },
  {
    id: '3',
    name: 'Rétention Clients Premium',
    type: 'retention',
    description: 'Fidéliser les clients premium et augmenter leur engagement',
    status: 'completed',
    budget: 300.00,
    spent: 298.75,
    startDate: '2023-12-15',
    endDate: '2024-01-15',
    targetAudience: {
      size: 156,
      criteria: ['Clients premium', 'Achat récent', 'Engagement élevé'],
      demographics: {
        ageRange: '30-50 ans',
        gender: ['Femmes', 'Hommes'],
        interests: ['Formation', 'Business', 'Lifestyle'],
        location: ['France']
      }
    },
    objectives: {
      primary: 'Maintenir 90% de rétention',
      kpis: [
        { name: 'Taux de rétention', target: 90, current: 94, unit: '%' },
        { name: 'Engagement premium', target: 15, current: 18, unit: 'actions/mois' },
        { name: 'Upsell rate', target: 25, current: 32, unit: '%' }
      ]
    },
    content: {
      posts: 8,
      emails: 6,
      notifications: 12
    },
    performance: {
      reach: 156,
      impressions: 1890,
      engagement: 456,
      clicks: 234,
      conversions: 45,
      newFollowers: 12,
      revenue: 2340.00
    },
    channels: ['Email', 'Push', 'SMS'],
    createdAt: '2023-12-10'
  },
  {
    id: '4',
    name: 'Conversion Black Friday',
    type: 'conversion',
    description: 'Maximiser les conversions pendant la période Black Friday',
    status: 'scheduled',
    budget: 1200.00,
    spent: 0,
    startDate: '2024-11-20',
    endDate: '2024-11-30',
    targetAudience: {
      size: 4500,
      criteria: ['Intérêt achat', 'Panier abandonné', 'Fans engagés'],
      demographics: {
        ageRange: '25-45 ans',
        gender: ['Femmes', 'Hommes'],
        interests: ['Shopping', 'Lifestyle', 'Tech'],
        location: ['France', 'Belgique', 'Suisse']
      }
    },
    objectives: {
      primary: 'Générer 50k€ de revenus',
      kpis: [
        { name: 'Revenus', target: 50000, current: 0, unit: '€' },
        { name: 'Taux de conversion', target: 8, current: 0, unit: '%' },
        { name: 'Panier moyen', target: 85, current: 0, unit: '€' }
      ]
    },
    content: {
      posts: 20,
      emails: 8,
      notifications: 15
    },
    performance: {
      reach: 0,
      impressions: 0,
      engagement: 0,
      clicks: 0,
      conversions: 0,
      newFollowers: 0,
      revenue: 0
    },
    channels: ['Instagram', 'Email', 'Push', 'SMS'],
    createdAt: '2024-01-12'
  }
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'active': return 'Active';
      case 'paused': return 'En pause';
      case 'completed': return 'Terminée';
      case 'scheduled': return 'Programmée';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'engagement': return 'bg-blue-100 text-blue-800';
      case 'acquisition': return 'bg-green-100 text-green-800';
      case 'retention': return 'bg-purple-100 text-purple-800';
      case 'conversion': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'engagement': return 'Engagement';
      case 'acquisition': return 'Acquisition';
      case 'retention': return 'Rétention';
      case 'conversion': return 'Conversion';
      default: return type;
    }
  };

  const calculateROI = (revenue: number, spent: number) => {
    return spent > 0 ? (((revenue - spent) / spent) * 100).toFixed(1) : '0.0';
  };

  const calculateProgress = (current: number, target: number) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
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

  // Stats calculations
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.performance.revenue, 0);
  const totalNewFollowers = campaigns.reduce((sum, c) => sum + c.performance.newFollowers, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campagnes</h1>
          <p className="text-gray-600 mt-1">
            Créez et gérez vos campagnes marketing pour engager votre audience
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouvelle campagne
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campagnes Actives</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeCampaigns}</p>
              <p className="text-sm text-green-600 mt-1">En cours</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalBudget)}</p>
              <p className="text-sm text-blue-600 mt-1">Dépensé: {formatCurrency(totalSpent)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Générés</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-green-600 mt-1">ROI: {calculateROI(totalRevenue, totalSpent)}%</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nouveaux Followers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalNewFollowers.toLocaleString()}</p>
              <p className="text-sm text-purple-600 mt-1">Via campagnes</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="active">Active</option>
              <option value="paused">En pause</option>
              <option value="completed">Terminée</option>
              <option value="scheduled">Programmée</option>
            </select>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les types</option>
              <option value="engagement">Engagement</option>
              <option value="acquisition">Acquisition</option>
              <option value="retention">Rétention</option>
              <option value="conversion">Conversion</option>
            </select>
          </div>
          <div>
            <Button variant="outline" className="w-full">
              <FiFilter className="w-4 h-4 mr-2" />
              Filtres avancés
            </Button>
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
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(campaign.type)}`}>
                    {getTypeLabel(campaign.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>🎯 {campaign.targetAudience.size.toLocaleString()} personnes</span>
                  <span>📅 {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                  <span>💰 {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                {campaign.status === 'active' && (
                  <Button size="sm" variant="outline">
                    <FiPause className="w-4 h-4" />
                  </Button>
                )}
                {campaign.status === 'paused' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <FiPlay className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <FiBarChart className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <FiEdit3 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* KPIs Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {campaign.objectives.kpis.map((kpi, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">{kpi.name}</span>
                    <span className="text-xs font-medium text-gray-900">
                      {kpi.current} / {kpi.target} {kpi.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#f01919] h-2 rounded-full" 
                      style={{ width: `${calculateProgress(kpi.current, kpi.target)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {calculateProgress(kpi.current, kpi.target).toFixed(1)}% atteint
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{campaign.performance.reach.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Portée</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{campaign.performance.engagement.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Engagement</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{campaign.performance.clicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Clics</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(campaign.performance.revenue)}</p>
                <p className="text-xs text-gray-500">Revenus</p>
              </div>
            </div>

            {/* Channels */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-1">
                {campaign.channels.map((channel, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedCampaign.name}</h2>
                <Button variant="outline" onClick={() => setSelectedCampaign(null)}>
                  Fermer
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Campaign Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informations générales</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Type:</span> {getTypeLabel(selectedCampaign.type)}</p>
                    <p><span className="font-medium">Statut:</span> {getStatusLabel(selectedCampaign.status)}</p>
                    <p><span className="font-medium">Période:</span> {formatDate(selectedCampaign.startDate)} - {formatDate(selectedCampaign.endDate)}</p>
                    <p><span className="font-medium">Budget:</span> {formatCurrency(selectedCampaign.budget)}</p>
                    <p><span className="font-medium">Dépensé:</span> {formatCurrency(selectedCampaign.spent)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Audience cible</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Taille:</span> {selectedCampaign.targetAudience.size.toLocaleString()} personnes</p>
                    <p><span className="font-medium">Âge:</span> {selectedCampaign.targetAudience.demographics.ageRange}</p>
                    <p><span className="font-medium">Genre:</span> {selectedCampaign.targetAudience.demographics.gender.join(', ')}</p>
                    <p><span className="font-medium">Localisation:</span> {selectedCampaign.targetAudience.demographics.location.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Performance Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Performance détaillée</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedCampaign.performance.impressions.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Impressions</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedCampaign.performance.reach.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Portée</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedCampaign.performance.engagement.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Engagement</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedCampaign.performance.conversions}</p>
                    <p className="text-sm text-gray-500">Conversions</p>
                  </div>
                </div>
              </div>

              {/* Content Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Contenu de la campagne</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-900">{selectedCampaign.content.posts}</p>
                    <p className="text-sm text-blue-600">Posts</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-900">{selectedCampaign.content.emails}</p>
                    <p className="text-sm text-green-600">Emails</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-xl font-bold text-purple-900">{selectedCampaign.content.notifications}</p>
                    <p className="text-sm text-purple-600">Notifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nouvelle campagne</h2>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez créer des campagnes marketing ciblées.
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <FiTarget className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune campagne trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Aucune campagne ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore créé de campagnes.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Créer votre première campagne
            </Button>
          )}
        </div>
      )}
    </div>
  );
}