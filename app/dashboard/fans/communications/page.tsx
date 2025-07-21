'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
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
  FiDownload
} from 'react-icons/fi';

interface Communication {
  id: string;
  title: string;
  type: 'email' | 'notification' | 'message';
  content: string;
  recipients: number;
  targetAudience: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  createdAt: string;
  scheduledFor?: string;
  sentAt?: string;
  metrics: {
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
  };
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

const communicationsData: Communication[] = [
  {
    id: '1',
    title: 'Newsletter Hebdomadaire - Janvier',
    type: 'email',
    content: 'Découvrez les nouveautés de la semaine et nos conseils exclusifs...',
    recipients: 1247,
    targetAudience: 'Tous les abonnés actifs',
    status: 'sent',
    createdAt: '2024-01-14T10:00:00Z',
    sentAt: '2024-01-15T08:00:00Z',
    metrics: {
      delivered: 1235,
      opened: 456,
      clicked: 89,
      replied: 12
    },
    tags: ['Newsletter', 'Hebdomadaire'],
    priority: 'medium'
  },
  {
    id: '2',
    title: 'Promotion Cours de Cuisine',
    type: 'email',
    content: 'Profitez de 30% de réduction sur nos cours de cuisine en ligne...',
    recipients: 567,
    targetAudience: 'Fans intéressés par la cuisine',
    status: 'sent',
    createdAt: '2024-01-12T14:30:00Z',
    sentAt: '2024-01-13T12:00:00Z',
    metrics: {
      delivered: 562,
      opened: 234,
      clicked: 67,
      replied: 8
    },
    tags: ['Promotion', 'Cuisine'],
    priority: 'high'
  },
  {
    id: '3',
    title: 'Message de Bienvenue Nouveaux Fans',
    type: 'message',
    content: 'Bienvenue dans notre communauté ! Voici comment commencer...',
    recipients: 89,
    targetAudience: 'Nouveaux fans (7 derniers jours)',
    status: 'scheduled',
    createdAt: '2024-01-15T16:00:00Z',
    scheduledFor: '2024-01-16T09:00:00Z',
    metrics: {
      delivered: 0,
      opened: 0,
      clicked: 0,
      replied: 0
    },
    tags: ['Bienvenue', 'Onboarding'],
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Notification Nouveau Contenu',
    type: 'notification',
    content: 'Un nouveau tutoriel vient d\'être publié sur votre Laala préféré !',
    recipients: 2156,
    targetAudience: 'Abonnés aux notifications',
    status: 'draft',
    createdAt: '2024-01-15T18:00:00Z',
    metrics: {
      delivered: 0,
      opened: 0,
      clicked: 0,
      replied: 0
    },
    tags: ['Notification', 'Contenu'],
    priority: 'low'
  },
  {
    id: '5',
    title: 'Enquête Satisfaction Client',
    type: 'email',
    content: 'Aidez-nous à améliorer votre expérience en répondant à cette enquête...',
    recipients: 345,
    targetAudience: 'Clients ayant acheté récemment',
    status: 'failed',
    createdAt: '2024-01-10T11:00:00Z',
    sentAt: '2024-01-11T15:00:00Z',
    metrics: {
      delivered: 298,
      opened: 89,
      clicked: 23,
      replied: 5
    },
    tags: ['Enquête', 'Satisfaction'],
    priority: 'medium'
  }
];

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
  const [communications, setCommunications] = useState<Communication[]>(communicationsData);
  const [selectedTab, setSelectedTab] = useState<'communications' | 'templates'>('communications');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || comm.status === filterStatus;
    const matchesType = filterType === 'all' || comm.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
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

  // Stats calculations
  const totalSent = communications.filter(c => c.status === 'sent').length;
  const totalRecipients = communications.reduce((sum, c) => sum + c.recipients, 0);
  const totalOpened = communications.reduce((sum, c) => sum + c.metrics.opened, 0);
  const totalDelivered = communications.reduce((sum, c) => sum + c.metrics.delivered, 0);
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

          {/* Filters */}
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="draft">Brouillon</option>
                  <option value="scheduled">Programmé</option>
                  <option value="sent">Envoyé</option>
                  <option value="failed">Échec</option>
                </select>
              </div>
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  <option value="all">Tous les types</option>
                  <option value="email">Email</option>
                  <option value="notification">Notification</option>
                  <option value="message">Message</option>
                </select>
              </div>
              <div>
                <Button variant="outline" className="w-full">
                  <FiFilter className="w-4 h-4 mr-2" />
                  Filtres avancés
                </Button>
              </div>
            </div>
          </div>

          {/* Communications List */}
          <div className="space-y-4">
            {filteredCommunications.map((comm) => (
              <div key={comm.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{comm.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(comm.status)}`}>
                        {getStatusLabel(comm.status)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(comm.type)}`}>
                        {getTypeLabel(comm.type)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(comm.priority)}`}>
                        {comm.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{comm.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👥 {comm.recipients.toLocaleString()} destinataires</span>
                      <span>🎯 {comm.targetAudience}</span>
                      <span>📅 {formatDate(comm.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {comm.status === 'draft' && (
                      <>
                        <Button size="sm" variant="outline">
                          <FiEdit3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-[#f01919] hover:bg-[#d01515] text-white">
                          <FiSend className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {comm.status === 'scheduled' && (
                      <>
                        <Button size="sm" variant="outline">
                          <FiEdit3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <FiX className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {comm.status === 'sent' && (
                      <Button size="sm" variant="outline">
                        <FiDownload className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <FiEye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                {comm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {comm.tags.map((tag, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metrics for sent communications */}
                {comm.status === 'sent' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{comm.metrics.delivered}</p>
                      <p className="text-xs text-gray-500">Délivrés</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{comm.metrics.opened}</p>
                      <p className="text-xs text-gray-500">
                        Ouverts ({calculateOpenRate(comm.metrics.opened, comm.metrics.delivered)}%)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{comm.metrics.clicked}</p>
                      <p className="text-xs text-gray-500">
                        Clics ({calculateClickRate(comm.metrics.clicked, comm.metrics.opened)}%)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{comm.metrics.replied}</p>
                      <p className="text-xs text-gray-500">Réponses</p>
                    </div>
                  </div>
                )}

                {/* Scheduled info */}
                {comm.status === 'scheduled' && comm.scheduledFor && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <FiClock className="w-4 h-4 inline mr-1" />
                      Programmé pour le {formatDate(comm.scheduledFor)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredCommunications.length === 0 && (
            <div className="text-center py-12">
              <FiMail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune communication trouvée</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Aucune communication ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore créé de communications.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
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

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nouvelle communication</h2>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez créer et envoyer des communications à vos fans.
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
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