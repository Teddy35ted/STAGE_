'use client';

import React from 'react';
import { 
  FiBell, 
  FiX, 
  FiCheck, 
  FiTrash2,
  FiSettings,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  isRead: boolean;
}

const notifications: Notification[] = [
  {
    id: '1',
    title: 'Nouveau fan',
    message: '5 nouveaux fans ont rejoint votre communauté aujourd\'hui',
    time: 'Il y a 2 heures',
    type: 'success',
    isRead: false,
  },
  {
    id: '2',
    title: 'Proposition publicitaire',
    message: 'Nouvelle proposition pour votre espace Laala "Lifestyle"',
    time: 'Il y a 4 heures',
    type: 'info',
    isRead: false,
  },
  {
    id: '3',
    title: 'Retrait en attente',
    message: 'Votre demande de retrait de 850€ est en cours de traitement',
    time: 'Il y a 1 jour',
    type: 'warning',
    isRead: true,
  },
  {
    id: '4',
    title: 'Paiement reçu',
    message: 'Vous avez reçu 125€ de revenus publicitaires',
    time: 'Il y a 2 jours',
    type: 'success',
    isRead: true,
  },
  {
    id: '5',
    title: 'Nouveau contenu populaire',
    message: 'Votre dernier post a dépassé 1000 vues !',
    time: 'Il y a 3 jours',
    type: 'success',
    isRead: true,
  },
];

export const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, onClose }) => {
  const [notificationList, setNotificationList] = React.useState(notifications);

  const markAsRead = (id: string) => {
    setNotificationList(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationList(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotificationList(prev => prev.filter(notif => notif.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <FiCheckCircle className="w-4 h-4" />;
      case 'warning': return <FiAlertTriangle className="w-4 h-4" />;
      case 'info': 
      default: return <FiInfo className="w-4 h-4" />;
    }
  };

  const getTypeColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': 
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const unreadCount = notificationList.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-[#f01919] rounded-lg flex items-center justify-center">
                <FiBell className="w-5 h-5 text-white" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes lues'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center space-x-2 text-sm text-[#f01919] hover:text-[#d01515] disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <FiCheck className="w-4 h-4" />
            <span>Tout marquer comme lu</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800">
            <FiSettings className="w-4 h-4" />
            <span>Paramètres</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {notificationList.length === 0 ? (
            <div className="p-8 text-center">
              <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notificationList.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getTypeColors(notification.type)} flex-shrink-0`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Marquer comme lu"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button className="w-full text-sm text-[#f01919] hover:text-[#d01515] font-medium">
            Voir toutes les notifications
          </button>
        </div>
      </div>
    </div>
  );
};