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
  FiFilter,
  FiDownload,
  FiBarChart,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';

interface EarningsHistory {
  id: string;
  date: string;
  type: 'direct' | 'indirect' | 'couris' | 'ads' | 'withdrawal';
  source: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  details: {
    laala?: string;
    content?: string;
    partner?: string;
    campaign?: string;
  };
  transactionId: string;
}

interface MonthlyStats {
  month: string;
  totalEarnings: number;
  directRevenue: number;
  indirectRevenue: number;
  courisRevenue: number;
  adsRevenue: number;
  withdrawals: number;
  growth: number;
}

const earningsHistoryData: EarningsHistory[] = [
  {
    id: '1',
    date: '2024-01-15T14:30:00Z',
    type: 'direct',
    source: 'Vente Contenu',
    description: 'Guide Complet Nutrition',
    amount: 29.99,
    status: 'completed',
    details: {
      laala: 'Mon Laala Lifestyle',
      content: 'Guide Complet Nutrition'
    },
    transactionId: 'TXN-2024-001'
  },
  {
    id: '2',
    date: '2024-01-15T10:20:00Z',
    type: 'couris',
    source: 'Engagement Contenu',
    description: 'Routine matinale productive',
    amount: 26.70,
    status: 'completed',
    details: {
      laala: 'Mon Laala Lifestyle',
      content: 'Routine matinale productive'
    },
    transactionId: 'CRS-2024-001'
  },
  {
    id: '3',
    date: '2024-01-14T16:45:00Z',
    type: 'indirect',
    source: 'Affiliation',
    description: 'Commission cours yoga',
    amount: 22.50,
    status: 'completed',
    details: {
      partner: 'Sarah Martin',
      content: 'Cours Yoga en Ligne'
    },
    transactionId: 'AFF-2024-001'
  },
  {
    id: '4',
    date: '2024-01-14T12:15:00Z',
    type: 'ads',
    source: 'Publicité',
    description: 'Campagne BioGlow Cosmetics',
    amount: 87.50,
    status: 'completed',
    details: {
      laala: 'Mon Laala Lifestyle',
      campaign: 'Beauté Naturelle Q1'
    },
    transactionId: 'ADS-2024-001'
  },
  {
    id: '5',
    date: '2024-01-13T18:30:00Z',
    type: 'direct',
    source: 'Formation',
    description: 'Formation React Avancé',
    amount: 89.99,
    status: 'completed',
    details: {
      laala: 'Tech & Innovation',
      content: 'Formation React Avancé'
    },
    transactionId: 'TXN-2024-002'
  },
  {
    id: '6',
    date: '2024-01-12T09:00:00Z',
    type: 'withdrawal',
    source: 'Retrait',
    description: 'Retrait vers compte bancaire',
    amount: -250.00,
    status: 'completed',
    details: {},
    transactionId: 'WTH-2024-001'
  },
  {
    id: '7',
    date: '2024-01-11T15:20:00Z',
    type: 'couris',
    source: 'Engagement Contenu',
    description: 'Recette healthy bowl',
    amount: 20.00,
    status: 'completed',
    details: {
      laala: 'Cuisine du Monde',
      content: 'Recette healthy bowl'
    },
    transactionId: 'CRS-2024-002'
  },
  {
    id: '8',
    date: '2024-01-10T11:45:00Z',
    type: 'indirect',
    source: 'Collaboration',
    description: 'Collab Chef Antoine',
    amount: 75.00,
    status: 'completed',
    details: {
      partner: 'Chef Antoine',
      content: 'Recette Collaborative'
    },
    transactionId: 'COL-2024-001'
  },
  {
    id: '9',
    date: '2024-01-09T14:10:00Z',
    type: 'ads',
    source: 'Publicité',
    description: 'Campagne FitGear Pro',
    amount: 42.00,
    status: 'pending',
    details: {
      laala: 'Fitness & Santé',
      campaign: 'Équipement Fitness'
    },
    transactionId: 'ADS-2024-002'
  },
  {
    id: '10',
    date: '2024-01-08T16:30:00Z',
    type: 'direct',
    source: 'Consultation',
    description: 'Session coaching bien-être',
    amount: 75.00,
    status: 'completed',
    details: {
      laala: 'Mon Laala Lifestyle',
      content: 'Consultation 1h'
    },
    transactionId: 'TXN-2024-003'
  }
];

const monthlyStatsData: MonthlyStats[] = [
  {
    month: 'Janvier 2024',
    totalEarnings: 2847.50,
    directRevenue: 1245.80,
    indirectRevenue: 567.30,
    courisRevenue: 456.90,
    adsRevenue: 577.50,
    withdrawals: 500.00,
    growth: 15.8
  },
  {
    month: 'Décembre 2023',
    totalEarnings: 2456.20,
    directRevenue: 1089.40,
    indirectRevenue: 498.60,
    courisRevenue: 389.70,
    adsRevenue: 478.50,
    withdrawals: 750.00,
    growth: 8.3
  },
  {
    month: 'Novembre 2023',
    totalEarnings: 2267.80,
    directRevenue: 967.20,
    indirectRevenue: 445.30,
    courisRevenue: 356.80,
    adsRevenue: 498.50,
    withdrawals: 400.00,
    growth: 12.1
  }
];

