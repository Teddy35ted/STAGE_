'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiUserPlus, 
  FiUsers, 
  FiTrendingUp, 
  FiCalendar,
  FiMapPin,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiEye,
  FiMail,
  FiGift,
  FiFilter
} from 'react-icons/fi';

interface NewFan {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  source: 'organic' | 'social' | 'referral' | 'campaign' | 'boost';
  location: string;
  age?: number;
  gender?: 'M' | 'F' | 'Other';
  firstInteraction: string;
  totalInteractions: number;
  daysActive: number;
  conversionPotential: 'high' | 'medium' | 'low';
  interests: string[];
  referredBy?: string;
  initialContent: string;
  engagementScore: number;
  hasCompletedOnboarding: boolean;
  lastActivity: string;
}

const newFansData: NewFan[] = [
  {
    id: '1',
    name: 'Emma Rousseau',
    email: 'emma.rousseau@email.com',
    joinedAt: '2024-01-15T10:30:00Z',
    source: 'social',
    location: 'Paris, France',
    age: 26,
    gender: 'F',
    firstInteraction: 'like',
    totalInteractions: 8,
    daysActive: 1,
    conversionPotential: 'high',
    interests: ['Lifestyle', 'Bien-être', 'Mode'],
    initialContent: 'Routine matinale du lundi',
    engagementScore: 7.2,
    hasCompletedOnboarding: true,
    lastActivity: '2024-01-15T16:45:00Z'
  },
  {
    id: '2',
    name: 'Lucas Moreau',
    email: 'lucas.moreau@email.com',
    joinedAt: '2024-01-14T14:20:00Z',
    source: 'organic',
    location: 'Lyon, France',
    age: 29,
    gender: 'M',
    firstInteraction: 'view',
    totalInteractions: 12,
    daysActive: 2,
    conversionPotential: 'medium',
    interests: ['Tech', 'Innovation', 'Business'],
    initialContent: 'Tutoriel React avancé',
    engagementScore: 6.8,
    hasCompletedOnboarding: false,
    lastActivity: '2024-01-15T12:30:00Z'
  },
  {
    id: '3',
    name: 'Camille Dubois',
    email: 'camille.dubois@email.com',
    joinedAt: '2024-01-13T09:15:00Z',
    source: 'referral',
    location: 'Marseille, France',
    age: 24,
    gender: 'F',
    firstInteraction: 'comment',
    totalInteractions: 15,
    daysActive: 3,
    conversionPotential: 'high',
    interests: ['Cuisine', 'Voyage', 'Photographie'],
    referredBy: 'Sophie Laurent',
    initialContent: 'Recette de soupe d\'hiver',
    engagementScore: 8.1,
    hasCompletedOnboarding: true,
    lastActivity: '2024-01-15T18:20:00Z'
  },
  {
    id: '4',
    name: 'Antoine Petit',
    email: 'antoine.petit@email.com',
    joinedAt: '2024-01-12T16:45:00Z',
    source: 'campaign',
    location: 'Toulouse, France',
    age: 31,
    gender: 'M',
    firstInteraction: 'share',
    totalInteractions: 6,
    daysActive: 4,
    conversionPotential: 'medium',
    interests: ['Sport', 'Nutrition', 'Fitness'],
    initialContent: 'Workout HIIT 20 minutes',
    engagementScore: 5.9,
    hasCompletedOnboarding: false,
    lastActivity: '2024-01-15T08:15:00Z'
  },
  {
    id: '5',
    name: 'Léa Martin',
    email: 'lea.martin@email.com',
    joinedAt: '2024-01-11T11:30:00Z',
    source: 'boost',
    location: 'Nice, France',
    age: 22,
    gender: 'F',
    firstInteraction: 'like',
    totalInteractions: 20,
    daysActive: 5,
    conversionPotential: 'high',
    interests: ['Mode', 'Beauté', 'Lifestyle'],
    initialContent: 'Guide style automne',
    engagementScore: 8.7,
    hasCompletedOnboarding: true,
    lastActivity: '2024-01-15T20:10:00Z'
  }
];

