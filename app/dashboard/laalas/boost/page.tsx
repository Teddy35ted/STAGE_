'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiZap, 
  FiTrendingUp, 
  FiTarget, 
  FiDollarSign,
  FiEye,
  FiHeart,
  FiUsers,
  FiCalendar,
  FiPlay,
  FiPause,
  FiBarChart,
  FiSettings
} from 'react-icons/fi';

interface BoostCampaign {
  id: string;
  name: string;
  laala: string;
  content: string;
  budget: number;
  spent: number;
  duration: number; // en jours
  status: 'active' | 'paused' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  targetAudience: string;
  objectives: string[];
  metrics: {
    impressions: number;
    clicks: number;
    engagement: number;
    newFollowers: number;
  };
}

const boostCampaigns: BoostCampaign[] = [
  {
    id: '1',
    name: 'Boost Routine Matinale',
    laala: 'Mon Laala Lifestyle',
    content: 'Les 5 habitudes matinales qui changent la vie',
    budget: 50.00,
    spent: 32.50,
    duration: 7,
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    targetAudience: 'Femmes 25-40 ans intéressées par le bien-être',
    objectives: ['Augmenter la portée', 'Gagner des followers'],
    metrics: {
      impressions: 15420,
      clicks: 892,
      engagement: 156,
      newFollowers: 23
    }
  },
  {
    id: '2',
    name: 'Promo Tutoriel React',
    laala: 'Tech & Innovation',
    content: 'Tutoriel React avancé - Hooks personnalisés',
    budget: 75.00,
    spent: 75.00,
    duration: 5,
    status: 'completed',
    startDate: '2024-01-08',
    endDate: '2024-01-13',
    targetAudience: 'Développeurs JavaScript 20-35 ans',
    objectives: ['Augmenter les vues', 'Générer du trafic'],
    metrics: {
      impressions: 8950,
      clicks: 567,
      engagement: 89,
      newFollowers: 45
    }
  },
  {
    id: '3',
    name: 'Boost Recette Hiver',
    laala: 'Cuisine du Monde',
    content: 'Soupe réconfortante aux légumes de saison',
    budget: 30.00,
    spent: 0,
    duration: 3,
    status: 'draft',
    startDate: '2024-01-25',
    endDate: '2024-01-28',
    targetAudience: 'Passionnés de cuisine 30-50 ans',
    objectives: ['Augmenter l\'engagement'],
    metrics: {
      impressions: 0,
      clicks: 0,
      engagement: 0,
      newFollowers: 0
    }
  }
];

const boostPackages = [
  {
    name: 'Boost Starter',
    price: 25,
    duration: 3,
    features: [
      'Portée augmentée de 300%',
      'Ciblage géographique',
      'Statistiques de base',
      'Support par email'
    ],
    recommended: false
  },
  {
    name: 'Boost Pro',
    price: 50,
    duration: 7,
    features: [
      'Portée augmentée de 500%',
      'Ciblage avancé (âge, intérêts)',
      'Statistiques détaillées',
      'A/B testing',
      'Support prioritaire'
    ],
    recommended: true
  },
  {
    name: 'Boost Premium',
    price: 100,
    duration: 14,
    features: [
      'Portée augmentée de 800%',
      'Ciblage ultra-précis',
      'Analytics avancés',
      'Optimisation automatique',
      'Manager dédié',
      'Rapport personnalisé'
    ],
    recommended: false
  }
];

