'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useCRUDNotifications } from '../../../contexts/NotificationContext';
import { CoGestionnaire } from '../../models/co_gestionnaire';
import { 
  FiUsers, 
  FiMail,
  FiPhone,
  FiMapPin,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiShield,
  FiCheck,
  FiAlertTriangle,
  FiSettings,
  FiUser,
  FiClock,
  FiUserCheck,
  FiUserPlus
} from 'react-icons/fi';

interface CoGestionnaireExtended extends CoGestionnaire {
  displayStatus?: 'actif' | 'inactif' | 'pending';
  displayRole?: string;
  displayCreationDate?: string;
}

const statusColors = {
  actif: 'bg-green-100 text-green-800',
  inactif: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800'
};

const statusLabels = {
  actif: 'Actif',
  inactif: 'Inactif',
  pending: 'En attente'
};

const accessColors = {
  gerer: 'bg-blue-100 text-blue-800',
  consulter: 'bg-gray-100 text-gray-800',
  Ajouter: 'bg-green-100 text-green-800'
};

const accessLabels = {
  gerer: 'Gérer',
  consulter: 'Consulter',
  Ajouter: 'Ajouter'
};

export default function CoGestionnairesPage() {
  const { notifyCreate, notifyUpdate, notifyDelete } = useCRUDNotifications();
  const [coGestionnaires, setCoGestionnaires] = useState<CoGestionnaireExtended[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAccess, setFilterAccess] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoGestionnaire, setSelectedCoGestionnaire] = useState<CoGestionnaireExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de création adapté au modèle CoGestionnaire
  const [newCoGestionnaire, setNewCoGestionnaire] = useState({
    nom: '',
    prenom: '',
    email: '',
    tel: '',
    pays: '',
    ville: '',
    ACCES: 'consulter' as 'gerer' | 'consulter' | 'Ajouter',
    role: '',
    description: '',
    permissions: [] as string[]
  });

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Récupération des co-gestionnaires depuis l'API
  const fetchCoGestionnaires = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des co-gestionnaires pour utilisateur:', user.uid);
      const coGestionnairesData = await apiFetch('/api/co-gestionnaires');
      
      if (!Array.isArray(coGestionnairesData)) {
        console.warn('⚠️ Réponse API inattendue:', coGestionnairesData);
        setCoGestionnaires([]);
        return;
      }
      
      // Transformer les co-gestionnaires pour l'affichage
      const transformedCoGestionnaires: CoGestionnaireExtended[] = coGestionnairesData.map((coGestionnaire: CoGestionnaire) => ({
        ...coGestionnaire,
        displayStatus: coGestionnaire.statut || 'pending',
        displayRole: coGestionnaire.role || 'Co-gestionnaire',
        displayCreationDate: coGestionnaire.dateCreation ? new Date(coGestionnaire.dateCreation).toLocaleDateString('fr-FR') : 'Date inconnue'
      }));
      
      setCoGestionnaires(transformedCoGestionnaires);
      console.log('✅ Co-gestionnaires récupérés:', transformedCoGestionnaires.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération co-gestionnaires:', err);
      setError(`Erreur lors du chargement des co-gestionnaires: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setCoGestionnaires([]);
    } finally {
      setLoading(false);
    }
  };

  // Création d'un nouveau co-gestionnaire
  const createCoGestionnaire = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newCoGestionnaire.nom.trim()) {
        setError('Le nom est requis');
        return;
      }
      
      if (!newCoGestionnaire.prenom.trim()) {
        setError('Le prénom est requis');
        return;
      }
      
      if (!newCoGestionnaire.email.trim()) {
        setError('L\'email est requis');
        return;
      }
      
      if (!newCoGestionnaire.tel.trim()) {
        setError('Le téléphone est requis');
        return;
      }
      
      const coGestionnaireData = {
        nom: newCoGestionnaire.nom,
        prenom: newCoGestionnaire.prenom,
        email: newCoGestionnaire.email,
        tel: newCoGestionnaire.tel,
        telephone: newCoGestionnaire.tel, // Alias pour compatibilité
        pays: newCoGestionnaire.pays,
        ville: newCoGestionnaire.ville,
        ACCES: newCoGestionnaire.ACCES,
        role: newCoGestionnaire.role || 'Co-gestionnaire',
        description: newCoGestionnaire.description,
        permissions: newCoGestionnaire.permissions,
        idProprietaire: user?.uid || 'anonymous',
        dateCreation: new Date().toISOString(),
        dateInvitation: new Date().toISOString(),
        statut: 'pending' as const
      };
      
      await apiFetch('/api/co-gestionnaires', {
        method: 'POST',
        body: JSON.stringify(coGestionnaireData)
      });
      
      console.log('✅ Co-gestionnaire créé avec succès');
      notifyCreate('Co-gestionnaire', `${newCoGestionnaire.prenom} ${newCoGestionnaire.nom}`, true);
      
      // Réinitialiser le formulaire
      setNewCoGestionnaire({
        nom: '',
        prenom: '',
        email: '',
        tel: '',
        pays: '',
        ville: '',
        ACCES: 'consulter',
        role: '',
        description: '',
        permissions: []
      });
      
      setShowCreateModal(false);
      await fetchCoGestionnaires();
      
    } catch (err) {
      console.error('❌ Erreur création co-gestionnaire:', err);
      notifyCreate('Co-gestionnaire', `${newCoGestionnaire.prenom} ${newCoGestionnaire.nom}`, false);
      setError('Erreur lors de la création du co-gestionnaire');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un co-gestionnaire
  const deleteCoGestionnaire = async (id: string) => {
    const coGestionnaire = coGestionnaires.find(cg => cg.id === id);
    const coGestionnaireName = coGestionnaire ? `${coGestionnaire.prenom} ${coGestionnaire.nom}` : 'Co-gestionnaire inconnu';
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${coGestionnaireName} ?`)) {
      return;
    }
    
    try {
      await apiFetch(`/api/co-gestionnaires/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Co-gestionnaire supprimé:', id);
      notifyDelete('Co-gestionnaire', coGestionnaireName, true);
      await fetchCoGestionnaires();
      
    } catch (err) {
      console.error('❌ Erreur suppression co-gestionnaire:', err);
      notifyDelete('Co-gestionnaire', coGestionnaireName, false);
      setError('Erreur lors de la suppression');
    }
  };

  // Fonction pour voir les détails d'un co-gestionnaire (READ)
  const viewCoGestionnaireDetails = (coGestionnaire: CoGestionnaireExtended) => {
    console.log('📖 Lecture co-gestionnaire:', coGestionnaire.id);
    setSelectedCoGestionnaire(coGestionnaire);
    setShowDetailModal(true);
  };

  // Fonction pour modifier un co-gestionnaire (UPDATE)
  const editCoGestionnaire = (coGestionnaire: CoGestionnaireExtended) => {
    console.log('✏️ Modification co-gestionnaire:', coGestionnaire.id);
    setSelectedCoGestionnaire(coGestionnaire);
    
    // Pré-remplir le formulaire avec les données du co-gestionnaire
    setNewCoGestionnaire({
      nom: coGestionnaire.nom || '',
      prenom: coGestionnaire.prenom || '',
      email: coGestionnaire.email || '',
      tel: coGestionnaire.tel || coGestionnaire.telephone || '',
      pays: coGestionnaire.pays || '',
      ville: coGestionnaire.ville || '',
      ACCES: coGestionnaire.ACCES || 'consulter',
      role: coGestionnaire.role || '',
      description: coGestionnaire.description || '',
      permissions: coGestionnaire.permissions || []
    });
    
    setShowEditModal(true);
  };

  // Mise à jour d'un co-gestionnaire existant
  const updateCoGestionnaire = async () => {
    if (!selectedCoGestionnaire) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!newCoGestionnaire.nom.trim()) {
        setError('Le nom est requis');
        return;
      }
      
      if (!newCoGestionnaire.prenom.trim()) {
        setError('Le prénom est requis');
        return;
      }
      
      if (!newCoGestionnaire.email.trim()) {
        setError('L\'email est requis');
        return;
      }
      
      if (!newCoGestionnaire.tel.trim()) {
        setError('Le téléphone est requis');
        return;
      }
      
      const coGestionnaireData = {
        nom: newCoGestionnaire.nom,
        prenom: newCoGestionnaire.prenom,
        email: newCoGestionnaire.email,
        tel: newCoGestionnaire.tel,
        telephone: newCoGestionnaire.tel,
        pays: newCoGestionnaire.pays,
        ville: newCoGestionnaire.ville,
        ACCES: newCoGestionnaire.ACCES,
        role: newCoGestionnaire.role,
        description: newCoGestionnaire.description,
        permissions: newCoGestionnaire.permissions
      };
      
      await apiFetch(`/api/co-gestionnaires/${selectedCoGestionnaire.id}`, {
        method: 'PUT',
        body: JSON.stringify(coGestionnaireData)
      });
      
      console.log('✅ Co-gestionnaire mis à jour avec succès');
      notifyUpdate('Co-gestionnaire', `${newCoGestionnaire.prenom} ${newCoGestionnaire.nom}`, true);
      
      // Réinitialiser les états
      setSelectedCoGestionnaire(null);
      setShowEditModal(false);
      
      // Réinitialiser le formulaire
      setNewCoGestionnaire({
        nom: '',
        prenom: '',
        email: '',
        tel: '',
        pays: '',
        ville: '',
        ACCES: 'consulter',
        role: '',
        description: '',
        permissions: []
      });
      
      await fetchCoGestionnaires();
      
    } catch (err) {
      console.error('❌ Erreur mise à jour co-gestionnaire:', err);
      notifyUpdate('Co-gestionnaire', `${newCoGestionnaire.prenom} ${newCoGestionnaire.nom}`, false);
      setError('Erreur lors de la mise à jour du co-gestionnaire');
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchCoGestionnaires();
    }
  }, [user]);

  const filteredCoGestionnaires = coGestionnaires.filter(coGestionnaire => {
    const matchesSearch = coGestionnaire.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coGestionnaire.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coGestionnaire.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coGestionnaire.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || coGestionnaire.displayStatus === filterStatus;
    const matchesAccess = filterAccess === 'all' || coGestionnaire.ACCES === filterAccess;
    return matchesSearch && matchesStatus && matchesAccess;
  });

  // Stats calculations
  const totalCoGestionnaires = coGestionnaires.length;
  const totalActifs = coGestionnaires.filter(cg => cg.displayStatus === 'actif').length;
  const totalPending = coGestionnaires.filter(cg => cg.displayStatus === 'pending').length;
  const totalInactifs = coGestionnaires.filter(cg => cg.displayStatus === 'inactif').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Co-gestionnaires</h1>
          <p className="text-gray-600 mt-1">
            Gérez les personnes qui ont accès à votre plateforme
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Inviter Co-gestionnaire
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCoGestionnaires}</p>
              <p className="text-sm text-blue-600 mt-1">Co-gestionnaires</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalActifs}</p>
              <p className="text-sm text-green-600 mt-1">Utilisateurs</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
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
              <p className="text-sm font-medium text-gray-600">Inactifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalInactifs}</p>
              <p className="text-sm text-red-600 mt-1">Utilisateurs</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500">
              <FiX className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters et Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Rechercher un co-gestionnaire..."
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
              <option value="actif">Actif</option>
              <option value="pending">En attente</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          <div>
            <select
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les accès</option>
              <option value="gerer">Gérer</option>
              <option value="consulter">Consulter</option>
              <option value="Ajouter">Ajouter</option>
            </select>
          </div>
          <div>
            <Button 
              onClick={fetchCoGestionnaires} 
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
              Inviter
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
          {filteredCoGestionnaires.map((coGestionnaire) => (
            <div key={coGestionnaire.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {coGestionnaire.prenom} {coGestionnaire.nom}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[coGestionnaire.displayStatus || 'pending']}`}>
                      {statusLabels[coGestionnaire.displayStatus || 'pending']}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {coGestionnaire.displayRole}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <FiMail className="w-4 h-4 mr-2" />
                      {coGestionnaire.email}
                    </div>
                    <div className="flex items-center">
                      <FiPhone className="w-4 h-4 mr-2" />
                      {coGestionnaire.tel || coGestionnaire.telephone || 'Non renseigné'}
                    </div>
                    <div className="flex items-center">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      {coGestionnaire.ville ? `${coGestionnaire.ville}, ${coGestionnaire.pays}` : coGestionnaire.pays || 'Non renseigné'}
                    </div>
                    <div className="flex items-center">
                      <FiShield className="w-4 h-4 mr-2" />
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${accessColors[coGestionnaire.ACCES]}`}>
                        {accessLabels[coGestionnaire.ACCES]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions du co-gestionnaire */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    ID: {coGestionnaire.id?.slice(-8)}
                  </span>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => viewCoGestionnaireDetails(coGestionnaire)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Voir les détails"
                    >
                      <FiEye className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => editCoGestionnaire(coGestionnaire)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      title="Modifier le co-gestionnaire"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteCoGestionnaire(coGestionnaire.id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer le co-gestionnaire"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* État vide */}
      {!loading && filteredCoGestionnaires.length === 0 && (
        <div className="text-center py-12">
          <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' || filterAccess !== 'all'
              ? 'Aucun co-gestionnaire trouvé' 
              : 'Aucun co-gestionnaire'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterAccess !== 'all'
              ? 'Aucun co-gestionnaire ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore invité de co-gestionnaires.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && filterAccess === 'all' && (
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

      {/* Modal de création moderne */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-50/90 via-blue-50/90 to-purple-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-[#f01919] to-[#d01515] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiUserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Inviter Co-gestionnaire</h2>
                    <p className="text-red-100 text-sm">Donnez accès à votre plateforme</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Contenu du formulaire */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                  <FiAlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 font-medium">Erreur</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); createCoGestionnaire(); }} className="space-y-6">
                {/* Informations personnelles */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiUser className="w-5 h-5 mr-2 text-[#f01919]" />
                    Informations personnelles
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <Input
                        id="prenom"
                        type="text"
                        value={newCoGestionnaire.prenom}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, prenom: e.target.value }))}
                        placeholder="Ex: Jean"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <Input
                        id="nom"
                        type="text"
                        value={newCoGestionnaire.nom}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Dupont"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={newCoGestionnaire.email}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Ex: jean.dupont@email.com"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="tel" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <Input
                        id="tel"
                        type="tel"
                        value={newCoGestionnaire.tel}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, tel: e.target.value }))}
                        placeholder="Ex: +33 6 12 34 56 78"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="pays" className="block text-sm font-medium text-gray-700 mb-2">
                        Pays
                      </label>
                      <Input
                        id="pays"
                        type="text"
                        value={newCoGestionnaire.pays}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, pays: e.target.value }))}
                        placeholder="Ex: France"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                      />
                    </div>

                    <div>
                      <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <Input
                        id="ville"
                        type="text"
                        value={newCoGestionnaire.ville}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, ville: e.target.value }))}
                        placeholder="Ex: Paris"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions et accès */}
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiShield className="w-5 h-5 mr-2 text-blue-600" />
                    Permissions et accès
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="acces" className="block text-sm font-medium text-gray-700 mb-2">
                        Niveau d'accès *
                      </label>
                      <select
                        id="acces"
                        value={newCoGestionnaire.ACCES}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, ACCES: e.target.value as 'gerer' | 'consulter' | 'Ajouter' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                      >
                        <option value="consulter">👁️ Consulter - Lecture seule</option>
                        <option value="Ajouter">➕ Ajouter - Créer du contenu</option>
                        <option value="gerer">⚙️ Gérer - Accès complet</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle personnalisé
                      </label>
                      <Input
                        id="role"
                        type="text"
                        value={newCoGestionnaire.role}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Ex: Manager, Assistant"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optionnelle)
                    </label>
                    <Textarea
                      id="description"
                      value={newCoGestionnaire.description}
                      onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du rôle ou des responsabilités..."
                      rows={3}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Message informatif */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-800 font-medium">Information importante</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Un email d'invitation sera envoyé à cette personne. Elle devra accepter l'invitation pour accéder à la plateforme.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                    disabled={loading}
                    className="px-6 py-2"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-[#f01919] to-[#d01515] hover:from-[#d01515] hover:to-[#b01313] text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || !newCoGestionnaire.nom.trim() || !newCoGestionnaire.prenom.trim() || !newCoGestionnaire.email.trim() || !newCoGestionnaire.tel.trim()}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-4 h-4 mr-2" />
                        Envoyer l'invitation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de co-gestionnaire (READ) */}
      {showDetailModal && selectedCoGestionnaire && (
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
                    <p className="text-blue-100 text-sm">{selectedCoGestionnaire.prenom} {selectedCoGestionnaire.nom}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCoGestionnaire(null);
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
                      <p className="text-gray-900 font-medium">{selectedCoGestionnaire.prenom}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nom</label>
                      <p className="text-gray-900 font-medium">{selectedCoGestionnaire.nom}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedCoGestionnaire.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Téléphone</label>
                      <p className="text-gray-900">{selectedCoGestionnaire.tel || selectedCoGestionnaire.telephone || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Pays</label>
                      <p className="text-gray-900">{selectedCoGestionnaire.pays || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ville</label>
                      <p className="text-gray-900">{selectedCoGestionnaire.ville || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                {/* Permissions et statut */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiShield className="w-5 h-5 mr-2 text-blue-600" />
                    Permissions et statut
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Statut</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedCoGestionnaire.displayStatus || 'pending']}`}>
                        {statusLabels[selectedCoGestionnaire.displayStatus || 'pending']}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Niveau d'accès</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${accessColors[selectedCoGestionnaire.ACCES]}`}>
                        {accessLabels[selectedCoGestionnaire.ACCES]}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rôle</label>
                      <p className="text-gray-900">{selectedCoGestionnaire.displayRole}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date de création</label>
                      <p className="text-gray-900">{selectedCoGestionnaire.displayCreationDate}</p>
                    </div>
                    {selectedCoGestionnaire.description && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-gray-900">{selectedCoGestionnaire.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations système */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations système</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID du co-gestionnaire:</span>
                      <span className="text-gray-900 font-mono">{selectedCoGestionnaire.id}</span>
                    </div>
                    {selectedCoGestionnaire.dateInvitation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date d'invitation:</span>
                        <span className="text-gray-900">{new Date(selectedCoGestionnaire.dateInvitation).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {selectedCoGestionnaire.idProprietaire && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invité par:</span>
                        <span className="text-gray-900 font-mono">{selectedCoGestionnaire.idProprietaire}</span>
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
                    editCoGestionnaire(selectedCoGestionnaire);
                  }}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <FiEdit3 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCoGestionnaire(null);
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
      {showEditModal && selectedCoGestionnaire && (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-yellow-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiEdit3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Modifier Co-gestionnaire</h2>
                    <p className="text-orange-100 text-sm">{selectedCoGestionnaire.prenom} {selectedCoGestionnaire.nom}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCoGestionnaire(null);
                    // Réinitialiser le formulaire
                    setNewCoGestionnaire({
                      nom: '',
                      prenom: '',
                      email: '',
                      tel: '',
                      pays: '',
                      ville: '',
                      ACCES: 'consulter',
                      role: '',
                      description: '',
                      permissions: []
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                  <FiAlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 font-medium">Erreur</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); updateCoGestionnaire(); }} className="space-y-6">
                {/* Informations personnelles */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiUser className="w-5 h-5 mr-2 text-orange-600" />
                    Informations personnelles
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-prenom" className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <Input
                        id="edit-prenom"
                        type="text"
                        value={newCoGestionnaire.prenom}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, prenom: e.target.value }))}
                        placeholder="Ex: Jean"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <Input
                        id="edit-nom"
                        type="text"
                        value={newCoGestionnaire.nom}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Dupont"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={newCoGestionnaire.email}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Ex: jean.dupont@email.com"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-tel" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <Input
                        id="edit-tel"
                        type="tel"
                        value={newCoGestionnaire.tel}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, tel: e.target.value }))}
                        placeholder="Ex: +33 6 12 34 56 78"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-pays" className="block text-sm font-medium text-gray-700 mb-2">
                        Pays
                      </label>
                      <Input
                        id="edit-pays"
                        type="text"
                        value={newCoGestionnaire.pays}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, pays: e.target.value }))}
                        placeholder="Ex: France"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-ville" className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <Input
                        id="edit-ville"
                        type="text"
                        value={newCoGestionnaire.ville}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, ville: e.target.value }))}
                        placeholder="Ex: Paris"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions et accès */}
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiShield className="w-5 h-5 mr-2 text-blue-600" />
                    Permissions et accès
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-acces" className="block text-sm font-medium text-gray-700 mb-2">
                        Niveau d'accès *
                      </label>
                      <select
                        id="edit-acces"
                        value={newCoGestionnaire.ACCES}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, ACCES: e.target.value as 'gerer' | 'consulter' | 'Ajouter' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                      >
                        <option value="consulter">👁️ Consulter - Lecture seule</option>
                        <option value="Ajouter">➕ Ajouter - Créer du contenu</option>
                        <option value="gerer">⚙️ Gérer - Accès complet</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle personnalisé
                      </label>
                      <Input
                        id="edit-role"
                        type="text"
                        value={newCoGestionnaire.role}
                        onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Ex: Manager, Assistant"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optionnelle)
                    </label>
                    <Textarea
                      id="edit-description"
                      value={newCoGestionnaire.description}
                      onChange={(e) => setNewCoGestionnaire(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du rôle ou des responsabilités..."
                      rows={3}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCoGestionnaire(null);
                    }}
                    disabled={loading}
                    className="px-6 py-2"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || !newCoGestionnaire.nom.trim() || !newCoGestionnaire.prenom.trim() || !newCoGestionnaire.email.trim() || !newCoGestionnaire.tel.trim()}
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
