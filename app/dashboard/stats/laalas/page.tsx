'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { useApi } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { LaalaDashboard } from '../../../models/laala';
import { 
  FiTrendingUp, 
  FiEye, 
  FiHeart, 
  FiMessageCircle,
  FiShare2,
  FiUsers,
  FiCalendar,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiTarget,
  FiFilter,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';

interface LaalaStats {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  isActive: boolean;
  followers: {
    total: number;
    growth: number;
    growthRate: number;
  };
  engagement: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    engagementRate: number;
    averageTimeSpent: number; // en minutes
  };
  content: {
    totalPosts: number;
    postsThisMonth: number;
    averagePostsPerWeek: number;
    topPerformingPost: {
      title: string;
      views: number;
      engagement: number;
    };
  };
  revenue: {
    totalEarnings: number;
    monthlyEarnings: number;
    averageRevenuePerPost: number;
    revenueGrowth: number;
  };
  demographics: {
    topAgeGroup: string;
    topGender: string;
    topLocation: string;
    audienceQuality: number; // score sur 100
  };
  performance: {
    bestDay: string;
    bestTime: string;
    peakEngagementHour: number;
    consistencyScore: number; // score sur 100
  };
  trends: {
    viewsTrend: number[];
    engagementTrend: number[];
    followersTrend: number[];
    revenueTrend: number[];
  };
}

