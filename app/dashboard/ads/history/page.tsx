'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiClock, 
  FiCheck, 
  FiX, 
  FiEye,
  FiDownload,
  FiBarChart,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiTrendingUp,
  FiFilter,
  FiRefreshCw,
  FiArchive
} from 'react-icons/fi';

interface HistoricalAd {
  id: string;
  name: string;
  advertiser: string;
  type: 'display' | 'video' | 'sponsored_post' | 'story' | 'newsletter';
  status: 'completed' | 'cancelled' | 'expired';
  duration: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  budget: {
    allocated: number;
    spent: number;
    efficiency: number; // spent/allocated ratio
  };
  finalPerformance: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    cpa: number;
    revenue: number;
    roi: number;
  };
  targeting: {
    audience: string;
    reach: number;
    demographics: string[];
  };
  content: {
    title: string;
    description: string;
    deliverables: {
      planned: number;
      delivered: number;
    };
  };
  rating: {
    advertiserRating: number;
    creatorRating: number;
    overallSatisfaction: number;
  };
  completedAt: string;
  archiveDate: string;
  notes?: string;
}

const historicalAdsData: HistoricalAd[] = [
  {
    id: '1',
    name: 'Campagne BioGlow Automne 2023',
    advertiser: 'BioGlow Cosmetics',
    type: 'sponsored_post',
    status: 'completed',
    duration: {
      startDate: '2023-10-01',
      endDate: '2023-11-30',
      totalDays: 60
    },
    budget: {
      allocated: 3000,
      spent: 2850,
      efficiency: 95.0
    },
    finalPerformance: {
      impressions: 185000,
      clicks: 5550,
      ctr: 3.0,
      conversions: 156,
      cpa: 18.27,
      revenue: 2850,
      roi: 245.6
    },
    targeting: {
      audience: 'Femmes intéressées par la beauté bio',
      reach: 67000,
      demographics: ['Femmes', '25-45 ans', 'France']
    },
    content: {
      title: 'Collection Automne Bio',
      description: 'Promotion de la nouvelle gamme cosmétiques bio pour l\'automne',
      deliverables: {
        planned: 12,
        delivered: 12
      }
    },
    rating: {
      advertiserRating: 4.8,
      creatorRating: 4.6,
      overallSatisfaction: 4.7
    },
    completedAt: '2023-11-30T23:59:00Z',
    archiveDate: '2023-12-07T10:00:00Z',
    notes: 'Excellente collaboration, résultats dépassant les attentes'
  },
  {
    id: '2',
    name: 'FitGear Summer Challenge',
    advertiser: 'FitGear Pro',
    type: 'video',
    status: 'completed',
    duration: {
      startDate: '2023-06-15',
      endDate: '2023-08-15',
      totalDays: 61
    },
    budget: {
      allocated: 2200,
      spent: 2200,
      efficiency: 100.0
    },
    finalPerformance: {
      impressions: 125000,
      clicks: 3750,
      ctr: 3.0,
      conversions: 89,
      cpa: 24.72,
      revenue: 2200,
      roi: 189.3
    },
    targeting: {
      audience: 'Passionnés de fitness été',
      reach: 45000,
      demographics: ['Hommes et Femmes', '18-40 ans', 'France']
    },
    content: {
      title: 'Défi Fitness Été',
      description: 'Challenge fitness avec équipements FitGear',
      deliverables: {
        planned: 8,
        delivered: 8
      }
    },
    rating: {
      advertiserRating: 4.5,
      creatorRating: 4.3,
      overallSatisfaction: 4.4
    },
    completedAt: '2023-08-15T23:59:00Z',
    archiveDate: '2023-08-22T14:30:00Z'
  },
  {
    id: '3',
    name: 'TechStart Bootcamp Promo',
    advertiser: 'TechStart Academy',
    type: 'newsletter',
    status: 'cancelled',
    duration: {
      startDate: '2023-09-01',
      endDate: '2023-09-15',
      totalDays: 14
    },
    budget: {
      allocated: 800,
      spent: 320,
      efficiency: 40.0
    },
    finalPerformance: {
      impressions: 25000,
      clicks: 750,
      ctr: 3.0,
      conversions: 12,
      cpa: 26.67,
      revenue: 320,
      roi: 87.5
    },
    targeting: {
      audience: 'Développeurs débutants',
      reach: 18000,
      demographics: ['Hommes et Femmes', '20-35 ans', 'France']
    },
    content: {
      title: 'Bootcamp Développement Web',
      description: 'Formation intensive développement web',
      deliverables: {
        planned: 6,
        delivered: 2
      }
    },
    rating: {
      advertiserRating: 2.8,
      creatorRating: 3.2,
      overallSatisfaction: 3.0
    },
    completedAt: '2023-09-15T12:00:00Z',
    archiveDate: '2023-09-20T09:15:00Z',
    notes: 'Campagne interrompue en raison de changements stratégiques de l\'annonceur'
  },
  {
    id: '4',
    name: 'EcoHome Hiver Solutions',
    advertiser: 'EcoHome Solutions',
    type: 'display',
    status: 'completed',
    duration: {
      startDate: '2023-12-01',
      endDate: '2024-01-31',
      totalDays: 61
    },
    budget: {
      allocated: 1500,
      spent: 1425,
      efficiency: 95.0
    },
    finalPerformance: {
      impressions: 95000,
      clicks: 2850,
      ctr: 3.0,
      conversions: 67,
      cpa: 21.27,
      revenue: 1425,
      roi: 156.8
    },
    targeting: {
      audience: 'Propriétaires éco-responsables hiver',
      reach: 38000,
      demographics: ['Hommes et Femmes', '30-55 ans', 'France']
    },
    content: {
      title: 'Solutions Écologiques Hiver',
      description: 'Isolation et chauffage écologique pour l\'hiver',
      deliverables: {
        planned: 10,
        delivered: 10
      }
    },
    rating: {
      advertiserRating: 4.6,
      creatorRating: 4.4,
      overallSatisfaction: 4.5
    },
    completedAt: '2024-01-31T23:59:00Z',
    archiveDate: '2024-02-05T11:20:00Z'
  },
  {
    id: '5',
    name: 'HealthyFood Spring Campaign',
    advertiser: 'HealthyFood Co',
    type: 'story',
    status: 'expired',
    duration: {
      startDate: '2023-03-15',
      endDate: '2023-04-15',
      totalDays: 31
    },
    budget: {
      allocated: 1200,
      spent: 960,
      efficiency: 80.0
    },
    finalPerformance: {
      impressions: 78000,
      clicks: 2340,
      ctr: 3.0,
      conversions: 45,
      cpa: 21.33,
      revenue: 960,
      roi: 134.4
    },
    targeting: {
      audience: 'Amateurs de cuisine saine',
      reach: 32000,
      demographics: ['Femmes', '25-50 ans', 'France']
    },
    content: {
      title: 'Recettes Printemps Healthy',
      description: 'Recettes saines et de saison pour le printemps',
      deliverables: {
        planned: 15,
        delivered: 12
      }
    },
    rating: {
      advertiserRating: 4.2,
      creatorRating: 4.0,
      overallSatisfaction: 4.1
    },
    completedAt: '2023-04-15T23:59:00Z',
    archiveDate: '2023-04-20T16:45:00Z',
    notes: 'Campagne expirée, quelques livrables non terminés'
  }
];

