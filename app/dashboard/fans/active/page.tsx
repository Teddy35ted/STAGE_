'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiZap, 
  FiUsers, 
  FiHeart, 
  FiMessageCircle,
  FiShare2,
  FiEye,
  FiClock,
  FiTrendingUp,
  FiCalendar,
  FiFilter,
  FiMail
} from 'react-icons/fi';

interface ActiveFan {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastActivity: string;
  activityScore: number;
  dailyEngagement: number;
  weeklyEngagement: number;
  monthlyEngagement: number;
  streakDays: number;
  favoriteTimeSlots: string[];
  activityTypes: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    messages: number;
  };
  recentActivities: {
    type: 'view' | 'like' | 'comment' | 'share' | 'message';
    content: string;
    timestamp: string;
  }[];
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
  joinedAt: string;
}

const activeFansData: ActiveFan[] = [
  {
    id: '1',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    lastActivity: '2024-01-15T16:30:00Z',
    activityScore: 9.2,
    dailyEngagement: 15,
    weeklyEngagement: 89,
    monthlyEngagement: 342,
    streakDays: 12,
    favoriteTimeSlots: ['18:00-20:00', '12:00-14:00'],
    activityTypes: {
      views: 156,
      likes: 89,
      comments: 23,
      shares: 12,
      messages: 8
    },
    recentActivities: [
      { type: 'comment', content: 'Super recette ! Je vais essayer ce soir', timestamp: '2024-01-15T16:30:00Z' },
      { type: 'like', content: 'Routine matinale du lundi', timestamp: '2024-01-15T16:25:00Z' },
      { type: 'share', content: 'Guide nutrition', timestamp: '2024-01-15T15:45:00Z' },
      { type: 'view', content: 'Workout HIIT 20 minutes', timestamp: '2024-01-15T15:30:00Z' }
    ],
    engagementTrend: 'increasing',
    joinedAt: '2023-08-20'
  },
  {
    id: '2',
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    lastActivity: '2024-01-15T14:20:00Z',
    activityScore: 8.7,
    dailyEngagement: 12,
    weeklyEngagement: 76,
    monthlyEngagement: 298,
    streakDays: 8,
    favoriteTimeSlots: ['08:00-10:00', '20:00-22:00'],
    activityTypes: {
      views: 134,
      likes: 67,
      comments: 19,
      shares: 8,
      messages: 5
    },
    recentActivities: [
      { type: 'like', content: 'Tutoriel React avancé', timestamp: '2024-01-15T14:20:00Z' },
      { type: 'comment', content: 'Très utile, merci !', timestamp: '2024-01-15T14:15:00Z' },
      { type: 'view', content: 'Formation JavaScript', timestamp: '2024-01-15T14:00:00Z' },
      { type: 'message', content: 'Question sur le cours', timestamp: '2024-01-15T13:45:00Z' }
    ],
    engagementTrend: 'stable',
    joinedAt: '2023-06-15'
  },
  {
    id: '3',
    name: 'Thomas Martin',
    email: 'thomas.martin@email.com',
    lastActivity: '2024-01-15T12:10:00Z',
    activityScore: 8.1,
    dailyEngagement: 10,
    weeklyEngagement: 65,
    monthlyEngagement: 245,
    streakDays: 5,
    favoriteTimeSlots: ['07:00-09:00', '17:00-19:00'],
    activityTypes: {
      views: 98,
      likes: 45,
      comments: 12,
      shares: 6,
      messages: 3
    },
    recentActivities: [
      { type: 'view', content: 'Présentation startup', timestamp: '2024-01-15T12:10:00Z' },
      { type: 'like', content: 'Tips entrepreneuriat', timestamp: '2024-01-15T12:05:00Z' },
      { type: 'comment', content: 'Excellent conseil !', timestamp: '2024-01-15T11:50:00Z' },
      { type: 'share', content: 'Guide business plan', timestamp: '2024-01-15T11:30:00Z' }
    ],
    engagementTrend: 'increasing',
    joinedAt: '2023-09-10'
  },
  {
    id: '4',
    name: 'Julie Moreau',
    email: 'julie.moreau@email.com',
    lastActivity: '2024-01-15T10:45:00Z',
    activityScore: 7.8,
    dailyEngagement: 8,
    weeklyEngagement: 52,
    monthlyEngagement: 198,
    streakDays: 3,
    favoriteTimeSlots: ['12:00-14:00', '19:00-21:00'],
    activityTypes: {
      views: 87,
      likes: 34,
      comments: 8,
      shares: 4,
      messages: 2
    },
    recentActivities: [
      { type: 'view', content: 'Recettes healthy', timestamp: '2024-01-15T10:45:00Z' },
      { type: 'like', content: 'Menu de la semaine', timestamp: '2024-01-15T10:30:00Z' },
      { type: 'comment', content: 'Ça a l\'air délicieux', timestamp: '2024-01-15T10:15:00Z' },
      { type: 'view', content: 'Tips cuisine rapide', timestamp: '2024-01-15T10:00:00Z' }
    ],
    engagementTrend: 'decreasing',
    joinedAt: '2023-11-05'
  }
];

