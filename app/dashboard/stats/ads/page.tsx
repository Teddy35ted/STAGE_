'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiTarget, 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown,
  FiEye,
  FiUsers,
  FiBarChart,
  FiPieChart,
  FiCalendar,
  FiActivity,
  FiPercent,
  FiAward,
  FiFilter,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';

interface AdPerformanceMetrics {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSpent: number;
    totalRevenue: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    averageCTR: number;
    averageCPC: number;
    averageCPM: number;
    averageROAS: number; // Return on Ad Spend
  };
  performance: {
    impressionsGrowth: number;
    clicksGrowth: number;
    conversionsGrowth: number;
    revenueGrowth: number;
    ctrTrend: number;
    cpcTrend: number;
    roasTrend: number;
    qualityScore: number; // score sur 100
  };
  demographics: {
    topAgeGroups: { range: string; percentage: number; performance: number }[];
    topGenders: { gender: string; percentage: number; performance: number }[];
    topLocations: { location: string; percentage: number; performance: number }[];
    deviceBreakdown: { device: string; percentage: number; ctr: number }[];
  };
  campaignTypes: {
    display: { campaigns: number; revenue: number; ctr: number; roi: number };
    video: { campaigns: number; revenue: number; ctr: number; roi: number };
    sponsoredContent: { campaigns: number; revenue: number; ctr: number; roi: number };
    story: { campaigns: number; revenue: number; ctr: number; roi: number };
    newsletter: { campaigns: number; revenue: number; ctr: number; roi: number };
  };
  topPerformers: {
    campaigns: {
      name: string;
      type: string;
      revenue: number;
      roi: number;
      impressions: number;
      ctr: number;
    }[];
    advertisers: {
      name: string;
      campaigns: number;
      revenue: number;
      satisfaction: number;
      renewalRate: number;
    }[];
    placements: {
      placement: string;
      revenue: number;
      ctr: number;
      fillRate: number;
    }[];
  };
  timeAnalysis: {
    bestDays: string[];
    bestHours: string[];
    seasonalTrends: { period: string; performance: number }[];
    weeklyPattern: { day: string; impressions: number; revenue: number }[];
  };
  optimization: {
    recommendations: string[];
    potentialRevenue: number;
    improvementAreas: { area: string; impact: number; difficulty: number }[];
    benchmarks: { metric: string; yourValue: number; industryAverage: number; topPerformers: number }[];
  };
}

