'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiTarget, 
  FiTrendingUp, 
  FiDollarSign, 
  FiEye,
  FiUsers,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiPlay,
  FiPause,
  FiBarChart,
  FiPercent
} from 'react-icons/fi';

interface AdRevenue {
  id: string;
  campaignName: string;
  advertiser: string;
  adType: 'display' | 'video' | 'sponsored_content' | 'affiliate';
  placement: string;
  laala: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  budget: number;
  earnings: number;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number; // Click Through Rate
    cpm: number; // Cost Per Mille
    cpc: number; // Cost Per Click
    conversions: number;
  };
  audienceReach: number;
  engagementRate: number;
}

interface AdStats {
  totalEarnings: number;
  totalCampaigns: number;
  activeCampaigns: number;
  averageCPM: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  topAdvertiser: string;
}

const adRevenueData: AdRevenue[] = [
  {
    id: '1',
    campaignName: 'Campagne Beauté Naturelle Q1',
    advertiser: 'BioGlow Cosmetics',
    adType: 'sponsored_content',
    placement: 'Feed principal',
    laala: 'Mon Laala Lifestyle',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'active',
    budget: 2500.00,
    earnings: 875.00,
    metrics: {
      impressions: 125000,
      clicks: 3750,
      ctr: 3.0,
      cpm: 7.00,
      cpc: 0.23,
      conversions: 89
    },
    audienceReach: 45000,
    engagementRate: 4.2
  },
  {
    id: '2',
    campaignName: 'Promo Équipement Fitness',
    advertiser: 'FitGear Pro',
    adType: 'display',
    placement: 'Sidebar',
    laala: 'Fitness & Santé',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'completed',
    budget: 1200.00,
    earnings: 420.00,
    metrics: {
      impressions: 60000,
      clicks: 1800,
      ctr: 3.0,
      cpm: 7.00,
      cpc: 0.23,
      conversions: 45
    },
    audienceReach: 28000,
    engagementRate: 3.8
  },
  {
    id: '3',
    campaignName: 'Formation Cuisine en Ligne',
    advertiser: 'Chef Academy',
    adType: 'video',
    placement: 'Pre-roll',
    laala: 'Cuisine du Monde',
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    status: 'active',
    budget: 1800.00,
    earnings: 630.00,
    metrics: {
      impressions: 90000,
      clicks: 2700,
      ctr: 3.0,
      cpm: 7.00,
      cpc: 0.23,
      conversions: 67
    },
    audienceReach: 35000,
    engagementRate: 5.1
  },
  {
    id: '4',
    campaignName: 'Livre Développement Personnel',
    advertiser: 'Éditions Mindset',
    adType: 'affiliate',
    placement: 'Contenu intégré',
    laala: 'Business & Productivité',
    startDate: '2024-01-05',
    endDate: '2024-01-20',
    status: 'completed',
    budget: 800.00,
    earnings: 240.00,
    metrics: {
      impressions: 34000,
      clicks: 1020,
      ctr: 3.0,
      cpm: 7.06,
      cpc: 0.24,
      conversions: 28
    },
    audienceReach: 18000,
    engagementRate: 6.2
  },
  {
    id: '5',
    campaignName: 'App Méditation Premium',
    advertiser: 'ZenMind App',
    adType: 'sponsored_content',
    placement: 'Stories',
    laala: 'Bien-être & Méditation',
    startDate: '2024-01-12',
    endDate: '2024-02-12',
    status: 'paused',
    budget: 1500.00,
    earnings: 315.00,
    metrics: {
      impressions: 45000,
      clicks: 1350,
      ctr: 3.0,
      cpm: 7.00,
      cpc: 0.23,
      conversions: 34
    },
    audienceReach: 22000,
    engagementRate: 4.7
  },
  {
    id: '6',
    campaignName: 'Outils Productivité Business',
    advertiser: 'ProductivePro',
    adType: 'display',
    placement: 'Banner top',
    laala: 'Business & Productivité',
    startDate: '2024-01-08',
    endDate: '2024-02-08',
    status: 'active',
    budget: 2000.00,
    earnings: 700.00,
    metrics: {
      impressions: 100000,
      clicks: 3000,
      ctr: 3.0,
      cpm: 7.00,
      cpc: 0.23,
      conversions: 78
    },
    audienceReach: 40000,
    engagementRate: 3.9
  }
];

const adStats: AdStats = {
  totalEarnings: 4250.00,
  totalCampaigns: 12,
  activeCampaigns: 4,
  averageCPM: 7.02,
  totalImpressions: 654000,
  totalClicks: 19620,
  averageCTR: 3.0,
  topAdvertiser: 'BioGlow Cosmetics'
};

