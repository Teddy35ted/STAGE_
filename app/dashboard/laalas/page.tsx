'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  FiEdit3, 
  FiPlus, 
  FiEye, 
  FiUsers, 
  FiCalendar,
  FiSettings,
  FiTrash2,
  FiMoreVertical,
  FiTrendingUp
} from 'react-icons/fi';

interface Laala {
  id: string;
  name: string;
  description: string;
  category: string;
  followers: number;
  posts: number;
  engagement: number;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  lastActivity: string;
}

const laalasData: Laala[] = [
  {
    id: '1',
    name: 'Mon Laala Lifestyle',
    description: 'Contenu lifestyle et bien-être',
    category: 'Lifestyle',
    followers: 2847,
    posts: 156,
    engagement: 8.7,
    status: 'active',
    createdAt: '2023-06-15',
    lastActivity: '2024-01-15'
  },
  {
    id: '2',
    name: 'Tech & Innovation',
    description: 'Actualités technologiques et innovations',
    category: 'Technologie',
    followers: 1523,
    posts: 89,
    engagement: 12.3,
    status: 'active',
    createdAt: '2023-08-20',
    lastActivity: '2024-01-14'
  },
  {
    id: '3',
    name: 'Cuisine du Monde',
    description: 'Recettes et découvertes culinaires',
    category: 'Cuisine',
    followers: 956,
    posts: 67,
    engagement: 6.2,
    status: 'inactive',
    createdAt: '2023-10-10',
    lastActivity: '2024-01-10'
  },
  {
    id: '4',
    name: 'Fitness & Santé',
    description: 'Conseils fitness et nutrition',
    category: 'Sport',
    followers: 0,
    posts: 0,
    engagement: 0,
    status: 'draft',
    createdAt: '2024-01-12',
    lastActivity: '2024-01-12'
  }
];

export default function LaalasPage() {
  const [laalas, setLaalas] = useState<Laala[]>(laalasData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredLaalas = laalas.filter(laala => {
    const matchesSearch = laala.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         laala.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || laala.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Laalas</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos espaces Laala et leur contenu
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Créer un Laala
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Laalas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{laalas.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiEdit3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Laalas Actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {laalas.filter(l => l.status === 'active').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiEye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Followers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {laalas.reduce((sum, l) => sum + l.followers, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(laalas.reduce((sum, l) => sum + l.engagement, 0) / laalas.filter(l => l.status === 'active').length || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un Laala..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="draft">Brouillon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Laalas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLaalas.map((laala) => (
          <div key={laala.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{laala.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{laala.description}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(laala.status)}`}>
                    {getStatusLabel(laala.status)}
                  </span>
                </div>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <FiMoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{laala.followers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{laala.posts}</p>
                  <p className="text-xs text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{laala.engagement}%</p>
                  <p className="text-xs text-gray-500">Engagement</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                >
                  <FiEye className="w-4 h-4 mr-1" />
                  Voir
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-[#f01919] hover:bg-[#d01515] text-white"
                >
                  <FiEdit3 className="w-4 h-4 mr-1" />
                  Éditer
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Créé le {new Date(laala.createdAt).toLocaleDateString('fr-FR')}</span>
                  <span>Dernière activité: {new Date(laala.lastActivity).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLaalas.length === 0 && (
        <div className="text-center py-12">
          <FiEdit3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun Laala trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucun Laala ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore créé de Laala.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Créer votre premier Laala
            </Button>
          )}
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Créer un nouveau Laala</h2>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité sera bientôt disponible.
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}