'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { useApi } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { CoGestionnaire } from '../../../models/co_gestionnaire';
import { 
  FiUsers, 
  FiUserPlus,
  FiUser,
  FiMail,
  FiPhone,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiStar,
  FiClock,
  FiTrendingUp,
  FiCheck,
  FiShield,
  FiUserCheck,
  FiEye
} from 'react-icons/fi';

interface CoGestionnaireExtended extends CoGestionnaire {
  displayName?: string;
  displayEmail?: string;
  displayStatus?: 'active' | 'inactive' | 'pending';
}

const roles = [
  { id: 'gestionnaire', name: 'Gestionnaire', color: 'bg-blue-100 text-blue-800' },
  { id: 'moderateur', name: 'Modérateur', color: 'bg-green-100 text-green-800' },
  { id: 'assistant', name: 'Assistant', color: 'bg-purple-100 text-purple-800' },
  { id: 'consultant', name: 'Consultant', color: 'bg-orange-100 text-orange-800' }
];

const permissions = [
  { id: 'read', name: 'Lecture', description: 'Consulter les données' },
  { id: 'write', name: 'Écriture', description: 'Modifier les données' },
  { id: 'delete', name: 'Suppression', description: 'Supprimer des éléments' },
  { id: 'admin', name: 'Administration', description: 'Accès administrateur complet' }
];

