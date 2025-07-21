'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiCalendar, 
  FiClock, 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiEye,
  FiPlay,
  FiPause,
  FiImage,
  FiVideo,
  FiFileText,
  FiRepeat
} from 'react-icons/fi';

interface ScheduledContent {
  id: string;
  title: string;
  type: 'image' | 'video' | 'text';
  laala: string;
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  content: string;
  tags: string[];
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

const scheduledContentData: ScheduledContent[] = [
  {
    id: '1',
    title: 'Routine matinale du lundi',
    type: 'image',
    laala: 'Mon Laala Lifestyle',
    scheduledFor: '2024-01-22T08:00:00Z',
    status: 'scheduled',
    content: 'Photo de ma routine matinale avec conseils bien-être',
    tags: ['lifestyle', 'routine', 'matin'],
    recurring: {
      type: 'weekly',
      interval: 1,
      endDate: '2024-06-01'
    }
  },
  {
    id: '2',
    title: 'Tutoriel React avancé',
    type: 'video',
    laala: 'Tech & Innovation',
    scheduledFor: '2024-01-23T14:30:00Z',
    status: 'scheduled',
    content: 'Vidéo explicative sur les hooks React avancés',
    tags: ['tech', 'react', 'tutoriel']
  },
  {
    id: '3',
    title: 'Recette de saison',
    type: 'image',
    laala: 'Cuisine du Monde',
    scheduledFor: '2024-01-21T12:00:00Z',
    status: 'published',
    content: 'Recette de soupe d\'hiver aux légumes de saison',
    tags: ['cuisine', 'hiver', 'légumes']
  },
  {
    id: '4',
    title: 'Workout HIIT',
    type: 'video',
    laala: 'Fitness & Santé',
    scheduledFor: '2024-01-20T07:00:00Z',
    status: 'failed',
    content: 'Séance de HIIT de 20 minutes pour débutants',
    tags: ['fitness', 'hiit', 'sport']
  },
  {
    id: '5',
    title: 'Article sur la méditation',
    type: 'text',
    laala: 'Mon Laala Lifestyle',
    scheduledFor: '2024-01-24T18:00:00Z',
    status: 'scheduled',
    content: 'Guide complet pour débuter la méditation',
    tags: ['méditation', 'bien-être', 'guide']
  }
];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export default function SchedulePage() {
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>(scheduledContentData);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredContent = scheduledContent.filter(content => {
    const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
    return matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'published': return 'Publié';
      case 'failed': return 'Échec';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getContentForDate = (date: string) => {
    return scheduledContent.filter(content => {
      const contentDate = new Date(content.scheduledFor).toISOString().split('T')[0];
      return contentDate === date;
    });
  };

  const getContentForTimeSlot = (date: string, timeSlot: string) => {
    return scheduledContent.filter(content => {
      const contentDate = new Date(content.scheduledFor);
      const contentDateStr = contentDate.toISOString().split('T')[0];
      const contentTime = contentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return contentDateStr === date && contentTime === timeSlot;
    });
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push(date.toISOString().split('T')[0]);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programmation</h1>
          <p className="text-gray-600 mt-1">
            Planifiez et gérez vos publications de contenu
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendrier
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Liste
            </button>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#f01919] hover:bg-[#d01515] text-white"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Programmer du contenu
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Programmé</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{scheduledContent.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {scheduledContent.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Publié</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {scheduledContent.filter(c => c.status === 'published').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiPlay className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Récurrents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {scheduledContent.filter(c => c.recurring).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiRepeat className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="scheduled">Programmé</option>
              <option value="published">Publié</option>
              <option value="failed">Échec</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          {viewMode === 'calendar' && (
            <div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Display */}
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Calendrier - {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {timeSlots.map((timeSlot) => {
              const content = getContentForTimeSlot(selectedDate, timeSlot);
              return (
                <div key={timeSlot} className="flex items-center border-b border-gray-100 pb-4">
                  <div className="w-16 text-sm font-medium text-gray-600">
                    {timeSlot}
                  </div>
                  <div className="flex-1 ml-4">
                    {content.length > 0 ? (
                      <div className="space-y-2">
                        {content.map((item) => {
                          const TypeIcon = getTypeIcon(item.type);
                          return (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                                  <TypeIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                  <p className="text-xs text-gray-500">{item.laala}</p>
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                  {getStatusLabel(item.status)}
                                </span>
                                {item.recurring && (
                                  <FiRepeat className="w-4 h-4 text-purple-500" title="Contenu récurrent" />
                                )}
                              </div>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="outline">
                                  <FiEye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <FiEdit3 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <FiTrash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">Aucun contenu programmé</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
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
                    Programmé pour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Récurrence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContent.map((content) => {
                  const TypeIcon = getTypeIcon(content.type);
                  const dateTime = formatDateTime(content.scheduledFor);
                  return (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${getTypeColor(content.type)}`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{content.title}</p>
                            <p className="text-xs text-gray-500">{content.content}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{content.laala}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <p>{dateTime.date}</p>
                          <p className="text-xs text-gray-500">{dateTime.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(content.status)}`}>
                          {getStatusLabel(content.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {content.recurring ? (
                          <div className="flex items-center text-sm text-gray-600">
                            <FiRepeat className="w-4 h-4 mr-1" />
                            {content.recurring.type === 'daily' && 'Quotidien'}
                            {content.recurring.type === 'weekly' && 'Hebdomadaire'}
                            {content.recurring.type === 'monthly' && 'Mensuel'}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <FiEye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <FiEdit3 className="w-4 h-4" />
                          </Button>
                          {content.status === 'scheduled' && (
                            <Button size="sm" variant="outline">
                              <FiPause className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <FiTrash2 className="w-4 h-4" />
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
      )}

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contenu programmé</h3>
          <p className="text-gray-600 mb-4">
            Commencez à programmer votre contenu pour automatiser vos publications.
          </p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#f01919] hover:bg-[#d01515] text-white"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Programmer votre premier contenu
          </Button>
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Programmer du contenu</h2>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez programmer vos publications à l'avance.
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