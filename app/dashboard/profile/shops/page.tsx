'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiShoppingBag, 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiEye,
  FiExternalLink,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiDollarSign
} from 'react-icons/fi';

interface Shop {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  status: 'active' | 'inactive' | 'pending';
  revenue: number;
  orders: number;
  rating: number;
  createdAt: string;
  openingHours: string;
}

const shopsData: Shop[] = [
  {
    id: '1',
    name: 'Boutique Lifestyle Marie',
    description: 'Vêtements et accessoires tendance pour femmes',
    category: 'Mode & Accessoires',
    address: '123 Rue de la Mode, 75001 Paris',
    phone: '+33 1 23 45 67 89',
    email: 'contact@boutique-marie.fr',
    website: 'https://boutique-marie.fr',
    status: 'active',
    revenue: 15420.50,
    orders: 156,
    rating: 4.8,
    createdAt: '2023-06-15',
    openingHours: '9h-19h (Lun-Sam)'
  },
  {
    id: '2',
    name: 'Tech Store Pro',
    description: 'Accessoires et gadgets technologiques',
    category: 'Technologie',
    address: '456 Avenue Tech, 69002 Lyon',
    phone: '+33 4 56 78 90 12',
    email: 'info@techstore-pro.fr',
    status: 'active',
    revenue: 8750.00,
    orders: 89,
    rating: 4.6,
    createdAt: '2023-08-20',
    openingHours: '10h-18h (Lun-Ven)'
  },
  {
    id: '3',
    name: 'Cuisine & Saveurs',
    description: 'Ustensiles de cuisine et produits gastronomiques',
    category: 'Cuisine & Maison',
    address: '789 Place Gourmande, 13001 Marseille',
    phone: '+33 4 91 23 45 67',
    email: 'hello@cuisine-saveurs.fr',
    status: 'pending',
    revenue: 0,
    orders: 0,
    rating: 0,
    createdAt: '2024-01-10',
    openingHours: 'En cours de définition'
  }
];

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>(shopsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shop.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const totalRevenue = shops.filter(s => s.status === 'active').reduce((sum, s) => sum + s.revenue, 0);
  const totalOrders = shops.filter(s => s.status === 'active').reduce((sum, s) => sum + s.orders, 0);
  const activeShops = shops.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Boutiques</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos boutiques en ligne et suivez leurs performances
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouvelle boutique
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Boutiques</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{shops.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Boutiques Actives</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeShops}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiEye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalRevenue.toLocaleString()} FCFA</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commandes Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher une boutique..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredShops.map((shop) => (
          <div key={shop.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shop.status)}`}>
                      {getStatusLabel(shop.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{shop.description}</p>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {shop.category}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FiMapPin className="w-4 h-4 mr-2" />
                  {shop.address}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiPhone className="w-4 h-4 mr-2" />
                  {shop.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiMail className="w-4 h-4 mr-2" />
                  {shop.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiClock className="w-4 h-4 mr-2" />
                  {shop.openingHours}
                </div>
              </div>

              {shop.status === 'active' && (
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{shop.revenue.toLocaleString()} FCFA</p>
                    <p className="text-xs text-gray-500">Revenus</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{shop.orders}</p>
                    <p className="text-xs text-gray-500">Commandes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{shop.rating}/5</p>
                    <p className="text-xs text-gray-500">Note</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <FiEye className="w-4 h-4 mr-1" />
                  Voir
                </Button>
                <Button size="sm" className="flex-1 bg-[#f01919] hover:bg-[#d01515] text-white">
                  <FiEdit3 className="w-4 h-4 mr-1" />
                  Éditer
                </Button>
                {shop.website && (
                  <Button size="sm" variant="outline">
                    <FiExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Créée le {new Date(shop.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div className="text-center py-12">
          <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune boutique trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucune boutique ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore créé de boutique.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Créer votre première boutique
            </Button>
          )}
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Créer une nouvelle boutique</h2>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez créer et gérer vos boutiques en ligne.
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