export default function ActiveFansPage() {
  const [fans, setFans] = useState<ActiveFan[]>(activeFansData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'activityScore' | 'dailyEngagement' | 'streakDays'>('activityScore');
  const [filterTrend, setFilterTrend] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const filteredAndSortedFans = fans
    .filter(fan => {
      const matchesSearch = fan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fan.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTrend = filterTrend === 'all' || fan.engagementTrend === filterTrend;
      return matchesSearch && matchesTrend;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const getActivityScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <FiTrendingUp className="w-4 h-4" />;
      case 'stable': return <FiZap className="w-4 h-4" />;
      case 'decreasing': return <FiTrendingUp className="w-4 h-4 transform rotate-180" />;
      default: return <FiZap className="w-4 h-4" />;
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'view': return <FiEye className="w-4 h-4" />;
      case 'like': return <FiHeart className="w-4 h-4" />;
      case 'comment': return <FiMessageCircle className="w-4 h-4" />;
      case 'share': return <FiShare2 className="w-4 h-4" />;
      case 'message': return <FiMail className="w-4 h-4" />;
      default: return <FiZap className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  const totalActiveUsers = fans.length;
  const averageActivityScore = fans.reduce((sum, fan) => sum + fan.activityScore, 0) / fans.length;
  const totalDailyEngagement = fans.reduce((sum, fan) => sum + fan.dailyEngagement, 0);
  const averageStreak = fans.reduce((sum, fan) => sum + fan.streakDays, 0) / fans.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activité Active</h1>
          <p className="text-gray-600 mt-1">
            Suivez l'engagement et l'activité de vos fans les plus actifs
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedTimeRange('daily')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedTimeRange === 'daily'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Quotidien
            </button>
            <button
              onClick={() => setSelectedTimeRange('weekly')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedTimeRange === 'weekly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hebdomadaire
            </button>
            <button
              onClick={() => setSelectedTimeRange('monthly')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedTimeRange === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensuel
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fans Actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalActiveUsers}</p>
              <p className="text-sm text-green-600 mt-1">+8% vs semaine dernière</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Score Moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{averageActivityScore.toFixed(1)}/10</p>
              <p className="text-sm text-blue-600 mt-1">Activité globale</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiZap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Quotidien</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalDailyEngagement}</p>
              <p className="text-sm text-purple-600 mt-1">Actions aujourd'hui</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiHeart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Streak Moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(averageStreak)} jours</p>
              <p className="text-sm text-green-600 mt-1">Activité continue</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiCalendar className="w-6 h-6 text-white" />
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
              <option value="activityScore">Trier par score</option>
              <option value="dailyEngagement">Trier par engagement</option>
              <option value="streakDays">Trier par streak</option>
            </select>
          </div>
          <div>
            <select
              value={filterTrend}
              onChange={(e) => setFilterTrend(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Toutes les tendances</option>
              <option value="increasing">En hausse</option>
              <option value="stable">Stable</option>
              <option value="decreasing">En baisse</option>
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

      {/* Active Fans List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAndSortedFans.map((fan, index) => (
          <div key={fan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#f01919] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-medium">
                    {fan.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{fan.name}</h3>
                  <p className="text-sm text-gray-500">{fan.email}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mr-2">
                      #{index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(fan.lastActivity)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center text-sm font-medium ${getActivityScoreColor(fan.activityScore)}`}>
                  <span className="mr-1">{fan.activityScore}/10</span>
                  <div className={getTrendColor(fan.engagementTrend)}>
                    {getTrendIcon(fan.engagementTrend)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Score d'activité</p>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  {selectedTimeRange === 'daily' ? fan.dailyEngagement :
                   selectedTimeRange === 'weekly' ? fan.weeklyEngagement :
                   fan.monthlyEngagement}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedTimeRange === 'daily' ? 'Aujourd\'hui' :
                   selectedTimeRange === 'weekly' ? 'Cette semaine' :
                   'Ce mois'}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{fan.streakDays}</p>
                <p className="text-xs text-gray-500">Jours consécutifs</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  {Object.values(fan.activityTypes).reduce((sum, val) => sum + val, 0)}
                </p>
                <p className="text-xs text-gray-500">Total actions</p>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {Object.entries(fan.activityTypes).map(([type, count]) => (
                <div key={type} className="text-center p-2 bg-gray-50 rounded">
                  <div className="flex justify-center mb-1">
                    {getActivityTypeIcon(type)}
                  </div>
                  <p className="text-xs font-medium text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 capitalize">{type}</p>
                </div>
              ))}
            </div>

            {/* Recent Activities */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Activités récentes</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {fan.recentActivities.slice(0, 3).map((activity, actIndex) => (
                  <div key={actIndex} className="flex items-center text-xs text-gray-600">
                    <div className="mr-2">
                      {getActivityTypeIcon(activity.type)}
                    </div>
                    <span className="flex-1 truncate">{activity.content}</span>
                    <span className="ml-2">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite Time Slots */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Créneaux préférés</h4>
              <div className="flex flex-wrap gap-1">
                {fan.favoriteTimeSlots.map((slot, slotIndex) => (
                  <span key={slotIndex} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {slot}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <FiEye className="w-4 h-4 mr-1" />
                Voir profil
              </Button>
              <Button size="sm" className="flex-1 bg-[#f01919] hover:bg-[#d01515] text-white">
                <FiMail className="w-4 h-4 mr-1" />
                Contacter
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedFans.length === 0 && (
        <div className="text-center py-12">
          <FiZap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fan actif trouvé</h3>
          <p className="text-gray-600">
            Aucun fan ne correspond à vos critères de recherche.
          </p>
        </div>
      )}
    </div>
  );
}