export default function ManagersPage() {
  const [managers, setManagers] = useState<CoGestionnaireExtended[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<CoGestionnaireExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de création
  const [newManager, setNewManager] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'assistant',
    permissions: [] as string[],
    description: ''
  });

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Récupération des co-gestionnaires depuis l'API
  const fetchManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des co-gestionnaires pour utilisateur:', user.uid);
      const managersData = await apiFetch('/api/co-gestionnaires');
      
      if (!Array.isArray(managersData)) {
        console.warn('⚠️ Réponse API inattendue:', managersData);
        setManagers([]);
        return;
      }
      
      // Transformer les co-gestionnaires pour l'affichage
      const transformedManagers: CoGestionnaireExtended[] = managersData.map((manager: CoGestionnaire) => ({
        ...manager,
        displayName: `${manager.prenom || ''} ${manager.nom || ''}`.trim() || 'Co-gestionnaire sans nom',
        displayEmail: manager.email || 'Aucun email',
        displayStatus: manager.statut === 'actif' ? 'active' : manager.statut === 'inactif' ? 'inactive' : 'pending'
      }));
      
      setManagers(transformedManagers);
      console.log('✅ Co-gestionnaires récupérés:', transformedManagers.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération co-gestionnaires:', err);
      setError(`Erreur lors du chargement des co-gestionnaires: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  // Création d'un nouveau co-gestionnaire
  const createManager = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newManager.nom.trim() || !newManager.prenom.trim() || !newManager.email.trim()) {
        setError('Le nom, prénom et email sont requis');
        return;
      }
      
      const managerData = {
        nom: newManager.nom,
        prenom: newManager.prenom,
        email: newManager.email,
        telephone: newManager.telephone,
        role: newManager.role,
        permissions: newManager.permissions,
        description: newManager.description,
        idProprietaire: user?.uid || 'anonymous',
        dateCreation: new Date().toISOString(),
        statut: 'actif',
        dateInvitation: new Date().toISOString()
      };
      
      await apiFetch('/api/co-gestionnaires', {
        method: 'POST',
        body: JSON.stringify(managerData)
      });
      
      console.log('✅ Co-gestionnaire créé avec succès');
      
      // Réinitialiser le formulaire
      setNewManager({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role: 'assistant',
        permissions: [],
        description: ''
      });
      
      setShowCreateModal(false);
      await fetchManagers();
      
    } catch (err) {
      console.error('❌ Erreur création co-gestionnaire:', err);
      setError('Erreur lors de la création du co-gestionnaire');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un co-gestionnaire
  const deleteManager = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce co-gestionnaire ?')) {
      return;
    }
    
    try {
      await apiFetch(`/api/co-gestionnaires/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Co-gestionnaire supprimé:', id);
      await fetchManagers();
      
    } catch (err) {
      console.error('❌ Erreur suppression co-gestionnaire:', err);
      setError('Erreur lors de la suppression');
    }
  };

  // Fonction pour voir les détails d'un co-gestionnaire (READ)
  const viewManagerDetails = (manager: CoGestionnaireExtended) => {
    console.log('📖 Lecture co-gestionnaire:', manager.id);
    setSelectedManager(manager);
    setShowDetailModal(true);
  };

  // Fonction pour modifier un co-gestionnaire (UPDATE)
  const editManager = (manager: CoGestionnaireExtended) => {
    console.log('✏️ Modification co-gestionnaire:', manager.id);
    setSelectedManager(manager);
    
    // Pré-remplir le formulaire avec les données du co-gestionnaire
    setNewManager({
      nom: manager.nom || '',
      prenom: manager.prenom || '',
      email: manager.email || '',
      telephone: manager.telephone || '',
      role: manager.role || 'assistant',
      permissions: manager.permissions || [],
      description: manager.description || ''
    });
    
    setShowEditModal(true);
  };

  // Mise à jour d'un co-gestionnaire existant
  const updateManager = async () => {
    if (!selectedManager) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!newManager.nom.trim()) {
        setError('Le nom est requis');
        return;
      }
      
      if (!newManager.prenom.trim()) {
        setError('Le prénom est requis');
        return;
      }
      
      if (!newManager.email.trim()) {
        setError('L\'email est requis');
        return;
      }
      
      const managerData = {
        nom: newManager.nom,
        prenom: newManager.prenom,
        email: newManager.email,
        telephone: newManager.telephone,
        role: newManager.role,
        permissions: newManager.permissions,
        description: newManager.description
      };
      
      await apiFetch(`/api/co-gestionnaires/${selectedManager.id}`, {
        method: 'PUT',
        body: JSON.stringify(managerData)
      });
      
      console.log('✅ Co-gestionnaire mis à jour avec succès');
      
      // Réinitialiser les états
      setSelectedManager(null);
      setShowEditModal(false);
      
      // Réinitialiser le formulaire
      setNewManager({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role: 'assistant',
        permissions: [],
        description: ''
      });
      
      await fetchManagers();
      
    } catch (err) {
      console.error('❌ Erreur mise à jour co-gestionnaire:', err);
      setError('Erreur lors de la mise à jour du co-gestionnaire');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des permissions
  const togglePermission = (permission: string) => {
    setNewManager(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchManagers();
    }
  }, [user]);

  const filteredManagers = managers.filter(manager => {
    const matchesSearch = manager.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manager.displayEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || manager.role === filterRole;
    return matchesSearch && matchesRole;
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
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getRoleColor = (role: string) => {
    const roleObj = roles.find(r => r.id === role);
    return roleObj ? roleObj.color : 'bg-gray-100 text-gray-800';
  };

  const getRoleName = (role: string) => {
    const roleObj = roles.find(r => r.id === role);
    return roleObj ? roleObj.name : role;
  };

  // Stats calculations
  const totalActive = managers.filter(m => m.displayStatus === 'active').length;
  const totalPending = managers.filter(m => m.displayStatus === 'pending').length;
  const totalAdmins = managers.filter(m => m.permissions?.includes('admin')).length;
  const totalManagers = managers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Co-gestionnaires</h1>
          <p className="text-gray-600 mt-1">
            Gérez votre équipe et les permissions d'accès
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouveau Co-gestionnaire
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Co-gestionnaires Actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalActive}</p>
              <p className="text-sm text-green-600 mt-1">En service</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiUserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalPending}</p>
              <p className="text-sm text-yellow-600 mt-1">Invitations</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <FiClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administrateurs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalAdmins}</p>
              <p className="text-sm text-purple-600 mt-1">Accès complet</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiShield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Équipe</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalManagers}</p>
              <p className="text-sm text-blue-600 mt-1">Membres</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters et Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Rechercher un co-gestionnaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les rôles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Button 
              onClick={fetchManagers} 
              variant="outline" 
              className="w-full"
              disabled={loading}
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
          <div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Nouveau
            </Button>
          </div>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FiX className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* État de chargement */}
      {loading && (
        <div className="text-center py-8">
          <FiRefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600">Chargement des co-gestionnaires...</p>
        </div>
      )}

      {/* Co-gestionnaires List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManagers.map((manager) => (
            <div key={manager.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {manager.displayName}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(manager.displayStatus || 'pending')}`}>
                      {getStatusLabel(manager.displayStatus || 'pending')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <FiMail className="w-4 h-4 mr-2" />
                      {manager.displayEmail}
                    </div>
                    {manager.telephone && (
                      <div className="flex items-center">
                        <FiPhone className="w-4 h-4 mr-2" />
                        {manager.telephone}
                      </div>
                    )}
                    {manager.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {manager.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(manager.role || 'assistant')}`}>
                      {getRoleName(manager.role || 'assistant')}
                    </span>
                    {manager.permissions && manager.permissions.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {manager.permissions.length} permission(s)
                      </span>
                    )}
                  </div>
                  {manager.permissions && manager.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {manager.permissions.map(permission => (
                        <span key={permission} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {permissions.find(p => p.id === permission)?.name || permission}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {manager.dateCreation && (
                    <span>Créé le {new Date(manager.dateCreation).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => viewManagerDetails(manager)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Voir les détails"
                  >
                    <FiEye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => editManager(manager)}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    title="Modifier le co-gestionnaire"
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteManager(manager.id!)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Supprimer le co-gestionnaire"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* État vide */}
      {!loading && filteredManagers.length === 0 && (
        <div className="text-center py-12">
          <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterRole !== 'all' 
              ? 'Aucun co-gestionnaire trouvé' 
              : 'Aucun co-gestionnaire'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterRole !== 'all'
              ? 'Aucun co-gestionnaire ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore ajouté de co-gestionnaires. Invitez votre première personne.'
            }
          </p>
          {!searchTerm && filterRole === 'all' && (
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Inviter votre premier co-gestionnaire
            </Button>
          )}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 via-pink-50/90 to-rose-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-red-500/20 rounded-2xl border border-white/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header rouge avec icône */}
            <div className="bg-[#f01919] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <FiUserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Nouveau Co-gestionnaire</h2>
                    <p className="text-red-100 text-sm">Ajoutez un membre à votre équipe</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); createManager(); }} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiUser className="w-5 h-5 text-[#f01919] mr-2" />
                  Informations personnelles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="nom"
                        type="text"
                        value={newManager.nom}
                        onChange={(e) => setNewManager(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Dupont"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="prenom"
                        type="text"
                        value={newManager.prenom}
                        onChange={(e) => setNewManager(prev => ({ ...prev, prenom: e.target.value }))}
                        placeholder="Ex: Jean"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={newManager.email}
                        onChange={(e) => setNewManager(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Ex: jean.dupont@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="telephone"
                        type="tel"
                        value={newManager.telephone}
                        onChange={(e) => setNewManager(prev => ({ ...prev, telephone: e.target.value }))}
                        placeholder="Ex: +33 1 23 45 67 89"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rôle et Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiShield className="w-5 h-5 text-[#f01919] mr-2" />
                  Rôle et Permissions
                </h3>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle *
                  </label>
                  <div className="relative">
                    <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      id="role"
                      value={newManager.role}
                      onChange={(e) => setNewManager(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] appearance-none bg-white"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm">
                        <input
                          type="checkbox"
                          id={`permission-${permission.id}`}
                          checked={newManager.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="rounded border-gray-300 text-[#f01919] focus:ring-[#f01919]"
                        />
                        <div className="flex-1">
                          <label htmlFor={`permission-${permission.id}`} className="text-sm font-medium text-gray-700">
                            {permission.name}
                          </label>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiEdit3 className="w-5 h-5 text-[#f01919] mr-2" />
                  Description
                </h3>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnel)
                  </label>
                  <Textarea
                    id="description"
                    value={newManager.description}
                    onChange={(e) => setNewManager(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez le rôle ou les responsabilités..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Informations complémentaires */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Informations importantes</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Une invitation sera envoyée par email au co-gestionnaire</p>
                  <p>• Les permissions peuvent être modifiées à tout moment</p>
                  <p>• L'accès peut être révoqué depuis le tableau de bord</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#f01919] hover:bg-[#d01515] text-white"
                  disabled={loading || !newManager.nom.trim() || !newManager.prenom.trim() || !newManager.email.trim()}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="w-4 h-4 mr-2" />
                      Inviter
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détails de co-gestionnaire (READ) */}
      {showDetailModal && selectedManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header du modal de détails */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Détails du Co-gestionnaire</h2>
                    <p className="text-blue-100 text-sm">{selectedManager.displayName}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedManager(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Contenu du modal de détails */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                {/* Informations personnelles */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiUser className="w-5 h-5 mr-2 text-blue-600" />
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Prénom</label>
                      <p className="text-gray-900 font-medium">{selectedManager.prenom}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nom</label>
                      <p className="text-gray-900 font-medium">{selectedManager.nom}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedManager.displayEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Téléphone</label>
                      <p className="text-gray-900">{selectedManager.telephone || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                {/* Rôle et permissions */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiShield className="w-5 h-5 mr-2 text-blue-600" />
                    Rôle et permissions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Statut</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedManager.displayStatus || 'pending')}`}>
                        {getStatusLabel(selectedManager.displayStatus || 'pending')}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rôle</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(selectedManager.role || 'assistant')}`}>
                        {getRoleName(selectedManager.role || 'assistant')}
                      </span>
                    </div>
                    {selectedManager.permissions && selectedManager.permissions.length > 0 && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Permissions</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedManager.permissions.map(permission => (
                            <span key={permission} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {permissions.find(p => p.id === permission)?.name || permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedManager.description && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-700">{selectedManager.description}</p>
                  </div>
                )}

                {/* Informations système */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations système</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID du co-gestionnaire:</span>
                      <span className="text-gray-900 font-mono">{selectedManager.id}</span>
                    </div>
                    {selectedManager.dateCreation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date de création:</span>
                        <span className="text-gray-900">{new Date(selectedManager.dateCreation).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions en bas */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDetailModal(false);
                    editManager(selectedManager);
                  }}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <FiEdit3 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedManager(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de co-gestionnaire (UPDATE) */}
      {showEditModal && selectedManager && (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-yellow-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiEdit3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Modifier Co-gestionnaire</h2>
                    <p className="text-orange-100 text-sm">{selectedManager.displayName}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedManager(null);
                    // Réinitialiser le formulaire
                    setNewManager({
                      nom: '',
                      prenom: '',
                      email: '',
                      telephone: '',
                      role: 'assistant',
                      permissions: [],
                      description: ''
                    });
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Contenu du formulaire de modification */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); updateManager(); }} className="space-y-6">
                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FiUser className="w-5 h-5 text-orange-600 mr-2" />
                    Informations personnelles
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="edit-nom"
                          type="text"
                          value={newManager.nom}
                          onChange={(e) => setNewManager(prev => ({ ...prev, nom: e.target.value }))}
                          placeholder="Ex: Dupont"
                          className="pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="edit-prenom" className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="edit-prenom"
                          type="text"
                          value={newManager.prenom}
                          onChange={(e) => setNewManager(prev => ({ ...prev, prenom: e.target.value }))}
                          placeholder="Ex: Jean"
                          className="pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="edit-email"
                          type="email"
                          value={newManager.email}
                          onChange={(e) => setNewManager(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Ex: jean.dupont@email.com"
                          className="pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="edit-telephone" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="edit-telephone"
                          type="tel"
                          value={newManager.telephone}
                          onChange={(e) => setNewManager(prev => ({ ...prev, telephone: e.target.value }))}
                          placeholder="Ex: +33 6 12 34 56 78"
                          className="pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rôle et permissions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FiShield className="w-5 h-5 text-blue-600 mr-2" />
                    Rôle et permissions
                  </h3>

                  <div>
                    <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle
                    </label>
                    <select
                      id="edit-role"
                      value={newManager.role}
                      onChange={(e) => setNewManager(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map(permission => (
                        <label key={permission.id} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newManager.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                            <p className="text-xs text-gray-500">{permission.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optionnel)
                    </label>
                    <Textarea
                      id="edit-description"
                      value={newManager.description}
                      onChange={(e) => setNewManager(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du rôle ou des responsabilités..."
                      rows={3}
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedManager(null);
                    }}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                    disabled={loading || !newManager.nom.trim() || !newManager.prenom.trim() || !newManager.email.trim()}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4 mr-2" />
                        Mettre à jour
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