const adMetrics: AdPerformanceMetrics = {
  overview: {
    totalCampaigns: 24,
    activeCampaigns: 6,
    totalSpent: 8450.00,
    totalRevenue: 12680.50,
    totalImpressions: 2450000,
    totalClicks: 73500,
    totalConversions: 1890,
    averageCTR: 3.0,
    averageCPC: 0.115,
    averageCPM: 3.45,
    averageROAS: 1.50
  },
  performance: {
    impressionsGrowth: 18.7,
    clicksGrowth: 22.3,
    conversionsGrowth: 15.8,
    revenueGrowth: 28.4,
    ctrTrend: 8.2,
    cpcTrend: -5.1,
    roasTrend: 12.6,
    qualityScore: 87
  },
  demographics: {
    topAgeGroups: [
      { range: '25-34', percentage: 42.3, performance: 3.2 },
      { range: '35-44', percentage: 28.1, performance: 3.8 },
      { range: '18-24', percentage: 15.8, performance: 2.1 },
      { range: '45-54', percentage: 10.5, performance: 4.1 },
      { range: '55+', percentage: 3.3, performance: 2.8 }
    ],
    topGenders: [
      { gender: 'Femmes', percentage: 68.5, performance: 3.4 },
      { gender: 'Hommes', percentage: 29.2, performance: 2.8 },
      { gender: 'Autre', percentage: 2.3, performance: 2.1 }
    ],
    topLocations: [
      { location: 'France', percentage: 72.4, performance: 3.2 },
      { location: 'Belgique', percentage: 8.9, performance: 3.8 },
      { location: 'Suisse', percentage: 6.2, performance: 4.1 },
      { location: 'Canada', percentage: 4.8, performance: 2.9 },
      { location: 'Maroc', percentage: 3.1, performance: 2.2 }
    ],
    deviceBreakdown: [
      { device: 'Mobile', percentage: 76.8, ctr: 3.2 },
      { device: 'Desktop', percentage: 18.4, ctr: 2.8 },
      { device: 'Tablette', percentage: 4.8, ctr: 2.1 }
    ]
  },
  campaignTypes: {
    display: { campaigns: 8, revenue: 2840.20, ctr: 2.1, roi: 1.35 },
    video: { campaigns: 6, revenue: 4250.80, ctr: 3.8, roi: 1.68 },
    sponsoredContent: { campaigns: 5, revenue: 3890.40, ctr: 4.2, roi: 1.82 },
    story: { campaigns: 3, revenue: 1120.60, ctr: 2.9, roi: 1.28 },
    newsletter: { campaigns: 2, revenue: 578.50, ctr: 1.8, roi: 1.15 }
  },
  topPerformers: {
    campaigns: [
      { name: 'BioGlow Printemps 2024', type: 'Contenu Sponsorisé', revenue: 1650.00, roi: 2.1, impressions: 125000, ctr: 4.2 },
      { name: 'FitGear Summer Challenge', type: 'Vidéo', revenue: 1420.50, roi: 1.9, impressions: 98000, ctr: 3.8 },
      { name: 'TechStart Formation', type: 'Display', revenue: 890.30, roi: 1.6, impressions: 156000, ctr: 2.8 },
      { name: 'EcoHome Solutions', type: 'Contenu Sponsorisé', revenue: 756.80, roi: 1.8, impressions: 89000, ctr: 3.9 },
      { name: 'HealthyFood Stories', type: 'Story', revenue: 445.20, roi: 1.4, impressions: 67000, ctr: 2.9 }
    ],
    advertisers: [
      { name: 'BioGlow Cosmetics', campaigns: 4, revenue: 2840.50, satisfaction: 4.8, renewalRate: 100 },
      { name: 'FitGear Pro', campaigns: 3, revenue: 1890.20, satisfaction: 4.6, renewalRate: 85 },
      { name: 'TechStart Academy', campaigns: 2, revenue: 1245.80, satisfaction: 4.2, renewalRate: 75 },
      { name: 'EcoHome Solutions', campaigns: 3, revenue: 1680.40, satisfaction: 4.7, renewalRate: 90 },
      { name: 'HealthyFood Co', campaigns: 2, revenue: 890.60, satisfaction: 4.1, renewalRate: 70 }
    ],
    placements: [
      { placement: 'Feed Principal', revenue: 4250.80, ctr: 3.8, fillRate: 94.2 },
      { placement: 'Stories', revenue: 2890.40, ctr: 3.2, fillRate: 87.5 },
      { placement: 'Sidebar', revenue: 1680.20, ctr: 2.1, fillRate: 78.9 },
      { placement: 'Newsletter', revenue: 890.50, ctr: 1.8, fillRate: 65.3 },
      { placement: 'Pre-roll', revenue: 1240.60, ctr: 4.1, fillRate: 82.7 }
    ]
  },
  timeAnalysis: {
    bestDays: ['Mercredi', 'Dimanche', 'Mardi'],
    bestHours: ['19h-21h', '12h-14h', '20h-22h'],
    seasonalTrends: [
      { period: 'Q1 2024', performance: 112 },
      { period: 'Q4 2023', performance: 98 },
      { period: 'Q3 2023', performance: 87 },
      { period: 'Q2 2023', performance: 94 }
    ],
    weeklyPattern: [
      { day: 'Lundi', impressions: 45000, revenue: 890.20 },
      { day: 'Mardi', impressions: 52000, revenue: 1120.50 },
      { day: 'Mercredi', impressions: 68000, revenue: 1450.80 },
      { day: 'Jeudi', impressions: 48000, revenue: 980.40 },
      { day: 'Vendredi', impressions: 41000, revenue: 820.30 },
      { day: 'Samedi', impressions: 38000, revenue: 760.20 },
      { day: 'Dimanche', impressions: 58000, revenue: 1240.60 }
    ]
  },
  optimization: {
    recommendations: [
      'Augmenter le budget sur les campagnes de contenu sponsorisé (+82% ROI)',
      'Optimiser les créatifs pour la tranche 45-54 ans (meilleure performance)',
      'Développer les placements vidéo (CTR +3.8%)',
      'Cibler davantage la Suisse et la Belgique (performance supérieure)',
      'Programmer plus de campagnes le mercredi et dimanche'
    ],
    potentialRevenue: 3240.50,
    improvementAreas: [
      { area: 'Optimisation créatifs', impact: 85, difficulty: 30 },
      { area: 'Ciblage démographique', impact: 70, difficulty: 20 },
      { area: 'Timing des campagnes', impact: 60, difficulty: 15 },
      { area: 'Diversification formats', impact: 90, difficulty: 50 },
      { area: 'A/B testing', impact: 75, difficulty: 25 }
    ],
    benchmarks: [
      { metric: 'CTR', yourValue: 3.0, industryAverage: 2.1, topPerformers: 4.2 },
      { metric: 'CPC', yourValue: 0.115, industryAverage: 0.145, topPerformers: 0.089 },
      { metric: 'ROAS', yourValue: 1.50, industryAverage: 1.25, topPerformers: 2.10 },
      { metric: 'Taux de conversion', yourValue: 2.57, industryAverage: 1.8, topPerformers: 3.8 }
    ]
  }
};

