'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { 
  FiBarChart, 
  FiTrendingUp, 
  FiUsers, 
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiCalendar,
  FiDownload,
  FiFilter
} from 'react-icons/fi';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

export default function StatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const statCards: StatCard[] = [
    {
      title: 'Vues Totales',
      value: '156.2K',
      change: '+12.5%',
      changeType: 'positive',
      icon: FiEye,
      color: 'bg-blue-500'
    },
    {
      title: 'Engagement',
      value: '8.7%',
      change: '+2.1%',
      changeType: 'positive',
      icon: FiTrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Nouveaux Followers',
      value: '2,847',
      change: '+18.3%',
      changeType: 'positive',
      icon: FiUsers,
      color: 'bg-purple-500'
    },
    {
      title: 'Revenus',
      value: '3,245 FCFA',
      change: '+7.8%',
      changeType: 'positive',
      icon: FiBarChart,
      color: 'bg-[#f01919]'
    }
  ];

  const laalasStats = [
    {
      name: 'Mon Laala Lifestyle',
      views: 45200,
      likes: 3420,
      comments: 567,
      shares: 234,
      followers: 2847,
      engagement: 9.2
    },
    {
      name: 'Tech & Innovation',
      views: 32100,
      likes: 2156,
      comments: 389,
      shares: 178,
      followers: 1523,
      engagement: 8.5
    },
    {
      name: 'Cuisine du Monde',
      views: 28900,
      likes: 1890,
      comments: 234,
      shares: 123,
      followers: 956,
      engagement: 7.8
    }
  ];

  const contentPerformance = [
    {
      title: 'Les 5 habitudes matinales qui changent la vie',
      type: 'Image',
      views: 12500,
      likes: 890,
      comments: 156,
      shares: 78,
      date: '2024-01-15'
    },
    {
      title: 'Tutoriel: Configuration serveur Next.js',
      type: 'Vidéo',
      views: 8900,
      likes: 567,
      comments: 89,
      shares: 45,
      date: '2024-01-14'
    },
    {
      title: 'Guide complet: Méditation pour débutants',
      type: 'Article',
      views: 7800,
      likes: 445,
      comments: 67,
      shares: 34,
      date: '2024-01-13'
    }
  ];

  const revenueData = [
    { month: 'Jan', direct: 1850, indirect: 600, ads: 795 },
    { month: 'Fév', direct: 2100, indirect: 750, ads: 920 },
    { month: 'Mar', direct: 1950, indirect: 680, ads: 850 },
    { month: 'Avr', direct: 2300, indirect: 820, ads: 1100 },
    { month: 'Mai', direct: 2150, indirect: 790, ads: 980 },
    { month: 'Juin', direct: 2450, indirect: 850, ads: 1200 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600 mt-1">
            Analysez vos performances et suivez votre croissance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <Button variant="outline">
            <FiDownload className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change} vs période précédente
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Évolution des revenus</h2>
            <Button variant="outline" size="sm">
              <FiFilter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
          </div>
          
          {/* Simple bar chart representation */}
          <div className="space-y-4">
            {revenueData.slice(-6).map((data, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-8 text-sm text-gray-600">{data.month}</div>
                <div className="flex-1 flex space-x-1">
                  <div 
                    className="bg-green-500 h-6 rounded-l"
                    style={{ width: `${(data.direct / 3000) * 100}%` }}
                    title={`Direct: ${data.direct} FCFA`}
                  ></div>
                  <div 
                    className="bg-blue-500 h-6"
                    style={{ width: `${(data.indirect / 3000) * 100}%` }}
                    title={`Indirect: ${data.indirect} FCFA`}
                  ></div>
                  <div 
                    className="bg-purple-500 h-6 rounded-r"
                    style={{ width: `${(data.ads / 3000) * 100}%` }}
                    title={`Publicité: ${data.ads} FCFA`}
                  ></div>
                </div>
                <div className="w-16 text-sm text-gray-900 font-medium">
                  {(data.direct + data.indirect + data.ads).toLocaleString()} FCFA
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Direct</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Indirect</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Publicité</span>
            </div>
          </div>
        </div>

        {/* Engagement Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Engagement par type de contenu</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Images</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">8.5%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vidéos</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">9.2%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Articles</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">7.8%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-500">156</p>
                <p className="text-xs text-gray-500">Images publiées</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">89</p>
                <p className="text-xs text-gray-500">Vidéos publiées</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">67</p>
                <p className="text-xs text-gray-500">Articles publiés</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Laalas Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Performance des Laalas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laala
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Followers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux d'engagement
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {laalasStats.map((laala, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{laala.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{laala.views.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiHeart className="w-4 h-4 mr-1" />
                        {laala.likes}
                      </div>
                      <div className="flex items-center">
                        <FiMessageCircle className="w-4 h-4 mr-1" />
                        {laala.comments}
                      </div>
                      <div className="flex items-center">
                        <FiShare2 className="w-4 h-4 mr-1" />
                        {laala.shares}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{laala.followers.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-[#f01919] h-2 rounded-full" 
                          style={{ width: `${(laala.engagement / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{laala.engagement}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Contenu le plus performant</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contenu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contentPerformance.map((content, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{content.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {content.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{content.views.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiHeart className="w-4 h-4 mr-1" />
                        {content.likes}
                      </div>
                      <div className="flex items-center">
                        <FiMessageCircle className="w-4 h-4 mr-1" />
                        {content.comments}
                      </div>
                      <div className="flex items-center">
                        <FiShare2 className="w-4 h-4 mr-1" />
                        {content.shares}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(content.date).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights et recommandations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <FiTrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-medium text-green-900">Croissance positive</h3>
            </div>
            <p className="text-sm text-green-700">
              Votre engagement a augmenté de 12% ce mois-ci. Continuez sur cette lancée !
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <FiUsers className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-900">Audience active</h3>
            </div>
            <p className="text-sm text-blue-700">
              Vos followers sont plus actifs le mardi et jeudi entre 18h-20h.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center mb-2">
              <FiBarChart className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="font-medium text-purple-900">Contenu performant</h3>
            </div>
            <p className="text-sm text-purple-700">
              Les vidéos génèrent 23% plus d'engagement que les autres formats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}