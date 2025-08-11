'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { useAuth } from '../../../../contexts/AuthContext';
import { CoGestionnaire } from '../../../models/co_gestionnaire';
import CoGestionnaireCreateFormAdvanced, { CoGestionnaireFormData } from '../../../../components/forms/CoGestionnaireCreateFormAdvanced';
import { 
  FiUsers, 
  FiUserPlus,
  FiUser,
  FiMail,
  FiPhone,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiEye
} from 'react-icons/fi';

interface CoGestionnaireExtended extends CoGestionnaire {
  displayName?: string;
  displayEmail?: string;
  displayStatus?: 'active' | 'inactive' | 'pending';
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<CoGestionnaireExtended[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<CoGestionnaireExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  // Récupération des co-gestionnaires
  const fetchManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setManagers([]);
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch('/api/co-gestionnaires', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const managersData = await response.json();
      console.log('📋 Co-gestionnaires reçus:', managersData);

      // Transformer les co-gestionnaires pour l'affichage
      const transformedManagers: CoGestionnaireExtended[] = managersData.map((manager: CoGestionnaire) => ({
        ...manager,
        displayName: `${manager.prenom} ${manager.nom}`,
        displayEmail: manager.email,
        displayStatus: manager.statut === 'actif' ? 'active' : 'inactive'
      }));

      setManagers(transformedManagers);
      console.log('✅ Co-gestionnaires récupérés:', transformedManagers.length);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des co-gestionnaires:', err);
      setError(`Erreur lors du chargement des co-gestionnaires: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  // Création d'un nouveau co-gestionnaire avec le formulaire avancé
  const handleCreateCoGestionnaire = async (formData: CoGestionnaireFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Création co-gestionnaire depuis dashboard:', formData);
      
      // Préparer les données pour l'API
      const coGestionnaireData = {
        ...formData,
        telephone: formData.tel, // Ajouter l'alias telephone
      };

      // Obtenir le token d'authentification
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Token d\'authentification non disponible');
      }

      // Appel API
      const response = await fetch('/api/co-gestionnaires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(coGestionnaireData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Erreur de création');
      }

      console.log('✅ Co-gestionnaire créé:', data);
      
      // Fermer le modal et recharger la liste
      setShowCreateModal(false);
      await fetchManagers();
      
    } catch (error) {
      console.error('❌ Erreur création co-gestionnaire:', error);
      setError(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un co-gestionnaire
  const deleteManager = async (id: string) => {
    try {
      setLoading(true);
      
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Token d\'authentification non disponible');
      }

      const response = await fetch(`/api/co-gestionnaires/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      console.log('✅ Co-gestionnaire supprimé');
      await fetchManagers();
      
    } catch (error) {
      console.error('❌ Erreur suppression co-gestionnaire:', error);
      setError(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchManagers();
  }, [user]);

  // Filtrage des co-gestionnaires
  const filteredManagers = managers.filter(manager =>
    manager.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.displayEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      default: return 'En attente';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Co-gestionnaires</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les membres de votre équipe et leurs permissions
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 bg-[#f01919] hover:bg-red-700 text-white"
        >
          <FiUserPlus className="w-4 h-4 mr-2" />
          Nouveau co-gestionnaire
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiUsers className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{managers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiUserPlus className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Actifs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {managers.filter(m => m.displayStatus === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiShield className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avec permissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {managers.filter(m => m.permissions && m.permissions.length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button
            onClick={fetchManagers}
            variant="outline"
            className="flex items-center"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Liste des co-gestionnaires */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <FiRefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Chargement des co-gestionnaires...</p>
          </div>
        ) : filteredManagers.length === 0 ? (
          <div className="p-8 text-center">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Aucun co-gestionnaire trouvé</p>
            <p className="text-sm text-gray-400">
              {searchTerm ? 'Essayez une autre recherche' : 'Commencez par en créer un'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Co-gestionnaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredManagers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {manager.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {manager.description || 'Co-gestionnaire'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{manager.displayEmail}</div>
                      <div className="text-sm text-gray-500">{manager.tel || 'Non renseigné'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(manager.displayStatus || 'pending')}`}>
                        {getStatusLabel(manager.displayStatus || 'pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {manager.permissions && manager.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {manager.permissions.map((permission, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {permission.resource}: {permission.actions.join(', ')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Aucune permission</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedManager(manager);
                            setShowDetailModal(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <FiEye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteManager(manager.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création avec formulaire avancé */}
      {showCreateModal && (
        <CoGestionnaireCreateFormAdvanced
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCoGestionnaire}
          loading={loading}
        />
      )}

      {/* Modal de détails de co-gestionnaire */}
      {showDetailModal && selectedManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Détails du co-gestionnaire</h2>
                  <p className="text-blue-100 text-sm">{selectedManager.displayName}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedManager(null);
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <FiTrash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Prénom</label>
                  <p className="text-gray-900 font-medium">{selectedManager.prenom}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nom</label>
                  <p className="text-gray-900 font-medium">{selectedManager.nom}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedManager.displayEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                  <p className="text-gray-900">{selectedManager.tel || 'Non renseigné'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Statut</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedManager.displayStatus || 'pending')}`}>
                    {getStatusLabel(selectedManager.displayStatus || 'pending')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Niveau d'accès</label>
                  <span className="text-gray-900">{selectedManager.ACCES}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Permissions</label>
                {selectedManager.permissions && selectedManager.permissions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedManager.permissions.map((permission, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{permission.resource}</div>
                        <div className="text-sm text-gray-600">
                          Actions: {permission.actions.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Aucune permission assignée</p>
                )}
              </div>

              {selectedManager.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{selectedManager.description}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedManager(null);
                }}
                variant="outline"
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
