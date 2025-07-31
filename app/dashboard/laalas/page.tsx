'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { LaalaDashboard } from '../../models/laala';
import { 
  FiUsers, 
  FiEye,
  FiHeart,
  FiTrendingUp,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiSettings
} from 'react-icons/fi';

interface LaalaExtended extends LaalaDashboard {
  displayTitle?: string;
  displayDescription?: string;
  displayStatus?: 'active' | 'inactive' | 'draft';
}

const templates = [
  {
    id: '1',
    name: 'Laala Éducatif',
    type: 'education',
    description: 'Template pour contenu éducatif',
    usage: 32
  },
  {
    id: '2',
    name: 'Laala Divertissement',
    type: 'entertainment',
    description: 'Template pour divertissement',
    usage: 28
  },
  {
    id: '3',
    name: 'Laala Business',
    type: 'business',
    description: 'Template professionnel',
    usage: 15
  },
  {
    id: '4',
    name: 'Laala Personnel',
    type: 'personal',
    description: 'Template personnel',
    usage: 41
  }
];

export default function LaalasPage() {
  const [laalas, setLaalas] = useState<LaalaExtended[]>([]);
  const [selectedTab, setSelectedTab] = useState<'laalas' | 'templates'>('laalas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de création
  const [newLaala, setNewLaala] = useState({
    nom: '',
    description: '',
    type: 'public' as 'public' | 'private',
    htags: [] as string[],
    newTag: ''
  });

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Récupération des laalas depuis l'API
  const fetchLaalas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des laalas pour utilisateur:', user.uid);
      const laalasData = await apiFetch('/api/laalas');
      
      if (!Array.isArray(laalasData)) {
        console.warn('⚠️ Réponse API inattendue:', laalasData);
        setLaalas([]);
        return;
      }
      
      // Transformer les laalas pour l'affichage
      const transformedLaalas: LaalaExtended[] = laalasData.map((laala: LaalaDashboard) => ({
        ...laala,
        displayTitle: laala.nom || 'Laala sans nom',
        displayDescription: laala.description || 'Aucune description',
        displayStatus: laala.type === 'public' ? 'active' : 'inactive'
      }));
      
      setLaalas(transformedLaalas);
      console.log('✅ Laalas récupérés:', transformedLaalas.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération laalas:', err);
      setError(`Erreur lors du chargement des laalas: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setLaalas([]);
    } finally {
      setLoading(false);
    }
  };

  // Création d'un nouveau laala
  const createLaala = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newLaala.nom.trim() || !newLaala.description.trim()) {
        setError('Le nom et la description sont requis');
        return;
      }
      
      const laalaData = {
        nom: newLaala.nom,
        description: newLaala.description,
        type: newLaala.type,
        htags: newLaala.htags,
        personnes: [],
        idCreateur: user?.uid || 'anonymous',
        dateCreation: new Date().toISOString(),
        statut: 'actif'
      };
      
      await apiFetch('/api/laalas', {
        method: 'POST',
        body: JSON.stringify(laalaData)
      });
      
      console.log('✅ Laala créé avec succès');
      
      // Réinitialiser le formulaire
      setNewLaala({
        nom: '',
        description: '',
        type: 'public',
        htags: [],
        newTag: ''
      });
      
      setShowCreateModal(false);
      await fetchLaalas();
      
    } catch (err) {
      console.error('❌ Erreur création laala:', err);
      setError('Erreur lors de la création du laala');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un laala
  const deleteLaala = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce laala ?')) {
      return;
    }
    
    try {
      await apiFetch(`/api/laalas/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Laala supprimé:', id);
      await fetchLaalas();
      
    } catch (err) {
      console.error('❌ Erreur suppression laala:', err);
      setError('Erreur lors de la suppression');
    }
  };

  // Ajout d'un hashtag
  const addHashtag = () => {
    if (newLaala.newTag.trim() && !newLaala.htags.includes(newLaala.newTag.trim())) {
      setNewLaala(prev => ({
        ...prev,
        htags: [...prev.htags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  // Suppression d'un hashtag
  const removeHashtag = (tag: string) => {
    setNewLaala(prev => ({
      ...prev,
      htags: prev.htags.filter(t => t !== tag)
    }));
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchLaalas();
    }
  }, [user]);

  const filteredLaalas = laalas.filter(laala => {
    const matchesSearch = laala.displayTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         laala.displayDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || laala.displayStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-purple-100 text-purple-800';
      case 'education': return 'bg-green-100 text-green-800';
      case 'entertainment': return 'bg-pink-100 text-pink-800';
      case 'business': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats calculations
  const totalActive = laalas.filter(l => l.displayStatus === 'active').length;
  const totalViews = laalas.reduce((sum, l) => sum + (l.vues || 0), 0);
  const totalFollowers = laalas.reduce((sum, l) => sum + (l.personnes?.length || 0), 0);
  const totalLikes = laalas.reduce((sum, l) => sum + (l.likes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Laalas</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos espaces de contenu et votre communauté
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouveau Laala
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setSelectedTab('laalas')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            selectedTab === 'laalas'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Mes Laalas ({laalas.length})
        </button>
        <button
          onClick={() => setSelectedTab('templates')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            selectedTab === 'templates'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Templates ({templates.length})
        </button>
      </div>

      {selectedTab === 'laalas' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Laalas Actifs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalActive}</p>
                  <p className="text-sm text-green-600 mt-1">En ligne</p>
                </div>
                <div className="p-3 rounded-lg bg-[#f01919]">
                  <FiPlay className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vues Totales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalViews.toLocaleString()}</p>
                  <p className="text-sm text-blue-600 mt-1">Toutes plateformes</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <FiEye className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Abonnés</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalFollowers.toLocaleString()}</p>
                  <p className="text-sm text-purple-600 mt-1">Communauté</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Likes Totaux</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalLikes.toLocaleString()}</p>
                  <p className="text-sm text-pink-600 mt-1">Engagement</p>
                </div>
                <div className="p-3 rounded-lg bg-pink-500">
                  <FiHeart className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters et Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Rechercher un laala..."
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
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="draft">Brouillon</option>
                </select>
              </div>
              <div>
                <Button 
                  onClick={fetchLaalas} 
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
              <p className="text-gray-600">Chargement des laalas...</p>
            </div>
          )}

          {/* Laalas List */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLaalas.map((laala) => (
                <div key={laala.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {laala.displayTitle}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(laala.displayStatus || 'inactive')}`}>
                          {getStatusLabel(laala.displayStatus || 'inactive')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {laala.displayDescription}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <FiEye className="w-4 h-4 mr-1" />
                          {laala.vues || 0}
                        </span>
                        <span className="flex items-center">
                          <FiUsers className="w-4 h-4 mr-1" />
                          {laala.personnes?.length || 0}
                        </span>
                        <span className="flex items-center">
                          <FiHeart className="w-4 h-4 mr-1" />
                          {laala.likes || 0}
                        </span>
                      </div>
                      {laala.htags && laala.htags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {laala.htags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              #{tag}
                            </span>
                          ))}
                          {laala.htags.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              +{laala.htags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(laala.type || 'public')}`}>
                      {laala.type === 'public' ? 'Public' : 'Privé'}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <FiSettings className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FiEdit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteLaala(laala.id!)}
                        className="text-red-600 hover:text-red-700"
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
          {!loading && filteredLaalas.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Aucun laala trouvé' 
                  : 'Aucun laala'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all'
                  ? 'Aucun laala ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore créé de laalas. Créez votre premier espace de contenu.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#f01919] hover:bg-[#d01515] text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Créer votre premier laala
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        /* Templates Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                    {template.type}
                  </span>
                  <span className="text-xs text-gray-500">{template.usage} utilisations</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <FiEye className="w-4 h-4 mr-1" />
                    Aperçu
                  </Button>
                  <Button size="sm" className="flex-1 bg-[#f01919] hover:bg-[#d01515] text-white">
                    Utiliser
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center py-8">
            <Button className="bg-[#f01919] hover:bg-[#d01515] text-white">
              <FiPlus className="w-4 h-4 mr-2" />
              Créer un nouveau template
            </Button>
          </div>
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nouveau Laala</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                <FiX className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); createLaala(); }} className="space-y-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du Laala
                </label>
                <Input
                  id="nom"
                  type="text"
                  value={newLaala.nom}
                  onChange={(e) => setNewLaala(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Ex: Mon Laala Cuisine"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newLaala.description}
                  onChange={(e) => setNewLaala(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre laala..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de Laala
                </label>
                <select
                  id="type"
                  value={newLaala.type}
                  onChange={(e) => setNewLaala(prev => ({ ...prev, type: e.target.value as 'public' | 'private' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hashtags
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newLaala.newTag}
                    onChange={(e) => setNewLaala(prev => ({ ...prev, newTag: e.target.value }))}
                    placeholder="Ajouter un hashtag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  />
                  <Button type="button" onClick={addHashtag} variant="outline">
                    <FiPlus className="w-4 h-4" />
                  </Button>
                </div>
                {newLaala.htags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newLaala.htags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeHashtag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <FiUsers className="w-4 h-4 inline mr-1" />
                  Votre laala sera visible selon le type choisi et pourra accueillir du contenu et des abonnés.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
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
                  disabled={loading || !newLaala.nom.trim() || !newLaala.description.trim()}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4 mr-2" />
                      Créer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