const laalaStatsData: LaalaStats[] = [
  {
    id: '1',
    name: 'Mon Laala Lifestyle',
    category: 'Lifestyle & Bien-être',
    createdAt: '2023-03-15',
    isActive: true,
    followers: {
      total: 12450,
      growth: 234,
      growthRate: 1.9
    },
    engagement: {
      totalViews: 485000,
      totalLikes: 28900,
      totalComments: 4560,
      totalShares: 1890,
      engagementRate: 7.2,
      averageTimeSpent: 3.4
    },
    content: {
      totalPosts: 156,
      postsThisMonth: 12,
      averagePostsPerWeek: 3.2,
      topPerformingPost: {
        title: 'Routine matinale pour être productive',
        views: 15420,
        engagement: 892
      }
    },
    revenue: {
      totalEarnings: 8450.50,
      monthlyEarnings: 1245.80,
      averageRevenuePerPost: 54.17,
      revenueGrowth: 15.3
    },
    demographics: {
      topAgeGroup: '25-34 ans',
      topGender: 'Femmes (68%)',
      topLocation: 'France (72%)',
      audienceQuality: 87
    },
    performance: {
      bestDay: 'Mercredi',
      bestTime: '19h-21h',
      peakEngagementHour: 20,
      consistencyScore: 82
    },
    trends: {
      viewsTrend: [12000, 13500, 15200, 14800, 16900, 18200, 19500],
      engagementTrend: [6.2, 6.8, 7.1, 6.9, 7.5, 7.8, 7.2],
      followersTrend: [11800, 11950, 12100, 12200, 12300, 12400, 12450],
      revenueTrend: [890, 950, 1020, 1150, 1200, 1300, 1245]
    }
  },
  {
    id: '2',
    name: 'Tech & Innovation',
    category: 'Technologie',
    createdAt: '2023-06-20',
    isActive: true,
    followers: {
      total: 8920,
      growth: 156,
      growthRate: 1.8
    },
    engagement: {
      totalViews: 298000,
      totalLikes: 18500,
      totalComments: 2890,
      totalShares: 1240,
      engagementRate: 6.8,
      averageTimeSpent: 4.1
    },
    content: {
      totalPosts: 89,
      postsThisMonth: 8,
      averagePostsPerWeek: 2.5,
      topPerformingPost: {
        title: 'Formation React Avancé',
        views: 12800,
        engagement: 756
      }
    },
    revenue: {
      totalEarnings: 5680.20,
      monthlyEarnings: 890.40,
      averageRevenuePerPost: 63.82,
      revenueGrowth: 22.1
    },
    demographics: {
      topAgeGroup: '22-35 ans',
      topGender: 'Hommes (58%)',
      topLocation: 'France (65%)',
      audienceQuality: 91
    },
    performance: {
      bestDay: 'Mardi',
      bestTime: '14h-16h',
      peakEngagementHour: 15,
      consistencyScore: 78
    },
    trends: {
      viewsTrend: [8500, 9200, 10100, 11200, 12000, 12500, 11800],
      engagementTrend: [5.8, 6.2, 6.5, 6.9, 7.2, 7.0, 6.8],
      followersTrend: [8200, 8350, 8500, 8650, 8750, 8850, 8920],
      revenueTrend: [650, 720, 780, 820, 890, 920, 890]
    }
  },
  {
    id: '3',
    name: 'Cuisine du Monde',
    category: 'Cuisine & Gastronomie',
    createdAt: '2023-01-10',
    isActive: true,
    followers: {
      total: 15680,
      growth: 189,
      growthRate: 1.2
    },
    engagement: {
      totalViews: 567000,
      totalLikes: 34200,
      totalComments: 5670,
      totalShares: 2340,
      engagementRate: 7.5,
      averageTimeSpent: 2.8
    },
    content: {
      totalPosts: 203,
      postsThisMonth: 15,
      averagePostsPerWeek: 4.1,
      topPerformingPost: {
        title: 'Recette healthy bowl automne',
        views: 18900,
        engagement: 1120
      }
    },
    revenue: {
      totalEarnings: 12340.80,
      monthlyEarnings: 1890.60,
      averageRevenuePerPost: 60.79,
      revenueGrowth: 8.7
    },
    demographics: {
      topAgeGroup: '30-45 ans',
      topGender: 'Femmes (74%)',
      topLocation: 'France (78%)',
      audienceQuality: 85
    },
    performance: {
      bestDay: 'Dimanche',
      bestTime: '11h-13h',
      peakEngagementHour: 12,
      consistencyScore: 89
    },
    trends: {
      viewsTrend: [18000, 19200, 20100, 19800, 21200, 22000, 20500],
      engagementTrend: [7.1, 7.3, 7.6, 7.4, 7.8, 7.9, 7.5],
      followersTrend: [15200, 15300, 15400, 15500, 15600, 15650, 15680],
      revenueTrend: [1650, 1720, 1800, 1850, 1900, 1950, 1890]
    }
  },
  {
    id: '4',
    name: 'Fitness & Santé',
    category: 'Sport & Fitness',
    createdAt: '2023-08-05',
    isActive: false,
    followers: {
      total: 6780,
      growth: -23,
      growthRate: -0.3
    },
    engagement: {
      totalViews: 189000,
      totalLikes: 11200,
      totalComments: 1890,
      totalShares: 780,
      engagementRate: 5.9,
      averageTimeSpent: 2.1
    },
    content: {
      totalPosts: 67,
      postsThisMonth: 3,
      averagePostsPerWeek: 1.2,
      topPerformingPost: {
        title: 'Workout HIIT 20 minutes',
        views: 9800,
        engagement: 567
      }
    },
    revenue: {
      totalEarnings: 2890.40,
      monthlyEarnings: 234.50,
      averageRevenuePerPost: 43.14,
      revenueGrowth: -12.4
    },
    demographics: {
      topAgeGroup: '20-30 ans',
      topGender: 'Hommes (52%)',
      topLocation: 'France (68%)',
      audienceQuality: 76
    },
    performance: {
      bestDay: 'Lundi',
      bestTime: '07h-09h',
      peakEngagementHour: 8,
      consistencyScore: 45
    },
    trends: {
      viewsTrend: [8900, 8200, 7800, 7200, 6800, 6200, 5900],
      engagementTrend: [6.8, 6.5, 6.2, 5.9, 5.6, 5.8, 5.9],
      followersTrend: [7100, 7050, 7000, 6950, 6850, 6800, 6780],
      revenueTrend: [450, 380, 320, 280, 250, 240, 234]
    }
  }
];

