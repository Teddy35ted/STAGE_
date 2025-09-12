'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { useAuth } from '../../../../contexts/AuthContext';
import { useCRUDNotifications } from '../../../../contexts/NotificationContext';
import { ValidationMessageT } from '../../../models/message';
import { PublicCommunication, AUDIENCE_TYPES, COMMUNICATION_TYPES, PRIORITY_LEVELS } from '../../../models/communication';
import { 
  FiMessageSquare,
  FiSend,
  FiUsers,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiUser,
  FiClock,
  FiCheck,
  FiAlertTriangle,
  FiMail,
  FiImage,
  FiFile
} from 'react-icons/fi';

interface CommunicationExtended {
  id?: string;
  displayTitle?: string;
  displayContent?: string;
  displayStatus?: 'sent' | 'pending' | 'failed' | 'read';
  displayType?: 'text' | 'image' | 'video' | 'mixed' | 'file';
  displayDate?: string;
  // Compatibility fields
  idsender?: string;
  nomsend?: string;
  nomrec?: string;
  receiverId?: string;
  authorId?: string;
  authorName?: string;
  title?: string;
  content?: string;
  status?: string;
  format?: string;
  createdAt?: string | number;
  // New communication fields
  targetAudience?: {
    type: string;
    description: string;
  };
  type?: string;
  priority?: string;
}

