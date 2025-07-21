'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown,
  FiPieChart,
  FiBarChart,
  FiCalendar,
  FiTarget,
  FiUsers,
  FiCreditCard,
  FiShoppingBag,
  FiFilter,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';

interface RevenueAnalytics {
  period: string;
  totalRevenue: number;
  revenueBreakdown: {
    direct: number;
    indirect: number;
    couris: number;
    ads: number;
  };
  growth: {
    total: number;
    direct: number;
    indirect: number;
    couris: number;
    ads: number;
  };
  metrics: {
    averageRevenuePerDay: number;
    averageRevenuePerContent: number;
    averageRevenuePerFollower: number;
    conversionRate: number;
    customerLifetimeValue: number;
  };
  topPerformers: {
    content: {
      title: string;
      revenue: number;
      type: string;
    }[];
    laalas: {
      name: string;
      revenue: number;
      growth: number;
    }[];
    revenueStreams: {
      source: string;
      revenue: number;
      percentage: number;
    }[];
  };
  forecasting: {
    nextMonth: number;
    nextQuarter: number;
    yearEnd: number;
    confidence: number;
  };
  comparisons: {
    lastMonth: number;
    lastQuarter: number;
    lastYear: number;
    industryAverage: number;
  };
}

interface MonthlyRevenue {
  month: string;
  direct: number;
  indirect: number;
  couris: number;
  ads: number;
  total: number;
}

const monthlyRevenueData: MonthlyRevenue[] = [
  { month: 'Juillet 2023', direct: 890, indirect: 340, couris: 280, ads: 190, total: 1700 },
  { month: 'Août 2023', direct: 1020, indirect: 380, couris: 320, ads: 220, total: 1940 },
  { month: 'Septembre 2023', direct: 1150, indirect: 420, couris: 360, ads: 250, total: 2180 },
  { month: 'Octobre 2023', direct: 1280, indirect: 480, couris: 390, ads: 280, total: 2430 },
  { month: 'Novembre 2023', direct: 1180, indirect: 520, couris: 420, ads: 310, total: 2430 },
  { month: 'Décembre 2023', direct: 1350, indirect: 580, couris: 450, ads: 340, total: 2720 },
  { month: 'Janvier 2024', direct: 1450, indirect: 620, couris: 480, ads: 380, total: 2930 }
];

const currentAnalytics: RevenueAnalytics = {
  period: 'Janvier 2024',
  totalRevenue: 2930.50,
  revenueBreakdown: {
    direct: 1450.80,
    indirect: 620.30,
    couris: 480.90,
    ads: 378.50
  },
  growth: {
    total: 7.7,
    direct: 7.4,
    indirect: 6.9,
    couris: 6.7,
    ads: 11.8
  },
  metrics: {
    averageRevenuePerDay: 94.53,
    averageRevenuePerContent: 54.27,
    averageRevenuePerFollower: 0.078,
    conversionRate: 3.2,
    customerLifetimeValue: 156.80
  },
  topPerformers: {
    content: [
      { title: 'Formation React Avancé', revenue: 539.94, type: 'Formation' },
      { title: 'Guide Complet Nutrition', revenue: 419.86, type: 'E-book' },
      { title: 'Consultation Bien-être 1h', revenue: 375.00, type: 'Service' },
      { title: 'Routine matinale productive', revenue: 103.70, type: 'Contenu' },
      { title: 'Recette healthy bowl', revenue: 89.50, type: 'Contenu' }
    ],
    laalas: [
      { name: 'Mon Laala Lifestyle', revenue: 1245.80, growth: 15.3 },
      { name: 'Tech & Innovation', revenue: 890.40, growth: 22.1 },
      { name: 'Cuisine du Monde', revenue: 567.30, growth: 8.7 },
      { name: 'Business & Productivité', revenue: 226.90, growth: -3.2 }
    ],
    revenueStreams: [
      { source: 'Ventes directes', revenue: 1450.80, percentage: 49.5 },
      { source: 'Collaborations', revenue: 620.30, percentage: 21.2 },
      { source: 'Couris engagement', revenue: 480.90, percentage: 16.4 },
      { source: 'Publicités', revenue: 378.50, percentage: 12.9 }
    ]
  },
  forecasting: {
    nextMonth: 3180.00,
    nextQuarter: 9540.00,
    yearEnd: 38200.00,
    confidence: 78.5
  },
  comparisons: {
    lastMonth: 2720.00,
    lastQuarter: 7630.00,
    lastYear: 18450.00,
    industryAverage: 2100.00
  }
};

