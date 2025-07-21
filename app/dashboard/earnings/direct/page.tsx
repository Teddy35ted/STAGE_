'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiEye, 
  FiHeart,
  FiShoppingBag,
  FiUsers,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiBarChart,
  FiFileText
} from 'react-icons/fi';

interface DirectRevenue {
  id: string;
  source: 'content_sale' | 'subscription' | 'course' | 'consultation' | 'product';
  title: string;
  description: string;
  amount: number;
  date: string;
  laala: string;
  buyer: {
    name: string;
    email: string;
    isRecurring: boolean;
  };
  metrics: {
    views: number;
    conversionRate: number;
    refunded: boolean;
  };
  commission: number;
  netAmount: number;
}

interface RevenueStats {
  period: string;
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  topPerformers: {
    content: string;
    revenue: number;
    sales: number;
  }[];
}

const directRevenueData: DirectRevenue[] = [
  {
    id: '1',
    source: 'content_sale',
    title: 'Guide Complet Nutrition',
    description: 'E-book de 50 pages sur la nutrition équilibrée',
    amount: 29.99,
    date: '2024-01-15T14:30:00Z',
    laala: 'Mon Laala Lifestyle',
    buyer: {
      name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      isRecurring: false
    },
    metrics: {
      views: 1250,
      conversionRate: 2.4,
      refunded: false
    },
    commission: 2.99,
    netAmount: 27.00
  },
  {
    id: '2',
    source: 'course',
    title: 'Formation React Avancé',
    description: 'Cours vidéo de 8 heures sur React et ses hooks',
    amount: 89.99,
    date: '2024-01-14T16:20:00Z',
    laala: 'Tech & Innovation',
    buyer: {
      name: 'Thomas Martin',
      email: 'thomas.martin@email.com',
      isRecurring: false
    },
    metrics: {
      views: 890,
      conversionRate: 5.6,
      refunded: false
    },
    commission: 8.99,
    netAmount: 81.00
  },
  {
    id: '3',
    source: 'subscription',
    title: 'Abonnement Premium Lifestyle',
    description: 'Accès mensuel au contenu premium',
    amount: 19.99,
    date: '2024-01-14T10:15:00Z',
    laala: 'Mon Laala Lifestyle',
    buyer: {
      name: 'Sophie Laurent',
      email: 'sophie.laurent@email.com',
      isRecurring: true
    },
    metrics: {
      views: 0,
      conversionRate: 0,
      refunded: false
    },
    commission: 1.99,
    netAmount: 18.00
  },
  {
    id: '4',
    source: 'consultation',
    title: 'Consultation Bien-être 1h',
    description: 'Session personnalisée de coaching bien-être',
    amount: 75.00,
    date: '2024-01-13T15:45:00Z',
    laala: 'Mon Laala Lifestyle',
    buyer: {
      name: 'Julie Moreau',
      email: 'julie.moreau@email.com',
      isRecurring: false
    },
    metrics: {
      views: 0,
      conversionRate: 0,
      refunded: false
    },
    commission: 7.50,
    netAmount: 67.50
  },
  {
    id: '5',
    source: 'product',
    title: 'Kit Ustensiles Cuisine',
    description: 'Set d\'ustensiles recommandés pour la cuisine',
    amount: 45.50,
    date: '2024-01-12T12:30:00Z',
    laala: 'Cuisine du Monde',
    buyer: {
      name: 'Antoine Petit',
      email: 'antoine.petit@email.com',
      isRecurring: false
    },
    metrics: {
      views: 2100,
      conversionRate: 1.8,
      refunded: false
    },
    commission: 4.55,
    netAmount: 40.95
  },
  {
    id: '6',
    source: 'content_sale',
    title: 'Workout Plan HIIT',
    description: 'Programme d\'entraînement HIIT de 4 semaines',
    amount: 24.99,
    date: '2024-01-11T18:20:00Z',
    laala: 'Fitness & Santé',
    buyer: {
      name: 'Camille Dubois',
      email: 'camille.dubois@email.com',
      isRecurring: false
    },
    metrics: {
      views: 1680,
      conversionRate: 3.2,
      refunded: true
    },
    commission: 2.50,
    netAmount: 22.49
  }
];

const monthlyStats: RevenueStats = {
  period: 'Janvier 2024',
  totalRevenue: 2847.50,
  totalSales: 89,
  averageOrderValue: 31.98,
  topPerformers: [
    { content: 'Formation React Avancé', revenue: 539.94, sales: 6 },
    { content: 'Guide Complet Nutrition', revenue: 419.86, sales: 14 },
    { content: 'Consultation Bien-être 1h', revenue: 375.00, sales: 5 },
    { content: 'Abonnement Premium Lifestyle', revenue: 359.82, sales: 18 },
    { content: 'Kit Ustensiles Cuisine', revenue: 273.00, sales: 6 }
  ]
};

