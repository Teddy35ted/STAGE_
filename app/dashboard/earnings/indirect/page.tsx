'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiShare2, 
  FiTrendingUp, 
  FiUsers, 
  FiDollarSign,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiExternalLink,
  FiPercent
} from 'react-icons/fi';

interface IndirectRevenue {
  id: string;
  type: 'affiliate' | 'referral' | 'collaboration' | 'sponsorship';
  title: string;
  description: string;
  partnerLaala: string;
  partnerName: string;
  amount: number;
  commission: number;
  date: string;
  metrics: {
    clicks: number;
    conversions: number;
    conversionRate: number;
    views: number;
  };
  status: 'pending' | 'confirmed' | 'paid';
  contentUrl?: string;
}

interface PartnerStats {
  partner: string;
  totalRevenue: number;
  totalCommissions: number;
  collaborations: number;
  averageCommission: number;
  bestPerforming: string;
}

const indirectRevenueData: IndirectRevenue[] = [
  {
    id: '1',
    type: 'affiliate',
    title: 'Promotion Cours Yoga en Ligne',
    description: 'Promotion du cours de yoga de Sarah Martin via mon contenu lifestyle',
    partnerLaala: 'Yoga & Méditation',
    partnerName: 'Sarah Martin',
    amount: 89.99,
    commission: 22.50,
    date: '2024-01-15T14:30:00Z',
    metrics: {
      clicks: 156,
      conversions: 3,
      conversionRate: 1.9,
      views: 2340
    },
    status: 'confirmed',
    contentUrl: 'https://laala.com/yoga-course'
  },
  {
    id: '2',
    type: 'collaboration',
    title: 'Collaboration Recette Healthy',
    description: 'Création de contenu collaboratif avec Chef Antoine',
    partnerLaala: 'Cuisine Gastronomique',
    partnerName: 'Chef Antoine',
    amount: 150.00,
    commission: 75.00,
    date: '2024-01-14T16:20:00Z',
    metrics: {
      clicks: 89,
      conversions: 5,
      conversionRate: 5.6,
      views: 1890
    },
    status: 'paid',
    contentUrl: 'https://laala.com/healthy-recipe'
  },
  {
    id: '3',
    type: 'referral',
    title: 'Parrainage Formation Business',
    description: 'Recommandation de la formation business de Marc Dupont',
    partnerLaala: 'Business & Entrepreneuriat',
    partnerName: 'Marc Dupont',
    amount: 299.99,
    commission: 45.00,
    date: '2024-01-13T10:15:00Z',
    metrics: {
      clicks: 234,
      conversions: 1,
      conversionRate: 0.4,
      views: 3450
    },
    status: 'confirmed'
  },
  {
    id: '4',
    type: 'sponsorship',
    title: 'Sponsoring Produit Beauté',
    description: 'Présentation des produits de beauté naturels BioGlow',
    partnerLaala: 'Beauté Naturelle',
    partnerName: 'BioGlow',
    amount: 200.00,
    commission: 200.00,
    date: '2024-01-12T15:45:00Z',
    metrics: {
      clicks: 345,
      conversions: 12,
      conversionRate: 3.5,
      views: 4560
    },
    status: 'paid'
  },
  {
    id: '5',
    type: 'affiliate',
    title: 'Promotion Livre Développement Personnel',
    description: 'Recommandation du livre "Mindset Gagnant" de Julie Moreau',
    partnerLaala: 'Développement Personnel',
    partnerName: 'Julie Moreau',
    amount: 24.99,
    commission: 5.00,
    date: '2024-01-11T12:30:00Z',
    metrics: {
      clicks: 67,
      conversions: 8,
      conversionRate: 11.9,
      views: 1230
    },
    status: 'pending'
  },
  {
    id: '6',
    type: 'collaboration',
    title: 'Collab Workout Challenge',
    description: 'Défi fitness collaboratif avec FitCoach Pro',
    partnerLaala: 'Fitness Pro',
    partnerName: 'FitCoach Pro',
    amount: 120.00,
    commission: 60.00,
    date: '2024-01-10T18:20:00Z',
    metrics: {
      clicks: 178,
      conversions: 6,
      conversionRate: 3.4,
      views: 2890
    },
    status: 'confirmed'
  }
];

const partnerStats: PartnerStats[] = [
  {
    partner: 'Sarah Martin',
    totalRevenue: 450.00,
    totalCommissions: 112.50,
    collaborations: 5,
    averageCommission: 22.50,
    bestPerforming: 'Cours Yoga Avancé'
  },
  {
    partner: 'Chef Antoine',
    totalRevenue: 380.00,
    totalCommissions: 190.00,
    collaborations: 3,
    averageCommission: 63.33,
    bestPerforming: 'Recette Healthy'
  },
  {
    partner: 'BioGlow',
    totalRevenue: 600.00,
    totalCommissions: 600.00,
    collaborations: 2,
    averageCommission: 300.00,
    bestPerforming: 'Routine Beauté'
  },
  {
    partner: 'Marc Dupont',
    totalRevenue: 299.99,
    totalCommissions: 45.00,
    collaborations: 1,
    averageCommission: 45.00,
    bestPerforming: 'Formation Business'
  }
];

