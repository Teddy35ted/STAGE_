'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiUsers, 
  FiShoppingBag,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiCalendar,
  FiFilter,
  FiDownload
} from 'react-icons/fi';

interface ProfitableFan {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  lastPurchase: string;
  joinedAt: string;
  lifetimeValue: number;
  engagementScore: number;
  favoriteCategories: string[];
  purchaseHistory: {
    date: string;
    amount: number;
    product: string;
    type: 'content' | 'product' | 'service' | 'boost';
  }[];
  metrics: {
    contentViews: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

const profitableFansData: ProfitableFan[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    totalSpent: 245.80,
    totalOrders: 12,
    averageOrderValue: 20.48,
    lastPurchase: '2024-01-14',
    joinedAt: '2023-08-15',
    lifetimeValue: 320.50,
    engagementScore: 8.7,
    favoriteCategories: ['Lifestyle', 'Cuisine', 'Bien-être'],
    purchaseHistory: [
      { date: '2024-01-14', amount: 29.99, product: 'Guide Nutrition', type: 'content' },
      { date: '2024-01-08', amount: 15.50, product: 'Accessoire Yoga', type: 'product' },
      { date: '2023-12-20', amount: 45.00, product: 'Consultation Bien-être', type: 'service' }
    ],
    metrics: {
      contentViews: 156,
      likes: 89,
      comments: 23,
      shares: 12
    }
  },
  {
    id: '2',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    totalSpent: 189.30,
    totalOrders: 8,
    averageOrderValue: 23.66,
    lastPurchase: '2024-01-12',
    joinedAt: '2023-09-20',
    lifetimeValue: 250.00,
    engagementScore: 9.2,
    favoriteCategories: ['Fitness', 'Nutrition', 'Mode'],
    purchaseHistory: [
      { date: '2024-01-12', amount: 35.00, product: 'Programme Fitness', type: 'content' },
      { date: '2024-01-05', amount: 25.00, product: 'Boost Publication', type: 'boost' },
      { date: '2023-12-15', amount: 18.90, product: 'Complément Alimentaire', type: 'product' }
    ],
    metrics: {
      contentViews: 203,
      likes: 145,
      comments: 34,
      shares: 18
    }
  },
  {
    id: '3',
    name: 'Thomas Martin',
    email: 'thomas.martin@email.com',
    totalSpent: 156.75,
    totalOrders: 6,
    averageOrderValue: 26.13,
    lastPurchase: '2024-01-10',
    joinedAt: '2023-10-05',
    lifetimeValue: 200.00,
    engagementScore: 7.8,
    favoriteCategories: ['Tech', 'Business', 'Formation'],
    purchaseHistory: [
      { date: '2024-01-10', amount: 49.99, product: 'Formation React', type: 'content' },
      { date: '2023-12-28', amount: 30.00, product: 'Consultation Tech', type: 'service' },
      { date: '2023-12-10', amount: 22.50, product: 'E-book JavaScript', type: 'content' }
    ],
    metrics: {
      contentViews: 98,
      likes: 67,
      comments: 15,
      shares: 8
    }
  },
  {
    id: '4',
    name: 'Julie Moreau',
    email: 'julie.moreau@email.com',
    totalSpent: 134.20,
    totalOrders: 9,
    averageOrderValue: 14.91,
    lastPurchase: '2024-01-09',
    joinedAt: '2023-07-12',
    lifetimeValue: 180.00,
    engagementScore: 8.1,
    favoriteCategories: ['Cuisine', 'Voyage', 'Photographie'],
    purchaseHistory: [
      { date: '2024-01-09', amount: 19.99, product: 'Recettes Healthy', type: 'content' },
      { date: '2023-12-22', amount: 12.50, product: 'Preset Lightroom', type: 'product' },
      { date: '2023-12-05', amount: 25.00, product: 'Cours Photo', type: 'service' }
    ],
    metrics: {
      contentViews: 178,
      likes: 92,
      comments: 28,
      shares: 14
    }
  }
];

export default function ProfitableFansPage() {
  const [fans, setFans] = useState<ProfitableFan[]>(profitableFansData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'totalSpent' | 'lifetimeValue' | 'engagementScore'>('totalSpent');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [selectedFan, setSelectedFan] = useState<ProfitableFan | null>(null);

  const filteredAndSortedFans = fans
    .filter(fan => {
      const matchesSearch = fan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fan.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const lastPurchaseDate = new Date(fan.lastPurchase);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - lastPurchaseDate.getTime()) / (1000 * 3600 * 24));
        
        switch (filterPeriod) {
          case '7days':
            matchesPeriod = daysDiff <= 7;
            break;
          case '30days':
            matchesPeriod = daysDiff <= 30;
            break;
          case '90days':
            matchesPeriod = daysDiff <= 90;
            break;
        }
      }
      
      return matchesSearch && matchesPeriod;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const totalRevenue = fans.reduce((sum, fan) => sum + fan.totalSpent, 0);
  const totalOrders = fans.reduce((sum, fan) => sum + fan.totalOrders, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const averageLifetimeValue = fans.reduce((sum, fan) => sum + fan.lifetimeValue, 0) / fans.length;

  const getEngagementColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activité Rentable</h1>
          <p className="text-gray-600 mt-1">
            Analysez vos fans les plus rentables et leur comportement d'achat
          </p>
        </div>
        <Button className="bg-[#f01919] hover:bg-[#d01515] text-white">
          <FiDownload className="w-4 h-4 mr-2" />
          Exporter les données
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
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
              <p className="text-sm font-medium text-gray-600">Commandes Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
              <p className="text-sm text-blue-600 mt-1">Panier moyen: {formatCurrency(averageOrderValue)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">LTV Moyenne</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(averageLifetimeValue)}</p>
              <p className="text-sm text-purple-600 mt-1">Lifetime Value</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fans Rentables</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fans.length}</p>
              <p className="text-sm text-green-600 mt-1">Top performers</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
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
              placeholder="Rechercher un fan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="totalSpent">Trier par dépenses</option>
              <option value="lifetimeValue">Trier par LTV</option>
              <option value="engagementScore">Trier par engagement</option>
            </select>
          </div>
          <div>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Toutes les périodes</option>
              <option value="7days">7 derniers jours</option>
              <option value="30days">30 derniers jours</option>
              <option value="90days">90 derniers jours</option>
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

      {/* Fans List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dépenses Totales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commandes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LTV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier Achat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedFans.map((fan, index) => (
                <tr key={fan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#f01919] rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-medium text-sm">
                          {fan.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fan.name}</p>
                        <p className="text-xs text-gray-500">{fan.email}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mr-1">
                            #{index + 1}
                          </span>
                          <span className="text-xs text-gray-500">
                            Membre depuis {new Date(fan.joinedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(fan.totalSpent)}</div>
                    <div className="text-xs text-gray-500">
                      Panier moyen: {formatCurrency(fan.averageOrderValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{fan.totalOrders}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(fan.lifetimeValue)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getEngagementColor(fan.engagementScore)}`}>
                        {fan.engagementScore}/10
                      </span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#f01919] h-2 rounded-full" 
                          style={{ width: `${(fan.engagementScore / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(fan.lastPurchase).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedFan(fan)}
                      >
                        <FiEye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="bg-[#f01919] hover:bg-[#d01515] text-white">
                        Contacter
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fan Details Modal */}
      {selectedFan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Profil de {selectedFan.name}</h2>
                <Button variant="outline" onClick={() => setSelectedFan(null)}>
                  Fermer
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Fan Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informations</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {selectedFan.email}</p>
                    <p><span className="font-medium">Membre depuis:</span> {new Date(selectedFan.joinedAt).toLocaleDateString('fr-FR')}</p>
                    <p><span className="font-medium">Dernier achat:</span> {new Date(selectedFan.lastPurchase).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Métriques</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{selectedFan.metrics.contentViews}</p>
                      <p className="text-xs text-gray-500">Vues</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{selectedFan.metrics.likes}</p>
                      <p className="text-xs text-gray-500">Likes</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{selectedFan.metrics.comments}</p>
                      <p className="text-xs text-gray-500">Commentaires</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{selectedFan.metrics.shares}</p>
                      <p className="text-xs text-gray-500">Partages</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Catégories préférées</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFan.favoriteCategories.map((category, index) => (
                    <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Historique des achats</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Produit</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedFan.purchaseHistory.map((purchase, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{new Date(purchase.date).toLocaleDateString('fr-FR')}</td>
                          <td className="px-4 py-2">{purchase.product}</td>
                          <td className="px-4 py-2">
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {purchase.type}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right font-medium">{formatCurrency(purchase.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredAndSortedFans.length === 0 && (
        <div className="text-center py-12">
          <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fan rentable trouvé</h3>
          <p className="text-gray-600">
            Aucun fan ne correspond à vos critères de recherche.
          </p>
        </div>
      )}
    </div>
  );
}