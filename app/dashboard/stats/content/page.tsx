'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { useApi } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { ContenuDashboard } from '../../../models/contenu';
import { 
  FiFileText, 
  FiVideo, 
  FiImage, 
  FiMic,
  FiEye, 
  FiHeart, 
  FiMessageCircle,
  FiShare2,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiClock,
  FiTarget,
  FiBarChart,
  FiPieChart,
  FiFilter,
  FiDownload,
  FiUsers,
  FiRefreshCw
} from 'react-icons/fi';

interface ContentStats {
  id: string;
  title: string;
  type: 'video' | 'image' | 'text' | 'audio' | 'carousel';
  laala: string;
  publishedAt: string;
  status: 'published' | 'scheduled' | 'draft' | 'archived';
  performance: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    engagementRate: number;
    reachRate: number;
    clickThroughRate: number;
  };
  audience: {
    totalReach: number;
    uniqueViewers: number;
    returningViewers: number;
    newViewers: number;
    averageWatchTime: number; // en secondes
    completionRate: number; // pourcentage
  };
  demographics: {
    topAgeGroup: string;
    topGender: string;
    topLocation: string;
    deviceBreakdown: {
      mobile: number;
      desktop: number;
      tablet: number;
    };
  };
  revenue: {
    directEarnings: number;
    indirectEarnings: number;
    courisEarnings: number;
    adsEarnings: number;
    totalEarnings: number;
  };
  trends: {
    viewsGrowth: number;
    engagementGrowth: number;
    reachGrowth: number;
    performanceScore: number; // score sur 100
  };
  optimization: {
    bestPostingTime: string;
    suggestedHashtags: string[];
    contentScore: number; // score qualité sur 100
    viralPotential: number; // score sur 100
  };
}