export default function CommunicationsPage() {
  const { user } = useAuth();
  const { notifyCreate, notifyUpdate, notifyDelete } = useCRUDNotifications();

  // États principaux
  const [communications, setCommunications] = useState<CommunicationExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({}); // Cache des noms d'utilisateurs

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<CommunicationExtended | null>(null);

  // États pour les filtres
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // États pour le formulaire
  const [newCommunication, setNewCommunication] = useState({
    title: '',
    content: '',
    type: 'announcement' as keyof typeof COMMUNICATION_TYPES,
    audienceType: 'followers' as keyof typeof AUDIENCE_TYPES,
    priority: 'medium' as keyof typeof PRIORITY_LEVELS,
    tags: [] as string[],
    category: '',
    publishNow: false
  });

  // Fonction pour récupérer le nom d'un utilisateur
  const getUserName = async (userId: string | undefined): Promise<string> => {
    if (!userId) return 'Utilisateur inconnu';
    
    // Vérifier le cache
    if (userNames[userId]) {
      return userNames[userId];
    }
    
    try {
      // Si c'est l'utilisateur connecté, utiliser ses informations
      if (userId === user?.uid) {
        const name = user?.displayName || user?.email || 'Vous';
        setUserNames(prev => ({ ...prev, [userId]: name }));
        return name;
      }
      
      // Sinon, récupérer depuis l'API
      const token = await user?.getIdToken();
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        const name = userData.nom || userData.firstName || userData.displayName || userData.email || userId;
        setUserNames(prev => ({ ...prev, [userId]: name }));
        return name;
      } else {
        // Fallback en cas d'erreur
        return userId;
      }
    } catch (error) {
      console.error('Erreur récupération nom utilisateur:', error);
      return userId;
    }
  };

  // Récupération des communications
  const fetchCommunications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des communications pour utilisateur:', user.uid);
      console.log('🔑 User token disponible:', !!user.getIdToken);
      
      // Obtenir le token d'authentification
      const token = await user.getIdToken();
      console.log('🔐 Token récupéré, longueur:', token.length);
      
      const response = await fetch('/api/communications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Réponse API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des messages');
      }
      
      const data = await response.json();
      console.log('📄 Données reçues:', {
        type: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) && data.length > 0 ? data[0] : 'Aucune donnée'
      });
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ Réponse API inattendue:', data);
        setCommunications([]);
        return;
      }
      
      // Transformer les communications pour l'affichage
      const transformedCommunications: CommunicationExtended[] = data.map((comm: PublicCommunication) => {
        console.log('🔄 Transformation communication:', {
          id: comm.id,
          title: comm.title,
          status: comm.status,
          authorId: comm.authorId
        });
        
        return {
          ...comm,
          displayTitle: comm.title || 'Sans titre',
          displayContent: comm.content || 'Contenu vide',
          displayStatus: comm.status === 'published' ? 'sent' : 'pending',
          displayType: comm.format || 'text',
          displayDate: comm.createdAt ? new Date(comm.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue',
          // Compatibility fields for existing interface
          id: comm.id,
          idsender: comm.authorId,
          nomsend: comm.authorName || 'Auteur inconnu',
          nomrec: comm.targetAudience?.description || `Audience: ${comm.targetAudience?.type}`,
          receiverId: comm.targetAudience?.type || 'unknown',
          targetAudience: comm.targetAudience,
          type: comm.type,
          priority: comm.priority
        };
      });
      
      console.log('✅ Communications transformées:', transformedCommunications.length);
      console.log('📊 Premier élément transformé:', transformedCommunications[0]);
      
      setCommunications(transformedCommunications);
      
    } catch (err) {
      console.error('❌ Erreur récupération communications:', err);
      console.error('📚 Stack trace:', err instanceof Error ? err.stack : 'Pas de stack');
      setError(`Erreur lors du chargement des communications: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  // Création d'une nouvelle communication
  const createCommunication = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newCommunication.content.trim()) {
        setError('Le contenu du message est requis');
        return;
      }
      
      if (!newCommunication.title.trim()) {
        setError('Le titre est requis');
        return;
      }
      
      const communicationData: Partial<PublicCommunication> = {
        title: newCommunication.title,
        content: newCommunication.content,
        type: newCommunication.type as 'announcement' | 'update' | 'promotion' | 'event' | 'newsletter',
        format: 'text',
        authorId: user?.uid || '',
        authorName: user?.displayName || user?.email || '',
        targetAudience: {
          type: newCommunication.audienceType as 'all' | 'followers' | 'fans' | 'vip' | 'custom',
          description: `Ciblage: ${newCommunication.audienceType}`,
          estimatedReach: 0
        },
        priority: newCommunication.priority as 'low' | 'medium' | 'high' | 'urgent',
        tags: newCommunication.tags,
        category: newCommunication.category,
        createdAt: new Date().toISOString(),
        status: newCommunication.publishNow ? 'published' : 'draft'
      };
      
      // Obtenir le token d'authentification
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Impossible d\'obtenir le token d\'authentification');
      }
      
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(communicationData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la communication');
      }

      console.log('✅ Communication créée avec succès');
      notifyCreate('Communication', newCommunication.title, true);
      
      // Réinitialiser le formulaire
      setNewCommunication({
        title: '',
        content: '',
        type: 'announcement' as keyof typeof COMMUNICATION_TYPES,
        audienceType: 'followers' as keyof typeof AUDIENCE_TYPES,
        priority: 'medium' as keyof typeof PRIORITY_LEVELS,
        tags: [] as string[],
        category: '',
        publishNow: false
      });
      
      setShowCreateModal(false);
      await fetchCommunications();
      
    } catch (err) {
      console.error('❌ Erreur création communication:', err);
      notifyCreate('Communication', newCommunication.title, false);
      setError('Erreur lors de la création de la communication');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour voir les détails d'une communication (READ)
  const viewCommunicationDetails = (communication: CommunicationExtended) => {
    console.log('📖 Lecture communication:', communication.id);
    setSelectedCommunication(communication);
    setShowDetailModal(true);
  };

  // Fonction pour modifier une communication (UPDATE)
  const editCommunication = (communication: CommunicationExtended) => {
    console.log('✏️ Modification communication:', communication.id);
    setSelectedCommunication(communication);
    
    // Pré-remplir le formulaire avec les données de la communication
    setNewCommunication({
      title: communication.displayTitle || '',
      content: communication.displayContent || '',
      type: 'announcement' as keyof typeof COMMUNICATION_TYPES,
      audienceType: 'followers' as keyof typeof AUDIENCE_TYPES,
      priority: 'medium' as keyof typeof PRIORITY_LEVELS,
      tags: [] as string[],
      category: '',
      publishNow: false
    });
    
    setShowEditModal(true);
  };

  // Mise à jour d'une communication existante
  const updateCommunication = async () => {
    if (!selectedCommunication) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!newCommunication.content.trim()) {
        setError('Le contenu du message est requis');
        return;
      }
      
      if (!newCommunication.title.trim()) {
        setError('Le titre est requis');
        return;
      }
      
      const updateData: Partial<PublicCommunication> = {
        title: newCommunication.title,
        content: newCommunication.content,
        type: newCommunication.type as 'announcement' | 'update' | 'promotion' | 'event' | 'newsletter',
        targetAudience: {
          type: newCommunication.audienceType as 'all' | 'followers' | 'fans' | 'vip' | 'custom',
          description: `Ciblage: ${newCommunication.audienceType}`,
          estimatedReach: 0
        },
        priority: newCommunication.priority as 'low' | 'medium' | 'high' | 'urgent',
        tags: newCommunication.tags,
        category: newCommunication.category,
        updatedAt: new Date().toISOString()
      };
      
      // Obtenir le token d'authentification
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Impossible d\'obtenir le token d\'authentification');
      }
      
      const response = await fetch(`/api/communications/${selectedCommunication.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la communication');
      }

      console.log('✅ Communication mise à jour avec succès');
      notifyUpdate('Communication', newCommunication.title || selectedCommunication.displayTitle || '', true);
      
      // Réinitialiser les états
      setSelectedCommunication(null);
      setShowEditModal(false);
      
      // Réinitialiser le formulaire
      setNewCommunication({
        title: '',
        content: '',
        type: 'announcement' as keyof typeof COMMUNICATION_TYPES,
        audienceType: 'followers' as keyof typeof AUDIENCE_TYPES,
        priority: 'medium' as keyof typeof PRIORITY_LEVELS,
        tags: [] as string[],
        category: '',
        publishNow: false
      });
      
      await fetchCommunications();
      
    } catch (err) {
      console.error('❌ Erreur mise à jour communication:', err);
      notifyUpdate('Communication', newCommunication.title || selectedCommunication?.displayTitle || '', false);
      setError('Erreur lors de la mise à jour de la communication');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'une communication
  const deleteCommunication = async (id: string) => {
    const communicationToDelete = communications.find(c => c.id === id);
    const communicationName = communicationToDelete?.displayTitle || 'Communication inconnue';
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette communication avec ${communicationName} ?`)) {
      return;
    }
    
    try {
      // Obtenir le token d'authentification
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Impossible d\'obtenir le token d\'authentification');
      }
      
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la communication');
      }

      console.log('✅ Communication supprimée:', id);
      notifyDelete('Communication', communicationName, true);
      await fetchCommunications();
      
    } catch (err) {
      console.error('❌ Erreur suppression communication:', err);
      notifyDelete('Communication', communicationName, false);
      setError('Erreur lors de la suppression');
    }
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchCommunications();
    }
  }, [user]);

  // Filtrage des communications
  const filteredCommunications = communications.filter(communication => {
    const matchesType = filterType === 'all' || communication.displayType === filterType;
    const matchesSearch = searchTerm === '' || 
      communication.displayTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      communication.displayContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      communication.nomrec?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      communication.nomsend?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Fonctions utilitaires pour les couleurs et icônes
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'file': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return FiMessageSquare;
      case 'image': return FiImage;
      case 'file': return FiFile;
      default: return FiMessageSquare;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Texte';
      case 'image': return 'Image';
      case 'file': return 'Fichier';
      default: return 'Texte';
    }
  };

  // Stats calculations
  const totalCommunications = communications.length;
  const totalTexts = communications.filter(c => c.displayType === 'text').length;
  const totalImages = communications.filter(c => c.displayType === 'image').length;
  const totalFiles = communications.filter(c => c.displayType === 'file').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos messages et communications avec les fans
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouvelle Communication
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCommunications}</p>
              <p className="text-sm text-blue-600 mt-1">Communications</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiMessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages Texte</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalTexts}</p>
              <p className="text-sm text-blue-600 mt-1">Envoyés</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiMessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Images</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalImages}</p>
              <p className="text-sm text-green-600 mt-1">Partagées</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiImage className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fichiers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalFiles}</p>
              <p className="text-sm text-purple-600 mt-1">Envoyés</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiFile className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters et Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Rechercher une communication..."
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
              <option value="text">Texte</option>
              <option value="image">Image</option>
              <option value="file">Fichier</option>
            </select>
          </div>
          <div>
            <Button 
              onClick={fetchCommunications} 
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
          <p className="text-gray-600">Chargement des communications...</p>
        </div>
      )}

      {/* Communications List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunications.map((communication) => {
            const TypeIcon = getTypeIcon(communication.displayType || 'text');
            
            return (
              <div key={communication.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <TypeIcon className="w-5 h-5 text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {communication.displayTitle}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(communication.displayType || 'text')}`}>
                        {getTypeLabel(communication.displayType || 'text')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {communication.displayContent}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <FiUser className="w-4 h-4 mr-2" />
                        De: {communication.nomsend || 'Vous'}
                      </div>
                      <div className="flex items-center">
                        <FiMail className="w-4 h-4 mr-2" />
                        À: {communication.nomrec || communication.receiverId}
                      </div>
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-2" />
                        {communication.displayDate}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions de la communication */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      ID: {communication.id?.slice(-8)}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => viewCommunicationDetails(communication)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Voir les détails"
                      >
                        <FiEye className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => editCommunication(communication)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        title="Modifier la communication"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteCommunication(communication.id!)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Supprimer la communication"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* État vide */}
      {!loading && filteredCommunications.length === 0 && (
        <div className="text-center py-12">
          <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterType !== 'all'
              ? 'Aucune communication trouvée' 
              : 'Aucune communication'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all'
              ? 'Aucune communication ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore envoyé de communications.'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Envoyer votre première communication
            </Button>
          )}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-blue-500/20 rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                <FiPlus className="w-5 h-5 mr-2 inline-block" />
                Nouvelle Communication
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la communication *
                </label>
                <Input
                  value={newCommunication.title}
                  onChange={(e) => setNewCommunication({ ...newCommunication, title: e.target.value })}
                  placeholder="Titre de votre communication"
                  required
                  className="bg-white/70 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de communication *
                  </label>
                  <select
                    value={newCommunication.type}
                    onChange={(e) => setNewCommunication({ 
                      ...newCommunication, 
                      type: e.target.value as keyof typeof COMMUNICATION_TYPES
                    })}
                    className="w-full px-3 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:bg-white"
                  >
                    <option value="announcement">📢 Annonce</option>
                    <option value="update">🔄 Mise à jour</option>
                    <option value="promotion">🎯 Promotion</option>
                    <option value="event">📅 Événement</option>
                    <option value="newsletter">📧 Newsletter</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience cible *
                  </label>
                  <select
                    value={newCommunication.audienceType}
                    onChange={(e) => setNewCommunication({ 
                      ...newCommunication, 
                      audienceType: e.target.value as keyof typeof AUDIENCE_TYPES
                    })}
                    className="w-full px-3 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:bg-white"
                  >
                    <option value="all">� Tout le monde</option>
                    <option value="followers">� Abonnés</option>
                    <option value="fans">⭐ Fans</option>
                    <option value="vip">� VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu de la communication *
                </label>
                <Textarea
                  value={newCommunication.content}
                  onChange={(e) => setNewCommunication({ 
                    ...newCommunication, 
                    content: e.target.value
                  })}
                  placeholder="Rédigez votre communication ici..."
                  rows={5}
                  required
                  className="bg-white/70 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={newCommunication.priority}
                    onChange={(e) => setNewCommunication({ 
                      ...newCommunication, 
                      priority: e.target.value as keyof typeof PRIORITY_LEVELS
                    })}
                    className="w-full px-3 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:bg-white"
                  >
                    <option value="low">🟢 Faible</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🟠 Élevée</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <Input
                    value={newCommunication.category}
                    onChange={(e) => setNewCommunication({ ...newCommunication, category: e.target.value })}
                    placeholder="Ex: Actualités, Promotions..."
                    className="bg-white/70 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="publishNow"
                  checked={newCommunication.publishNow}
                  onChange={(e) => setNewCommunication({ 
                    ...newCommunication, 
                    publishNow: e.target.checked
                  })}
                  className="w-4 h-4 text-[#f01919] bg-gray-100 border-gray-300 rounded focus:ring-[#f01919] focus:ring-2"
                />
                <label htmlFor="publishNow" className="text-sm font-medium text-gray-700">
                  Publier immédiatement
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50/50">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={loading}
                className="bg-white/80 hover:bg-white"
              >
                Annuler
              </Button>
              <Button
                onClick={createCommunication}
                disabled={loading}
                className="bg-gradient-to-r from-[#f01919] to-[#d01515] hover:from-[#d01515] hover:to-[#b01010] text-white shadow-lg"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détail (read) */}
      {showDetailModal && selectedCommunication && (
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-50/90 via-teal-50/90 to-cyan-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-emerald-500/20 rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                <FiEye className="w-5 h-5 mr-2 inline-block" />
                Détails de la Communication
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expéditeur</label>
                    <p className="text-gray-900">{selectedCommunication.nomsend || 'Vous'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Destinataire</label>
                    <p className="text-gray-900">{selectedCommunication.nomrec || selectedCommunication.receiverId}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date d'envoi</label>
                    <p className="text-gray-900">{selectedCommunication.displayDate}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type de message</label>
                    <div className="flex items-center space-x-2">
                      {React.createElement(getTypeIcon(selectedCommunication.displayType || 'text'), {
                        className: "w-4 h-4 text-gray-500"
                      })}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedCommunication.displayType || 'text')}`}>
                        {getTypeLabel(selectedCommunication.displayType || 'text')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Statut</label>
                    <div className="flex items-center space-x-2">
                      <FiCheck className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Envoyé</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contenu du message */}
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Contenu du message</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedCommunication.displayContent}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  editCommunication(selectedCommunication);
                }}
                className="text-orange-600 hover:text-orange-700"
              >
                <FiEdit3 className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification (update) */}
      {showEditModal && selectedCommunication && (
        <div className="fixed inset-0 bg-gradient-to-br from-amber-50/90 via-orange-50/90 to-yellow-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-amber-500/20 rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                <FiEdit3 className="w-5 h-5 mr-2 inline-block" />
                Modifier la Communication
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium">
                  <strong>Communication ID:</strong> {selectedCommunication.id?.slice(-8)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la communication *
                </label>
                <Input
                  value={newCommunication.title}
                  onChange={(e) => setNewCommunication({ ...newCommunication, title: e.target.value })}
                  placeholder="Titre de votre communication"
                  required
                  className="bg-white/70 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de communication *
                  </label>
                  <select
                    value={newCommunication.type}
                    onChange={(e) => setNewCommunication({ 
                      ...newCommunication, 
                      type: e.target.value as keyof typeof COMMUNICATION_TYPES
                    })}
                    className="w-full px-3 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:bg-white"
                  >
                    <option value="announcement">📢 Annonce</option>
                    <option value="update">🔄 Mise à jour</option>
                    <option value="promotion">🎯 Promotion</option>
                    <option value="event">📅 Événement</option>
                    <option value="newsletter">📧 Newsletter</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience cible *
                  </label>
                  <select
                    value={newCommunication.audienceType}
                    onChange={(e) => setNewCommunication({ 
                      ...newCommunication, 
                      audienceType: e.target.value as keyof typeof AUDIENCE_TYPES
                    })}
                    className="w-full px-3 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:bg-white"
                  >
                    <option value="all">👥 Tout le monde</option>
                    <option value="followers">👤 Abonnés</option>
                    <option value="fans">⭐ Fans</option>
                    <option value="vip">💎 VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu de la communication *
                </label>
                <Textarea
                  value={newCommunication.content}
                  onChange={(e) => setNewCommunication({ 
                    ...newCommunication, 
                    content: e.target.value
                  })}
                  placeholder="Rédigez votre communication ici..."
                  rows={5}
                  required
                  className="bg-white/70 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={newCommunication.priority}
                    onChange={(e) => setNewCommunication({ 
                      ...newCommunication, 
                      priority: e.target.value as keyof typeof PRIORITY_LEVELS
                    })}
                    className="w-full px-3 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:bg-white"
                  >
                    <option value="low">🟢 Faible</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🟠 Élevée</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <Input
                    value={newCommunication.category}
                    onChange={(e) => setNewCommunication({ ...newCommunication, category: e.target.value })}
                    placeholder="Ex: Actualités, Promotions..."
                    className="bg-white/70 focus:bg-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50/50">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={loading}
                className="bg-white/80 hover:bg-white"
              >
                Annuler
              </Button>
              <Button
                onClick={updateCommunication}
                disabled={loading}
                className="bg-gradient-to-r from-[#f01919] to-[#d01515] hover:from-[#d01515] hover:to-[#b01010] text-white shadow-lg"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