export default function RevenueStatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'total' | 'direct' | 'indirect' | 'couris' | 'ads'>('total');
  const [showForecasting, setShowForecasting] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <FiTrendingUp className="w-4 h-4" />;
    if (growth < 0) return <FiTrendingDown className="w-4 h-4" />;
    return <FiTrendingUp className="w-4 h-4" />;
  };

  const getRevenueStreamColor = (index: number) => {
    const colors = ['bg-[#f01919]', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'];
    return colors[index % colors.length];
  };

  const calculateGrowthFromPrevious = (current: number, previous: number) => {
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analyse des Revenus</h1>
          <p className="text-gray-600 mt-1">
            Analysez en détail vos performances financières et tendances
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

      {/* Main Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(currentAnalytics.totalRevenue)}</p>
              <div className={`flex items-center mt-1 text-sm ${getGrowthColor(currentAnalytics.growth.total)}`}>
                {getGrowthIcon(currentAnalytics.growth.total)}
                <span className="ml-1">+{currentAnalytics.growth.total.toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Directs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(currentAnalytics.revenueBreakdown.direct)}</p>
              <div className={`flex items-center mt-1 text-sm ${getGrowthColor(currentAnalytics.growth.direct)}`}>
                {getGrowthIcon(currentAnalytics.growth.direct)}
                <span className="ml-1">+{currentAnalytics.growth.direct.toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus/Jour</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(currentAnalytics.metrics.averageRevenuePerDay)}</p>
              <p className="text-sm text-green-600 mt-1">Moyenne quotidienne</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Conversion</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{currentAnalytics.metrics.conversionRate.toFixed(1)}%</p>
              <p className="text-sm text-purple-600 mt-1">Performance globale</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition des revenus</h2>
          <div className="space-y-4">
            {currentAnalytics.topPerformers.revenueStreams.map((stream, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${getRevenueStreamColor(index)}`}></div>
                  <span className="text-sm font-medium text-gray-700">{stream.source}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(stream.revenue)}</p>
                  <p className="text-xs text-gray-500">{stream.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Métriques clés</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(currentAnalytics.metrics.averageRevenuePerContent)}</p>
              <p className="text-xs text-gray-500">Revenus/contenu</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(currentAnalytics.metrics.averageRevenuePerFollower)}</p>
              <p className="text-xs text-gray-500">Revenus/follower</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(currentAnalytics.metrics.customerLifetimeValue)}</p>
              <p className="text-xs text-gray-500">LTV client</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{currentAnalytics.metrics.conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Conversion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Évolution mensuelle</h2>
          <div className="flex space-x-2">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="total">Total</option>
              <option value="direct">Direct</option>
              <option value="indirect">Indirect</option>
              <option value="couris">Couris</option>
              <option value="ads">Publicités</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {monthlyRevenueData.map((month, index) => {
            const value = selectedMetric === 'total' ? month.total : month[selectedMetric as keyof MonthlyRevenue] as number;
            const maxValue = Math.max(...monthlyRevenueData.map(m => selectedMetric === 'total' ? m.total : m[selectedMetric as keyof MonthlyRevenue] as number));
            const height = (value / maxValue) * 100;
            
            return (
              <div key={index} className="text-center">
                <div className="h-32 flex items-end justify-center mb-2">
                  <div 
                    className="w-8 bg-[#f01919] rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${month.month}: ${formatCurrency(value)}`}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mb-1">{month.month.split(' ')[0]}</p>
                <p className="text-xs font-medium text-gray-900">{formatCurrency(value)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenus les plus rentables</h2>
          <div className="space-y-3">
            {currentAnalytics.topPerformers.content.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{content.title}</p>
                  <p className="text-xs text-gray-500">{content.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(content.revenue)}</p>
                  <p className="text-xs text-gray-500">#{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Laalas les plus rentables</h2>
          <div className="space-y-3">
            {currentAnalytics.topPerformers.laalas.map((laala, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{laala.name}</p>
                  <div className={`flex items-center text-xs ${getGrowthColor(laala.growth)}`}>
                    {getGrowthIcon(laala.growth)}
                    <span className="ml-1">{laala.growth > 0 ? '+' : ''}{laala.growth.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(laala.revenue)}</p>
                  <p className="text-xs text-gray-500">#{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecasting */}
      {showForecasting && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Prévisions de revenus</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Confiance: {currentAnalytics.forecasting.confidence.toFixed(1)}%</span>
              <Button size="sm" variant="outline">
                <FiRefreshCw className="w-4 h-4 mr-1" />
                Recalculer
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(currentAnalytics.forecasting.nextMonth)}</p>
              <p className="text-sm text-blue-600">Mois prochain</p>
              <p className="text-xs text-blue-500 mt-1">
                +{calculateGrowthFromPrevious(currentAnalytics.forecasting.nextMonth, currentAnalytics.totalRevenue).toFixed(1)}% prévu
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-900">{formatCurrency(currentAnalytics.forecasting.nextQuarter)}</p>
              <p className="text-sm text-green-600">Prochain trimestre</p>
              <p className="text-xs text-green-500 mt-1">
                +{calculateGrowthFromPrevious(currentAnalytics.forecasting.nextQuarter, currentAnalytics.comparisons.lastQuarter).toFixed(1)}% prévu
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(currentAnalytics.forecasting.yearEnd)}</p>
              <p className="text-sm text-purple-600">Fin d'année</p>
              <p className="text-xs text-purple-500 mt-1">
                +{calculateGrowthFromPrevious(currentAnalytics.forecasting.yearEnd, currentAnalytics.comparisons.lastYear).toFixed(1)}% prévu
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparisons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparaisons</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(currentAnalytics.comparisons.lastMonth)}</p>
            <p className="text-sm text-gray-600">Mois dernier</p>
            <div className={`text-xs mt-1 ${getGrowthColor(currentAnalytics.growth.total)}`}>
              +{currentAnalytics.growth.total.toFixed(1)}% vs maintenant
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(currentAnalytics.comparisons.lastQuarter)}</p>
            <p className="text-sm text-gray-600">Trimestre dernier</p>
            <div className="text-xs text-green-600 mt-1">
              +{calculateGrowthFromPrevious(currentAnalytics.totalRevenue * 3, currentAnalytics.comparisons.lastQuarter).toFixed(1)}% vs maintenant
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(currentAnalytics.comparisons.lastYear)}</p>
            <p className="text-sm text-gray-600">Année dernière</p>
            <div className="text-xs text-green-600 mt-1">
              +{calculateGrowthFromPrevious(currentAnalytics.totalRevenue * 12, currentAnalytics.comparisons.lastYear).toFixed(1)}% vs maintenant
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(currentAnalytics.comparisons.industryAverage)}</p>
            <p className="text-sm text-gray-600">Moyenne industrie</p>
            <div className={`text-xs mt-1 ${currentAnalytics.totalRevenue > currentAnalytics.comparisons.industryAverage ? 'text-green-600' : 'text-red-600'}`}>
              {currentAnalytics.totalRevenue > currentAnalytics.comparisons.industryAverage ? '+' : ''}
              {calculateGrowthFromPrevious(currentAnalytics.totalRevenue, currentAnalytics.comparisons.industryAverage).toFixed(1)}% vs vous
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Optimization Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTrendingUp className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-2">
              Optimisation des revenus
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
              <div>
                <p className="font-medium mb-1">Opportunités identifiées</p>
                <ul className="space-y-1">
                  <li>• Les revenus publicitaires croissent le plus (+11.8%)</li>
                  <li>• Potentiel d'amélioration sur les revenus indirects</li>
                  <li>• Taux de conversion supérieur à la moyenne industrie</li>
                  <li>• LTV client en progression constante</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Recommandations</p>
                <ul className="space-y-1">
                  <li>• Développer les partenariats et collaborations</li>
                  <li>• Optimiser les prix de vos formations</li>
                  <li>• Créer plus de contenu récurrent (abonnements)</li>
                  <li>• Analyser les contenus les plus rentables</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}