'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiUsers, 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiEye,
  FiMail,
  FiShield,
  FiCheck,
  FiX,
  FiClock,
  FiSettings
} from 'react-icons/fi';

interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'active' | 'pending' | 'suspended';
  lastActivity: string;
  invitedAt: string;
  avatar?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const managersData: Manager[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    email: 'sophie.martin@email.com',
    role: 'Gestionnaire de contenu',
    permissions: ['content_create', 'content_edit', 'content_publish', 'stats_view'],
    status: 'active',
    lastActivity: '2024-01-15T14:30:00Z',
    invitedAt: '2023-12-01'
  },
  {
    id: '2',
    name: 'Thomas Dubois',
    email: 'thomas.dubois@email.com',
    role: 'Gestionnaire marketing',
    permissions: ['campaigns_create', 'campaigns_manage', 'fans_view', 'stats_view'],
    status: 'active',
    lastActivity: '2024-01-14T16:45:00Z',
    invitedAt: '2023-11-15'
  },
  {
    id: '3',
    name: 'Marie Leroy',
    email: 'marie.leroy@email.com',
    role: 'Assistante',
    permissions: ['content_view', 'fans_view'],
    status: 'pending',
    lastActivity: '',
    invitedAt: '2024-01-10'
  }
];

const availablePermissions: Permission[] = [
  // Contenu
  { id: 'content_view', name: 'Voir le contenu', description: 'Consulter tous les contenus', category: 'Contenu' },
  { id: 'content_create', name: 'Créer du contenu', description: 'Créer de nouveaux contenus', category: 'Contenu' },
  { id: 'content_edit', name: 'Modifier le contenu', description: 'Modifier les contenus existants', category: 'Contenu' },
  { id: 'content_publish', name: 'Publier le contenu', description: 'Publier et programmer du contenu', category: 'Contenu' },
  { id: 'content_delete', name: 'Supprimer le contenu', description: 'Supprimer des contenus', category: 'Contenu' },
  
  // Laalas
  { id: 'laalas_view', name: 'Voir les Laalas', description: 'Consulter tous les Laalas', category: 'Laalas' },
  { id: 'laalas_create', name: 'Créer des Laalas', description: 'Créer de nouveaux Laalas', category: 'Laalas' },
  { id: 'laalas_edit', name: 'Modifier les Laalas', description: 'Modifier les Laalas existants', category: 'Laalas' },
  { id: 'laalas_delete', name: 'Supprimer les Laalas', description: 'Supprimer des Laalas', category: 'Laalas' },
  
  // Fans/Friends
  { id: 'fans_view', name: 'Voir les fans', description: 'Consulter la liste des fans', category: 'Communauté' },
  { id: 'fans_message', name: 'Contacter les fans', description: 'Envoyer des messages aux fans', category: 'Communauté' },
  { id: 'campaigns_create', name: 'Créer des campagnes', description: 'Créer des campagnes marketing', category: 'Communauté' },
  { id: 'campaigns_manage', name: 'Gérer les campagnes', description: 'Modifier et supprimer des campagnes', category: 'Communauté' },
  
  // Statistiques
  { id: 'stats_view', name: 'Voir les statistiques', description: 'Consulter toutes les statistiques', category: 'Statistiques' },
  { id: 'stats_export', name: 'Exporter les données', description: 'Exporter les statistiques', category: 'Statistiques' },
  
  // Finances
  { id: 'earnings_view', name: 'Voir les gains', description: 'Consulter les revenus', category: 'Finances' },
  { id: 'earnings_withdraw', name: 'Demander des retraits', description: 'Effectuer des demandes de retrait', category: 'Finances' },
  
  // Boutiques
  { id: 'shops_view', name: 'Voir les boutiques', description: 'Consulter les boutiques', category: 'Boutiques' },
  { id: 'shops_manage', name: 'Gérer les boutiques', description: 'Créer et modifier des boutiques', category: 'Boutiques' },
  
  // Administration
  { id: 'managers_invite', name: 'Inviter des gestionnaires', description: 'Inviter de nouveaux cogestionnaires', category: 'Administration' },
  { id: 'managers_manage', name: 'Gérer les gestionnaires', description: 'Modifier les permissions des gestionnaires', category: 'Administration' }
];

