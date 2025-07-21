'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiUsers, 
  FiMapPin, 
  FiCalendar, 
  FiHeart,
  FiTrendingUp,
  FiGlobe,
  FiSmartphone,
  FiClock,
  FiFilter,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';

interface DemographicData {
  gender: {
    female: number;
    male: number;
    other: number;
  };
  ageGroups: {
    '18-24': number;
    '25-34': number;
    '35-44': number;
    '45-54': number;
    '55+': number;
  };
  locations: {
    country: string;
    percentage: number;
    count: number;
  }[];
  interests: {
    category: string;
    percentage: number;
    count: number;
    growth: number;
  }[];
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  languages: {
    language: string;
    percentage: number;
    count: number;
  }[];
  activityTimes: {
    hour: number;
    activity: number;
  }[];
  joinPeriods: {
    period: string;
    count: number;
    percentage: number;
  }[];
}

const demographicsData: DemographicData = {
  gender: {
    female: 68.5,
    male: 29.2,
    other: 2.3
  },
  ageGroups: {
    '18-24': 15.8,
    '25-34': 42.3,
    '35-44': 28.1,
    '45-54': 10.5,
    '55+': 3.3
  },
  locations: [
    { country: 'France', percentage: 72.4, count: 3620 },
    { country: 'Belgique', percentage: 8.9, count: 445 },
    { country: 'Suisse', percentage: 6.2, count: 310 },
    { country: 'Canada', percentage: 4.8, count: 240 },
    { country: 'Maroc', percentage: 3.1, count: 155 },
    { country: 'Autres', percentage: 4.6, count: 230 }
  ],
  interests: [
    { category: 'Lifestyle', percentage: 78.5, count: 3925, growth: 12.3 },
    { category: 'Bien-être', percentage: 65.2, count: 3260, growth: 8.7 },
    { category: 'Mode', percentage: 54.8, count: 2740, growth: 15.2 },
    { category: 'Cuisine', percentage: 48.3, count: 2415, growth: 6.9 },
    { category: 'Technologie', percentage: 35.7, count: 1785, growth: 22.1 },
    { category: 'Voyage', percentage: 32.1, count: 1605, growth: -3.2 },
    { category: 'Sport', percentage: 28.9, count: 1445, growth: 9.8 },
    { category: 'Business', percentage: 24.6, count: 1230, growth: 18.5 }
  ],
  devices: {
    mobile: 76.8,
    desktop: 18.4,
    tablet: 4.8
  },
  languages: [
    { language: 'Français', percentage: 89.2, count: 4460 },
    { language: 'Anglais', percentage: 7.8, count: 390 },
    { language: 'Arabe', percentage: 2.1, count: 105 },
    { language: 'Autres', percentage: 0.9, count: 45 }
  ],
  activityTimes: [
    { hour: 0, activity: 2.1 }, { hour: 1, activity: 1.8 }, { hour: 2, activity: 1.2 },
    { hour: 3, activity: 0.9 }, { hour: 4, activity: 0.7 }, { hour: 5, activity: 1.1 },
    { hour: 6, activity: 2.8 }, { hour: 7, activity: 5.2 }, { hour: 8, activity: 8.9 },
    { hour: 9, activity: 7.6 }, { hour: 10, activity: 6.8 }, { hour: 11, activity: 7.2 },
    { hour: 12, activity: 9.8 }, { hour: 13, activity: 8.4 }, { hour: 14, activity: 7.1 },
    { hour: 15, activity: 6.9 }, { hour: 16, activity: 7.8 }, { hour: 17, activity: 8.9 },
    { hour: 18, activity: 12.4 }, { hour: 19, activity: 15.2 }, { hour: 20, activity: 18.7 },
    { hour: 21, activity: 16.8 }, { hour: 22, activity: 12.3 }, { hour: 23, activity: 6.4 }
  ],
  joinPeriods: [
    { period: 'Ce mois', count: 234, percentage: 4.7 },
    { period: 'Mois dernier', count: 189, percentage: 3.8 },
    { period: 'Il y a 2 mois', count: 156, percentage: 3.1 },
    { period: 'Il y a 3 mois', count: 298, percentage: 6.0 },
    { period: 'Il y a 4-6 mois', count: 567, percentage: 11.3 },
    { period: 'Il y a 7-12 mois', count: 1245, percentage: 24.9 },
    { period: 'Plus d\'un an', count: 2311, percentage: 46.2 }
  ]
};