const contentStatsData: ContentStats[] = [
  {
    id: '1',
    title: 'Routine matinale pour être productive',
    type: 'video',
    laala: 'Mon Laala Lifestyle',
    publishedAt: '2024-01-15T08:00:00Z',
    status: 'published',
    performance: {
      views: 15420,
      likes: 892,
      comments: 156,
      shares: 89,
      saves: 234,
      engagementRate: 8.9,
      reachRate: 67.3,
      clickThroughRate: 3.2
    },
    audience: {
      totalReach: 22900,
      uniqueViewers: 14800,
      returningViewers: 620,
      newViewers: 14180,
      averageWatchTime: 185, // 3min 5sec
      completionRate: 72.4
    },
    demographics: {
      topAgeGroup: '25-34 ans',
      topGender: 'Femmes (74%)',
      topLocation: 'France (68%)',
      deviceBreakdown: {
        mobile: 78.5,
        desktop: 16.2,
        tablet: 5.3
      }
    },
    revenue: {
      directEarnings: 45.80,
      indirectEarnings: 12.30,
      courisEarnings: 26.70,
      adsEarnings: 18.90,
      totalEarnings: 103.70
    },
    trends: {
      viewsGrowth: 23.5,
      engagementGrowth: 15.8,
      reachGrowth: 18.2,
      performanceScore: 87
    },
    optimization: {
      bestPostingTime: '19h-21h',
      suggestedHashtags: ['#routine', '#productivité', '#lifestyle', '#motivation'],
      contentScore: 92,
      viralPotential: 78
    }
  },
  {
    id: '2',
    title: 'Formation React Avancé - Hooks personnalisés',
    type: 'video',
    laala: 'Tech & Innovation',
    publishedAt: '2024-01-14T14:30:00Z',
    status: 'published',
    performance: {
      views: 12800,
      likes: 756,
      comments: 234,
      shares: 145,
      saves: 389,
      engagementRate: 12.1,
      reachRate: 71.8,
      clickThroughRate: 5.6
    },
    audience: {
      totalReach: 17800,
      uniqueViewers: 12100,
      returningViewers: 700,
      newViewers: 11400,
      averageWatchTime: 420, // 7min
      completionRate: 68.9
    },
    demographics: {
      topAgeGroup: '22-35 ans',
      topGender: 'Hommes (62%)',
      topLocation: 'France (58%)',
      deviceBreakdown: {
        mobile: 45.2,
        desktop: 48.7,
        tablet: 6.1
      }
    },
    revenue: {
      directEarnings: 89.99,
      indirectEarnings: 25.40,
      courisEarnings: 35.20,
      adsEarnings: 22.10,
      totalEarnings: 172.69
    },
    trends: {
      viewsGrowth: 31.2,
      engagementGrowth: 28.7,
      reachGrowth: 25.1,
      performanceScore: 94
    },
    optimization: {
      bestPostingTime: '14h-16h',
      suggestedHashtags: ['#react', '#javascript', '#webdev', '#coding'],
      contentScore: 96,
      viralPotential: 85
    }
  },
  {
    id: '3',
    title: 'Recette healthy bowl automne',
    type: 'image',
    laala: 'Cuisine du Monde',
    publishedAt: '2024-01-13T12:00:00Z',
    status: 'published',
    performance: {
      views: 18900,
      likes: 1120,
      comments: 89,
      shares: 234,
      saves: 567,
      engagementRate: 10.6,
      reachRate: 73.2,
      clickThroughRate: 2.8
    },
    audience: {
      totalReach: 25800,
      uniqueViewers: 18200,
      returningViewers: 700,
      newViewers: 17500,
      averageWatchTime: 45, // temps de vue image
      completionRate: 89.3
    },
    demographics: {
      topAgeGroup: '30-45 ans',
      topGender: 'Femmes (81%)',
      topLocation: 'France (75%)',
      deviceBreakdown: {
        mobile: 82.1,
        desktop: 13.4,
        tablet: 4.5
      }
    },
    revenue: {
      directEarnings: 24.50,
      indirectEarnings: 8.90,
      courisEarnings: 20.00,
      adsEarnings: 15.60,
      totalEarnings: 69.00
    },
    trends: {
      viewsGrowth: 19.8,
      engagementGrowth: 22.3,
      reachGrowth: 16.7,
      performanceScore: 82
    },
    optimization: {
      bestPostingTime: '11h-13h',
      suggestedHashtags: ['#healthy', '#cuisine', '#recette', '#automne'],
      contentScore: 88,
      viralPotential: 72
    }
  },
  {
    id: '4',
    title: 'Tips productivité au travail',
    type: 'text',
    laala: 'Business & Productivité',
    publishedAt: '2024-01-12T16:45:00Z',
    status: 'published',
    performance: {
      views: 9800,
      likes: 567,
      comments: 123,
      shares: 78,
      saves: 189,
      engagementRate: 9.7,
      reachRate: 65.4,
      clickThroughRate: 4.1
    },
    audience: {
      totalReach: 14980,
      uniqueViewers: 9200,
      returningViewers: 600,
      newViewers: 8600,
      averageWatchTime: 120, // temps de lecture
      completionRate: 76.8
    },
    demographics: {
      topAgeGroup: '25-40 ans',
      topGender: 'Hommes (54%)',
      topLocation: 'France (72%)',
      deviceBreakdown: {
        mobile: 68.9,
        desktop: 26.7,
        tablet: 4.4
      }
    },
    revenue: {
      directEarnings: 15.20,
      indirectEarnings: 22.50,
      courisEarnings: 25.30,
      adsEarnings: 12.80,
      totalEarnings: 75.80
    },
    trends: {
      viewsGrowth: 12.4,
      engagementGrowth: 18.9,
      reachGrowth: 14.2,
      performanceScore: 79
    },
    optimization: {
      bestPostingTime: '09h-11h',
      suggestedHashtags: ['#productivité', '#business', '#tips', '#travail'],
      contentScore: 85,
      viralPotential: 68
    }
  },
  {
    id: '5',
    title: 'Méditation guidée 10 minutes',
    type: 'audio',
    laala: 'Bien-être & Méditation',
    publishedAt: '2024-01-11T20:00:00Z',
    status: 'published',
    performance: {
      views: 6780,
      likes: 345,
      comments: 67,
      shares: 34,
      saves: 234,
      engagementRate: 10.0,
      reachRate: 58.9,
      clickThroughRate: 2.1
    },
    audience: {
      totalReach: 11500,
      uniqueViewers: 6200,
      returningViewers: 580,
      newViewers: 5620,
      averageWatchTime: 480, // 8min sur 10min
      completionRate: 80.0
    },
    demographics: {
      topAgeGroup: '30-50 ans',
      topGender: 'Femmes (69%)',
      topLocation: 'France (71%)',
      deviceBreakdown: {
        mobile: 89.2,
        desktop: 8.1,
        tablet: 2.7
      }
    },
    revenue: {
      directEarnings: 8.50,
      indirectEarnings: 5.70,
      courisEarnings: 14.00,
      adsEarnings: 6.30,
      totalEarnings: 34.50
    },
    trends: {
      viewsGrowth: 8.7,
      engagementGrowth: 15.2,
      reachGrowth: 11.3,
      performanceScore: 75
    },
    optimization: {
      bestPostingTime: '20h-22h',
      suggestedHashtags: ['#méditation', '#bienêtre', '#relaxation', '#mindfulness'],
      contentScore: 81,
      viralPotential: 62
    }
  }
];

