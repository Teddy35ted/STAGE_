'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { useApi } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { useMediaUpload } from '../../../../hooks/useMediaUpload';
import { ContenuDashboard } from '../../../models/contenu';
import { 
  FiFileText, 
  FiImage,
  FiVideo,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiAlertTriangle,
  FiUpload,
  FiCheck,
  FiSettings
} from 'react-icons/fi';

interface ContenuExtended extends ContenuDashboard {
  displayTitle?: string;
  displayDescription?: string;
  displayStatus?: 'published' | 'draft' | 'scheduled';
  laalaName?: string;
}

const contentTypes = [
  { id: 'image', name: 'Image', icon: FiImage, color: 'bg-green-100 text-green-800' },
  { id: 'video', name: 'Vidéo', icon: FiVideo, color: 'bg-red-100 text-red-800' }
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
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de création
  const [newContent, setNewContent] = useState({
    nom: '',
    description: '',
    type: 'image',
    idLaala: '',
    allowComment: true,
    src: '' // URL de l'image uploadée
  });

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Upload de médias
  const mediaUpload = useMediaUpload({
    category: 'contenu-media',
    userId: user?.uid,
    onSuccess: (result) => {
      setNewContent(prev => ({ ...prev, src: result.url }));
      console.log('✅ Média uploadé:', result.url);
    },
    onError: (error) => {
      setError(`Erreur upload: ${error}`);
      console.error('❌ Erreur upload média:', error);
    }
  });

  // Chargement des données initiales
  useEffect(() => {
    loadContents();
    loadLaalas();
  }, []);

  const loadContents = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/contenus');
      if (Array.isArray(data)) {
        const enrichedContents = data.map((content: ContenuDashboard) => ({
          ...content,
          displayTitle: content.nom,
          displayDescription: content.nom, // Utilise nom comme description
          displayStatus: 'published' as const,
          laalaName: laalas.find(l => l.id === content.idLaala)?.nom || 'Laala inconnue'
        }));
        setContents(enrichedContents);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des contenus:', err);
      setError('Erreur lors du chargement des contenus');
    } finally {
      setLoading(false);
    }
  };

  const loadLaalas = async () => {
    try {
      const data = await apiFetch('/api/laalas');
      if (Array.isArray(data)) {
        setLaalas(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des laalas:', err);
    }
  };

  // Fonctions CRUD
  const createContent = async () => {
    if (!newContent.nom.trim() || !newContent.idLaala) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contentData = {
        ...newContent,
        idCreateur: user?.uid
        // src est déjà inclus dans newContent grâce au callback onSuccess
      };

      await apiFetch('/api/contenus', {
        method: 'POST',
        body: JSON.stringify(contentData)
      });
      
      setShowCreateModal(false);
      setNewContent({
        nom: '',
        description: '',
        type: 'image',
        idLaala: '',
        allowComment: true,
        src: '' // Reset de l'URL de l'image
      });
      await loadContents();
    } catch (err) {
      console.error('Erreur création contenu:', err);
      setError('Erreur lors de la création du contenu');
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async () => {
    if (!selectedContent || !newContent.nom.trim() || !newContent.idLaala) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiFetch(`/api/contenus/${selectedContent.id}`, {
        method: 'PUT',
        body: JSON.stringify(newContent)
      });
      
      setShowEditModal(false);
      setSelectedContent(null);
      await loadContents();
    } catch (err) {
      console.error('Erreur mise à jour contenu:', err);
      setError('Erreur lors de la mise à jour du contenu');
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (content: ContenuExtended) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      return;
    }

    try {
      setLoading(true);
      await apiFetch(`/api/contenus/${content.id}`, {
        method: 'DELETE'
      });
      await loadContents();
    } catch (err) {
      console.error('Erreur suppression contenu:', err);
      setError('Erreur lors de la suppression du contenu');
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire d'upload
  const handleFileUpload = async (file: File) => {
    try {
      await mediaUpload.upload(file);
    } catch (err) {
      console.error('Erreur upload:', err);
      setError('Erreur lors de l\'upload du fichier');
    }
  };

  // Filtrage des contenus
  const filteredContents = contents.filter(content => {
    const matchesSearch = content.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.displayDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || content.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeInfo = (type: string) => {
    return contentTypes.find(t => t.id === type) || contentTypes[0];
  };

  const openEditModal = (content: ContenuExtended) => {
    setSelectedContent(content);
    setNewContent({
      nom: content.nom,
      description: content.displayDescription || '',
      type: content.type || 'image',
      idLaala: content.idLaala,
      allowComment: content.allowComment ?? true,
      src: content.src || '' // Inclure l'URL existante
    });
    setError(null);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header moderne avec gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestion des Contenus</h1>
              <p className="text-purple-100 mt-1">Créez et gérez vos contenus multimédias</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setNewContent({
                nom: '',
                description: '',
                type: 'image',
                idLaala: '',
                allowComment: true,
                src: '' // Reset de l'URL
              });
              setError(null);
              setShowCreateModal(true);
            }}
            className="bg-white text-purple-600 hover:bg-purple-50 font-medium"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Nouveau Contenu
          </Button>
        </div>
      </div>

      {/* Section de filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Rechercher un contenu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              {contentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages d'erreur globaux */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <FiAlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">Erreur</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Liste des contenus */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Contenus ({filteredContents.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <FiRefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Chargement des contenus...</p>
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="p-8 text-center">
            <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun contenu trouvé</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm || filterType !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre premier contenu'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredContents.map((content) => {
              const typeInfo = getTypeInfo(content.type || 'image');
              const IconComponent = typeInfo.icon;

              return (
                <div key={content.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {content.displayTitle}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {content.displayDescription}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Type: {typeInfo.name}</span>
                          <span>Laala: {content.laalaName}</span>
                          <span>Commentaires: {content.allowComment ? 'Autorisés' : 'Désactivés'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedContent(content);
                          setShowDetailModal(true);
                        }}
                      >
                        <FiEye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(content)}
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContent(content)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
      </div>

      {/* Modal de création moderne */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiFileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Nouveau Contenu</h2>
                    <p className="text-purple-100 text-sm">Créez et partagez votre contenu</p>
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

              <form onSubmit={(e) => { e.preventDefault(); createContent(); }} className="space-y-6">
                {/* Informations de base */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiSettings className="w-5 h-5 mr-2 text-purple-600" />
                    Informations de base
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du contenu *
                      </label>
                      <Input
                        id="nom"
                        type="text"
                        value={newContent.nom}
                        onChange={(e) => setNewContent(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Donnez un nom à votre contenu"
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Type de contenu *
                      </label>
                      <select
                        id="type"
                        value={newContent.type}
                        onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        {contentTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="idLaala" className="block text-sm font-medium text-gray-700 mb-2">
                        Laala associée *
                      </label>
                      <select
                        id="idLaala"
                        value={newContent.idLaala}
                        onChange={(e) => setNewContent(prev => ({ ...prev, idLaala: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">Sélectionner une laala</option>
                        {laalas.map(laala => (
                          <option key={laala.id} value={laala.id}>{laala.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <Textarea
                        id="description"
                        value={newContent.description}
                        onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Décrivez votre contenu..."
                        rows={4}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Upload de médias */}
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiUpload className="w-5 h-5 mr-2 text-blue-600" />
                    Fichier multimédia
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Télécharger un fichier ({newContent.type})
                      </label>
                      <input
                        type="file"
                        accept={newContent.type === 'image' ? 'image/*' : 'video/*'}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={mediaUpload.isUploading}
                      />
                      {mediaUpload.isUploading && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${mediaUpload.progress}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Upload en cours... {mediaUpload.progress}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="bg-green-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiCheck className="w-5 h-5 mr-2 text-green-600" />
                    Options
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowComment"
                      checked={newContent.allowComment}
                      onChange={(e) => setNewContent(prev => ({ ...prev, allowComment: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="allowComment" className="text-sm text-gray-700">
                      Autoriser les commentaires
                    </label>
                  </div>
                </div>

                {/* Boutons d'action */}
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
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={loading || !newContent.nom.trim() || !newContent.description.trim() || !newContent.idLaala}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Publication...
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
        </div>
      )}

      {/* Modal de détail */}
      {showDetailModal && selectedContent && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Détails du contenu</h2>
                <p className="text-gray-600 text-sm mt-1">Informations complètes sur ce contenu</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                <FiX className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedContent.nom}</h3>
                <p className="text-gray-600">{selectedContent.displayDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900">{getTypeInfo(selectedContent.type || 'image').name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Laala</label>
                  <p className="text-gray-900">{selectedContent.laalaName}</p>
                </div>
              </div>

              {selectedContent.src && (selectedContent.type === 'image' || selectedContent.type === 'video') && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Médias</label>
                  {selectedContent.type === 'image' ? (
                    <img 
                      src={selectedContent.src} 
                      alt={selectedContent.nom}
                      className="mt-2 max-w-full h-auto rounded-lg border"
                    />
                  ) : (
                    <video 
                      src={selectedContent.src} 
                      controls
                      className="mt-2 max-w-full h-auto rounded-lg border"
                    />
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Commentaires</label>
                <p className="text-gray-900">{selectedContent.allowComment ? 'Autorisés' : 'Désactivés'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedContent && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modifier le contenu</h2>
                <p className="text-gray-600 text-sm mt-1">Mettez à jour les informations de ce contenu</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                <FiX className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                <FiAlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-800 font-medium">Erreur</h4>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); updateContent(); }} className="space-y-4">
              <div>
                <label htmlFor="edit-nom" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du contenu *
                </label>
                <Input
                  id="edit-nom"
                  type="text"
                  value={newContent.nom}
                  onChange={(e) => setNewContent(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Nom du contenu"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  id="edit-description"
                  value={newContent.description}
                  onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du contenu"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    id="edit-type"
                    value={newContent.type}
                    onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    {contentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-idLaala" className="block text-sm font-medium text-gray-700 mb-2">
                    Laala *
                  </label>
                  <select
                    id="edit-idLaala"
                    value={newContent.idLaala}
                    onChange={(e) => setNewContent(prev => ({ ...prev, idLaala: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner une laala</option>
                    {laalas.map(laala => (
                      <option key={laala.id} value={laala.id}>{laala.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-allowComment"
                  checked={newContent.allowComment}
                  onChange={(e) => setNewContent(prev => ({ ...prev, allowComment: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="edit-allowComment" className="text-sm text-gray-700">
                  Autoriser les commentaires
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loading || !newContent.nom.trim() || !newContent.description.trim() || !newContent.idLaala}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <FiEdit3 className="w-4 h-4 mr-2" />
                      Mettre à jour
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
