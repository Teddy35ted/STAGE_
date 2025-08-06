'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiClock, 
  FiTrendingUp, 
  FiDollarSign, 
  FiCalendar,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiFilter,
  FiDownload,
  FiPlay,
  FiPause,
  FiRefreshCw
} from 'react-icons/fi';

interface CourisEarning {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: 'video' | 'image' | 'text' | 'audio';
  laala: string;
  publishedAt: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    watchTime: number; // en minutes
    engagementRate: number;
  };
  earnings: {
    baseRate: number;
    bonusEngagement: number;
    bonusViews: number;
    bonusQuality: number;
    total: number;
  };
  status: 'calculating' | 'confirmed' | 'paid';
  paymentDate?: string;
}

interface CourisStats {
  totalEarnings: number;
  totalContent: number;
  averagePerContent: number;
  bestPerforming: {
    title: string;
    earnings: number;
    views: number;
  };
  monthlyGrowth: number;
}

const courisData: CourisEarning[] = [
  {
    id: '1',
    contentId: 'content_001',
    contentTitle: 'Routine matinale pour être productive',
    contentType: 'video',
    laala: 'Mon Laala Lifestyle',
    publishedAt: '2024-01-15T08:00:00Z',
    metrics: {
      views: 15420,
      likes: 892,
      comments: 156,
      shares: 89,
      watchTime: 8940, // minutes totales
      engagementRate: 7.8
    },
    earnings: {
      baseRate: 12.50,
      bonusEngagement: 3.20,
      bonusViews: 8.90,
      bonusQuality: 2.10,
      total: 26.70
    },
    status: 'confirmed',
    paymentDate: '2024-01-20'
  },
  {
    id: '2',
    contentId: 'content_002',
    contentTitle: 'Recette healthy bowl automne',
    contentType: 'video',
    laala: 'Cuisine du Monde',
    publishedAt: '2024-01-14T12:30:00Z',
    metrics: {
      views: 8950,
      likes: 567,
      comments: 89,
      shares: 45,
      watchTime: 4560,
      engagementRate: 8.2
    },
    earnings: {
      baseRate: 8.90,
      bonusEngagement: 4.10,
      bonusViews: 5.20,
      bonusQuality: 1.80,
      total: 20.00
    },
    status: 'paid',
    paymentDate: '2024-01-18'
  },
  {
    id: '3',
    contentId: 'content_003',
    contentTitle: 'Tips pour améliorer sa productivité',
    contentType: 'text',
    laala: 'Business & Productivité',
    publishedAt: '2024-01-13T16:45:00Z',
    metrics: {
      views: 12340,
      likes: 678,
      comments: 234,
      shares: 123,
      watchTime: 0, // pas applicable pour du texte
      engagementRate: 9.1
    },
    earnings: {
      baseRate: 10.20,
      bonusEngagement: 5.50,
      bonusViews: 7.10,
      bonusQuality: 2.50,
      total: 25.30
    },
    status: 'confirmed'
  },
  {
    id: '4',
    contentId: 'content_004',
    contentTitle: 'Workout HIIT 20 minutes',
    contentType: 'video',
    laala: 'Fitness & Santé',
    publishedAt: '2024-01-12T07:00:00Z',
    metrics: {
      views: 18750,
      likes: 1234,
      comments: 298,
      shares: 156,
      watchTime: 12450,
      engagementRate: 8.9
    },
    earnings: {
      baseRate: 15.60,
      bonusEngagement: 4.80,
      bonusViews: 11.20,
      bonusQuality: 3.40,
      total: 35.00
    },
    status: 'paid',
    paymentDate: '2024-01-17'
  },
  {
    id: '5',
    contentId: 'content_005',
    contentTitle: 'Guide méditation débutant',
    contentType: 'audio',
    laala: 'Bien-être & Méditation',
    publishedAt: '2024-01-11T20:00:00Z',
    metrics: {
      views: 6780,
      likes: 345,
      comments: 67,
      shares: 34,
      watchTime: 3890,
      engagementRate: 6.8
    },
    earnings: {
      baseRate: 6.80,
      bonusEngagement: 2.10,
      bonusViews: 3.90,
      bonusQuality: 1.20,
      total: 14.00
    },
    status: 'calculating'
  },
  {
    id: '6',
    contentId: 'content_006',
    contentTitle: 'Inspiration déco salon cosy',
    contentType: 'image',
    laala: 'Déco & Maison',
    publishedAt: '2024-01-10T14:20:00Z',
    metrics: {
      views: 9870,
      likes: 456,
      comments: 78,
      shares: 67,
      watchTime: 0,
      engagementRate: 6.1
    },
    earnings: {
      baseRate: 7.90,
      bonusEngagement: 1.80,
      bonusViews: 5.60,
      bonusQuality: 1.50,
      total: 16.80
    },
    status: 'confirmed'
  }
];

const courisStats: CourisStats = {
  totalEarnings: 1247.50,
  totalContent: 45,
  averagePerContent: 27.72,
  bestPerforming: {
    title: 'Workout HIIT 20 minutes',
    earnings: 35.00,
    views: 18750
  },
  monthlyGrowth: 15.8
};