export default function AdsEarningsPage() {
  const [revenues, setRevenues] = useState<AdRevenue[]>(adRevenueData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const filteredRevenues = revenues.filter(revenue => {
    const matchesSearch = revenue.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         revenue.advertiser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || revenue.adType === filterType;
    const matchesStatus = filterStatus === 'all' || revenue.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'display': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'sponsored_content': return 'bg-purple-100 text-purple-800';
      case 'affiliate': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'display': return 'Display';
      case 'video': return 'Vidéo';
      case 'sponsored_content': return 'Contenu Sponsorisé';
      case 'affiliate': return 'Affiliation';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Terminée';
      case 'paused': return 'En pause';
      default: return status;
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

  const totalEarnings = filteredRevenues.reduce((sum, r) => sum + r.earnings, 0);
  const totalImpressions = filteredRevenues.reduce((sum, r) => sum + r.metrics.impressions, 0);
  const totalClicks = filteredRevenues.reduce((sum, r) => sum + r.metrics.clicks, 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenus Publicitaires</h1>
          <p className="text-gray-600 mt-1">
            Revenus générés par les campagnes publicitaires sur vos Laalas
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedPeriod === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setSelectedPeriod('quarter')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedPeriod === 'quarter'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedPeriod === 'year'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Année
            </button>
          </div>
          <Button variant="outline">
            <FiDownload className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Publicitaires</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalEarnings)}</p>
              <p className="text-sm text-green-600 mt-1">+22.5% vs mois dernier</p>
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
              <p className="text-sm text-blue-600 mt-1">Portée publicitaire</p>
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
              <p className="text-sm text-purple-600 mt-1">CTR: {averageCTR.toFixed(2)}%</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campagnes Actives</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{adStats.activeCampaigns}</p>
              <p className="text-sm text-green-600 mt-1">En cours</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiBarChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Advertiser */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Annonceur principal</h2>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div>
            <h3 className="font-medium text-gray-900">{adStats.topAdvertiser}</h3>
            <p className="text-sm text-gray-600">Partenaire le plus rentable ce mois</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#f01919]">{formatCurrency(875.00)}</p>
            <p className="text-sm text-gray-600">Revenus générés</p>
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les types</option>
              <option value="display">Display</option>
              <option value="video">Vidéo</option>
              <option value="sponsored_content">Contenu Sponsorisé</option>
              <option value="affiliate">Affiliation</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Active</option>
              <option value="completed">Terminée</option>
              <option value="paused">En pause</option>
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

      {/* Revenue List */}
      <div className="space-y-4">
        {filteredRevenues.map((revenue) => (
          <div key={revenue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{revenue.campaignName}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(revenue.adType)}`}>
                    {getTypeLabel(revenue.adType)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(revenue.status)}`}>
                    {getStatusLabel(revenue.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  <span>🏢 {revenue.advertiser}</span>
                  <span>📍 {revenue.laala}</span>
                  <span>📍 {revenue.placement}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📅 {formatDate(revenue.startDate)} - {formatDate(revenue.endDate)}</span>
                  <span>👥 {revenue.audienceReach.toLocaleString()} personnes atteintes</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.earnings)}</p>
                <p className="text-sm text-gray-500">sur {formatCurrency(revenue.budget)}</p>
                <p className="text-xs text-gray-400">
                  {((revenue.earnings / revenue.budget) * 100).toFixed(1)}% du budget
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiEye className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{revenue.metrics.impressions.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">Impressions</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiTarget className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{revenue.metrics.clicks.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">Clics</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiPercent className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{revenue.metrics.ctr.toFixed(2)}%</span>
                </div>
                <p className="text-xs text-gray-500">CTR</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiDollarSign className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.metrics.cpm)}</span>
                </div>
                <p className="text-xs text-gray-500">CPM</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiTrendingUp className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{revenue.metrics.conversions}</span>
                </div>
                <p className="text-xs text-gray-500">Conversions</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                {revenue.status === 'active' && (
                  <Button size="sm" variant="outline">
                    <FiPause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                )}
                {revenue.status === 'paused' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <FiPlay className="w-4 h-4 mr-1" />
                    Reprendre
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <FiBarChart className="w-4 h-4 mr-1" />
                  Détails
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Engagement: {revenue.engagementRate.toFixed(1)}% • CPC: {formatCurrency(revenue.metrics.cpc)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRevenues.length === 0 && (
        <div className="text-center py-12">
          <FiTarget className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune campagne publicitaire trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Aucune campagne ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore de revenus publicitaires.'
            }
          </p>
        </div>
      )}

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTarget className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-2">
              Performance publicitaire
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
              <div>
                <p className="font-medium mb-1">Métriques clés</p>
                <ul className="space-y-1">
                  <li>• CPM moyen: {formatCurrency(adStats.averageCPM)}</li>
                  <li>• CTR global: {adStats.averageCTR.toFixed(2)}%</li>
                  <li>• Revenus totaux: {formatCurrency(adStats.totalEarnings)}</li>
                  <li>• Campagnes actives: {adStats.activeCampaigns}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Optimisation</p>
                <ul className="space-y-1">
                  <li>• Contenu sponsorisé: Meilleur engagement</li>
                  <li>• Vidéos: CTR le plus élevé</li>
                  <li>• Display: Volume d'impressions important</li>
                  <li>• Affiliation: Conversions qualifiées</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}