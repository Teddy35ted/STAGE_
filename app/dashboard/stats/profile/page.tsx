'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiUser, 
  FiTrendingUp, 
  FiTrendingDown,
  FiUsers,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiCalendar,
  FiTarget,
  FiAward,
  FiStar,
  FiActivity,
  FiBarChart,
  FiPieChart,
  FiFilter,
  FiDownload
} from 'react-icons/fi';

interface ProfileMetrics {
  overview: {
    totalFollowers: number;
    followersGrowth: number;
    totalViews: number;
    viewsGrowth: number;
    engagementRate: number;
    engagementGrowth: number;
    profileViews: number;
    profileViewsGrowth: number;
  };
  content: {
    totalPosts: number;
    postsThisMonth: number;
    averagePostsPerWeek: number;
    contentConsistency: number; // score sur 100
    topPerformingType: string;
    averageEngagementPerPost: number;
  };
  audience: {
    demographics: {
      ageGroups: { range: string; percentage: number }[];
      genderSplit: { gender: string; percentage: number }[];
      topLocations: { country: string; percentage: number }[];
    };
    behavior: {
      averageSessionDuration: number; // en minutes
      bounceRate: number;
      returnVisitorRate: number;
      peakActivityHours: string[];
      mostActiveDays: string[];
    };
    quality: {
      engagementQuality: number; // score sur 100
      audienceGrowthQuality: number; // score sur 100
      followerRetentionRate: number;
      spamFollowersPercentage: number;
    };
  };
  performance: {
    reachRate: number;
    impressionGrowth: number;
    clickThroughRate: number;
    saveRate: number;
    shareRate: number;
    commentRate: number;
    viralityScore: number; // score sur 100
    influenceScore: number; // score sur 100
  };
  monetization: {
    totalEarnings: number;
    earningsGrowth: number;
    averageRevenuePerFollower: number;
    conversionRate: number;
    customerAcquisitionCost: number;
    lifetimeValue: number;
    monetizationEfficiency: number; // score sur 100
  };
  reputation: {
    overallRating: number;
    totalReviews: number;
    positiveReviewsPercentage: number;
    responseRate: number;
    averageResponseTime: number; // en heures
    professionalismScore: number; // score sur 100
    reliabilityScore: number; // score sur 100
  };
  goals: {
    followersTarget: number;
    followersProgress: number;
    revenueTarget: number;
    revenueProgress: number;
    engagementTarget: number;
    engagementProgress: number;
    contentTarget: number;
    contentProgress: number;
  };
}

const profileMetrics: ProfileMetrics = {
  overview: {
    totalFollowers: 37850,
    followersGrowth: 8.2,
    totalViews: 1350000,
    viewsGrowth: 15.7,
    engagementRate: 7.4,
    engagementGrowth: 12.3,
    profileViews: 89500,
    profileViewsGrowth: 18.9
  },
  content: {
    totalPosts: 515,
    postsThisMonth: 28,
    averagePostsPerWeek: 6.8,
    contentConsistency: 87,
    topPerformingType: 'Vidéo',
    averageEngagementPerPost: 892
  },
  audience: {
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 15.8 },
        { range: '25-34', percentage: 42.3 },
        { range: '35-44', percentage: 28.1 },
        { range: '45-54', percentage: 10.5 },
        { range: '55+', percentage: 3.3 }
      ],
      genderSplit: [
        { gender: 'Femmes', percentage: 68.5 },
        { gender: 'Hommes', percentage: 29.2 },
        { gender: 'Autre', percentage: 2.3 }
      ],
      topLocations: [
        { country: 'France', percentage: 72.4 },
        { country: 'Belgique', percentage: 8.9 },
        { country: 'Suisse', percentage: 6.2 },
        { country: 'Canada', percentage: 4.8 },
        { country: 'Maroc', percentage: 3.1 }
      ]
    },
    behavior: {
      averageSessionDuration: 4.2,
      bounceRate: 23.5,
      returnVisitorRate: 67.8,
      peakActivityHours: ['19h-21h', '12h-14h'],
      mostActiveDays: ['Mercredi', 'Dimanche']
    },
    quality: {
      engagementQuality: 89,
      audienceGrowthQuality: 85,
      followerRetentionRate: 94.2,
      spamFollowersPercentage: 2.1
    }
  },
  performance: {
    reachRate: 68.3,
    impressionGrowth: 22.1,
    clickThroughRate: 3.8,
    saveRate: 12.4,
    shareRate: 5.7,
    commentRate: 2.9,
    viralityScore: 78,
    influenceScore: 82
  },
  monetization: {
    totalEarnings: 4250.80,
    earningsGrowth: 18.5,
    averageRevenuePerFollower: 0.112,
    conversionRate: 3.2,
    customerAcquisitionCost: 12.50,
    lifetimeValue: 156.80,
    monetizationEfficiency: 84
  },
  reputation: {
    overallRating: 4.7,
    totalReviews: 156,
    positiveReviewsPercentage: 92.3,
    responseRate: 96.8,
    averageResponseTime: 2.4,
    professionalismScore: 91,
    reliabilityScore: 88
  },
  goals: {
    followersTarget: 50000,
    followersProgress: 75.7,
    revenueTarget: 5000,
    revenueProgress: 85.0,
    engagementTarget: 8.0,
    engagementProgress: 92.5,
    contentTarget: 30,
    contentProgress: 93.3
  }
};