export default function AdsHistoryPage() {
  const [ads, setAds] = useState<HistoricalAd[]>(historicalAdsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'completedAt' | 'revenue' | 'roi' | 'rating'>('completedAt');
  const [selectedAd, setSelectedAd] = useState<HistoricalAd | null>(null);

  const filteredAds = ads
    .filter(ad => {
      const matchesSearch = ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ad.advertiser.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || ad.status === filterStatus;
      const matchesType = filterType === 'all' || ad.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'completedAt') {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      } else if (sortBy === 'revenue') {
        return b.finalPerformance.revenue - a.finalPerformance.revenue;
      } else if (sortBy === 'roi') {
        return b.finalPerformance.roi - a.finalPerformance.roi;
      } else {
        return b.rating.overallSatisfaction - a.rating.overallSatisfaction;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      case 'expired': return 'Expirée';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheck className="w-4 h-4" />;
      case 'cancelled': return <FiX className="w-4 h-4" />;
      case 'expired': return <FiClock className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
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

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-gray-300">☆</span>);
    }
    return stars;
  };

  // Stats calculations
  const completedAds = ads.filter(ad => ad.status === 'completed').length;
  const totalRevenue = ads.reduce((sum, ad) => sum + ad.finalPerformance.revenue, 0);
  const averageROI = ads.reduce((sum, ad) => sum + ad.finalPerformance.roi, 0) / ads.length;
  const averageRating = ads.reduce((sum, ad) => sum + ad.rating.overallSatisfaction, 0) / ads.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des Publicités</h1>
          <p className="text-gray-600 mt-1">
            Consultez les performances de vos campagnes publicitaires pass��es
          </p>
        </div>
        <Button variant="outline">
          <FiDownload className="w-4 h-4 mr-2" />
          Exporter l'historique
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campagnes Terminées</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{completedAds}</p>
              <p className="text-sm text-green-600 mt-1">Avec succès</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-green-600 mt-1">Historique complet</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI Moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{averageROI.toFixed(1)}%</p>
              <p className="text-sm text-blue-600 mt-1">Performance globale</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{averageRating.toFixed(1)}/5</p>
              <p className="text-sm text-purple-600 mt-1">Satisfaction client</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
              <option value="expired">Expirée</option>
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
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="completedAt">Plus récentes</option>
              <option value="revenue">Plus rentables</option>
              <option value="roi">Meilleur ROI</option>
              <option value="rating">Mieux notées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ads History List */}
      <div className="space-y-6">
        {filteredAds.map((ad) => (
          <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{ad.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ad.status)}`}>
                    {getStatusIcon(ad.status)}
                    <span className="ml-1">{getStatusLabel(ad.status)}</span>
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(ad.type)}`}>
                    {getTypeLabel(ad.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{ad.content.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>🏢 {ad.advertiser}</span>
                  <span>📅 {formatDate(ad.duration.startDate)} - {formatDate(ad.duration.endDate)}</span>
                  <span>⏱️ {ad.duration.totalDays} jours</span>
                  <span>👥 {ad.targeting.reach.toLocaleString()} personnes atteintes</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(ad.finalPerformance.revenue)}</p>
                <p className="text-sm text-gray-500">Revenus générés</p>
                <p className="text-xs text-green-600">ROI: {ad.finalPerformance.roi.toFixed(1)}%</p>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{ad.finalPerformance.impressions.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Impressions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{ad.finalPerformance.clicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Clics</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{ad.finalPerformance.ctr.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">CTR</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{ad.finalPerformance.conversions}</p>
                <p className="text-xs text-gray-500">Conversions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(ad.finalPerformance.cpa)}</p>
                <p className="text-xs text-gray-500">CPA</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{ad.budget.efficiency.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Efficacité budget</p>
              </div>
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">Note Annonceur</p>
                <div className="flex justify-center items-center space-x-1">
                  {renderStars(ad.rating.advertiserRating)}
                  <span className={`ml-2 text-sm font-medium ${getRatingColor(ad.rating.advertiserRating)}`}>
                    {ad.rating.advertiserRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">Note Créateur</p>
                <div className="flex justify-center items-center space-x-1">
                  {renderStars(ad.rating.creatorRating)}
                  <span className={`ml-2 text-sm font-medium ${getRatingColor(ad.rating.creatorRating)}`}>
                    {ad.rating.creatorRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">Satisfaction Globale</p>
                <div className="flex justify-center items-center space-x-1">
                  {renderStars(ad.rating.overallSatisfaction)}
                  <span className={`ml-2 text-sm font-medium ${getRatingColor(ad.rating.overallSatisfaction)}`}>
                    {ad.rating.overallSatisfaction.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deliverables */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Livrables</span>
                <span className="text-sm text-gray-600">
                  {ad.content.deliverables.delivered} / {ad.content.deliverables.planned}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    ad.content.deliverables.delivered === ad.content.deliverables.planned 
                      ? 'bg-green-500' 
                      : 'bg-yellow-500'
                  }`}
                  style={{ width: `${(ad.content.deliverables.delivered / ad.content.deliverables.planned) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Notes */}
            {ad.notes && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Notes:</strong> {ad.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedAd(ad)}
                >
                  <FiEye className="w-4 h-4 mr-1" />
                  Voir détails
                </Button>
                <Button size="sm" variant="outline">
                  <FiBarChart className="w-4 h-4 mr-1" />
                  Rapport complet
                </Button>
                <Button size="sm" variant="outline">
                  <FiDownload className="w-4 h-4 mr-1" />
                  Exporter
                </Button>
                <Button size="sm" variant="outline">
                  <FiArchive className="w-4 h-4 mr-1" />
                  Archiver
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Archivé le {formatDate(ad.archiveDate)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Détails - {selectedAd.name}</h2>
                <Button variant="outline" onClick={() => setSelectedAd(null)}>
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
                    <p><span className="font-medium">Annonceur:</span> {selectedAd.advertiser}</p>
                    <p><span className="font-medium">Type:</span> {getTypeLabel(selectedAd.type)}</p>
                    <p><span className="font-medium">Statut:</span> {getStatusLabel(selectedAd.status)}</p>
                    <p><span className="font-medium">Durée:</span> {selectedAd.duration.totalDays} jours</p>
                    <p><span className="font-medium">Terminé le:</span> {formatDate(selectedAd.completedAt)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Budget et performance</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Budget alloué:</span> {formatCurrency(selectedAd.budget.allocated)}</p>
                    <p><span className="font-medium">Budget dépensé:</span> {formatCurrency(selectedAd.budget.spent)}</p>
                    <p><span className="font-medium">Efficacité:</span> {selectedAd.budget.efficiency.toFixed(1)}%</p>
                    <p><span className="font-medium">ROI:</span> {selectedAd.finalPerformance.roi.toFixed(1)}%</p>
                    <p><span className="font-medium">Revenus:</span> {formatCurrency(selectedAd.finalPerformance.revenue)}</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Métriques détaillées</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedAd.finalPerformance.impressions.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Impressions</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedAd.finalPerformance.clicks.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Clics</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedAd.finalPerformance.ctr.toFixed(2)}%</p>
                    <p className="text-sm text-gray-500">CTR</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedAd.finalPerformance.conversions}</p>
                    <p className="text-sm text-gray-500">Conversions</p>
                  </div>
                </div>
              </div>

              {/* Audience Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Audience ciblée</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedAd.targeting.audience}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Portée atteinte</h4>
                    <p className="text-sm text-gray-600">{selectedAd.targeting.reach.toLocaleString()} personnes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredAds.length === 0 && (
        <div className="text-center py-12">
          <FiArchive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publicité dans l'historique</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Aucune publicité ne correspond à vos critères de recherche.'
              : 'Votre historique publicitaire apparaîtra ici une fois vos premières campagnes terminées.'
            }
          </p>
        </div>
      )}

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiBarChart className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Bilan de vos campagnes publicitaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-1">Performance globale</p>
                <ul className="space-y-1">
                  <li>• {completedAds} campagnes terminées avec succès</li>
                  <li>• {formatCurrency(totalRevenue)} de revenus générés</li>
                  <li>• {averageROI.toFixed(1)}% de ROI moyen</li>
                  <li>• {averageRating.toFixed(1)}/5 de satisfaction moyenne</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Points d'amélioration</p>
                <ul className="space-y-1">
                  <li>• Analysez les campagnes les plus performantes</li>
                  <li>• Identifiez les audiences les plus rentables</li>
                  <li>• Optimisez les types de contenu efficaces</li>
                  <li>• Maintenez des relations durables avec les annonceurs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}