const predefinedRoles = [
  {
    name: 'Gestionnaire de contenu',
    permissions: ['content_view', 'content_create', 'content_edit', 'content_publish', 'laalas_view', 'stats_view']
  },
  {
    name: 'Gestionnaire marketing',
    permissions: ['fans_view', 'fans_message', 'campaigns_create', 'campaigns_manage', 'stats_view', 'content_view']
  },
  {
    name: 'Gestionnaire boutiques',
    permissions: ['shops_view', 'shops_manage', 'earnings_view', 'stats_view']
  },
  {
    name: 'Assistante',
    permissions: ['content_view', 'fans_view', 'stats_view', 'laalas_view']
  },
  {
    name: 'Administrateur',
    permissions: availablePermissions.map(p => p.id)
  }
];

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>(managersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  
  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const filteredManagers = managers.filter(manager => {
    const matchesSearch = manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manager.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || manager.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <FiCheck className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'suspended': return <FiX className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const handleRoleChange = (roleName: string) => {
    setInviteRole(roleName);
    const role = predefinedRoles.find(r => r.name === roleName);
    if (role) {
      setSelectedPermissions(role.permissions);
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleInvite = () => {
    // Logique d'invitation
    console.log('Inviting:', { email: inviteEmail, role: inviteRole, permissions: selectedPermissions });
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('');
    setSelectedPermissions([]);
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cogestionnaires</h1>
          <p className="text-gray-600 mt-1">
            Gérez les accès et permissions de votre équipe
          </p>
        </div>
        <Button 
          onClick={() => setShowInviteModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Inviter un cogestionnaire
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gestionnaires</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{managers.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {managers.filter(m => m.status === 'active').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {managers.filter(m => m.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <FiClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Permissions moyennes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(managers.reduce((sum, m) => sum + m.permissions.length, 0) / managers.length)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiShield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un gestionnaire..."
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
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Managers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gestionnaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredManagers.map((manager) => (
                <tr key={manager.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#f01919] rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-medium text-sm">
                          {manager.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{manager.name}</p>
                        <p className="text-xs text-gray-500">{manager.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{manager.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-2">{manager.permissions.length} permissions</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedManager(manager);
                          setShowPermissionsModal(true);
                        }}
                      >
                        <FiEye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(manager.status)}`}>
                      {getStatusIcon(manager.status)}
                      <span className="ml-1">{getStatusLabel(manager.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {manager.lastActivity 
                        ? new Date(manager.lastActivity).toLocaleDateString('fr-FR')
                        : 'Jamais'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <FiEdit3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FiMail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredManagers.length === 0 && (
        <div className="text-center py-12">
          <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun gestionnaire trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucun gestionnaire ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore invité de cogestionnaires.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Button 
              onClick={() => setShowInviteModal(true)}
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Inviter votre premier cogestionnaire
            </Button>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Inviter un cogestionnaire</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <Input
                  type="email"
                  placeholder="email@exemple.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle prédéfini
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  <option value="">Sélectionner un rôle...</option>
                  {predefinedRoles.map((role) => (
                    <option key={role.name} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Permissions ({selectedPermissions.length} sélectionnées)
                </label>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                      <div className="space-y-2 ml-4">
                        {permissions.map((permission) => (
                          <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              className="mt-1"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                              <p className="text-xs text-gray-500">{permission.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowInviteModal(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleInvite}
                disabled={!inviteEmail || selectedPermissions.length === 0}
                className="bg-[#f01919] hover:bg-[#d01515] text-white"
              >
                Envoyer l'invitation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Permissions de {selectedManager.name}
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => {
                  const categoryPermissions = permissions.filter(p => 
                    selectedManager.permissions.includes(p.id)
                  );
                  
                  if (categoryPermissions.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                      <div className="space-y-2 ml-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-3">
                            <FiCheck className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                              <p className="text-xs text-gray-500">{permission.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPermissionsModal(false)}
              >
                Fermer
              </Button>
              <Button className="bg-[#f01919] hover:bg-[#d01515] text-white">
                <FiSettings className="w-4 h-4 mr-2" />
                Modifier les permissions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}