export default function ProfileStatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<'overview' | 'audience' | 'performance' | 'monetization'>('overview');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
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

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques du Profil</h1>
          <p className="text-gray-600 mt-1">
            Analysez vos performances personnelles et votre croissance
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
              <p className="text-sm font-medium text-gray-600">Followers Totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(profileMetrics.overview.totalFollowers)}</p>
              <div className={`flex items-center mt-1 text-sm ${getGrowthColor(profileMetrics.overview.followersGrowth)}`}>
                {getGrowthIcon(profileMetrics.overview.followersGrowth)}
                <span className="ml-1">+{profileMetrics.overview.followersGrowth.toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vues Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(profileMetrics.overview.totalViews)}</p>
              <div className={`flex items-center mt-1 text-sm ${getGrowthColor(profileMetrics.overview.viewsGrowth)}`}>
                {getGrowthIcon(profileMetrics.overview.viewsGrowth)}
                <span className="ml-1">+{profileMetrics.overview.viewsGrowth.toFixed(1)}%</span>
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
              <p className="text-sm font-medium text-gray-600">Taux d'Engagement</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{profileMetrics.overview.engagementRate.toFixed(1)}%</p>
              <div className={`flex items-center mt-1 text-sm ${getGrowthColor(profileMetrics.overview.engagementGrowth)}`}>
                {getGrowthIcon(profileMetrics.overview.engagementGrowth)}
                <span className="ml-1">+{profileMetrics.overview.engagementGrowth.toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiHeart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(profileMetrics.monetization.totalEarnings)}</p>
              <div className={`flex items-center mt-1 text-sm ${getGrowthColor(profileMetrics.monetization.earningsGrowth)}`}>
                {getGrowthIcon(profileMetrics.monetization.earningsGrowth)}
                <span className="ml-1">+{profileMetrics.monetization.earningsGrowth.toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Progression des objectifs</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Followers</span>
              <span className="text-sm text-gray-600">
                {formatNumber(profileMetrics.overview.totalFollowers)} / {formatNumber(profileMetrics.goals.followersTarget)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getProgressColor(profileMetrics.goals.followersProgress)}`}
                style={{ width: `${profileMetrics.goals.followersProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{profileMetrics.goals.followersProgress.toFixed(1)}% atteint</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Revenus</span>
              <span className="text-sm text-gray-600">
                {formatCurrency(profileMetrics.monetization.totalEarnings)} / {formatCurrency(profileMetrics.goals.revenueTarget)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getProgressColor(profileMetrics.goals.revenueProgress)}`}
                style={{ width: `${profileMetrics.goals.revenueProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{profileMetrics.goals.revenueProgress.toFixed(1)}% atteint</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Engagement</span>
              <span className="text-sm text-gray-600">
                {profileMetrics.overview.engagementRate.toFixed(1)}% / {profileMetrics.goals.engagementTarget.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getProgressColor(profileMetrics.goals.engagementProgress)}`}
                style={{ width: `${profileMetrics.goals.engagementProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{profileMetrics.goals.engagementProgress.toFixed(1)}% atteint</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Contenu</span>
              <span className="text-sm text-gray-600">
                {profileMetrics.content.postsThisMonth} / {profileMetrics.goals.contentTarget}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getProgressColor(profileMetrics.goals.contentProgress)}`}
                style={{ width: `${profileMetrics.goals.contentProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{profileMetrics.goals.contentProgress.toFixed(1)}% atteint</p>
          </div>
        </div>
      </div>

      {/* Demographics & Audience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Démographie de l'audience</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Répartition par âge</h3>
              {profileMetrics.audience.demographics.ageGroups.map((group, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{group.range} ans</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#f01919] h-2 rounded-full" 
                        style={{ width: `${group.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-10">
                      {group.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Répartition par genre</h3>
              {profileMetrics.audience.demographics.genderSplit.map((gender, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{gender.gender}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${gender.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-10">
                      {gender.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comportement de l'audience</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{profileMetrics.audience.behavior.averageSessionDuration.toFixed(1)}min</p>
              <p className="text-xs text-gray-500">Durée moyenne</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{profileMetrics.audience.behavior.returnVisitorRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Visiteurs récurrents</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Heures de pic</h3>
              <div className="flex flex-wrap gap-1">
                {profileMetrics.audience.behavior.peakActivityHours.map((hour, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {hour}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Jours les plus actifs</h3>
              <div className="flex flex-wrap gap-1">
                {profileMetrics.audience.behavior.mostActiveDays.map((day, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Métriques de performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{profileMetrics.performance.reachRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Taux de portée</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{profileMetrics.performance.clickThroughRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">CTR</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{profileMetrics.performance.saveRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Taux de sauvegarde</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{profileMetrics.performance.shareRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Taux de partage</p>
          </div>
        </div>
      </div>

      {/* Quality Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scores de qualité</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Qualité de l'engagement</span>
              <span className={`text-lg font-bold ${getScoreColor(profileMetrics.audience.quality.engagementQuality)}`}>
                {profileMetrics.audience.quality.engagementQuality}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Croissance audience</span>
              <span className={`text-lg font-bold ${getScoreColor(profileMetrics.audience.quality.audienceGrowthQuality)}`}>
                {profileMetrics.audience.quality.audienceGrowthQuality}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Score viral</span>
              <span className={`text-lg font-bold ${getScoreColor(profileMetrics.performance.viralityScore)}`}>
                {profileMetrics.performance.viralityScore}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Score d'influence</span>
              <span className={`text-lg font-bold ${getScoreColor(profileMetrics.performance.influenceScore)}`}>
                {profileMetrics.performance.influenceScore}/100
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Réputation & Professionnalisme</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Note globale</span>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {renderStars(profileMetrics.reputation.overallRating)}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {profileMetrics.reputation.overallRating.toFixed(1)}/5
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Avis positifs</span>
              <span className="text-sm font-medium text-green-600">
                {profileMetrics.reputation.positiveReviewsPercentage.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Taux de réponse</span>
              <span className="text-sm font-medium text-blue-600">
                {profileMetrics.reputation.responseRate.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Temps de réponse</span>
              <span className="text-sm font-medium text-gray-900">
                {profileMetrics.reputation.averageResponseTime.toFixed(1)}h
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Professionnalisme</span>
                <span className={`text-sm font-bold ${getScoreColor(profileMetrics.reputation.professionalismScore)}`}>
                  {profileMetrics.reputation.professionalismScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Fiabilité</span>
                <span className={`text-sm font-bold ${getScoreColor(profileMetrics.reputation.reliabilityScore)}`}>
                  {profileMetrics.reputation.reliabilityScore}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance du contenu</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-900">{profileMetrics.content.totalPosts}</p>
            <p className="text-sm text-blue-600">Posts totaux</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-900">{profileMetrics.content.postsThisMonth}</p>
            <p className="text-sm text-green-600">Ce mois</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-900">{profileMetrics.content.averagePostsPerWeek.toFixed(1)}</p>
            <p className="text-sm text-purple-600">Posts/semaine</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className={`text-2xl font-bold ${getScoreColor(profileMetrics.content.contentConsistency)}`}>
              {profileMetrics.content.contentConsistency}/100
            </p>
            <p className="text-sm text-yellow-600">Consistance</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Type de contenu le plus performant</p>
              <p className="text-lg font-bold text-gray-900">{profileMetrics.content.topPerformingType}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Engagement moyen par post</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(profileMetrics.content.averageEngagementPerPost)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monetization Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTrendingUp className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-2">
              Insights de performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
              <div>
                <p className="font-medium mb-1">Points forts</p>
                <ul className="space-y-1">
                  <li>• Taux d'engagement supérieur à la moyenne (7.4%)</li>
                  <li>• Excellente rétention des followers (94.2%)</li>
                  <li>• Croissance constante des revenus (+18.5%)</li>
                  <li>• Très bon score de professionnalisme (91/100)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Axes d'amélioration</p>
                <ul className="space-y-1">
                  <li>• Augmenter la fréquence de publication</li>
                  <li>• Améliorer le taux de conversion (3.2%)</li>
                  <li>• Développer le potentiel viral (78/100)</li>
                  <li>• Optimiser les heures de publication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}