export default function AdsStatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'impressions' | 'clicks' | 'conversions'>('revenue');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBenchmarkColor = (yourValue: number, industryAverage: number, isHigherBetter: boolean = true) => {
    const isAboveAverage = isHigherBetter ? yourValue > industryAverage : yourValue < industryAverage;
    return isAboveAverage ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques Publicitaires</h1>
          <p className="text-gray-600 mt-1">
            Analysez les performances de vos campagnes publicitaires
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Publicitaires</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(adMetrics.overview.totalRevenue)}</p>
              <div className={`flex items-center mt-1 text-sm ${getGrowthColor(adMetrics.performance.revenueGrowth)}`}>
                {getGrowthIcon(adMetrics.performance.revenueGrowth)}
                <span className="ml-1">+{adMetrics.performance.revenueGrowth.toFixed(1)}%</span>
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
              <p className="text-sm font-medium text-gray-600">Impressions Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(adMetrics.overview.totalImpressions)}</p>
              <div className={`flex items-center mt-1 text-sm ${getGrowthColor(adMetrics.performance.impressionsGrowth)}`}>
                {getGrowthIcon(adMetrics.performance.impressionsGrowth)}
                <span className="ml-1">+{adMetrics.performance.impressionsGrowth.toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiEye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CTR Moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{adMetrics.overview.averageCTR.toFixed(1)}%</p>
              <div className={`flex items-center mt-1 text-sm ${getGrowthColor(adMetrics.performance.ctrTrend)}`}>
                {getGrowthIcon(adMetrics.performance.ctrTrend)}
                <span className="ml-1">+{adMetrics.performance.ctrTrend.toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROAS</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{adMetrics.overview.averageROAS.toFixed(2)}x</p>
              <div className={`flex items-center mt-1 text-sm ${getGrowthColor(adMetrics.performance.roasTrend)}`}>
                {getGrowthIcon(adMetrics.performance.roasTrend)}
                <span className="ml-1">+{adMetrics.performance.roasTrend.toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Types Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance par type de campagne</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(adMetrics.campaignTypes).map(([type, data]) => {
            const typeLabels: { [key: string]: string } = {
              display: 'Display',
              video: 'Vidéo',
              sponsoredContent: 'Contenu Sponsorisé',
              story: 'Story',
              newsletter: 'Newsletter'
            };
            
            return (
              <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{typeLabels[type]}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(data.revenue)}</p>
                  <p className="text-gray-600">{data.campaigns} campagnes</p>
                  <p className="text-blue-600">CTR: {data.ctr.toFixed(1)}%</p>
                  <p className="text-green-600">ROI: {data.roi.toFixed(2)}x</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Performance Pattern */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance hebdomadaire</h2>
        <div className="grid grid-cols-7 gap-2">
          {adMetrics.timeAnalysis.weeklyPattern.map((day, index) => {
            const maxRevenue = Math.max(...adMetrics.timeAnalysis.weeklyPattern.map(d => d.revenue));
            const height = (day.revenue / maxRevenue) * 100;
            
            return (
              <div key={index} className="text-center">
                <div className="h-24 flex items-end justify-center mb-2">
                  <div 
                    className="w-8 bg-[#f01919] rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${day.day}: ${formatCurrency(day.revenue)}`}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mb-1">{day.day}</p>
                <p className="text-xs font-medium text-gray-900">{formatCurrency(day.revenue)}</p>
                <p className="text-xs text-gray-500">{formatNumber(day.impressions)} imp.</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demographics Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance par démographie</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Groupes d'âge</h3>
              {adMetrics.demographics.topAgeGroups.map((group, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{group.range} ans</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{group.percentage.toFixed(1)}%</span>
                    <span className={`text-sm font-medium ${getPerformanceColor(group.performance * 25)}`}>
                      CTR: {group.performance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Localisation</h3>
              {adMetrics.demographics.topLocations.slice(0, 3).map((location, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{location.location}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{location.percentage.toFixed(1)}%</span>
                    <span className={`text-sm font-medium ${getPerformanceColor(location.performance * 25)}`}>
                      CTR: {location.performance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top annonceurs</h2>
          <div className="space-y-3">
            {adMetrics.topPerformers.advertisers.slice(0, 5).map((advertiser, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{advertiser.name}</p>
                  <p className="text-xs text-gray-500">
                    {advertiser.campaigns} campagnes • Satisfaction: {advertiser.satisfaction.toFixed(1)}/5
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(advertiser.revenue)}</p>
                  <p className="text-xs text-green-600">Renouvellement: {advertiser.renewalRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Campaigns */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Campagnes les plus performantes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campagne</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenus</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impressions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adMetrics.topPerformers.campaigns.map((campaign, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{campaign.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{campaign.type}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(campaign.revenue)}</td>
                  <td className="px-4 py-3 text-sm text-green-600">{campaign.roi.toFixed(1)}x</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(campaign.impressions)}</td>
                  <td className="px-4 py-3 text-sm text-blue-600">{campaign.ctr.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benchmarks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparaison avec l'industrie</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {adMetrics.optimization.benchmarks.map((benchmark, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">{benchmark.metric}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vous:</span>
                  <span className={`font-medium ${getBenchmarkColor(
                    benchmark.yourValue, 
                    benchmark.industryAverage, 
                    benchmark.metric !== 'CPC'
                  )}`}>
                    {benchmark.metric === 'CPC' ? formatCurrency(benchmark.yourValue) : 
                     benchmark.metric.includes('Taux') || benchmark.metric === 'CTR' ? 
                     `${benchmark.yourValue.toFixed(1)}%` : 
                     benchmark.yourValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Industrie:</span>
                  <span className="text-gray-900">
                    {benchmark.metric === 'CPC' ? formatCurrency(benchmark.industryAverage) : 
                     benchmark.metric.includes('Taux') || benchmark.metric === 'CTR' ? 
                     `${benchmark.industryAverage.toFixed(1)}%` : 
                     benchmark.industryAverage.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Top 10%:</span>
                  <span className="text-green-600 font-medium">
                    {benchmark.metric === 'CPC' ? formatCurrency(benchmark.topPerformers) : 
                     benchmark.metric.includes('Taux') || benchmark.metric === 'CTR' ? 
                     `${benchmark.topPerformers.toFixed(1)}%` : 
                     benchmark.topPerformers.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTarget className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Recommandations d'optimisation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-2">Opportunités identifiées</p>
                <ul className="space-y-1">
                  {adMetrics.optimization.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
                <p className="font-medium mt-3 text-green-700">
                  Potentiel de revenus supplémentaires: {formatCurrency(adMetrics.optimization.potentialRevenue)}
                </p>
              </div>
              <div>
                <p className="font-medium mb-2">Axes d'amélioration prioritaires</p>
                {adMetrics.optimization.improvementAreas.slice(0, 3).map((area, index) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <span className="text-sm">{area.area}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600">Impact: {area.impact}%</span>
                      <span className="text-xs text-yellow-600">Difficulté: {area.difficulty}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Score */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Score de qualité publicitaire</h2>
            <p className="text-sm text-gray-600 mt-1">
              Évaluation globale de vos performances publicitaires
            </p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getPerformanceColor(adMetrics.performance.qualityScore)}`}>
              {adMetrics.performance.qualityScore}/100
            </div>
            <div className="flex items-center justify-center mt-1">
              <FiAward className={`w-5 h-5 mr-1 ${getPerformanceColor(adMetrics.performance.qualityScore)}`} />
              <span className={`text-sm font-medium ${getPerformanceColor(adMetrics.performance.qualityScore)}`}>
                {adMetrics.performance.qualityScore >= 85 ? 'Excellent' : 
                 adMetrics.performance.qualityScore >= 70 ? 'Bon' : 'À améliorer'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}