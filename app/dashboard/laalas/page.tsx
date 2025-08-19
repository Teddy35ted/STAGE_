'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { SimpleMediaUpload } from '../../../components/ui/simple-media-upload';
import { FileSelector } from '../../../components/ui/file-selector';
import { UniversalMedia } from '../../../components/media/UniversalMedia';
import { useApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useCRUDNotifications } from '../../../contexts/NotificationContext';
import { LaalaDashboard } from '../../models/laala';
import { MediaUploadResult, AppwriteMediaService } from '../../../lib/appwrite/media-service';
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
  participants?: string[]; // Pour remplacer personnes
}

export default function LaalasPage() {
  const { notifyCreate, notifyUpdate, notifyDelete } = useCRUDNotifications();
  const [laalas, setLaalas] = useState<LaalaExtended[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLaala, setSelectedLaala] = useState<LaalaExtended | null>(null);
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
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);

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
        displayStatus: laala.isLaalaPublic ? 'active' : 'inactive',
        participants: laala.idparticipants || []
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
    // S'assurer que l'URL est une string
    const urlString = String(result.url);
    setCoverUrl(urlString);
    console.log('Couverture Laala uploadée:', { ...result, url: urlString });
  };

  // Gestion de la sélection de fichier pour la couverture
  const handleCoverFileSelect = (file: File) => {
    setSelectedCoverFile(file);
    // Créer une URL de prévisualisation locale
    const previewUrl = URL.createObjectURL(file);
    setCoverUrl(previewUrl);
    console.log('Fichier de couverture sélectionné:', file.name);
  };

  const handleCoverFileRemove = () => {
    setSelectedCoverFile(null);
    setCoverUrl('');
    console.log('Fichier de couverture supprimé');
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
      
      let finalCoverUrl = coverUrl;
      
      // Upload du fichier de couverture s'il y en a un sélectionné
      if (selectedCoverFile) {
        try {
          console.log('📤 Upload de la couverture...');
          const uploadResult = await AppwriteMediaService.uploadFile({
            file: selectedCoverFile,
            category: 'laala-cover',
            onProgress: (progress) => console.log(`Upload: ${progress}%`)
          });
          finalCoverUrl = uploadResult.url;
          console.log('✅ Couverture uploadée:', finalCoverUrl);
        } catch (uploadError) {
          console.error('❌ Erreur upload couverture:', uploadError);
          setError('Erreur lors de l\'upload de la couverture');
          return;
        }
      }
      
      const laalaData = {
        nom: newLaala.nom,
        description: newLaala.description,
        type: newLaala.type,
        htags: newLaala.htags,
        coverUrl: finalCoverUrl,
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
      notifyCreate('Laala', newLaala.nom, true);
      
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
      setSelectedCoverFile(null);
      
      setShowCreateModal(false);
      await fetchLaalas();
      
    } catch (err) {
      console.error('❌ Erreur création laala:', err);
      notifyCreate('Laala', newLaala.nom, false);
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
      notifyDelete('Laala', laalaName, true);
      
      if (linkedContents.length > 0) {
        // Message de succès avec info sur les contenus supprimés
        const successMessage = `Laala "${laalaName}" et ${linkedContents.length} contenu(s) associé(s) supprimés avec succès.`;
        console.log('✅', successMessage);
      }
      
      await fetchLaalas();
      
    } catch (err) {
      console.error('❌ Erreur suppression laala:', err);
      notifyDelete('Laala', laalaName, false);
      setError('Erreur lors de la suppression du laala');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour voir les détails d'un laala (READ)
  const viewLaalaDetails = (laala: LaalaExtended) => {
    console.log('📖 Lecture laala:', laala.nom);
    setSelectedLaala(laala);
    setShowDetailModal(true);
  };

  // Fonction pour modifier un laala (UPDATE)
  const editLaala = (laala: LaalaExtended) => {
    console.log('✏️ Modification laala:', laala.nom);
    setSelectedLaala(laala);
    
    // Pré-remplir le formulaire avec les données du laala
    setNewLaala({
      nom: laala.nom || '',
      description: laala.description || '',
      type: laala.isLaalaPublic ? 'public' : 'private',
      htags: laala.htags || [],
      newTag: ''
    });
    
    // Définir les médias existants
    setCoverUrl(laala.cover ? String(laala.cover) : '');
    setCoverMediaType(laala.iscoverVideo ? 'video' : 'image');
    
    setShowEditModal(true);
  };

  // Mise à jour d'un laala existant
  const updateLaala = async () => {
    if (!selectedLaala) return;
    
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
        isLaalaPublic: newLaala.type === 'public',
        cover: coverUrl,
        iscoverVideo: coverMediaType === 'video',
        dateModification: new Date().toISOString()
      };
      
      await apiFetch(`/api/laalas/${selectedLaala.id}`, {
        method: 'PUT',
        body: JSON.stringify(laalaData)
      });
      
      console.log('✅ Laala mis à jour avec succès');
      notifyUpdate('Laala', newLaala.nom, true);
      
      // Réinitialiser les états
      setSelectedLaala(null);
      setShowEditModal(false);
      
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
      
      await fetchLaalas();
      
    } catch (err) {
      console.error('❌ Erreur mise à jour laala:', err);
      notifyUpdate('Laala', newLaala.nom, false);
      setError('Erreur lors de la mise à jour du laala');
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
  const totalFollowers = laalas.reduce((sum, l) => sum + (l.participants?.length || 0), 0);
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
                          {laala.participants?.length || 0}
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
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(laala.type || 'Laala freestyle')}`}>
                      {laala.isLaalaPublic ? 'Public' : 'Privé'}
                    </span>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => viewLaalaDetails(laala)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Voir les détails"
                      >
                        <FiEye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => editLaala(laala)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        title="Modifier le laala"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteLaala(laala.id!, laala.displayTitle!)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Supprimer le laala"
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
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

                  {/* Sélection de la couverture */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <FileSelector
                      accept={coverMediaType === 'image' ? 'image/*' : 'video/*'}
                      maxSize={coverMediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024}
                      label={`Sélectionner une ${coverMediaType === 'image' ? 'image' : 'vidéo'} de couverture`}
                      description={`${coverMediaType === 'image' ? 'Image' : 'Vidéo'} qui représentera votre Laala (optionnel)`}
                      mediaType={coverMediaType}
                      onFileSelect={handleCoverFileSelect}
                      onFileRemove={handleCoverFileRemove}
                    />
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

      {/* Modal de détails de laala (READ) */}
      {showDetailModal && selectedLaala && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header du modal de détails */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Détails du Laala</h2>
                    <p className="text-blue-100 text-sm">{selectedLaala.displayTitle}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedLaala(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Contenu du modal de détails */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne principale - Informations */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Informations générales */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiSettings className="w-5 h-5 mr-2 text-blue-600" />
                      Informations générales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nom</label>
                        <p className="text-gray-900 font-medium">{selectedLaala.nom}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Type</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedLaala.type || 'Laala freestyle')}`}>
                          {selectedLaala.isLaalaPublic ? 'Public' : 'Privé'}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-gray-900">{selectedLaala.description || 'Aucune description'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hashtags */}
                  {selectedLaala.htags && selectedLaala.htags.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiUsers className="w-5 h-5 mr-2 text-purple-600" />
                        Hashtags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedLaala.htags.map((tag, index) => (
                          <span key={index} className="inline-flex px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Créateur */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiUsers className="w-5 h-5 mr-2 text-blue-600" />
                      Créateur
                    </h3>
                    <div className="flex items-center space-x-3">
                      {selectedLaala.avatarCrea && (
                        <UniversalMedia
                          src={String(selectedLaala.avatarCrea)}
                          alt={selectedLaala.nomCrea}
                          className="w-12 h-12 rounded-full border-2 border-blue-200 object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{selectedLaala.nomCrea}</p>
                        {selectedLaala.iscert && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Certifié
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colonne latérale - Statistiques et image */}
                <div className="space-y-6">
                  {/* Image de couverture */}
                  {selectedLaala.cover && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <UniversalMedia
                        src={String(selectedLaala.cover)}
                        alt={selectedLaala.nom}
                        className="w-full h-48 object-cover"
                        isVideo={selectedLaala.iscoverVideo}
                      />
                    </div>
                  )}

                  {/* Statistiques */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiTrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                      Statistiques
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Vues</span>
                        <div className="flex items-center space-x-1">
                          <FiEye className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{selectedLaala.vues || 0}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Likes</span>
                        <div className="flex items-center space-x-1">
                          <FiHeart className="w-4 h-4 text-red-500" />
                          <span className="font-medium">{selectedLaala.likes || 0}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Participants</span>
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{selectedLaala.participants?.length || 0}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Republications</span>
                        <span className="font-medium">{selectedLaala.republication || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">État</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedLaala.displayStatus || 'inactive')}`}>
                          {getStatusLabel(selectedLaala.displayStatus || 'inactive')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">En cours</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedLaala.encours ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedLaala.encours ? 'Oui' : 'Non'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">À la une</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedLaala.alaune ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedLaala.alaune ? 'Oui' : 'Non'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Monétisé</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedLaala.ismonetise ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedLaala.ismonetise ? 'Oui' : 'Non'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions en bas */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDetailModal(false);
                    editLaala(selectedLaala);
                  }}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <FiEdit3 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedLaala(null);
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

      {/* Modal de modification de laala (UPDATE) */}
      {showEditModal && selectedLaala && (
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
                    <h2 className="text-xl font-bold text-white">Modifier le Laala</h2>
                    <p className="text-orange-100 text-sm">{selectedLaala.displayTitle}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLaala(null);
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

              <form onSubmit={(e) => { e.preventDefault(); updateLaala(); }} className="space-y-6">
                {/* Informations de base */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiSettings className="w-5 h-5 mr-2 text-orange-600" />
                    Informations de base
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du Laala *
                      </label>
                      <Input
                        id="edit-nom"
                        type="text"
                        value={newLaala.nom}
                        onChange={(e) => setNewLaala(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Mon Laala Cuisine"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-2">
                        Type de Laala
                      </label>
                      <select
                        id="edit-type"
                        value={newLaala.type}
                        onChange={(e) => setNewLaala(prev => ({ ...prev, type: e.target.value as 'public' | 'private' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      >
                        <option value="public">🌍 Public</option>
                        <option value="private">🔒 Privé</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <Textarea
                      id="edit-description"
                      value={newLaala.description}
                      onChange={(e) => setNewLaala(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez votre laala, son objectif, sa thématique..."
                      rows={4}
                      className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Hashtags */}
                <div className="bg-purple-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiUsers className="w-5 h-5 mr-2 text-purple-600" />
                    Hashtags
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={newLaala.newTag}
                      onChange={(e) => setNewLaala(prev => ({ ...prev, newTag: e.target.value }))}
                      placeholder="Ajouter un hashtag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addHashtag} variant="outline">
                      <FiPlus className="w-4 h-4" />
                    </Button>
                  </div>

                  {newLaala.htags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newLaala.htags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeHashtag(tag)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Couverture du Laala */}
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiImage className="w-5 h-5 mr-2 text-blue-600" />
                    Couverture du Laala
                  </h3>
                  
                  {/* Sélecteur de type de média */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-blue-50 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-300">
                      <input
                        type="radio"
                        name="editCoverMediaType"
                        value="image"
                        checked={coverMediaType === 'image'}
                        onChange={(e) => setCoverMediaType(e.target.value as 'image' | 'video')}
                        className="w-4 h-4 text-blue-600 mr-3"
                      />
                      <FiImage className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Image</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-blue-50 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-300">
                      <input
                        type="radio"
                        name="editCoverMediaType"
                        value="video"
                        checked={coverMediaType === 'video'}
                        onChange={(e) => setCoverMediaType(e.target.value as 'image' | 'video')}
                        className="w-4 h-4 text-blue-600 mr-3"
                      />
                      <FiVideo className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Vidéo</span>
                    </label>
                  </div>

                  {/* Aperçu de la couverture actuelle */}
                  {coverUrl && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Couverture actuelle :</h4>
                      <div className="w-full h-32 rounded-lg overflow-hidden">
                        <UniversalMedia
                          src={coverUrl}
                          alt="Couverture actuelle"
                          className="w-full h-full object-cover"
                          isVideo={coverMediaType === 'video'}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload de nouvelle couverture */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <SimpleMediaUpload
                      accept={coverMediaType === 'image' ? 'image/*' : 'video/*'}
                      maxSize={coverMediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024}
                      label={`Changer la ${coverMediaType === 'image' ? 'image' : 'vidéo'} de couverture`}
                      description={`${coverMediaType === 'image' ? 'Image' : 'Vidéo'} qui représentera votre Laala (optionnel)`}
                      mediaType={coverMediaType}
                      onUploadSuccess={handleCoverUpload}
                      onUploadError={(error: string) => {
                        console.error('Erreur upload couverture:', error);
                        setError(error);
                      }}
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
                      setSelectedLaala(null);
                    }}
                    disabled={loading}
                    className="px-6 py-2"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || !newLaala.nom.trim() || !newLaala.description.trim()}
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