export default function DirectRevenuePage() {
  const [revenues, setRevenues] = useState<DirectRevenue[]>(directRevenueData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterLaala, setFilterLaala] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const filteredRevenues = revenues.filter(revenue => {
    const matchesSearch = revenue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         revenue.buyer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = filterSource === 'all' || revenue.source === filterSource;
    const matchesLaala = filterLaala === 'all' || revenue.laala === filterLaala;
    return matchesSearch && matchesSource && matchesLaala;
  });

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'content_sale': return 'bg-blue-100 text-blue-800';
      case 'subscription': return 'bg-green-100 text-green-800';
      case 'course': return 'bg-purple-100 text-purple-800';
      case 'consultation': return 'bg-yellow-100 text-yellow-800';
      case 'product': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'content_sale': return 'Vente Contenu';
      case 'subscription': return 'Abonnement';
      case 'course': return 'Formation';
      case 'consultation': return 'Consultation';
      case 'product': return 'Produit';
      default: return source;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'content_sale': return <FiFileText className="w-4 h-4" />;
      case 'subscription': return <FiUsers className="w-4 h-4" />;
      case 'course': return <FiBarChart className="w-4 h-4" />;
      case 'consultation': return <FiHeart className="w-4 h-4" />;
      case 'product': return <FiShoppingBag className="w-4 h-4" />;
      default: return <FiDollarSign className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const laalas = Array.from(new Set(revenues.map(r => r.laala)));
  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.amount, 0);
  const totalNet = filteredRevenues.reduce((sum, r) => sum + r.netAmount, 0);
  const totalCommission = filteredRevenues.reduce((sum, r) => sum + r.commission, 0);
  const averageOrderValue = filteredRevenues.length > 0 ? totalRevenue / filteredRevenues.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenus Directs</h1>
          <p className="text-gray-600 mt-1">
            Revenus générés par vos contenus publiés sur vos Laalas
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
              <p className="text-sm font-medium text-gray-600">Revenus Bruts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-green-600 mt-1">+12.5% vs mois dernier</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Nets</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalNet)}</p>
              <p className="text-sm text-blue-600 mt-1">Après commissions</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre de Ventes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredRevenues.length}</p>
              <p className="text-sm text-purple-600 mt-1">Transactions</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Panier Moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(averageOrderValue)}</p>
              <p className="text-sm text-green-600 mt-1">Par transaction</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiBarChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenus les plus rentables</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {monthlyStats.topPerformers.map((performer, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(performer.revenue)}</p>
              <p className="text-sm text-gray-600 mb-1">{performer.content}</p>
              <p className="text-xs text-gray-500">{performer.sales} ventes</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Rechercher une vente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Toutes les sources</option>
              <option value="content_sale">Vente Contenu</option>
              <option value="subscription">Abonnement</option>
              <option value="course">Formation</option>
              <option value="consultation">Consultation</option>
              <option value="product">Produit</option>
            </select>
          </div>
          <div>
            <select
              value={filterLaala}
              onChange={(e) => setFilterLaala(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les Laalas</option>
              {laalas.map(laala => (
                <option key={laala} value={laala}>{laala}</option>
              ))}
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contenu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acheteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laala
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRevenues.map((revenue) => (
                <tr key={revenue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${getSourceColor(revenue.source)}`}>
                        {getSourceIcon(revenue.source)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{revenue.title}</p>
                        <p className="text-xs text-gray-500">{revenue.description}</p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSourceColor(revenue.source)}`}>
                            {getSourceLabel(revenue.source)}
                          </span>
                          {revenue.buyer.isRecurring && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 ml-1">
                              Récurrent
                            </span>
                          )}
                          {revenue.metrics.refunded && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 ml-1">
                              Remboursé
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{revenue.buyer.name}</p>
                      <p className="text-xs text-gray-500">{revenue.buyer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(revenue.amount)}</p>
                      <p className="text-xs text-gray-500">
                        Net: {formatCurrency(revenue.netAmount)} (commission: {formatCurrency(revenue.commission)})
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{revenue.laala}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {revenue.metrics.views > 0 ? (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiEye className="w-4 h-4 mr-1" />
                          {revenue.metrics.views.toLocaleString()} vues
                        </div>
                        <div className="text-xs text-gray-500">
                          Conversion: {revenue.metrics.conversionRate}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {formatDate(revenue.date)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRevenues.length === 0 && (
        <div className="text-center py-12">
          <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun revenu direct trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterSource !== 'all' || filterLaala !== 'all'
              ? 'Aucun revenu ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore généré de revenus directs.'
            }
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTrendingUp className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Résumé des revenus directs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-1">Performance globale</p>
                <ul className="space-y-1">
                  <li>• Total des ventes: {formatCurrency(totalRevenue)}</li>
                  <li>• Revenus nets: {formatCurrency(totalNet)}</li>
                  <li>• Commissions: {formatCurrency(totalCommission)}</li>
                  <li>• Panier moyen: {formatCurrency(averageOrderValue)}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Sources principales</p>
                <ul className="space-y-1">
                  <li>• Formations: Source la plus rentable</li>
                  <li>• Contenus: Volume de ventes élevé</li>
                  <li>• Abonnements: Revenus récurrents</li>
                  <li>• Consultations: Valeur unitaire élevée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}