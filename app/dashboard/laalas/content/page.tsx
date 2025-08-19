'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { useApi } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { ContenuDashboard } from '../../../models/contenu';
import { 
  FiFileText, 
  FiImage,
  FiVideo,
  FiMusic,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiHeart,
  FiShare2,
  FiCalendar,
  FiAlertTriangle
} from 'react-icons/fi';

interface ContenuExtended extends ContenuDashboard {
  displayTitle?: string;
  displayDescription?: string;
  displayStatus?: 'published' | 'draft' | 'scheduled';
  laalaName?: string;
}

const contentTypes = [
  { id: 'texte', name: 'Texte', icon: FiFileText, color: 'bg-blue-100 text-blue-800' },
  { id: 'image', name: 'Image', icon: FiImage, color: 'bg-green-100 text-green-800' },
  { id: 'video', name: 'Vidéo', icon: FiVideo, color: 'bg-red-100 text-red-800' },
  { id: 'audio', name: 'Audio', icon: FiMusic, color: 'bg-purple-100 text-purple-800' }
];

export default function ContentPage() {
  const [contents, setContents] = useState<ContenuExtended[]>([]);
  const [laalas, setLaalas] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'contents'>('contents');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContenuExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLaalas, setLoadingLaalas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de création
  const [newContent, setNewContent] = useState({
    nom: '',
    description: '',
    type: 'texte',
    src: '',
    idLaala: '',
    allowComment: true,
    htags: [] as string[],
    newTag: ''
  });

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Récupération des laalas depuis l'API
  const fetchLaalas = async () => {
    try {
      setLoadingLaalas(true);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement des laalas');
        setLoadingLaalas(false);
        return;
      }
      
      console.log('🔍 Récupération des laalas pour utilisateur:', user.uid);
      const laalasData = await apiFetch('/api/laalas');
      
      if (!Array.isArray(laalasData)) {
        console.warn('⚠️ Réponse API inattendue pour laalas:', laalasData);
        setLaalas([]);
        return;
      }
      
      setLaalas(laalasData);
      console.log('✅ Laalas récupérés:', laalasData.length);
      
      // Sélectionner automatiquement le premier laala s'il y en a un
      if (laalasData.length > 0 && !newContent.idLaala) {
        setNewContent(prev => ({ ...prev, idLaala: laalasData[0].id }));
      }
      
    } catch (err) {
      console.error('❌ Erreur récupération laalas:', err);
      setLaalas([]);
    } finally {
      setLoadingLaalas(false);
    }
  };

  // Récupération des contenus depuis l'API
  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des contenus pour utilisateur:', user.uid);
      const contentsData = await apiFetch('/api/contenus');
      
      if (!Array.isArray(contentsData)) {
        console.warn('⚠️ Réponse API inattendue:', contentsData);
        setContents([]);
        return;
      }
      
      // Transformer les contenus pour l'affichage
      const transformedContents: ContenuExtended[] = contentsData.map((content: ContenuDashboard) => {
        const laala = laalas.find(l => l.id === content.idLaala);
        return {
          ...content,
          displayTitle: content.nom || 'Contenu sans titre',
          displayDescription: content.nom || 'Aucune description', // utiliser nom comme description
          displayStatus: content.allowComment ? 'published' : 'draft', // utiliser allowComment comme indicateur de statut
          laalaName: laala?.nom || 'Laala inconnu'
        };
      });
      
      setContents(transformedContents);
      console.log('✅ Contenus récupérés:', transformedContents.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération contenus:', err);
      setError(`Erreur lors du chargement des contenus: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  // Création d'un nouveau contenu
  const createContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newContent.nom.trim()) {
        setError('Le nom du contenu est requis');
        return;
      }

      if (!newContent.idLaala) {
        setError('Vous devez sélectionner un laala pour ce contenu');
        return;
      }
      
      const contentData = {
        nom: newContent.nom,
        description: newContent.description,
        type: newContent.type,
        src: newContent.src,
        idLaala: newContent.idLaala,
        allowComment: newContent.allowComment,
        htags: newContent.htags,
        personnes: [],
        idCreateur: user?.uid || 'anonymous',
        dateCreation: new Date().toISOString(),
        statut: 'publié',
        vues: 0,
        likes: 0,
        commentaires: 0
      };
      
      await apiFetch('/api/contenus', {
        method: 'POST',
        body: JSON.stringify(contentData)
      });
      
      console.log('✅ Contenu créé avec succès');
      
      // Réinitialiser le formulaire
      setNewContent({
        nom: '',
        description: '',
        type: 'texte',
        src: '',
        idLaala: laalas.length > 0 ? laalas[0].id : '',
        allowComment: true,
        htags: [],
        newTag: ''
      });
      
      setShowCreateModal(false);
      await fetchContents();
      
    } catch (err) {
      console.error('❌ Erreur création contenu:', err);
      setError('Erreur lors de la création du contenu');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un contenu
  const deleteContent = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      return;
    }
    
    try {
      await apiFetch(`/api/contenus/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Contenu supprimé:', id);
      await fetchContents();
      
    } catch (err) {
      console.error('❌ Erreur suppression contenu:', err);
      setError('Erreur lors de la suppression');
    }
  };

  // Fonction pour voir les détails d'un contenu (READ)
  const viewContentDetails = (content: ContenuExtended) => {
    console.log('📖 Lecture contenu:', content.nom);
    setSelectedContent(content);
    setShowDetailModal(true);
  };

  // Fonction pour modifier un contenu (UPDATE)
  const editContent = (content: ContenuExtended) => {
    console.log('✏️ Modification contenu:', content.nom);
    setSelectedContent(content);
    
    // Pré-remplir le formulaire avec les données du contenu
    setNewContent({
      nom: content.nom || '',
      description: '', // Le modèle n'a pas de description, donc on laisse vide
      type: content.type || 'texte',
      src: content.src || '',
      idLaala: content.idLaala || '',
      allowComment: content.allowComment !== false,
      htags: content.htags || [],
      newTag: ''
    });
    
    setShowEditModal(true);
  };

  // Mise à jour d'un contenu existant
  const updateContent = async () => {
    if (!selectedContent) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!newContent.nom.trim() || !newContent.description.trim() || !newContent.idLaala) {
        setError('Le nom, la description et le laala sont requis');
        return;
      }
      
      const contentData = {
        nom: newContent.nom,
        description: newContent.description,
        type: newContent.type,
        src: newContent.src,
        idLaala: newContent.idLaala,
        allowComment: newContent.allowComment,
        htags: newContent.htags,
        dateModification: new Date().toISOString()
      };
      
      await apiFetch(`/api/contenus/${selectedContent.id}`, {
        method: 'PUT',
        body: JSON.stringify(contentData)
      });
      
      console.log('✅ Contenu mis à jour avec succès');
      
      // Réinitialiser les états
      setSelectedContent(null);
      setShowEditModal(false);
      
      // Réinitialiser le formulaire
      setNewContent({
        nom: '',
        description: '',
        type: 'texte',
        src: '',
        idLaala: '',
        allowComment: true,
        htags: [],
        newTag: ''
      });
      
      await fetchContents();
      
    } catch (err) {
      console.error('❌ Erreur mise à jour contenu:', err);
      setError('Erreur lors de la mise à jour du contenu');
    } finally {
      setLoading(false);
    }
  };

  // Ajout d'un hashtag
  const addHashtag = () => {
    if (newContent.newTag.trim() && !newContent.htags.includes(newContent.newTag.trim())) {
      setNewContent(prev => ({
        ...prev,
        htags: [...prev.htags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  // Suppression d'un hashtag
  const removeHashtag = (tag: string) => {
    setNewContent(prev => ({
      ...prev,
      htags: prev.htags.filter(t => t !== tag)
    }));
  };

  // Ouverture du modal avec vérification des laalas
  const handleOpenCreateModal = async () => {
    await fetchLaalas();
    if (laalas.length === 0) {
      setError('Vous devez d\'abord créer un laala avant de pouvoir créer du contenu');
      return;
    }
    setShowCreateModal(true);
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchLaalas().then(() => {
        fetchContents();
      });
    }
  }, [user]);

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.displayTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.displayDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || content.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'draft': return 'Brouillon';
      case 'scheduled': return 'Programmé';
      default: return status;
    }
  };

  const getTypeInfo = (type: string) => {
    return contentTypes.find(t => t.id === type) || contentTypes[0];
  };

  // Stats calculations
  const totalPublished = contents.filter(c => c.displayStatus === 'published').length;
  const totalViews = contents.reduce((sum, c) => sum + (c.vues || 0), 0);
  const totalLikes = contents.reduce((sum, c) => sum + (c.likes || 0), 0);
  const totalComments = contents.reduce((sum, c) => sum + (Array.isArray(c.commentaires) ? c.commentaires.length : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Contenus</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos publications et créations
          </p>
        </div>
        <Button 
          onClick={handleOpenCreateModal}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
          disabled={laalas.length === 0}
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouveau Contenu
        </Button>
      </div>

      {/* Alerte si aucun laala */}
      {laalas.length === 0 && !loadingLaalas && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <FiAlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
            <div>
              <p className="text-yellow-800 font-medium">Aucun laala disponible</p>
              <p className="text-yellow-700 text-sm mt-1">
                Vous devez d'abord créer un laala avant de pouvoir créer du contenu. 
                <a href="/dashboard/laalas" className="underline ml-1">Créer un laala</a>
              </p>
            </div>
          </div>
        </div>
      )}

      <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contenus Publiés</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalPublished}</p>
                  <p className="text-sm text-green-600 mt-1">En ligne</p>
                </div>
                <div className="p-3 rounded-lg bg-[#f01919]">
                  <FiFileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vues Totales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalViews.toLocaleString()}</p>
                  <p className="text-sm text-blue-600 mt-1">Audience</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <FiEye className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Likes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalLikes.toLocaleString()}</p>
                  <p className="text-sm text-pink-600 mt-1">Engagement</p>
                </div>
                <div className="p-3 rounded-lg bg-pink-500">
                  <FiHeart className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commentaires</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalComments.toLocaleString()}</p>
                  <p className="text-sm text-purple-600 mt-1">Interactions</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500">
                  <FiShare2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters et Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Rechercher un contenu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  <option value="all">Tous les types</option>
                  {contentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Button 
                  onClick={fetchContents} 
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
                  onClick={handleOpenCreateModal}
                  className="w-full bg-[#f01919] hover:bg-[#d01515] text-white"
                  disabled={laalas.length === 0}
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
              <p className="text-gray-600">Chargement des contenus...</p>
            </div>
          )}

          {/* Contents List */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContents.map((content) => {
                const typeInfo = getTypeInfo(content.type || 'texte');
                const IconComponent = typeInfo.icon;
                
                return (
                  <div key={content.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <IconComponent className="w-5 h-5 text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {content.displayTitle}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(content.displayStatus || 'draft')}`}>
                            {getStatusLabel(content.displayStatus || 'draft')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {content.displayDescription}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          📍 Laala: {content.laalaName}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            <FiEye className="w-4 h-4 mr-1" />
                            {content.vues || 0}
                          </span>
                          <span className="flex items-center">
                            <FiHeart className="w-4 h-4 mr-1" />
                            {content.likes || 0}
                          </span>
                          <span className="flex items-center">
                            <FiShare2 className="w-4 h-4 mr-1" />
                            {content.commentaires || 0}
                          </span>
                        </div>
                        {content.htags && content.htags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {content.htags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                #{tag}
                              </span>
                            ))}
                            {content.htags.length > 3 && (
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                +{content.htags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                        {typeInfo.name}
                      </span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <FiEdit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteContent(content.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* État vide */}
          {!loading && filteredContents.length === 0 && (
            <div className="text-center py-12">
              <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterType !== 'all' 
                  ? 'Aucun contenu trouvé' 
                  : 'Aucun contenu'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all'
                  ? 'Aucun contenu ne correspond à vos critères de recherche.'
                  : laalas.length === 0 
                    ? 'Vous devez d\'abord créer un laala avant de pouvoir créer du contenu.'
                    : 'Vous n\'avez pas encore créé de contenus. Créez votre première publication.'
                }
              </p>
              {!searchTerm && filterType === 'all' && laalas.length > 0 && (
                <Button 
                  onClick={handleOpenCreateModal}
                  className="bg-[#f01919] hover:bg-[#d01515] text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Créer votre premier contenu
                </Button>
              )}
              {laalas.length === 0 && (
                <Button 
                  onClick={() => window.location.href = '/dashboard/laalas'}
                  className="bg-[#f01919] hover:bg-[#d01515] text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Créer votre premier laala
                </Button>
              )}
            </div>
          )}
        </>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nouveau Contenu</h2>
                <p className="text-gray-600 text-sm mt-1">Créez un nouveau contenu pour vos laalas</p>
              </div>
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

            <form onSubmit={(e) => { e.preventDefault(); createContent(); }} className="space-y-4">
              <div>
                <label htmlFor="idLaala" className="block text-sm font-medium text-gray-700 mb-1">
                  Laala associé <span className="text-red-500">*</span>
                </label>
                <select
                  id="idLaala"
                  value={newContent.idLaala}
                  onChange={(e) => setNewContent(prev => ({ ...prev, idLaala: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                  required
                >
                  <option value="">Sélectionner un laala</option>
                  {laalas.map(laala => (
                    <option key={laala.id} value={laala.id}>
                      {laala.nom} ({laala.categorie})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Le contenu sera publié dans ce laala
                </p>
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du contenu <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nom"
                  type="text"
                  value={newContent.nom}
                  onChange={(e) => setNewContent(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Ex: Mon article"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newContent.description}
                  onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre contenu..."
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de contenu
                </label>
                <select
                  id="type"
                  value={newContent.type}
                  onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  {contentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="src" className="block text-sm font-medium text-gray-700 mb-1">
                  URL/Source (optionnel)
                </label>
                <Input
                  id="src"
                  type="url"
                  value={newContent.src}
                  onChange={(e) => setNewContent(prev => ({ ...prev, src: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hashtags
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newContent.newTag}
                    onChange={(e) => setNewContent(prev => ({ ...prev, newTag: e.target.value }))}
                    placeholder="Ajouter un hashtag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  />
                  <Button type="button" onClick={addHashtag} variant="outline">
                    <FiPlus className="w-4 h-4" />
                  </Button>
                </div>
                {newContent.htags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newContent.htags.map((tag, index) => (
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowComment"
                  checked={newContent.allowComment}
                  onChange={(e) => setNewContent(prev => ({ ...prev, allowComment: e.target.checked }))}
                  className="rounded border-gray-300 text-[#f01919] focus:ring-[#f01919]"
                />
                <label htmlFor="allowComment" className="text-sm text-gray-700">
                  Autoriser les commentaires
                </label>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <FiFileText className="w-4 h-4 inline mr-1" />
                  Votre contenu sera publié dans le laala sélectionné et visible par votre communauté.
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
                  disabled={loading || !newContent.nom.trim() || !newContent.idLaala}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4 mr-2" />
                      Publier
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