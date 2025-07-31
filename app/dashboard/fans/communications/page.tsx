'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { useApi } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { ValidationMessageT } from '../../../models/message';
import { 
  FiMail, 
  FiSend, 
  FiUsers, 
  FiMessageCircle,
  FiEye,
  FiClock,
  FiCheck,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';

interface Communication extends ValidationMessageT {
  // Propriétés additionnelles pour l'affichage
  displayTitle?: string;
  displayContent?: string;
  displayType?: 'text' | 'image' | 'file';
}

const templates = [
  {
    id: '1',
    name: 'Newsletter Standard',
    type: 'email',
    description: 'Template pour newsletter hebdomadaire',
    usage: 45
  },
  {
    id: '2',
    name: 'Message de Bienvenue',
    type: 'message',
    description: 'Accueil des nouveaux fans',
    usage: 23
  },
  {
    id: '3',
    name: 'Promotion Produit',
    type: 'email',
    description: 'Template pour promotions',
    usage: 18
  },
  {
    id: '4',
    name: 'Notification Push',
    type: 'notification',
    description: 'Notifications mobiles',
    usage: 67
  }
];

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [selectedTab, setSelectedTab] = useState<'communications' | 'templates'>('communications');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de création
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    type: 'text' as 'text' | 'image' | 'file',
    receiverId: 'public' // Pour les annonces publiques
  });

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Récupération des messages depuis l'API
  const fetchCommunications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      // Récupérer tous les messages de l'utilisateur connecté
      console.log('🔍 Récupération des messages pour utilisateur:', user.uid);
      const messages = await apiFetch('/api/messages');
      
      // Vérifier que messages est un tableau
      if (!Array.isArray(messages)) {
        console.warn('⚠️ Réponse API inattendue:', messages);
        setCommunications([]);
        return;
      }
      
      // Transformer les messages en communications pour l'affichage
      const transformedCommunications: Communication[] = messages.map((msg: ValidationMessageT) => ({
        ...msg,
        displayTitle: `Communication ${msg.id?.slice(-8) || 'Sans ID'}`,
        displayContent: msg.message?.text || msg.messages?.[0]?.text || 'Contenu non disponible',
        displayType: msg.message?.type || msg.messages?.[0]?.type || 'text'
      }));
      
      setCommunications(transformedCommunications);
      console.log('✅ Communications récupérées:', transformedCommunications.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération communications:', err);
      setError(`Erreur lors du chargement des communications: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setCommunications([]); // S'assurer que la liste est vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Création d'une nouvelle communication
  const createCommunication = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newMessage.title.trim() || !newMessage.content.trim()) {
        setError('Le titre et le contenu sont requis');
        return;
      }
      
      const messageData = {
        receiverId: newMessage.receiverId,
        message: {
          type: newMessage.type,
          text: newMessage.content,
          createdAt: Date.now(),
          author: {
            id: user?.uid || 'anonymous'
          }
        },
        // Ajouter des métadonnées pour l'affichage
        nomsend: user?.email || 'Utilisateur',
        nomrec: 'Public',
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
      });
      
      console.log('✅ Communication créée avec succès');
      
      // Réinitialiser le formulaire
      setNewMessage({
        title: '',
        content: '',
        type: 'text',
        receiverId: 'public'
      });
      
      setShowCreateModal(false);
      
      // Recharger les communications
      await fetchCommunications();
      
    } catch (err) {
      console.error('❌ Erreur création communication:', err);
      setError('Erreur lors de la création de la communication');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'une communication
  const deleteCommunication = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette communication ?')) {
      return;
    }
    
    try {
      await apiFetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Communication supprimée:', id);
      
      // Recharger les communications
      await fetchCommunications();
      
    } catch (err) {
      console.error('❌ Erreur suppression communication:', err);
      setError('Erreur lors de la suppression');
    }
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchCommunications();
    }
  }, [user]);

  const filteredCommunications = communications.filter(comm => {
    const searchContent = comm.displayContent || comm.message?.text || '';
    const searchTitle = comm.displayTitle || '';
    const matchesSearch = searchTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         searchContent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || comm.displayType === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'scheduled': return 'Programmé';
      case 'sent': return 'Envoyé';
      case 'failed': return 'Échec';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'notification': return 'bg-purple-100 text-purple-800';
      case 'message': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'notification': return 'Notification';
      case 'message': return 'Message';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOpenRate = (opened: number, delivered: number) => {
    return delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0.0';
  };

  const calculateClickRate = (clicked: number, opened: number) => {
    return opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0.0';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stats calculations avec vérifications de sécurité
  const totalSent = communications.filter(c => c.status === 'sent').length;
  const totalRecipients = communications.reduce((sum, c) => sum + (c.recipients || 0), 0);
  const totalOpened = communications.reduce((sum, c) => sum + (c.metrics?.opened || 0), 0);
  const totalDelivered = communications.reduce((sum, c) => sum + (c.metrics?.delivered || 0), 0);
  const averageOpenRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos communications avec votre communauté
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouvelle communication
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setSelectedTab('communications')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            selectedTab === 'communications'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Communications ({communications.length})
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

      {selectedTab === 'communications' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Communications Envoyées</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalSent}</p>
                  <p className="text-sm text-green-600 mt-1">Ce mois-ci</p>
                </div>
                <div className="p-3 rounded-lg bg-[#f01919]">
                  <FiSend className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Destinataires Totaux</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalRecipients.toLocaleString()}</p>
                  <p className="text-sm text-blue-600 mt-1">Portée totale</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux d'Ouverture</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{averageOpenRate}%</p>
                  <p className="text-sm text-purple-600 mt-1">Moyenne globale</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500">
                  <FiEye className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Programmées</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {communications.filter(c => c.status === 'scheduled').length}
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">En attente</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500">
                  <FiClock className="w-6 h-6 text-white" />
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
                  Nouvelle
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
            <div className="space-y-4">
              {filteredCommunications.map((comm) => (
                <div key={comm.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {comm.displayTitle || 'Communication sans titre'}
                        </h3>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {comm.displayType || 'text'}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Publié
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {comm.displayContent || 'Contenu non disponible'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>👤 De: {comm.nomsend || 'Utilisateur'}</span>
                        <span>📅 {comm.date || 'Date inconnue'}</span>
                        {comm.heure && <span>🕐 {comm.heure}</span>}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteCommunication(comm.id!)}
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
          {!loading && filteredCommunications.length === 0 && (
            <div className="text-center py-12">
              <FiMail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterType !== 'all' 
                  ? 'Aucune communication trouvée' 
                  : 'Aucune communication'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all'
                  ? 'Aucune communication ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore créé de communications. Créez votre première annonce pour votre communauté.'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#f01919] hover:bg-[#d01515] text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Créer votre première communication
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
                    {getTypeLabel(template.type)}
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
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Communication</h2>
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

            <form onSubmit={(e) => { e.preventDefault(); createCommunication(); }} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la communication
                </label>
                <Input
                  id="title"
                  type="text"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Nouvelle annonce importante"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu du message
                </label>
                <Textarea
                  id="content"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Rédigez votre message pour votre communauté..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de contenu
                </label>
                <select
                  id="type"
                  value={newMessage.type}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as 'text' | 'image' | 'file' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  <option value="text">Texte</option>
                  <option value="image">Image</option>
                  <option value="file">Fichier</option>
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <FiMessageCircle className="w-4 h-4 inline mr-1" />
                  Cette communication sera visible par votre communauté comme une annonce publique.
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
                  disabled={loading || !newMessage.title.trim() || !newMessage.content.trim()}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4 mr-2" />
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