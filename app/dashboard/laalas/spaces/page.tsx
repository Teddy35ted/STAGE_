'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiGrid, 
  FiPlus, 
  FiEdit3, 
  FiEye, 
  FiSettings,
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiStar,
  FiHeart,
  FiMessageCircle,
  FiShare2
} from 'react-icons/fi';

interface LaalaSpace {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  availability: 'available' | 'busy' | 'maintenance';
  rating: number;
  totalBookings: number;
  amenities: string[];
  images: string[];
  owner: string;
  createdAt: string;
  nextAvailable: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface SpaceRequest {
  id: string;
  spaceName: string;
  requestedBy: string;
  requestDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  budget: number;
}

const laalaSpaces: LaalaSpace[] = [
  {
    id: '1',
    name: 'Studio Photo Lifestyle',
    description: 'Studio professionnel équipé pour shootings lifestyle et mode',
    category: 'Studio Photo',
    location: 'Paris 11ème',
    capacity: 8,
    pricePerHour: 45,
    availability: 'available',
    rating: 4.8,
    totalBookings: 156,
    amenities: ['Éclairage professionnel', 'Fond blanc/noir', 'Vestiaire', 'WiFi', 'Café'],
    images: ['/studio1.jpg', '/studio2.jpg'],
    owner: 'Marie Dubois',
    createdAt: '2023-06-15',
    nextAvailable: '2024-01-20T09:00:00Z',
    stats: {
      views: 2847,
      likes: 156,
      comments: 23,
      shares: 12
    }
  },
  {
    id: '2',
    name: 'Espace Coworking Tech',
    description: 'Espace moderne pour tournages tech et présentations',
    category: 'Coworking',
    location: 'Lyon Part-Dieu',
    capacity: 12,
    pricePerHour: 35,
    availability: 'busy',
    rating: 4.6,
    totalBookings: 89,
    amenities: ['Écrans 4K', 'Matériel audio', 'Tableau blanc', 'WiFi fibre', 'Parking'],
    images: ['/coworking1.jpg'],
    owner: 'Thomas Martin',
    createdAt: '2023-08-20',
    nextAvailable: '2024-01-22T14:00:00Z',
    stats: {
      views: 1523,
      likes: 89,
      comments: 34,
      shares: 18
    }
  },
  {
    id: '3',
    name: 'Cuisine Équipée Pro',
    description: 'Cuisine professionnelle pour tournages culinaires',
    category: 'Cuisine',
    location: 'Marseille Centre',
    capacity: 6,
    pricePerHour: 55,
    availability: 'maintenance',
    rating: 4.9,
    totalBookings: 67,
    amenities: ['Équipement pro', 'Îlot central', 'Caméras fixes', 'Réfrigération', 'Ustensiles'],
    images: ['/cuisine1.jpg', '/cuisine2.jpg', '/cuisine3.jpg'],
    owner: 'Sophie Laurent',
    createdAt: '2023-09-10',
    nextAvailable: '2024-01-25T10:00:00Z',
    stats: {
      views: 956,
      likes: 67,
      comments: 15,
      shares: 8
    }
  }
];

const spaceRequests: SpaceRequest[] = [
  {
    id: '1',
    spaceName: 'Studio Photo Lifestyle',
    requestedBy: 'Julie Moreau',
    requestDate: '2024-01-18',
    startTime: '14:00',
    endTime: '18:00',
    purpose: 'Shooting produits cosmétiques',
    status: 'pending',
    budget: 180
  },
  {
    id: '2',
    spaceName: 'Espace Coworking Tech',
    requestedBy: 'Alexandre Petit',
    requestDate: '2024-01-19',
    startTime: '09:00',
    endTime: '12:00',
    purpose: 'Présentation startup',
    status: 'approved',
    budget: 105
  },
  {
    id: '3',
    spaceName: 'Cuisine Équipée Pro',
    requestedBy: 'Chef Antoine',
    requestDate: '2024-01-20',
    startTime: '10:00',
    endTime: '16:00',
    purpose: 'Tournage recette gastronomique',
    status: 'rejected',
    budget: 330
  }
];

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<LaalaSpace[]>(laalaSpaces);
  const [requests, setRequests] = useState<SpaceRequest[]>(spaceRequests);
  const [selectedTab, setSelectedTab] = useState<'spaces' | 'requests'>('spaces');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || space.category === filterCategory;
    const matchesAvailability = filterAvailability === 'all' || space.availability === filterAvailability;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'available': return 'Disponible';
      case 'busy': return 'Occupé';
      case 'maintenance': return 'Maintenance';
      default: return availability;
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Refusé';
      default: return status;
    }
  };

  const categories = Array.from(new Set(spaces.map(s => s.category)));
  const totalRevenue = requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.budget, 0);
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Espaces Laala</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos espaces et demandes de location
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Demander un espace
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setSelectedTab('spaces')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            selectedTab === 'spaces'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Mes Espaces ({spaces.length})
        </button>
        <button
          onClick={() => setSelectedTab('requests')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            selectedTab === 'requests'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Demandes ({requests.length})
        </button>
      </div>

      {selectedTab === 'spaces' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Espaces</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{spaces.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#f01919]">
                  <FiGrid className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Espaces Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {spaces.filter(s => s.availability === 'available').length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-500">
                  <FiMapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus ce mois</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalRevenue} €</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <FiDollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Demandes en attente</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{pendingRequests}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500">
                  <FiClock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Rechercher un espace..."
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
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  <option value="all">Toutes les disponibilités</option>
                  <option value="available">Disponible</option>
                  <option value="busy">Occupé</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Spaces Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSpaces.map((space) => (
              <div key={space.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiGrid className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(space.availability)}`}>
                      {getAvailabilityLabel(space.availability)}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {space.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{space.name}</h3>
                      <p className="text-sm text-gray-600">{space.description}</p>
                    </div>
                    <div className="flex items-center text-sm text-yellow-500">
                      <FiStar className="w-4 h-4 mr-1" />
                      {space.rating}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      {space.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiUsers className="w-4 h-4 mr-2" />
                      Capacité: {space.capacity} personnes
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiDollarSign className="w-4 h-4 mr-2" />
                      {space.pricePerHour} €/heure
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      Prochaine dispo: {new Date(space.nextAvailable).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {space.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {amenity}
                      </span>
                    ))}
                    {space.amenities.length > 3 && (
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        +{space.amenities.length - 3} autres
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{space.stats.views}</p>
                      <p className="text-xs text-gray-500">Vues</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{space.stats.likes}</p>
                      <p className="text-xs text-gray-500">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{space.stats.comments}</p>
                      <p className="text-xs text-gray-500">Commentaires</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{space.totalBookings}</p>
                      <p className="text-xs text-gray-500">Réservations</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <FiEye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button size="sm" className="flex-1 bg-[#f01919] hover:bg-[#d01515] text-white">
                      <FiEdit3 className="w-4 h-4 mr-1" />
                      Éditer
                    </Button>
                    <Button size="sm" variant="outline">
                      <FiSettings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSpaces.length === 0 && (
            <div className="text-center py-12">
              <FiGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun espace trouvé</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory !== 'all' || filterAvailability !== 'all'
                  ? 'Aucun espace ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore d\'espaces Laala.'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && filterAvailability === 'all' && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#f01919] hover:bg-[#d01515] text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Demander votre premier espace
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        /* Requests Tab */
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Demandes de location</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Espace
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demandeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Objectif
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{request.spaceName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{request.requestedBy}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <p>{new Date(request.requestDate).toLocaleDateString('fr-FR')}</p>
                          <p className="text-xs text-gray-500">{request.startTime} - {request.endTime}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{request.purpose}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{request.budget} €</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRequestStatusColor(request.status)}`}>
                          {getRequestStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                Accepter
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                Refuser
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <FiEye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {requests.length === 0 && (
            <div className="text-center py-12">
              <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
              <p className="text-gray-600">
                Les demandes de location de vos espaces apparaîtront ici.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Demander un espace Laala</h2>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez demander des espaces pour vos tournages et événements.
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