export default function CourisPage() {
  const [earnings, setEarnings] = useState<CourisEarning[]>(courisData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const filteredEarnings = earnings.filter(earning => {
    const matchesSearch = earning.contentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         earning.laala.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || earning.contentType === filterType;
    const matchesStatus = filterStatus === 'all' || earning.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'image': return 'bg-blue-100 text-blue-800';
      case 'text': return 'bg-green-100 text-green-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Vidéo';
      case 'image': return 'Image';
      case 'text': return 'Texte';
      case 'audio': return 'Audio';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'calculating': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'calculating': return 'En calcul';
      case 'confirmed': return 'Confirmé';
      case 'paid': return 'Payé';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'calculating': return <FiRefreshCw className="w-4 h-4" />;
      case 'confirmed': return <FiClock className="w-4 h-4" />;
      case 'paid': return <FiDollarSign className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const totalEarnings = filteredEarnings.reduce((sum, e) => sum + e.earnings.total, 0);
  const totalViews = filteredEarnings.reduce((sum, e) => sum + e.metrics.views, 0);
  const averageEngagement = filteredEarnings.length > 0 
    ? filteredEarnings.reduce((sum, e) => sum + e.metrics.engagementRate, 0) / filteredEarnings.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Couris</h1>
          <p className="text-gray-600 mt-1">
            Revenus générés par l'engagement et la qualité de vos contenus
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
              <p className="text-sm font-medium text-gray-600">Couris Totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalEarnings)}</p>
              <p className="text-sm text-green-600 mt-1">+{courisStats.monthlyGrowth}% ce mois</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contenus Rémunérés</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredEarnings.length}</p>
              <p className="text-sm text-blue-600 mt-1">Ce mois</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vues Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-purple-600 mt-1">Portée globale</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiEye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{averageEngagement.toFixed(1)}%</p>
              <p className="text-sm text-green-600 mt-1">Taux global</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiHeart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Best Performing Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenu le plus rentable</h2>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div>
            <h3 className="font-medium text-gray-900">{courisStats.bestPerforming.title}</h3>
            <p className="text-sm text-gray-600">{courisStats.bestPerforming.views.toLocaleString()} vues</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#f01919]">{formatCurrency(courisStats.bestPerforming.earnings)}</p>
            <p className="text-sm text-gray-600">Couris générés</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Rechercher un contenu..."
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
              <option value="video">Vidéo</option>
              <option value="image">Image</option>
              <option value="text">Texte</option>
              <option value="audio">Audio</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="calculating">En calcul</option>
              <option value="confirmed">Confirmé</option>
              <option value="paid">Payé</option>
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

      {/* Earnings List */}
      <div className="space-y-4">
        {filteredEarnings.map((earning) => (
          <div key={earning.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{earning.contentTitle}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(earning.contentType)}`}>
                    {getTypeLabel(earning.contentType)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(earning.status)}`}>
                    {getStatusIcon(earning.status)}
                    <span className="ml-1">{getStatusLabel(earning.status)}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📍 {earning.laala}</span>
                  <span>📅 {formatDate(earning.publishedAt)}</span>
                  {earning.paymentDate && (
                    <span>💰 Payé le {formatDate(earning.paymentDate)}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(earning.earnings.total)}</p>
                <p className="text-sm text-gray-500">Couris total</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiEye className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{earning.metrics.views.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">Vues</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiHeart className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{earning.metrics.likes}</span>
                </div>
                <p className="text-xs text-gray-500">Likes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiMessageCircle className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{earning.metrics.comments}</span>
                </div>
                <p className="text-xs text-gray-500">Commentaires</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiTrendingUp className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{earning.metrics.engagementRate.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-500">Engagement</p>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-900">{formatCurrency(earning.earnings.baseRate)}</p>
                <p className="text-xs text-blue-600">Taux de base</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-900">{formatCurrency(earning.earnings.bonusEngagement)}</p>
                <p className="text-xs text-green-600">Bonus engagement</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-900">{formatCurrency(earning.earnings.bonusViews)}</p>
                <p className="text-xs text-purple-600">Bonus vues</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-900">{formatCurrency(earning.earnings.bonusQuality)}</p>
                <p className="text-xs text-yellow-600">Bonus qualité</p>
              </div>
            </div>

            {/* Watch Time for videos */}
            {earning.contentType === 'video' && earning.metrics.watchTime > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-700">Temps de visionnage total</span>
                  <span className="font-medium text-red-900">{formatDuration(earning.metrics.watchTime)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredEarnings.length === 0 && (
        <div className="text-center py-12">
          <FiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun couris trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Aucun couris ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore généré de couris.'
            }
          </p>
        </div>
      )}

      {/* How Couris Work */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiClock className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Comment fonctionnent les Couris ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-1">Calcul des revenus</p>
                <ul className="space-y-1">
                  <li>• <strong>Taux de base:</strong> Selon le type de contenu</li>
                  <li>• <strong>Bonus engagement:</strong> Basé sur les interactions</li>
                  <li>• <strong>Bonus vues:</strong> Selon la portée atteinte</li>
                  <li>• <strong>Bonus qualité:</strong> Évaluation algorithmique</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Optimisation</p>
                <ul className="space-y-1">
                  <li>• Publiez régulièrement du contenu de qualité</li>
                  <li>• Encouragez l'engagement de votre audience</li>
                  <li>• Variez les types de contenu</li>
                  <li>• Analysez vos meilleures performances</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}