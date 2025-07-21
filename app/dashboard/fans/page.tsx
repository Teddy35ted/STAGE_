'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  FiUsers, 
  FiUserPlus, 
  FiTrendingUp, 
  FiHeart, 
  FiMessageCircle,
  FiCalendar,
  FiFilter,
  FiMail,
  FiTarget,
  FiEye,
  FiZap
} from 'react-icons/fi';

interface Fan {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  followedAt: string;
  lastActivity: string;
  totalInteractions: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'new';
  location: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  interests: string[];
}

const fansData: Fan[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    followedAt: '2023-12-15',
    lastActivity: '2024-01-15',
    totalInteractions: 156,
    totalSpent: 89.50,
    status: 'active',
    location: 'Paris, France',
    age: 28,
    gender: 'F',
    interests: ['Lifestyle', 'Cuisine', 'Voyage']
  },
  {
    id: '2',
    name: 'Thomas Martin',
    email: 'thomas.martin@email.com',
    followedAt: '2024-01-10',
    lastActivity: '2024-01-14',
    totalInteractions: 23,
    totalSpent: 0,
    status: 'new',
    location: 'Lyon, France',
    age: 32,
    gender: 'M',
    interests: ['Tech', 'Sport']
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    followedAt: '2023-08-20',
    lastActivity: '2024-01-12',
    totalInteractions: 289,
    totalSpent: 156.75,
    status: 'active',
    location: 'Marseille, France',
    age: 25,
    gender: 'F',
    interests: ['Fitness', 'Nutrition', 'Lifestyle']
  },
  {
    id: '4',
    name: 'Pierre Durand',
    email: 'pierre.durand@email.com',
    followedAt: '2023-11-05',
    lastActivity: '2023-12-20',
    totalInteractions: 45,
    totalSpent: 25.00,
    status: 'inactive',
    location: 'Toulouse, France',
    age: 35,
    gender: 'M',
    interests: ['Cuisine', 'Voyage']
  }
];

export default function FansPage() {
  const [fans, setFans] = useState<Fan[]>(fansData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  const filteredFans = fans.filter(fan => {
    const matchesSearch = fan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fan.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || fan.status === filterStatus;
    
    let matchesPeriod = true;
    if (filterPeriod !== 'all') {
      const now = new Date();
      const followedDate = new Date(fan.followedAt);
      const daysDiff = Math.floor((now.getTime() - followedDate.getTime()) / (1000 * 3600 * 24));
      
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
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'new': return 'Nouveau';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getDemographics = () => {
    const total = fans.length;
    const genderStats = fans.reduce((acc, fan) => {
      acc[fan.gender] = (acc[fan.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ageGroups = fans.reduce((acc, fan) => {
      const group = fan.age < 25 ? '18-24' : 
                   fan.age < 35 ? '25-34' : 
                   fan.age < 45 ? '35-44' : '45+';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { genderStats, ageGroups, total };
  };

  const demographics = getDemographics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fans/Friends</h1>
          <p className="text-gray-600 mt-1">
            Gérez votre communauté et analysez l'engagement
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FiMail className="w-4 h-4 mr-2" />
            Communication
          </Button>
          <Button className="bg-[#f01919] hover:bg-[#d01515] text-white">
            <FiTarget className="w-4 h-4 mr-2" />
            Campagne
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fans/Friends</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fans.length.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+12 cette semaine</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fans Actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {fans.filter(f => f.status === 'active').length}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {((fans.filter(f => f.status === 'active').length / fans.length) * 100).toFixed(1)}% du total
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiZap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nouveaux Fans</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {fans.filter(f => f.status === 'new').length}
              </p>
              <p className="text-sm text-purple-600 mt-1">Ce mois-ci</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiUserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Fans</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {fans.reduce((sum, f) => sum + f.totalSpent, 0).toFixed(0)} €
              </p>
              <p className="text-sm text-green-600 mt-1">+8% vs mois dernier</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par genre</h2>
          <div className="space-y-3">
            {Object.entries(demographics.genderStats).map(([gender, count]) => (
              <div key={gender} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {gender === 'F' ? 'Femmes' : gender === 'M' ? 'Hommes' : 'Autre'}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#f01919] h-2 rounded-full" 
                      style={{ width: `${(count / demographics.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {((count / demographics.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par âge</h2>
          <div className="space-y-3">
            {Object.entries(demographics.ageGroups).map(([ageGroup, count]) => (
              <div key={ageGroup} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{ageGroup} ans</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / demographics.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {((count / demographics.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="new">Nouveaux</option>
            </select>
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
                  Fan/Friend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suivi depuis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFans.map((fan) => (
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
                        <p className="text-xs text-gray-500">{fan.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fan.status)}`}>
                      {getStatusLabel(fan.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <p className="font-medium">{fan.totalInteractions} interactions</p>
                      <p className="text-xs text-gray-500">
                        Dernière activité: {formatDate(fan.lastActivity)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {fan.totalSpent.toFixed(2)} €
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {formatDate(fan.followedAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <FiEye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FiMail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FiMessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredFans.length === 0 && (
        <div className="text-center py-12">
          <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fan trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterPeriod !== 'all'
              ? 'Aucun fan ne correspond à vos critères de recherche.'
              : 'Votre communauté grandit chaque jour !'
            }
          </p>
        </div>
      )}
    </div>
  );
}