export default function ContentStatsPage() {
  const [contents, setContents] = useState<ContentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLaala, setFilterLaala] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'views' | 'engagement' | 'revenue' | 'performance'>('views');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Fonction pour générer des statistiques aléatoires
  const generateRandomStats = (contenu: ContenuDashboard): ContentStats => {
    const baseViews = Math.floor(Math.random() * 50000) + 1000;
    const engagementRate = Math.random() * 15 + 2; // 2-17%
    const likes = Math.floor(baseViews * (engagementRate / 100) * (Math.random() * 0.8 + 0.4));
    const comments = Math.floor(likes * (Math.random() * 0.3 + 0.1));
    const shares = Math.floor(likes * (Math.random() * 0.2 + 0.05));
    const saves = Math.floor(likes * (Math.random() * 0.4 + 0.2));

    const ageGroups = ['18-24 ans', '25-34 ans', '30-45 ans', '35-50 ans', '45-60 ans'];
    const genders = ['Femmes (68%)', 'Hommes (62%)', 'Femmes (74%)', 'Hommes (58%)', 'Mixte (50%)'];
    const locations = ['France (72%)', 'France (68%)', 'Europe (65%)', 'Francophonie (70%)'];
    const postingTimes = ['07h-09h', '09h-11h', '11h-13h', '14h-16h', '17h-19h', '19h-21h', '20h-22h'];
    
    const hashtagsByType = {
      video: ['#video', '#ContenuDashboard', '#créatif', '#viral'],
      image: ['#photo', '#visual', '#art', '#inspiration'],
      text: ['#article', '#blog', '#lecture', '#info'],
      audio: ['#audio', '#podcast', '#son', '#écoute'],
      carousel: ['#carrousel', '#série', '#collection', '#galerie']
    };

    const directEarnings = Math.random() * 200 + 10;
    const indirectEarnings = Math.random() * 100 + 5;
    const courisEarnings = Math.random() * 150 + 8;
    const adsEarnings = Math.random() * 80 + 3;

    return {
      id: contenu.id || '',
      title: contenu.nom || 'Contenu sans titre',
      type: (contenu.type as any) || 'text',
      laala: contenu.idLaala || 'Laala inconnu',
      publishedAt: contenu.date || new Date().toISOString(),
      status: 'published',
      performance: {
        views: baseViews,
        likes,
        comments,
        shares,
        saves,
        engagementRate: parseFloat(engagementRate.toFixed(1)),
        reachRate: Math.random() * 30 + 50, // 50-80%
        clickThroughRate: Math.random() * 8 + 1 // 1-9%
      },
      audience: {
        totalReach: Math.floor(baseViews * (Math.random() * 0.5 + 1.2)),
        uniqueViewers: Math.floor(baseViews * (Math.random() * 0.2 + 0.8)),
        returningViewers: Math.floor(baseViews * (Math.random() * 0.1 + 0.05)),
        newViewers: Math.floor(baseViews * (Math.random() * 0.3 + 0.7)),
        averageWatchTime: Math.floor(Math.random() * 300 + 30), // 30s-5min
        completionRate: Math.random() * 40 + 60 // 60-100%
      },
      demographics: {
        topAgeGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
        topGender: genders[Math.floor(Math.random() * genders.length)],
        topLocation: locations[Math.floor(Math.random() * locations.length)],
        deviceBreakdown: {
          mobile: Math.random() * 30 + 60, // 60-90%
          desktop: Math.random() * 25 + 10, // 10-35%
          tablet: Math.random() * 10 + 2 // 2-12%
        }
      },
      revenue: {
        directEarnings,
        indirectEarnings,
        courisEarnings,
        adsEarnings,
        totalEarnings: directEarnings + indirectEarnings + courisEarnings + adsEarnings
      },
      trends: {
        viewsGrowth: (Math.random() - 0.3) * 50, // -15% à +35%
        engagementGrowth: (Math.random() - 0.2) * 40, // -8% à +32%
        reachGrowth: (Math.random() - 0.25) * 35, // -8.75% à +26.25%
        performanceScore: Math.floor(Math.random() * 40 + 60) // 60-100
      },
      optimization: {
        bestPostingTime: postingTimes[Math.floor(Math.random() * postingTimes.length)],
        suggestedHashtags: hashtagsByType[contenu.type as keyof typeof hashtagsByType] || hashtagsByType.text,
        contentScore: Math.floor(Math.random() * 30 + 70), // 70-100
        viralPotential: Math.floor(Math.random() * 40 + 40) // 40-80
      }
    };
  };

  // Récupération des contenus depuis l'API
  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des contenus pour utilisateur:', user.uid);
      const contenuData = await apiFetch('/api/contenus');
      
      if (!Array.isArray(contenuData)) {
        console.warn('⚠️ Réponse API inattendue:', contenuData);
        setContents([]);
        return;
      }
      
      // Filtrer les contenus de l'utilisateur et générer des statistiques
      const userContents = contenuData.filter((contenu: ContenuDashboard) => 
        contenu.idCreateur === user.uid
      );
      
      const contentsWithStats: ContentStats[] = userContents.map(generateRandomStats);
      
      setContents(contentsWithStats);
      console.log('✅ Contenus avec statistiques générés:', contentsWithStats.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération contenus:', err);
      setError(`Erreur lors du chargement des contenus: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchContents();
    }
  }, [user]);

  const filteredContents = contents
    .filter(content => {
      const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.laala.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || content.type === filterType;
      const matchesLaala = filterLaala === 'all' || content.laala === filterLaala;
      return matchesSearch && matchesType && matchesLaala;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'views': return b.performance.views - a.performance.views;
        case 'engagement': return b.performance.engagementRate - a.performance.engagementRate;
        case 'revenue': return b.revenue.totalEarnings - a.revenue.totalEarnings;
        case 'performance': return b.trends.performanceScore - a.trends.performanceScore;
        default: return 0;
      }
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <FiVideo className="w-5 h-5" />;
      case 'image': return <FiImage className="w-5 h-5" />;
      case 'text': return <FiFileText className="w-5 h-5" />;
      case 'audio': return <FiMic className="w-5 h-5" />;
      case 'carousel': return <FiImage className="w-5 h-5" />;
      default: return <FiFileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'image': return 'bg-blue-100 text-blue-800';
      case 'text': return 'bg-green-100 text-green-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      case 'carousel': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Vidéo';
      case 'image': return 'Image';
      case 'text': return 'Texte';
      case 'audio': return 'Audio';
      case 'carousel': return 'Carrousel';
      default: return type;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}min ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const laalas = Array.from(new Set(contents.map(c => c.laala)));
  
  // Global stats
  const totalViews = contents.reduce((sum, c) => sum + c.performance.views, 0);
  const totalEngagement = contents.reduce((sum, c) => sum + c.performance.likes + c.performance.comments + c.performance.shares, 0);
  const totalRevenue = contents.reduce((sum, c) => sum + c.revenue.totalEarnings, 0);
  const averagePerformance = contents.length > 0 ? contents.reduce((sum, c) => sum + c.trends.performanceScore, 0) / contents.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques du ContenuDashboard</h1>
          <p className="text-gray-600 mt-1">
            Analysez les performances de tous vos contenus
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
          <p className="text-gray-600">Chargement des statistiques de ContenuDashboard...</p>
        </div>
      )}

      {/* Global Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vues Totales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalViews)}</p>
                <p className="text-sm text-blue-600 mt-1">Tous contenus</p>
              </div>
              <div className="p-3 rounded-lg bg-[#f01919]">
                <FiEye className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interactions Totales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalEngagement)}</p>
                <p className="text-sm text-green-600 mt-1">Engagement global</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <FiHeart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Générés</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-purple-600 mt-1">Total ContenuDashboard</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Moyenne</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{averagePerformance.toFixed(0)}/100</p>
                <p className="text-sm text-blue-600 mt-1">Score global</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <FiTarget className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Type Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par type de ContenuDashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['video', 'image', 'text', 'audio', 'carousel'].map(type => {
            const count = contents.filter(c => c.type === type).length;
            const percentage = contents.length > 0 ? (count / contents.length) * 100 : 0;
            return (
              <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex p-3 rounded-lg mb-2 ${getTypeColor(type)}`}>
                  {getTypeIcon(type)}
                </div>
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{getTypeLabel(type)}</p>
                <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Rechercher un ContenuDashboard..."
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
              <option value="video">Vidéo</option>
              <option value="image">Image</option>
              <option value="text">Texte</option>
              <option value="audio">Audio</option>
              <option value="carousel">Carrousel</option>
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
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="views">Plus de vues</option>
              <option value="engagement">Meilleur engagement</option>
              <option value="revenue">Plus rentables</option>
              <option value="performance">Meilleures performances</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Stats List */}
      <div className="space-y-6">
        {filteredContents.map((content) => (
          <div key={content.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${getTypeColor(content.type)}`}>
                    {getTypeIcon(content.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>📍 {content.laala}</span>
                      <span>📅 {formatDate(content.publishedAt)}</span>
                      <span className={`font-medium ${getPerformanceColor(content.trends.performanceScore)}`}>
                        Score: {content.trends.performanceScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(content.performance.views)}</p>
                <p className="text-sm text-gray-500">Vues</p>
                <p className="text-xs text-green-600">{formatCurrency(content.revenue.totalEarnings)}</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiHeart className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{formatNumber(content.performance.likes)}</span>
                </div>
                <p className="text-xs text-gray-500">Likes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiMessageCircle className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{formatNumber(content.performance.comments)}</span>
                </div>
                <p className="text-xs text-gray-500">Commentaires</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiShare2 className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{formatNumber(content.performance.shares)}</span>
                </div>
                <p className="text-xs text-gray-500">Partages</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiTarget className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{content.performance.engagementRate.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-500">Engagement</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiUsers className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{content.performance.reachRate.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-500">Portée</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiClock className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{content.audience.completionRate.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-500">Completion</p>
              </div>
            </div>

            {/* Audience Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Audience</h4>
                <div className="text-sm text-blue-700">
                  <p>Portée: {formatNumber(content.audience.totalReach)}</p>
                  <p>Vues uniques: {formatNumber(content.audience.uniqueViewers)}</p>
                  <p>Nouveaux: {formatNumber(content.audience.newViewers)}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Démographie</h4>
                <div className="text-sm text-blue-700">
                  <p>{content.demographics.topAgeGroup}</p>
                  <p>{content.demographics.topGender}</p>
                  <p>{content.demographics.topLocation}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Appareils</h4>
                <div className="text-sm text-blue-700">
                  <p>Mobile: {content.demographics.deviceBreakdown.mobile.toFixed(1)}%</p>
                  <p>Desktop: {content.demographics.deviceBreakdown.desktop.toFixed(1)}%</p>
                  <p>Tablette: {content.demographics.deviceBreakdown.tablet.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-green-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-green-900">{formatCurrency(content.revenue.directEarnings)}</p>
                <p className="text-xs text-green-600">Direct</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-900">{formatCurrency(content.revenue.indirectEarnings)}</p>
                <p className="text-xs text-green-600">Indirect</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-900">{formatCurrency(content.revenue.courisEarnings)}</p>
                <p className="text-xs text-green-600">Couris</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-900">{formatCurrency(content.revenue.adsEarnings)}</p>
                <p className="text-xs text-green-600">Publicité</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-900">{formatCurrency(content.revenue.totalEarnings)}</p>
                <p className="text-xs text-green-600">Total</p>
              </div>
            </div>

            {/* Growth Trends */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`flex items-center justify-center mb-1 ${getGrowthColor(content.trends.viewsGrowth)}`}>
                  {content.trends.viewsGrowth > 0 ? <FiTrendingUp className="w-4 h-4 mr-1" /> : <FiTrendingDown className="w-4 h-4 mr-1" />}
                  <span className="text-sm font-medium">
                    {content.trends.viewsGrowth > 0 ? '+' : ''}{content.trends.viewsGrowth.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">Croissance vues</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`flex items-center justify-center mb-1 ${getGrowthColor(content.trends.engagementGrowth)}`}>
                  {content.trends.engagementGrowth > 0 ? <FiTrendingUp className="w-4 h-4 mr-1" /> : <FiTrendingDown className="w-4 h-4 mr-1" />}
                  <span className="text-sm font-medium">
                    {content.trends.engagementGrowth > 0 ? '+' : ''}{content.trends.engagementGrowth.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">Croissance engagement</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`flex items-center justify-center mb-1 ${getPerformanceColor(content.optimization.contentScore)}`}>
                  <FiTarget className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{content.optimization.contentScore}/100</span>
                </div>
                <p className="text-xs text-gray-500">Score ContenuDashboard</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`flex items-center justify-center mb-1 ${getPerformanceColor(content.optimization.viralPotential)}`}>
                  <FiBarChart className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{content.optimization.viralPotential}/100</span>
                </div>
                <p className="text-xs text-gray-500">Potentiel viral</p>
              </div>
            </div>

            {/* Optimization Suggestions */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Optimisations suggérées</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
                <div>
                  <p><strong>Meilleur moment:</strong> {content.optimization.bestPostingTime}</p>
                  <p><strong>Temps de vue moyen:</strong> {formatDuration(content.audience.averageWatchTime)}</p>
                </div>
                <div>
                  <p><strong>Hashtags suggérés:</strong></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {content.optimization.suggestedHashtags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
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
                Dernière analyse: il y a 1h
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContents.length === 0 && (
        <div className="text-center py-12">
          <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun ContenuDashboard trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterLaala !== 'all'
              ? 'Aucun ContenuDashboard ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore publié de ContenuDashboard.'
            }
          </p>
        </div>
      )}

      {/* Content Performance Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTrendingUp className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-purple-900 mb-2">
              Analyse de performance du ContenuDashboard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-700">
              <div>
                <p className="font-medium mb-1">Métriques globales</p>
                <ul className="space-y-1">
                  <li>• {formatNumber(totalViews)} vues au total</li>
                  <li>• {formatNumber(totalEngagement)} interactions</li>
                  <li>• {formatCurrency(totalRevenue)} de revenus générés</li>
                  <li>• {averagePerformance.toFixed(0)}/100 de performance moyenne</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Optimisations recommandées</p>
                <ul className="space-y-1">
                  <li>• Analysez vos contenus les plus performants</li>
                  <li>• Reproduisez les formats qui fonctionnent</li>
                  <li>• Optimisez les heures de publication</li>
                  <li>• Améliorez l'engagement avec votre audience</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
