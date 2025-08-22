'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Database, Users, User, FileText } from 'lucide-react';

interface PermissionTestData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
  ACCES: string;
  statut: string;
}

export default function TestPermissionsStorage() {
  const [coGestionnaires, setCoGestionnaires] = useState<PermissionTestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoGestionnaires = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/co-gestionnaires/list-all');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de récupération');
      }

      console.log('📋 Co-gestionnaires récupérés:', data.coGestionnaires);
      setCoGestionnaires(data.coGestionnaires || []);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoGestionnaires();
  }, []);

  const formatPermissions = (permissions: Array<{ resource: string; actions: string[] }>) => {
    if (!permissions || permissions.length === 0) {
      return 'Aucune permission';
    }

    return permissions.map(p => 
      `${p.resource}: ${p.actions.join(', ')}`
    ).join(' | ');
  };

  const getPermissionColor = (actions: string[]) => {
    if (actions.includes('delete')) return 'text-red-600 bg-red-50';
    if (actions.includes('update')) return 'text-orange-600 bg-orange-50';
    if (actions.includes('create')) return 'text-green-600 bg-green-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🔍 Test Stockage des Permissions
              </h1>
              <p className="text-gray-600">
                Vérification que les permissions du formulaire sont correctement stockées en base
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={fetchCoGestionnaires}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          </div>

          {/* Contenu */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Récupération des données...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-medium">Erreur</p>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Total Co-gestionnaires</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{coGestionnaires.length}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Avec Permissions</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {coGestionnaires.filter(c => c.permissions && c.permissions.length > 0).length}
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900">Sans Permissions</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {coGestionnaires.filter(c => !c.permissions || c.permissions.length === 0).length}
                  </p>
                </div>
              </div>

              {/* Liste des co-gestionnaires */}
              {coGestionnaires.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun co-gestionnaire</h3>
                  <p className="text-gray-500">Créez un co-gestionnaire pour tester le stockage des permissions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Détails des Permissions Stockées
                  </h2>
                  
                  {coGestionnaires.map((coGestionnaire) => (
                    <div key={coGestionnaire.id} className="bg-gray-50 border rounded-lg p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Informations personnelles */}
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">
                            👤 {coGestionnaire.prenom} {coGestionnaire.nom}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>📧 Email: {coGestionnaire.email}</p>
                            <p>🔐 Niveau d'accès: <span className="font-medium">{coGestionnaire.ACCES}</span></p>
                            <p>📊 Statut: <span className={`font-medium ${coGestionnaire.statut === 'actif' ? 'text-green-600' : 'text-red-600'}`}>
                              {coGestionnaire.statut}
                            </span></p>
                          </div>
                        </div>

                        {/* Permissions détaillées */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">🔑 Permissions Stockées</h4>
                          {!coGestionnaire.permissions || coGestionnaire.permissions.length === 0 ? (
                            <div className="bg-red-50 border border-red-200 rounded p-2">
                              <p className="text-red-600 text-sm">❌ Aucune permission stockée</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {coGestionnaire.permissions.map((permission, index) => (
                                <div key={index} className={`p-2 rounded ${getPermissionColor(permission.actions)}`}>
                                  <p className="font-medium capitalize">📁 {permission.resource}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {permission.actions.map((action) => (
                                      <span key={action} className="px-2 py-1 bg-white rounded text-xs font-medium">
                                        {action === 'create' && '➕ Créer'}
                                        {action === 'read' && '👁️ Consulter'}
                                        {action === 'update' && '✏️ Modifier'}
                                        {action === 'delete' && '🗑️ Supprimer'}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
