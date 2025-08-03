'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { MediaUpload } from '../../../components/ui/media-upload';
import { useApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { LaalaDashboard } from '../../models/laala';
import { MediaUploadResult } from '../../../lib/appwrite/media-service';
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
  FiSettings,
  FiAlertTriangle,
  FiImage,
  FiVideo,
  FiCheck
} from 'react-icons/fi';

interface LaalaExtended extends LaalaDashboard {
  displayTitle?: string;
  displayDescription?: string;
  displayStatus?: 'active' | 'inactive' | 'draft';
}

export default function LaalasPage() {
  const [laalas, setLaalas] = useState<LaalaExtended[]>([]);
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

  // États pour les médias
  const [coverMediaType, setCoverMediaType] = useState<'image' | 'video'>('image');
  const [coverUrl, setCoverUrl] = useState<string>('');

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

  // Gestion des uploads de médias
  const handleCoverUpload = (result: MediaUploadResult) => {
    setCoverUrl(result.url);
    console.log('Couverture Laala uploadée:', result);
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
        coverUrl,
        coverType: coverMediaType,
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
      setCoverUrl('');
      setCoverMediaType('image');
      
      setShowCreateModal(false);
      await fetchLaalas();
      
    } catch (err) {
      console.error('❌ Erreur création laala:', err);
      setError('Erreur lors de la création du laala');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un laala avec suppression en cascade des contenus
  const deleteLaala = async (id: string, laalaName: string) => {
    // Vérifier d'abord s'il y a des contenus liés
    try {
      const contentsData = await apiFetch('/api/contenus');
      const linkedContents = Array.isArray(contentsData) 
        ? contentsData.filter((content: any) => content.idLaala === id)
        : [];
      
      let confirmMessage = `Êtes-vous sûr de vouloir supprimer le laala "${laalaName}" ?`;
      
      if (linkedContents.length > 0) {
        confirmMessage += `\n\n⚠️ ATTENTION: Cette action supprimera également ${linkedContents.length} contenu(s) associé(s) à ce laala.\n\nCette action est irréversible.`;
      }
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Supprimer d'abord tous les contenus liés
      if (linkedContents.length > 0) {
        console.log(`🗑️ Suppression de ${linkedContents.length} contenus liés au laala ${id}`);
        
        for (const content of linkedContents) {
          try {
            await apiFetch(`/api/contenus/${content.id}`, {
              method: 'DELETE'
            });
            console.log(`✅ Contenu supprimé: ${content.id}`);
          } catch (contentErr) {
            console.error(`❌ Erreur suppression contenu ${content.id}:`, contentErr);
          }
        }
      }
      
      // Ensuite supprimer le laala
      await apiFetch(`/api/laalas/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Laala supprimé:', id);
      
      if (linkedContents.length > 0) {
        // Message de succès avec info sur les contenus supprimés
        const successMessage = `Laala "${laalaName}" et ${linkedContents.length} contenu(s) associé(s) supprimés avec succès.`;
        console.log('✅', successMessage);
      }
      
      await fetchLaalas();
      
    } catch (err) {
      console.error('❌ Erreur suppression laala:', err);
      setError('Erreur lors de la suppression du laala');
    } finally {
      setLoading(false);
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

      {/* Actions CRUD */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions disponibles</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Créer
          </Button>
          <Button 
            onClick={fetchLaalas}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            <FiEye className="w-4 h-4 mr-2" />
            Lire
          </Button>
          <Button 
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
            disabled={filteredLaalas.length === 0}
          >
            <FiEdit3 className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button 
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={filteredLaalas.length === 0}
          >
            <FiTrash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

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
                        onClick={() => deleteLaala(laala.id!, laala.displayTitle!)}
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

      {/* Modal de création moderne */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-[#f01919] to-[#d01515] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Nouveau Laala</h2>
                    <p className="text-red-100 text-sm">Créez votre espace de contenu</p>
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

              <form onSubmit={(e) => { e.preventDefault(); createLaala(); }} className="space-y-6">
                {/* Informations de base */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiSettings className="w-5 h-5 mr-2 text-[#f01919]" />
                    Informations de base
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du Laala *
                      </label>
                      <Input
                        id="nom"
                        type="text"
                        value={newLaala.nom}
                        onChange={(e) => setNewLaala(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Mon Laala Cuisine"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Type de Laala
                      </label>
                      <select
                        id="type"
                        value={newLaala.type}
                        onChange={(e) => setNewLaala(prev => ({ ...prev, type: e.target.value as 'public' | 'private' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919] transition-all duration-200"
                      >
                        <option value="public">🌍 Public</option>
                        <option value="private">�� Privé</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <Textarea
                      id="description"
                      value={newLaala.description}
                      onChange={(e) => setNewLaala(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez votre laala, son objectif, le type de contenu que vous partagerez..."
                      rows={4}
                      className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919] resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Hashtags */}
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="text-blue-600 mr-2">#</span>
                    Hashtags
                  </h3>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newLaala.newTag}
                      onChange={(e) => setNewLaala(prev => ({ ...prev, newTag: e.target.value }))}
                      placeholder="Ajouter un hashtag (ex: cuisine, voyage...)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                      className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button 
                      type="button" 
                      onClick={addHashtag} 
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                    >
                      <FiPlus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {newLaala.htags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newLaala.htags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeHashtag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Couverture du Laala */}
                <div className="bg-purple-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiImage className="w-5 h-5 mr-2 text-purple-600" />
                    Couverture du Laala
                  </h3>
                  
                  {/* Choix du type de couverture moderne */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Type de couverture
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center justify-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        coverMediaType === 'image' 
                          ? 'border-purple-500 bg-purple-100 text-purple-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                      }`}>
                        <input
                          type="radio"
                          name="coverType"
                          value="image"
                          checked={coverMediaType === 'image'}
                          onChange={(e) => setCoverMediaType('image')}
                          className="sr-only"
                        />
                        <FiImage className="w-5 h-5" />
                        <span className="font-medium">Image</span>
                      </label>

                      <label className={`flex items-center justify-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        coverMediaType === 'video' 
                          ? 'border-purple-500 bg-purple-100 text-purple-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                      }`}>
                        <input
                          type="radio"
                          name="coverType"
                          value="video"
                          checked={coverMediaType === 'video'}
                          onChange={(e) => setCoverMediaType('video')}
                          className="sr-only"
                        />
                        <FiVideo className="w-5 h-5" />
                        <span className="font-medium">Vidéo</span>
                      </label>
                    </div>
                  </div>

                  {/* Upload de la couverture */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <MediaUpload
                      category="laala-cover"
                      userId={user?.uid || 'anonymous'}
                      acceptedTypes={coverMediaType === 'image' ? 'image/*' : 'video/*'}
                      maxSize={coverMediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024}
                      label={`Sélectionner une ${coverMediaType === 'image' ? 'image' : 'vidéo'} de couverture`}
                      description={`${coverMediaType === 'image' ? 'Image' : 'Vidéo'} qui représentera votre Laala (optionnel)`}
                      onUploadSuccess={handleCoverUpload}
                      onUploadError={(error: string) => {
                        console.error('Erreur upload couverture:', error);
                        setError(error);
                      }}
                      preview={true}
                    />
                    {coverUrl && (
                      <div className="mt-4 flex items-center space-x-3">
                        <div className="relative">
                          {coverMediaType === 'image' ? (
                            <img 
                              src={coverUrl} 
                              alt="Couverture" 
                              className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200"
                            />
                          ) : (
                            <video 
                              src={coverUrl} 
                              className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200"
                              controls
                            />
                          )}
                          <div className="absolute -top-2 -right-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <FiCheck className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Couverture ajoutée</p>
                          <p className="text-xs text-gray-500">
                            {coverMediaType === 'image' ? 'Image' : 'Vidéo'} prête à être utilisée
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages informatifs */}
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <FiUsers className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-blue-800 font-medium">À propos de votre Laala</h4>
                        <p className="text-blue-700 text-sm mt-1">
                          Votre laala sera visible selon le type choisi et pourra accueillir du contenu et des abonnés.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <FiAlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-amber-800 font-medium">Important</h4>
                        <p className="text-amber-700 text-sm mt-1">
                          La suppression d'un laala entraînera automatiquement la suppression de tous les contenus qui y sont associés.
                        </p>
                      </div>
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
                    disabled={loading || !newLaala.nom.trim() || !newLaala.description.trim()}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4 mr-2" />
                        Créer le Laala
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