export default function EarningsHistoryPage() {
  const [history, setHistory] = useState<EarningsHistory[]>(earningsHistoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredHistory = history
    .filter(item => {
      const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.source.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'bg-blue-100 text-blue-800';
      case 'indirect': return 'bg-purple-100 text-purple-800';
      case 'couris': return 'bg-green-100 text-green-800';
      case 'ads': return 'bg-yellow-100 text-yellow-800';
      case 'withdrawal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'direct': return 'Direct';
      case 'indirect': return 'Indirect';
      case 'couris': return 'Couris';
      case 'ads': return 'Publicité';
      case 'withdrawal': return 'Retrait';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échec';
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalEarnings = filteredHistory
    .filter(item => item.type !== 'withdrawal' && item.status === 'completed')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalWithdrawals = Math.abs(filteredHistory
    .filter(item => item.type === 'withdrawal' && item.status === 'completed')
    .reduce((sum, item) => sum + item.amount, 0));

  const pendingAmount = filteredHistory
    .filter(item => item.status === 'pending')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des Gains</h1>
          <p className="text-gray-600 mt-1">
            Consultez l'historique complet de vos revenus et retraits
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
              <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalEarnings)}</p>
              <p className="text-sm text-green-600 mt-1">Période sélectionnée</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retraits Effectués</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalWithdrawals)}</p>
              <p className="text-sm text-blue-600 mt-1">Montants retirés</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiArrowDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(pendingAmount)}</p>
              <p className="text-sm text-yellow-600 mt-1">À confirmer</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <FiClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredHistory.length}</p>
              <p className="text-sm text-purple-600 mt-1">Total opérations</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiBarChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {monthlyStatsData.map((month, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{month.month}</h3>
                <div className={`flex items-center text-sm ${month.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {month.growth > 0 ? <FiArrowUp className="w-4 h-4 mr-1" /> : <FiArrowDown className="w-4 h-4 mr-1" />}
                  {Math.abs(month.growth)}%
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(month.totalEarnings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Direct:</span>
                  <span className="text-blue-600">{formatCurrency(month.directRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Indirect:</span>
                  <span className="text-purple-600">{formatCurrency(month.indirectRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Couris:</span>
                  <span className="text-green-600">{formatCurrency(month.courisRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Publicité:</span>
                  <span className="text-yellow-600">{formatCurrency(month.adsRevenue)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">Retraits:</span>
                  <span className="text-red-600">-{formatCurrency(month.withdrawals)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Rechercher une transaction..."
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
              <option value="direct">Direct</option>
              <option value="indirect">Indirect</option>
              <option value="couris">Couris</option>
              <option value="ads">Publicité</option>
              <option value="withdrawal">Retrait</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Terminé</option>
              <option value="pending">En attente</option>
              <option value="failed">Échec</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="date">Trier par date</option>
              <option value="amount">Trier par montant</option>
            </select>
          </div>
          <div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? <FiArrowDown className="w-4 h-4 mr-2" /> : <FiArrowUp className="w-4 h-4 mr-2" />}
              {sortOrder === 'desc' ? 'Décroissant' : 'Croissant'}
            </Button>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatDate(item.date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                      {getTypeLabel(item.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.details.laala && <span>📍 {item.details.laala}</span>}
                        {item.details.partner && <span>👤 {item.details.partner}</span>}
                        {item.details.campaign && <span>📢 {item.details.campaign}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.amount >= 0 ? '+' : ''}{formatCurrency(item.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-gray-500 font-mono">
                      {item.transactionId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <FiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Aucune transaction ne correspond à vos critères de recherche.'
              : 'Votre historique de gains apparaîtra ici.'
            }
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTrendingUp className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Résumé de vos gains
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-1">Performance globale</p>
                <ul className="space-y-1">
                  <li>• Revenus totaux: {formatCurrency(totalEarnings)}</li>
                  <li>• Retraits effectués: {formatCurrency(totalWithdrawals)}</li>
                  <li>• Solde disponible: {formatCurrency(totalEarnings - totalWithdrawals)}</li>
                  <li>• Croissance mensuelle: +15.8%</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Sources principales</p>
                <ul className="space-y-1">
                  <li>• Revenus directs: 43.7% du total</li>
                  <li>• Publicités: 20.3% du total</li>
                  <li>• Revenus indirects: 19.9% du total</li>
                  <li>• Couris: 16.1% du total</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}