export default function DemographicsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'new' | 'active' | 'engaged'>('all');

  const totalFans = 5000; // Mock total

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <FiTrendingUp className="w-3 h-3" />;
    if (growth < 0) return <FiTrendingUp className="w-3 h-3 transform rotate-180" />;
    return <FiTrendingUp className="w-3 h-3" />;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMaxActivity = () => {
    return Math.max(...demographicsData.activityTimes.map(t => t.activity));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Démographie</h1>
          <p className="text-gray-600 mt-1">
            Analysez la composition et les caractéristiques de votre audience
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedTimeRange('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedTimeRange === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setSelectedTimeRange('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedTimeRange === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setSelectedTimeRange('quarter')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedTimeRange === 'quarter'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setSelectedTimeRange('year')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedTimeRange === 'year'
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
              <p className="text-sm font-medium text-gray-600">Total Fans</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalFans.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+8.2% ce mois</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Genre Majoritaire</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercentage(demographicsData.gender.female)}</p>
              <p className="text-sm text-blue-600 mt-1">Femmes</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiHeart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Âge Moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">25-34</p>
              <p className="text-sm text-purple-600 mt-1">Tranche principale</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pays Principal</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercentage(demographicsData.locations[0].percentage)}</p>
              <p className="text-sm text-green-600 mt-1">{demographicsData.locations[0].country}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiMapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gender & Age Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par genre</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Femmes</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-pink-500 h-3 rounded-full" 
                    style={{ width: `${demographicsData.gender.female}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12">
                  {formatPercentage(demographicsData.gender.female)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hommes</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${demographicsData.gender.male}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12">
                  {formatPercentage(demographicsData.gender.male)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Autre</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full" 
                    style={{ width: `${demographicsData.gender.other}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12">
                  {formatPercentage(demographicsData.gender.other)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par âge</h2>
          <div className="space-y-4">
            {Object.entries(demographicsData.ageGroups).map(([ageGroup, percentage]) => (
              <div key={ageGroup} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{ageGroup} ans</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[#f01919] h-3 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">
                    {formatPercentage(percentage)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition géographique</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demographicsData.locations.map((location, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiMapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{location.country}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatPercentage(location.percentage)}</p>
                <p className="text-xs text-gray-500">{location.count.toLocaleString()} fans</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Centres d'intérêt</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demographicsData.interests.map((interest, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{interest.category}</span>
                  <div className={`flex items-center text-xs ${getGrowthColor(interest.growth)}`}>
                    {getGrowthIcon(interest.growth)}
                    <span className="ml-1">{interest.growth > 0 ? '+' : ''}{interest.growth.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#f01919] h-2 rounded-full" 
                      style={{ width: `${interest.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {formatPercentage(interest.percentage)} ({interest.count.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device & Language */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appareils utilisés</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiSmartphone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Mobile</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full" 
                    style={{ width: `${demographicsData.devices.mobile}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(demographicsData.devices.mobile)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiGlobe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Desktop</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${demographicsData.devices.desktop}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(demographicsData.devices.desktop)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiSmartphone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Tablette</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full" 
                    style={{ width: `${demographicsData.devices.tablet}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(demographicsData.devices.tablet)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Langues</h2>
          <div className="space-y-4">
            {demographicsData.languages.map((language, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{language.language}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[#f01919] h-3 rounded-full" 
                      style={{ width: `${language.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPercentage(language.percentage)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Times */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Heures d'activité</h2>
        <div className="grid grid-cols-12 gap-1 mb-4">
          {demographicsData.activityTimes.map((time) => (
            <div key={time.hour} className="text-center">
              <div 
                className="bg-[#f01919] rounded-t mb-1"
                style={{ 
                  height: `${(time.activity / getMaxActivity()) * 60}px`,
                  minHeight: '4px'
                }}
              ></div>
              <span className="text-xs text-gray-500">{time.hour}h</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Pic d'activité: 20h-21h ({formatPercentage(Math.max(...demographicsData.activityTimes.map(t => t.activity)))})</span>
          <span>Activité minimale: 4h-5h ({formatPercentage(Math.min(...demographicsData.activityTimes.map(t => t.activity)))})</span>
        </div>
      </div>

      {/* Join Periods */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ancienneté des fans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {demographicsData.joinPeriods.map((period, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{period.count.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{period.period}</p>
              <p className="text-xs text-gray-500">{formatPercentage(period.percentage)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTrendingUp className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Insights démographiques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-1">Audience principale</p>
                <ul className="space-y-1">
                  <li>• Femmes 25-34 ans (42.3%)</li>
                  <li>• Principalement en France (72.4%)</li>
                  <li>• Utilisent majoritairement mobile (76.8%)</li>
                  <li>• Actives en soirée (18h-21h)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Opportunités de croissance</p>
                <ul className="space-y-1">
                  <li>• Technologie: +22.1% d'intérêt</li>
                  <li>• Business: +18.5% d'engagement</li>
                  <li>• Mode: +15.2% de croissance</li>
                  <li>• Potentiel marché masculin (29.2%)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}