export default function IndirectRevenuePage() {
  const [revenues, setRevenues] = useState<IndirectRevenue[]>(indirectRevenueData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const filteredRevenues = revenues.filter(revenue => {
    const matchesSearch = revenue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         revenue.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || revenue.type === filterType;
    const matchesStatus = filterStatus === 'all' || revenue.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'affiliate': return 'bg-blue-100 text-blue-800';
      case 'referral': return 'bg-green-100 text-green-800';
      case 'collaboration': return 'bg-purple-100 text-purple-800';
      case 'sponsorship': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'affiliate': return 'Affiliation';
      case 'referral': return 'Parrainage';
      case 'collaboration': return 'Collaboration';
      case 'sponsorship': return 'Sponsoring';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'paid': return 'Payé';
      default: return status;
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

  const totalCommissions = filteredRevenues.reduce((sum, r) => sum + r.commission, 0);
  const totalClicks = filteredRevenues.reduce((sum, r) => sum + r.metrics.clicks, 0);
  const totalConversions = filteredRevenues.reduce((sum, r) => sum + r.metrics.conversions, 0);
  const averageConversionRate = filteredRevenues.length > 0 
    ? filteredRevenues.reduce((sum, r) => sum + r.metrics.conversionRate, 0) / filteredRevenues.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenus Indirects</h1>
          <p className="text-gray-600 mt-1">
            Revenus générés par vos contenus publiés sur les Laalas d'autres créateurs
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
              <p className="text-sm font-medium text-gray-600">Commissions Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCommissions)}</p>
              <p className="text-sm text-green-600 mt-1">+18.3% vs mois dernier</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clics Générés</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalClicks.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">Trafic dirigé</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiExternalLink className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalConversions}</p>
              <p className="text-sm text-purple-600 mt-1">Ventes générées</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Conversion</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{averageConversionRate.toFixed(1)}%</p>
              <p className="text-sm text-green-600 mt-1">Moyenne</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiPercent className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Partners */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Partenaires les plus rentables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerStats.map((partner, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{partner.partner}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {partner.collaborations} collabs
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Commissions:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(partner.totalCommissions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Moyenne:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(partner.averageCommission)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Meilleur: {partner.bestPerforming}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Rechercher une collaboration..."
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
              <option value="affiliate">Affiliation</option>
              <option value="referral">Parrainage</option>
              <option value="collaboration">Collaboration</option>
              <option value="sponsorship">Sponsoring</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
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

      {/* Revenue List */}
      <div className="space-y-4">
        {filteredRevenues.map((revenue) => (
          <div key={revenue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{revenue.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(revenue.type)}`}>
                    {getTypeLabel(revenue.type)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(revenue.status)}`}>
                    {getStatusLabel(revenue.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{revenue.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>👤 {revenue.partnerName}</span>
                  <span>📍 {revenue.partnerLaala}</span>
                  <span>📅 {formatDate(revenue.date)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(revenue.commission)}</p>
                <p className="text-sm text-gray-500">Commission</p>
                <p className="text-xs text-gray-400">sur {formatCurrency(revenue.amount)}</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiEye className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{revenue.metrics.views.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">Vues</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiExternalLink className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{revenue.metrics.clicks}</span>
                </div>
                <p className="text-xs text-gray-500">Clics</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiTrendingUp className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{revenue.metrics.conversions}</span>
                </div>
                <p className="text-xs text-gray-500">Conversions</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiPercent className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{revenue.metrics.conversionRate.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-500">Taux conversion</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                {revenue.contentUrl && (
                  <Button size="sm" variant="outline">
                    <FiExternalLink className="w-4 h-4 mr-1" />
                    Voir contenu
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <FiUsers className="w-4 h-4 mr-1" />
                  Contacter partenaire
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Commission: {((revenue.commission / revenue.amount) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRevenues.length === 0 && (
        <div className="text-center py-12">
          <FiShare2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun revenu indirect trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Aucun revenu ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore généré de revenus indirects.'
            }
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiShare2 className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-purple-900 mb-2">
              Optimisez vos revenus indirects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-700">
              <div>
                <p className="font-medium mb-1">Stratégies efficaces</p>
                <ul className="space-y-1">
                  <li>• Collaborations avec des créateurs complémentaires</li>
                  <li>• Programmes d'affiliation à forte commission</li>
                  <li>• Sponsorings de marques alignées avec vos valeurs</li>
                  <li>• Parrainages de formations de qualité</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Métriques clés</p>
                <ul className="space-y-1">
                  <li>• Taux de conversion moyen: {averageConversionRate.toFixed(1)}%</li>
                  <li>• Commission moyenne: {formatCurrency(totalCommissions / filteredRevenues.length)}</li>
                  <li>• Meilleur partenaire: {partnerStats[0]?.partner}</li>
                  <li>• Type le plus rentable: Sponsoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}