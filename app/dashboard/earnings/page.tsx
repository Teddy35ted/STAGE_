'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiDownload, 
  FiEye, 
  FiCalendar,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';

interface EarningItem {
  id: string;
  type: 'direct' | 'indirect' | 'couris' | 'ads';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'processing';
}

const earningsData: EarningItem[] = [
  {
    id: '1',
    type: 'direct',
    amount: 125.50,
    description: 'Contenu publié sur "Mon Laala Lifestyle"',
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: '2',
    type: 'indirect',
    amount: 45.20,
    description: 'Contenu publié sur le Laala de @marie_style',
    date: '2024-01-14',
    status: 'completed'
  },
  {
    id: '3',
    type: 'ads',
    amount: 200.00,
    description: 'Publicité Nike - Campagne Été 2024',
    date: '2024-01-13',
    status: 'processing'
  },
  {
    id: '4',
    type: 'couris',
    amount: 75.30,
    description: 'Bonus engagement communauté',
    date: '2024-01-12',
    status: 'completed'
  },
];

const withdrawalHistory = [
  {
    id: '1',
    amount: 500.00,
    date: '2024-01-10',
    status: 'completed',
    method: 'Virement bancaire'
  },
  {
    id: '2',
    amount: 300.00,
    date: '2024-01-05',
    status: 'completed',
    method: 'PayPal'
  },
  {
    id: '3',
    amount: 150.00,
    date: '2024-01-01',
    status: 'pending',
    method: 'Virement bancaire'
  },
];

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const totalEarnings = earningsData.reduce((sum, item) => sum + item.amount, 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'bg-green-100 text-green-800';
      case 'indirect': return 'bg-blue-100 text-blue-800';
      case 'ads': return 'bg-purple-100 text-purple-800';
      case 'couris': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'direct': return 'Direct';
      case 'indirect': return 'Indirect';
      case 'ads': return 'Publicité';
      case 'couris': return 'Couris';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Gains</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos revenus et demandes de retrait
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total ce mois</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">2,450 FCFA</p>
              <p className="text-sm text-green-600 mt-1">+12% vs mois dernier</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disponible</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">850 FCFA</p>
              <p className="text-sm text-gray-600 mt-1">Prêt à retirer</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus directs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1,850 FCFA</p>
              <p className="text-sm text-blue-600 mt-1">75% du total</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiArrowUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus indirects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">600 FCFA</p>
              <p className="text-sm text-purple-600 mt-1">25% du total</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiArrowDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Revenus récents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
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
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earningsData.map((earning) => (
                <tr key={earning.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(earning.type)}`}>
                      {getTypeLabel(earning.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{earning.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">+{earning.amount.toFixed(2)} FCFA</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-500">
                      {new Date(earning.date).toLocaleDateString('fr-FR')}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(earning.status)}`}>
                      {getStatusLabel(earning.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des retraits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawalHistory.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">-{withdrawal.amount.toFixed(2)} FCFA</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{withdrawal.method}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-500">
                      {new Date(withdrawal.date).toLocaleDateString('fr-FR')}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(withdrawal.status)}`}>
                      {getStatusLabel(withdrawal.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}