'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import ContenuCreateForm from '../../../../components/forms/ContenuCreateForm';
import { 
  FiEdit3, 
  FiPlus, 
  FiEye, 
  FiHeart, 
  FiMessageCircle,
  FiShare2,
  FiCalendar,
  FiImage,
  FiVideo,
  FiFileText,
  FiMoreVertical,
  FiFilter
} from 'react-icons/fi';
import { ContenuCore, ContenuDashboard, generateContenuAutoFields } from '../../../models/contenu';

interface Content {
  id: string;
  title: string;
  type: 'image' | 'video' | 'text';
  laala: string;
  status: 'published' | 'draft' | 'scheduled';
  views: number;
  likes: number;
  comments: number;
  shares: number;
  publishedAt: string;
  scheduledFor?: string;
}

const contentData: Content[] = [
  {
    id: '1',
    title: 'Les 5 habitudes matinales qui changent la vie',
    type: 'image',
    laala: 'Mon Laala Lifestyle',
    status: 'published',
    views: 2847,
    likes: 156,
    comments: 23,
    shares: 12,
    publishedAt: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    title: 'Tutoriel: Configuration serveur Next.js',
    type: 'video',
    laala: 'Tech & Innovation',
    status: 'published',
    views: 1523,
    likes: 89,
    comments: 34,
    shares: 18,
    publishedAt: '2024-01-14T14:30:00Z'
  },
  {
    id: '3',
    title: 'Recette: Pasta aux légumes de saison',
    type: 'image',
    laala: 'Cuisine du Monde',
    status: 'draft',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    publishedAt: '2024-01-16T12:00:00Z'
  },
  {
    id: '4',
    title: 'Workout HIIT 20 minutes',
    type: 'video',
    laala: 'Fitness & Santé',
    status: 'scheduled',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    publishedAt: '2024-01-18T07:00:00Z',
    scheduledFor: '2024-01-18T07:00:00Z'
  },
  {
    id: '5',
    title: 'Guide complet: Méditation pour débutants',
    type: 'text',
    laala: 'Mon Laala Lifestyle',
    status: 'published',
    views: 956,
    likes: 67,
    comments: 15,
    shares: 8,
    publishedAt: '2024-01-13T16:45:00Z'
  }
];

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>(contentData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLaala, setFilterLaala] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const laalas = Array.from(new Set(contents.map(c => c.laala)));

  // Informations du créateur simulées - à remplacer par les vraies données utilisateur
  const creatorInfo = {
    id: '92227616TG',
    nom: 'Sophie Martin',
    avatar: 'https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/assets%2Fprofil.png?alt=media',
    iscert: false
  };

  // Laalas disponibles pour la création de contenu
  const availableLaalas = [
    { id: '1', name: 'Mon Laala Lifestyle' },
    { id: '2', name: 'Tech & Innovation' },
    { id: '3', name: 'Cuisine du Monde' },
    { id: '4', name: 'Fitness & Santé' }
  ];

  const handleCreateContenu = (contenuData: ContenuCore) => {
    try {
      // Générer les données automatiques
      const autoFields = generateContenuAutoFields(contenuData, creatorInfo, contents.length + 1);
      
      // Créer le contenu complet
      const newContenu: ContenuDashboard = {
        ...contenuData,
        ...autoFields
      };

      // Trouver le nom du Laala
      const laalaName = availableLaalas.find(l => l.id === contenuData.idLaala)?.name || 'Laala inconnu';

      // Convertir vers le format d'affichage local
      const displayContent: Content = {
        id: newContenu.id,
        title: newContenu.nom,
        type: newContenu.type as 'image' | 'video' | 'text',
        laala: laalaName,
        status: 'published',
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        publishedAt: new Date().toISOString()
      };

      // Ajouter à la liste
      setContents(prev => [displayContent, ...prev]);

      // Ici vous pourriez sauvegarder en base de données
      console.log('Nouveau contenu créé:', newContenu);
      
      // Afficher un message de succès
      alert('Contenu créé avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de la création du contenu:', error);
      alert('Erreur lors de la création du contenu');
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || content.type === filterType;
    const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
    const matchesLaala = filterLaala === 'all' || content.laala === filterLaala;
    return matchesSearch && matchesType && matchesStatus && matchesLaala;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return FiImage;
      case 'video': return FiVideo;
      case 'text': return FiFileText;
      default: return FiFileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'text': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contenu</h1>
          <p className="text-gray-600 mt-1">
            Gérez tout votre contenu publié sur vos Laalas
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouveau contenu
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contenus</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{contents.length}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {contents.reduce((sum, c) => sum + c.views, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiEye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Likes Totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {contents.reduce((sum, c) => sum + c.likes, 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-500">
              <FiHeart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {((contents.reduce((sum, c) => sum + c.likes + c.comments + c.shares, 0) / 
                   contents.reduce((sum, c) => sum + c.views, 0)) * 100 || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiMessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Rechercher..."
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
              <option value="image">Images</option>
              <option value="video">Vidéos</option>
              <option value="text">Texte</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publié</option>
              <option value="draft">Brouillon</option>
              <option value="scheduled">Programmé</option>
            </select>
          </div>
          <div>
            <select
              value={filterLaala}
              onChange={(e) => setFilterLaala(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les Laalas</option>
              {laalas.map(laala => (
                <option key={laala} value={laala}>{laala}</option>
              ))}
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

      {/* Content List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contenu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laala
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContents.map((content) => {
                const TypeIcon = getTypeIcon(content.type);
                return (
                  <tr key={content.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${getTypeColor(content.type)}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{content.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{content.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{content.laala}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(content.status)}`}>
                        {getStatusLabel(content.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiEye className="w-4 h-4 mr-1" />
                          {content.views.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <FiHeart className="w-4 h-4 mr-1" />
                          {content.likes}
                        </div>
                        <div className="flex items-center">
                          <FiMessageCircle className="w-4 h-4 mr-1" />
                          {content.comments}
                        </div>
                        <div className="flex items-center">
                          <FiShare2 className="w-4 h-4 mr-1" />
                          {content.shares}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {content.status === 'scheduled' && content.scheduledFor ? (
                          <div>
                            <p className="text-xs text-gray-500">Programmé pour:</p>
                            <p>{formatDate(content.scheduledFor)}</p>
                          </div>
                        ) : (
                          formatDate(content.publishedAt)
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <FiEye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FiEdit3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FiMoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredContents.length === 0 && (
        <div className="text-center py-12">
          <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contenu trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterLaala !== 'all'
              ? 'Aucun contenu ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore créé de contenu.'
            }
          </p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#f01919] hover:bg-[#d01515] text-white"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Créer votre premier contenu
          </Button>
        </div>
      )}

      {/* Create Content Form */}
      <ContenuCreateForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateContenu}
        creatorId={creatorInfo.id}
        availableLaalas={availableLaalas}
      />
    </div>
  );
}