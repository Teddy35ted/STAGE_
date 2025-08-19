'use client';

import React, { useState, useEffect } from 'react';
import { CoGestionnaire } from '../../models/co_gestionnaire';
import { useApi } from '../../../lib/api';
import { CoGestionnaireForm } from '../../../components/forms/CoGestionnaireForm';
import { Button } from '../../../components/ui/button';
import { 
  FiUsers, 
  FiPlus, 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiShield,
  FiCalendar,
  FiMoreVertical,
  FiUserCheck,
  FiUserX
} from 'react-icons/fi';

export default function CoGestionnairesPage() {
  const [coGestionnaires, setCoGestionnaires] = useState<CoGestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoGestionnaire, setSelectedCoGestionnaire] = useState<CoGestionnaire | undefined>();
  const [viewMode, setViewMode] = useState<'view' | 'edit' | 'create'>('view');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const { apiFetch } = useApi();

  const fetchCoGestionnaires = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/co-gestionnaires');
      setCoGestionnaires(response.coGestionnaires || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des co-gestionnaires');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoGestionnaires();
  }, []);

  const handleCreate = () => {
    setSelectedCoGestionnaire(undefined);
    setViewMode('create');
    setIsFormOpen(true);
  };

  const handleView = (coGestionnaire: CoGestionnaire) => {
    setSelectedCoGestionnaire(coGestionnaire);
    setViewMode('view');
    setIsFormOpen(true);
  };

  const handleEdit = (coGestionnaire: CoGestionnaire) => {
    setSelectedCoGestionnaire(coGestionnaire);
    setViewMode('edit');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/co-gestionnaires/${id}`, {
        method: 'DELETE'
      });
      await fetchCoGestionnaires();
      setShowDeleteConfirm(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (statut: string) => {
    const styles = {
      actif: 'bg-green-100 text-green-800',
      inactif: 'bg-red-100 text-red-800',
      suspendu: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[statut as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {statut === 'actif' ? 'Actif' : statut === 'inactif' ? 'Inactif' : 'Suspendu'}
      </span>
    );
  };

  const getAccessBadge = (acces: string) => {
    const styles = {
      consulter: 'bg-blue-100 text-blue-800',
      gerer: 'bg-purple-100 text-purple-800',
      Ajouter: 'bg-green-100 text-green-800'
    };

    const labels = {
      consulter: 'Consulter',
      gerer: 'Gérer',
      Ajouter: 'Ajouter'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[acces as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[acces as keyof typeof labels] || acces}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#f01919] rounded-lg flex items-center justify-center">
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Co-gestionnaires</h1>
            <p className="text-gray-600">Gérez votre équipe de collaborateurs</p>
          </div>
        </div>
        
        <Button
          onClick={handleCreate}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Ajouter un co-gestionnaire
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{coGestionnaires.length}</p>
            </div>
            <FiUsers className="w-8 h-8 text-[#f01919]" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {coGestionnaires.filter(c => c.statut === 'actif').length}
              </p>
            </div>
            <FiUserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactifs</p>
              <p className="text-2xl font-bold text-red-600">
                {coGestionnaires.filter(c => c.statut === 'inactif').length}
              </p>
            </div>
            <FiUserX className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administrateurs</p>
              <p className="text-2xl font-bold text-purple-600">
                {coGestionnaires.filter(c => c.ACCES === 'gerer').length}
              </p>
            </div>
            <FiShield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Co-gestionnaires List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Liste des co-gestionnaires</h2>
        </div>
        
        {coGestionnaires.length === 0 ? (
          <div className="p-12 text-center">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun co-gestionnaire</h3>
            <p className="text-gray-600 mb-4">Commencez par ajouter des membres à votre équipe</p>
            <Button
              onClick={handleCreate}
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Ajouter le premier co-gestionnaire
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {coGestionnaires.map((coGestionnaire) => (
              <div key={coGestionnaire.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#f01919] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {coGestionnaire.prenom?.[0]?.toUpperCase()}{coGestionnaire.nom?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {coGestionnaire.prenom} {coGestionnaire.nom}
                        </h3>
                        {getStatusBadge(coGestionnaire.statut)}
                        {getAccessBadge(coGestionnaire.ACCES)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <FiMail className="w-4 h-4" />
                          <span>{coGestionnaire.email}</span>
                        </div>
                        {coGestionnaire.tel && (
                          <div className="flex items-center space-x-1">
                            <FiPhone className="w-4 h-4" />
                            <span>{coGestionnaire.tel}</span>
                          </div>
                        )}
                        {(coGestionnaire.ville || coGestionnaire.pays) && (
                          <div className="flex items-center space-x-1">
                            <FiMapPin className="w-4 h-4" />
                            <span>{[coGestionnaire.ville, coGestionnaire.pays].filter(Boolean).join(', ')}</span>
                          </div>
                        )}
                      </div>
                      
                      {coGestionnaire.dateCreation && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                          <FiCalendar className="w-3 h-3" />
                          <span>Ajouté le {new Date(coGestionnaire.dateCreation).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(coGestionnaire)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <FiEye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(coGestionnaire)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(coGestionnaire.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <CoGestionnaireForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        coGestionnaire={selectedCoGestionnaire}
        onSuccess={fetchCoGestionnaires}
        mode={viewMode}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce co-gestionnaire ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Annuler
              </Button>
              <Button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