export default function LaalaStatsPage() {
  const [stats, setStats] = useState<LaalaStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'followers' | 'engagement' | 'revenue' | 'growth'>('followers');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Fonction pour générer des statistiques aléatoires
  const generateRandomStats = (laala: LaalaDashboard): LaalaStats => {
    const baseFollowers = Math.floor(Math.random() * 50000) + 500;
    const baseViews = Math.floor(Math.random() * 1000000) + 10000;
    const engagementRate = Math.random() * 12 + 3; // 3-15%
    const totalLikes = Math.floor(baseViews * (engagementRate / 100) * (Math.random() * 0.6 + 0.4));
    const totalComments = Math.floor(totalLikes * (Math.random() * 0.2 + 0.1));
    const totalShares = Math.floor(totalLikes * (Math.random() * 0.15 + 0.05));

    const categories = [
      'Lifestyle & Bien-être', 'Technologie', 'Cuisine & Gastronomie', 
      'Sport & Fitness', 'Mode & Beauté', 'Voyage & Culture', 
      'Business & Entrepreneuriat', 'Art & Créativité'
    ];
    
    const ageGroups = ['18-24 ans', '25-34 ans', '30-45 ans', '35-50 ans', '45-60 ans'];
    const genders = ['Femmes (68%)', 'Hommes (62%)', 'Femmes (74%)', 'Hommes (58%)', 'Mixte (50%)'];
    const locations = ['France (72%)', 'France (68%)', 'Europe (65%)', 'Francophonie (70%)'];
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const times = ['07h-09h', '09h-11h', '11h-13h', '14h-16h', '17h-19h', '19h-21h', '20h-22h'];

    const totalPosts = Math.floor(Math.random() * 200) + 20;
    const postsThisMonth = Math.floor(Math.random() * 20) + 1;
    const monthlyEarnings = Math.random() * 3000 + 200;
    const totalEarnings = monthlyEarnings * (Math.random() * 12 + 6);
    const followerGrowth = Math.floor((Math.random() - 0.2) * 500); // -100 à +400
    const followerGrowthRate = (followerGrowth / baseFollowers) * 100;

    return {
      id: laala.id || '',
      name: laala.nom || 'Laala sans nom',
      category: categories[Math.floor(Math.random() * categories.length)],
      createdAt: laala.date || new Date().toISOString(),
      isActive: Math.random() > 0.2, // 80% de chance d'être actif
      followers: {
        total: baseFollowers,
        growth: followerGrowth,
        growthRate: parseFloat(followerGrowthRate.toFixed(1))
      },
      engagement: {
        totalViews: baseViews,
        totalLikes,
        totalComments,
        totalShares,
        engagementRate: parseFloat(engagementRate.toFixed(1)),
        averageTimeSpent: Math.random() * 5 + 1 // 1-6 minutes
      },
      content: {
        totalPosts,
        postsThisMonth,
        averagePostsPerWeek: parseFloat((postsThisMonth / 4).toFixed(1)),
        topPerformingPost: {
          title: `Contenu populaire de ${laala.nom}`,
          views: Math.floor(Math.random() * 50000) + 5000,
          engagement: Math.floor(Math.random() * 2000) + 200
        }
      },
      revenue: {
        totalEarnings,
        monthlyEarnings,
        averageRevenuePerPost: parseFloat((monthlyEarnings / postsThisMonth).toFixed(2)),
        revenueGrowth: (Math.random() - 0.3) * 50 // -15% à +35%
      },
      demographics: {
        topAgeGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
        topGender: genders[Math.floor(Math.random() * genders.length)],
        topLocation: locations[Math.floor(Math.random() * locations.length)],
        audienceQuality: Math.floor(Math.random() * 40 + 60) // 60-100
      },
      performance: {
        bestDay: days[Math.floor(Math.random() * days.length)],
        bestTime: times[Math.floor(Math.random() * times.length)],
        peakEngagementHour: Math.floor(Math.random() * 24),
        consistencyScore: Math.floor(Math.random() * 50 + 50) // 50-100
      },
      trends: {
        viewsTrend: Array.from({length: 7}, () => Math.floor(Math.random() * 20000) + 5000),
        engagementTrend: Array.from({length: 7}, () => Math.random() * 5 + 3),
        followersTrend: Array.from({length: 7}, (_, i) => baseFollowers - (6-i) * 50 + Math.floor(Math.random() * 100)),
        revenueTrend: Array.from({length: 7}, () => Math.random() * 500 + 100)
      }
    };
  };

  // Récupération des laalas depuis l'API
  const fetchLaalas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des laalas pour utilisateur:', user.uid);
      const laalaData = await apiFetch('/api/laalas');
      
      if (!Array.isArray(laalaData)) {
        console.warn('⚠️ Réponse API inattendue:', laalaData);
        setStats([]);
        return;
      }
      
      // Filtrer les laalas de l'utilisateur et générer des statistiques
      const userLaalas = laalaData.filter((laala: LaalaDashboard) => 
        laala.idCreateur === user.uid
      );
      
      const laalasWithStats: LaalaStats[] = userLaalas.map(generateRandomStats);
      
      setStats(laalasWithStats);
      console.log('✅ Laalas avec statistiques générés:', laalasWithStats.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération laalas:', err);
      setError(`Erreur lors du chargement des laalas: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchLaalas();
    }
  }, [user]);

  const filteredStats = stats
    .filter(laala => {
      const matchesSearch = laala.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           laala.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || laala.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && laala.isActive) ||
                           (filterStatus === 'inactive' && !laala.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'followers': return b.followers.total - a.followers.total;
        case 'engagement': return b.engagement.engagementRate - a.engagement.engagementRate;
        case 'revenue': return b.revenue.monthlyEarnings - a.revenue.monthlyEarnings;
        case 'growth': return b.followers.growthRate - a.followers.growthRate;
        default: return 0;
      }
    });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const categories = Array.from(new Set(stats.map(s => s.category)));
  
  // Global stats
  const totalFollowers = stats.reduce((sum, s) => sum + s.followers.total, 0);
  const totalViews = stats.reduce((sum, s) => sum + s.engagement.totalViews, 0);
  const totalRevenue = stats.reduce((sum, s) => sum + s.revenue.monthlyEarnings, 0);
  const averageEngagement = stats.length > 0 ? stats.reduce((sum, s) => sum + s.engagement.engagementRate, 0) / stats.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques des Laalas</h1>
          <p className="text-gray-600 mt-1">
            Analysez les performances de tous vos Laalas
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

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FiRefreshCw className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* État de chargement */}
      {loading && (
        <div className="text-center py-8">
          <FiRefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600">Chargement des statistiques des Laalas...</p>
        </div>
      )}

      {/* Global Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Followers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalFollowers)}</p>
                <p className="text-sm text-blue-600 mt-1">Tous Laalas</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalViews)}</p>
                <p className="text-sm text-green-600 mt-1">Portée globale</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <FiEye className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-purple-600 mt-1">Ce mois</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Moyen</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{averageEngagement.toFixed(1)}%</p>
                <p className="text-sm text-blue-600 mt-1">Taux global</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <FiHeart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Rechercher un Laala..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="followers">Plus de followers</option>
              <option value="engagement">Meilleur engagement</option>
              <option value="revenue">Plus rentables</option>
              <option value="growth">Croissance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Laalas Stats List */}
      <div className="space-y-6">
        {filteredStats.map((laala) => (
          <div key={laala.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{laala.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    laala.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {laala.isActive ? 'Actif' : 'Inactif'}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {laala.category}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📅 Créé le {formatDate(laala.createdAt)}</span>
                  <span>📝 {laala.content.totalPosts} posts</span>
                  <span>⭐ Qualité audience: {laala.demographics.audienceQuality}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(laala.followers.total)}</p>
                <p className="text-sm text-gray-500">Followers</p>
                <div className={`text-sm font-medium ${getGrowthColor(laala.followers.growthRate)}`}>
                  {laala.followers.growthRate > 0 ? '+' : ''}{laala.followers.growthRate.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{formatNumber(laala.engagement.totalViews)}</p>
                <p className="text-xs text-gray-500">Vues</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{laala.engagement.engagementRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Engagement</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(laala.revenue.monthlyEarnings)}</p>
                <p className="text-xs text-gray-500">Revenus/mois</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{laala.content.postsThisMonth}</p>
                <p className="text-xs text-gray-500">Posts ce mois</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{laala.engagement.averageTimeSpent.toFixed(1)}min</p>
                <p className="text-xs text-gray-500">Temps moyen</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold ${getPerformanceColor(laala.performance.consistencyScore)}`}>
                  {laala.performance.consistencyScore}
                </p>
                <p className="text-xs text-gray-500">Consistance</p>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Audience principale</h4>
                <p className="text-sm text-blue-700">{laala.demographics.topAgeGroup}</p>
                <p className="text-sm text-blue-700">{laala.demographics.topGender}</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Localisation</h4>
                <p className="text-sm text-blue-700">{laala.demographics.topLocation}</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Performance optimale</h4>
                <p className="text-sm text-blue-700">{laala.performance.bestDay}</p>
                <p className="text-sm text-blue-700">{laala.performance.bestTime}</p>
              </div>
            </div>

            {/* Top Performing Content */}
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Contenu le plus performant</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">{laala.content.topPerformingPost.title}</p>
                  <p className="text-xs text-green-600">
                    {formatNumber(laala.content.topPerformingPost.views)} vues • 
                    {formatNumber(laala.content.topPerformingPost.engagement)} interactions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-800">
                    {formatCurrency(laala.revenue.averageRevenuePerPost)}
                  </p>
                  <p className="text-xs text-green-600">Revenus/post moyen</p>
                </div>
              </div>
            </div>

            {/* Trend Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <FiTrendingUp className={`w-4 h-4 mr-1 ${getGrowthColor(laala.followers.growthRate)}`} />
                  <span className={`text-sm font-medium ${getGrowthColor(laala.followers.growthRate)}`}>
                    Followers
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {laala.followers.growth > 0 ? '+' : ''}{laala.followers.growth} ce mois
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <FiActivity className={`w-4 h-4 mr-1 ${getGrowthColor(laala.revenue.revenueGrowth)}`} />
                  <span className={`text-sm font-medium ${getGrowthColor(laala.revenue.revenueGrowth)}`}>
                    Revenus
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {laala.revenue.revenueGrowth > 0 ? '+' : ''}{laala.revenue.revenueGrowth.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <FiBarChart className="w-4 h-4 mr-1 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Posts/semaine</span>
                </div>
                <p className="text-xs text-gray-500">
                  {laala.content.averagePostsPerWeek.toFixed(1)} en moyenne
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <FiTarget className={`w-4 h-4 mr-1 ${getPerformanceColor(laala.demographics.audienceQuality)}`} />
                  <span className={`text-sm font-medium ${getPerformanceColor(laala.demographics.audienceQuality)}`}>
                    Qualité
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {laala.demographics.audienceQuality}% score
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <FiBarChart className="w-4 h-4 mr-1" />
                  Analytics détaillés
                </Button>
                <Button size="sm" variant="outline">
                  <FiPieChart className="w-4 h-4 mr-1" />
                  Rapport complet
                </Button>
                <Button size="sm" variant="outline">
                  <FiTarget className="w-4 h-4 mr-1" />
                  Optimiser
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Dernière mise à jour: il y a 2h
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStats.length === 0 && (
        <div className="text-center py-12">
          <FiBarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun Laala trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Aucun Laala ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore créé de Laalas.'
            }
          </p>
        </div>
      )}

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTrendingUp className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Résumé des performances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-1">Métriques globales</p>
                <ul className="space-y-1">
                  <li>• {formatNumber(totalFollowers)} followers au total</li>
                  <li>• {formatNumber(totalViews)} vues cumulées</li>
                  <li>• {formatCurrency(totalRevenue)} de revenus mensuels</li>
                  <li>• {averageEngagement.toFixed(1)}% d'engagement moyen</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Recommandations</p>
                <ul className="space-y-1">
                  <li>• Concentrez-vous sur vos Laalas les plus performants</li>
                  <li>• Analysez les heures de pic d'engagement</li>
                  <li>• Reproduisez le contenu qui fonctionne le mieux</li>
                  <li>• Optimisez la fréquence de publication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}