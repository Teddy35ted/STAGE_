'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { FiDollarSign, FiTrendingUp, FiDownload, FiCalendar, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useSoldeAnimateur } from '../../../hooks/useSoldeAnimateur';

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
    amount: 78.30,
    description: 'Revenus publicitaires',
    date: '2024-01-13',
    status: 'processing'
  },
  {
    id: '4',
    type: 'couris',
    amount: 32.15,
    description: 'Course livrée à Douala',
    date: '2024-01-12',
    status: 'completed'
  },
  {
    id: '5',
    type: 'indirect',
    amount: 89.75,
    description: 'Commission sur vente via votre réseau',
    date: '2024-01-11',
    status: 'completed'
  }
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
  const { solde, loading: soldeLoading } = useSoldeAnimateur();

  const totalEarnings = earningsData.reduce((sum, item) => sum + item.amount, 0);

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Mes Gains</h1>
          <p className="text-gray-600">Suivez vos revenus et gérez vos retraits</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FiDownload className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solde disponible</p>
                <div className="text-2xl font-bold text-gray-900">
                  {soldeLoading ? '...' : `${formatMontant(solde)} FCFA`}
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gains totaux</p>
                <p className="text-2xl font-bold text-gray-900">{totalEarnings.toFixed(2)} FCFA</p>
                <div className="flex items-center mt-1">
                  <FiArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                  <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gains ce mois</p>
                <p className="text-2xl font-bold text-gray-900">281.15 FCFA</p>
                <div className="flex items-center mt-1">
                  <FiArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.2%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiCalendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre de transactions</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <div className="flex items-center mt-1">
                  <FiArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-2.1%</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Historique des gains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earningsData.map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(earning.type)}`}>
                        {getTypeLabel(earning.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{earning.description}</p>
                        <p className="text-sm text-gray-500">{earning.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">+{earning.amount.toFixed(2)} FCFA</p>
                      <p className={`text-sm ${getStatusColor(earning.status)}`}>
                        {getStatusLabel(earning.status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historique des retraits</CardTitle>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Nouveau retrait
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawalHistory.map((withdrawal) => (
                  <div key={withdrawal.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">-{withdrawal.amount.toFixed(2)} FCFA</span>
                      <Badge variant={withdrawal.status === 'completed' ? 'default' : 'secondary'}>
                        {withdrawal.status === 'completed' ? 'Terminé' : 'En attente'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{withdrawal.method}</p>
                      <p>{withdrawal.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