export default function BoostPage() {
  const [campaigns, setCampaigns] = useState<BoostCampaign[]>(boostCampaigns);
  const [selectedTab, setSelectedTab] = useState<'campaigns' | 'packages'>('campaigns');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredCampaigns = campaigns.filter(campaign => {
    return filterStatus === 'all' || campaign.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'paused': return 'En pause';
      case 'completed': return 'Terminé';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
  };

  const calculateCPC = (spent: number, clicks: number) => {
    return clicks > 0 ? (spent / clicks).toFixed(2) : '0.00';
  };

  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0);
  const totalNewFollowers = campaigns.reduce((sum, c) => sum + c.metrics.newFollowers, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booster</h1>
          <p className="text-gray-600 mt-1">
            Amplifiez la portée de vos contenus avec nos outils de boost
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiZap className="w-4 h-4 mr-2" />
          Créer un boost
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setSelectedTab('campaigns')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            selectedTab === 'campaigns'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Mes Campagnes
        </button>
        <button
          onClick={() => setSelectedTab('packages')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            selectedTab === 'packages'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Packages Boost
        </button>
      </div>

      {selectedTab === 'campaigns' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget Total Dépensé</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalSpent.toFixed(2)} FCFA</p>
                </div>
                <div className="p-3 rounded-lg bg-[#f01919]">
                  <FiDollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Impressions Totales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalImpressions.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <FiEye className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clics Totaux</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalClicks.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">CTR: {calculateCTR(totalClicks, totalImpressions)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500">
                  <FiTarget className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nouveaux Followers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalNewFollowers}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="paused">En pause</option>
                <option value="completed">Terminé</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{campaign.content}</p>
                    <p className="text-xs text-gray-500">Laala: {campaign.laala}</p>
                  </div>
                  <div className="flex space-x-2">
                    {campaign.status === 'active' && (
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
                    <Button size="sm" variant="outline">
                      <FiBarChart className="w-4 h-4 mr-1" />
                      Stats
                    </Button>
                    <Button size="sm" variant="outline">
                      <FiSettings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Budget</p>
                    <p className="text-sm font-medium text-gray-900">
                      {campaign.spent.toFixed(2)} € / {campaign.budget.toFixed(2)} €
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-[#f01919] h-2 rounded-full" 
                        style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Impressions</p>
                    <p className="text-sm font-medium text-gray-900">
                      {campaign.metrics.impressions.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Clics (CTR)</p>
                    <p className="text-sm font-medium text-gray-900">
                      {campaign.metrics.clicks} ({calculateCTR(campaign.metrics.clicks, campaign.metrics.impressions)}%)
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Nouveaux Followers</p>
                    <p className="text-sm font-medium text-gray-900">
                      +{campaign.metrics.newFollowers}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      {new Date(campaign.startDate).toLocaleDateString('fr-FR')} - {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center">
                      <FiTarget className="w-4 h-4 mr-1" />
                      {campaign.targetAudience}
                    </div>
                  </div>
                  <div className="text-xs">
                    CPC: {calculateCPC(campaign.spent, campaign.metrics.clicks)} €
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <FiZap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune campagne de boost</h3>
              <p className="text-gray-600 mb-4">
                Créez votre première campagne pour amplifier la portée de vos contenus.
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-[#f01919] hover:bg-[#d01515] text-white"
              >
                <FiZap className="w-4 h-4 mr-2" />
                Créer votre premier boost
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Packages Tab */
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre package de boost</h2>
            <p className="text-gray-600">
              Amplifiez la portée de vos contenus avec nos packages optimisés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boostPackages.map((pkg, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-lg shadow-sm border-2 p-6 ${
                  pkg.recommended
                    ? 'border-[#f01919] ring-2 ring-[#f01919] ring-opacity-20'
                    : 'border-gray-200'
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#f01919] text-white px-3 py-1 text-xs font-medium rounded-full">
                      Recommandé
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-3xl font-bold text-[#f01919]">{pkg.price} €</span>
                    <span className="text-gray-600">/ {pkg.duration} jours</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <FiZap className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    pkg.recommended
                      ? 'bg-[#f01919] hover:bg-[#d01515] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Choisir ce package
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <FiTrendingUp className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Optimisez vos résultats
                </h3>
                <p className="text-blue-700 mb-4">
                  Nos algorithmes analysent votre audience pour maximiser l'impact de vos boosts. 
                  Plus vous utilisez nos services, plus les résultats s'améliorent.
                </p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Ciblage automatique basé sur vos followers existants</li>
                  <li>• Optimisation en temps réel des performances</li>
                  <li>• Rapports détaillés avec recommandations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Créer une campagne de boost</h2>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez booster vos contenus pour augmenter leur portée.
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
    </div>
  );
}