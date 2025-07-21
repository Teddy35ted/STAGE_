'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  FiTarget, 
  FiDollarSign, 
  FiEye, 
  FiTrendingUp,
  FiCalendar,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiExternalLink,
  FiFilter,
  FiPlus,
  FiClock
} from 'react-icons/fi';

interface Ad {
  id: string;
  title: string;
  brand: string;
  description: string;
  type: 'profile' | 'laala_space';
  budget: number;
  duration: number; // en jours
  status: 'pending' | 'active' | 'completed' | 'rejected';
  proposedAt: string;
  startDate?: string;
  endDate?: string;
  targetAudience: string;
  expectedReach: number;
  category: string;
}

const adsData: Ad[] = [
  {
    id: '1',
    title: 'Campagne Nike Air Max',
    brand: 'Nike',
    description: 'Promotion des nouvelles chaussures Nike Air Max pour la collection printemps 2024',
    type: 'profile',
    budget: 2500,
    duration: 7,
    status: 'pending',
    proposedAt: '2024-01-15T10:00:00Z',
    targetAudience: 'Sportifs 18-35 ans',
    expectedReach: 15000,
    category: 'Sport'
  },
  {
    id: '2',
    title: 'Partenariat L\'Oréal',
    brand: 'L\'Oréal Paris',
    description: 'Mise en avant de la nouvelle gamme de soins capillaires',
    type: 'laala_space',
    budget: 1800,
    duration: 14,
    status: 'active',
    proposedAt: '2024-01-10T14:30:00Z',
    startDate: '2024-01-12T00:00:00Z',
    endDate: '2024-01-26T23:59:59Z',
    targetAudience: 'Femmes 25-45 ans',
    expectedReach: 12000,
    category: 'Beauté'
  },
  {
    id: '3',
    title: 'Collaboration Samsung',
    brand: 'Samsung',
    description: 'Présentation du nouveau Galaxy S24 et de ses fonctionnalités',
    type: 'profile',
    budget: 3200,
    duration: 10,
    status: 'completed',
    proposedAt: '2024-01-05T09:15:00Z',
    startDate: '2024-01-08T00:00:00Z',
    endDate: '2024-01-18T23:59:59Z',
    targetAudience: 'Tech enthusiasts 20-40 ans',
    expectedReach: 18000,
    category: 'Technologie'
  },
  {
    id: '4',
    title: 'Promotion HelloFresh',
    brand: 'HelloFresh',
    description: 'Code promo pour les box repas HelloFresh',
    type: 'laala_space',
    budget: 800,
    duration: 5,
    status: 'rejected',
    proposedAt: '2024-01-14T16:45:00Z',
    targetAudience: 'Familles 25-50 ans',
    expectedReach: 8000,
    category: 'Alimentation'
  }
];

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>(adsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ad.status === filterStatus;
    const matchesType = filterType === 'all' || ad.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'active': return 'Active';
      case 'completed': return 'Terminée';
      case 'rejected': return 'Refusée';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'profile': return 'Profil';
      case 'laala_space': return 'Espace Laala';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'profile': return 'bg-purple-100 text-purple-800';
      case 'laala_space': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleAdAction = (adId: string, action: 'accept' | 'reject' | 'discuss') => {
    setAds(ads.map(ad => {
      if (ad.id === adId) {
        if (action === 'accept') {
          return { ...ad, status: 'active' as const };
        } else if (action === 'reject') {
          return { ...ad, status: 'rejected' as const };
        }
      }
      return ad;
    }));
  };

  const totalRevenue = ads.filter(ad => ad.status === 'completed').reduce((sum, ad) => sum + ad.budget, 0);
  const activeAds = ads.filter(ad => ad.status === 'active').length;
  const pendingAds = ads.filter(ad => ad.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Publicités</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos partenariats publicitaires et campagnes
          </p>
        </div>
        <Button className="bg-[#f01919] hover:bg-[#d01515] text-white">
          <FiPlus className="w-4 h-4 mr-2" />
          Demander un espace
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Publicité</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalRevenue.toLocaleString()} €</p>
              <p className="text-sm text-green-600 mt-1">+15% vs mois dernier</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campagnes Actives</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeAds}</p>
              <p className="text-sm text-blue-600 mt-1">En cours</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nouvelles Propositions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingAds}</p>
              <p className="text-sm text-yellow-600 mt-1">En attente</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <FiClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portée Totale</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {ads.reduce((sum, ad) => sum + ad.expectedReach, 0).toLocaleString()}
              </p>
              <p className="text-sm text-purple-600 mt-1">Impressions estimées</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiEye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Rechercher une publicité..."
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
              <option value="pending">En attente</option>
              <option value="active">Active</option>
              <option value="completed">Terminée</option>
              <option value="rejected">Refusée</option>
            </select>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les types</option>
              <option value="profile">Profil</option>
              <option value="laala_space">Espace Laala</option>
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

      {/* Ads List */}
      <div className="space-y-4">
        {filteredAds.map((ad) => (
          <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ad.status)}`}>
                    {getStatusLabel(ad.status)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(ad.type)}`}>
                    {getTypeLabel(ad.type)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Marque</p>
                    <p className="font-medium text-gray-900">{ad.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-medium text-gray-900">{ad.budget.toLocaleString()} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="font-medium text-gray-900">{ad.duration} jours</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Portée estimée</p>
                    <p className="font-medium text-gray-900">{ad.expectedReach.toLocaleString()}</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{ad.description}</p>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    Proposé le {formatDate(ad.proposedAt)}
                  </div>
                  <div className="flex items-center">
                    <FiTarget className="w-4 h-4 mr-1" />
                    {ad.targetAudience}
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {ad.category}
                  </div>
                </div>

                {ad.status === 'active' && ad.startDate && ad.endDate && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Campagne active:</strong> Du {formatDate(ad.startDate)} au {formatDate(ad.endDate)}
                    </p>
                  </div>
                )}
              </div>

              <div className="ml-6">
                {ad.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAdAction(ad.id, 'accept')}
                    >
                      <FiCheck className="w-4 h-4 mr-1" />
                      Accepter
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAdAction(ad.id, 'discuss')}
                    >
                      <FiMessageSquare className="w-4 h-4 mr-1" />
                      Discuter
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleAdAction(ad.id, 'reject')}
                    >
                      <FiX className="w-4 h-4 mr-1" />
                      Refuser
                    </Button>
                  </div>
                )}

                {ad.status === 'active' && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <FiEye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button size="sm" variant="outline">
                      <FiTrendingUp className="w-4 h-4 mr-1" />
                      Stats
                    </Button>
                  </div>
                )}

                {(ad.status === 'completed' || ad.status === 'rejected') && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <FiEye className="w-4 h-4 mr-1" />
                      Détails
                    </Button>
                    {ad.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        <FiExternalLink className="w-4 h-4 mr-1" />
                        Rapport
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAds.length === 0 && (
        <div className="text-center py-12">
          <FiTarget className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publicité trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Aucune publicité ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore de propositions publicitaires.'
            }
          </p>
          <Button className="bg-[#f01919] hover:bg-[#d01515] text-white">
            <FiPlus className="w-4 h-4 mr-2" />
            Demander un espace publicitaire
          </Button>
        </div>
      )}
    </div>
  );
}