export default function NewFansPage() {
  const [fans, setFans] = useState<NewFan[]>(newFansData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterPotential, setFilterPotential] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'joinedAt' | 'engagementScore' | 'totalInteractions'>('joinedAt');

  const filteredAndSortedFans = fans
    .filter(fan => {
      const matchesSearch = fan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fan.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const joinedDate = new Date(fan.joinedAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - joinedDate.getTime()) / (1000 * 3600 * 24));
        
        switch (filterPeriod) {
          case '1day':
            matchesPeriod = daysDiff <= 1;
            break;
          case '1week':
            matchesPeriod = daysDiff <= 7;
            break;
          case '1month':
            matchesPeriod = daysDiff <= 30;
            break;
        }
      }
      
      const matchesSource = filterSource === 'all' || fan.source === filterSource;
      const matchesPotential = filterPotential === 'all' || fan.conversionPotential === filterPotential;
      
      return matchesSearch && matchesPeriod && matchesSource && matchesPotential;
    })
    .sort((a, b) => {
      if (sortBy === 'joinedAt') {
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      }
      return b[sortBy] - a[sortBy];
    });

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'organic': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-blue-100 text-blue-800';
      case 'referral': return 'bg-purple-100 text-purple-800';
      case 'campaign': return 'bg-yellow-100 text-yellow-800';
      case 'boost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'organic': return 'Organique';
      case 'social': return 'Réseaux sociaux';
      case 'referral': return 'Parrainage';
      case 'campaign': return 'Campagne';
      case 'boost': return 'Boost';
      default: return source;
    }
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPotentialLabel = (potential: string) => {
    switch (potential) {
      case 'high': return 'Élevé';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      default: return potential;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  // Stats calculations
  const totalNewFans = fans.length;
  const fansToday = fans.filter(f => {
    const today = new Date();
    const joinedDate = new Date(f.joinedAt);
    return joinedDate.toDateString() === today.toDateString();
  }).length;
  
  const fansThisWeek = fans.filter(f => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(f.joinedAt) >= weekAgo;
  }).length;
  
  const averageEngagement = fans.reduce((sum, f) => sum + f.engagementScore, 0) / fans.length;
  const onboardingRate = (fans.filter(f => f.hasCompletedOnboarding).length / fans.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveaux Fans</h1>
          <p className="text-gray-600 mt-1">
            Découvrez et engagez vos nouveaux followers
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FiGift className="w-4 h-4 mr-2" />
            Campagne d'accueil
          </Button>
          <Button className="bg-[#f01919] hover:bg-[#d01515] text-white">
            <FiMail className="w-4 h-4 mr-2" />
            Message de bienvenue
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nouveaux Fans</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalNewFans}</p>
              <p className="text-sm text-green-600 mt-1">+{fansToday} aujourd'hui</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiUserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cette Semaine</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fansThisWeek}</p>
              <p className="text-sm text-blue-600 mt-1">Croissance hebdo</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{averageEngagement.toFixed(1)}/10</p>
              <p className="text-sm text-purple-600 mt-1">Score d'activité</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiHeart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux d'Onboarding</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{onboardingRate.toFixed(0)}%</p>
              <p className="text-sm text-green-600 mt-1">Profils complétés</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Rechercher un fan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Toutes les périodes</option>
              <option value="1day">Dernières 24h</option>
              <option value="1week">Dernière semaine</option>
              <option value="1month">Dernier mois</option>
            </select>
          </div>
          <div>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Toutes les sources</option>
              <option value="organic">Organique</option>
              <option value="social">Réseaux sociaux</option>
              <option value="referral">Parrainage</option>
              <option value="campaign">Campagne</option>
              <option value="boost">Boost</option>
            </select>
          </div>
          <div>
            <select
              value={filterPotential}
              onChange={(e) => setFilterPotential(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les potentiels</option>
              <option value="high">Élevé</option>
              <option value="medium">Moyen</option>
              <option value="low">Faible</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="joinedAt">Plus récents</option>
              <option value="engagementScore">Plus engagés</option>
              <option value="totalInteractions">Plus actifs</option>
            </select>
          </div>
        </div>
      </div>

      {/* New Fans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAndSortedFans.map((fan) => (
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
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSourceColor(fan.source)}`}>
                      {getSourceLabel(fan.source)}
                    </span>
                    {!fan.hasCompletedOnboarding && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        Onboarding incomplet
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPotentialColor(fan.conversionPotential)}`}>
                  {getPotentialLabel(fan.conversionPotential)}
                </span>
                <p className="text-xs text-gray-500 mt-1">Potentiel</p>
              </div>
            </div>

            {/* Fan Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Rejoint</p>
                <p className="text-sm font-medium text-gray-900">{formatTimeAgo(fan.joinedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Localisation</p>
                <p className="text-sm font-medium text-gray-900">{fan.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Interactions</p>
                <p className="text-sm font-medium text-gray-900">{fan.totalInteractions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Jours actifs</p>
                <p className="text-sm font-medium text-gray-900">{fan.daysActive}</p>
              </div>
            </div>

            {/* Engagement Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Score d'engagement</span>
                <span className="text-xs font-medium text-gray-900">{fan.engagementScore}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#f01919] h-2 rounded-full" 
                  style={{ width: `${(fan.engagementScore / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Initial Content */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Premier contenu vu</p>
              <p className="text-sm text-gray-900">{fan.initialContent}</p>
              <p className="text-xs text-gray-500 mt-1">
                Première interaction: {fan.firstInteraction}
              </p>
            </div>

            {/* Interests */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Centres d'intérêt</p>
              <div className="flex flex-wrap gap-1">
                {fan.interests.slice(0, 3).map((interest, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {interest}
                  </span>
                ))}
                {fan.interests.length > 3 && (
                  <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{fan.interests.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Referral Info */}
            {fan.referredBy && (
              <div className="mb-4 p-2 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600">
                  Parrainé par: <span className="font-medium">{fan.referredBy}</span>
                </p>
              </div>
            )}

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
              {!fan.hasCompletedOnboarding && (
                <Button size="sm" variant="outline">
                  <FiGift className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Dernière activité: {formatTimeAgo(fan.lastActivity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedFans.length === 0 && (
        <div className="text-center py-12">
          <FiUserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun nouveau fan trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterPeriod !== 'all' || filterSource !== 'all' || filterPotential !== 'all'
              ? 'Aucun nouveau fan ne correspond à vos critères de recherche.'
              : 'Aucun nouveau fan récemment.'
            }
          </p>
        </div>
      )}
    </div>
  );
}