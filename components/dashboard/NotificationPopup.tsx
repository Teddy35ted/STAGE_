'use client';

import React from 'react';
import { 
  FiBell, 
  FiX, 
  FiTrash2,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPopup({ isOpen, onClose }: NotificationPopupProps) {
  const { notifications, removeNotification, clearAllNotifications, getUnreadCount } = useNotifications();

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'error':
        return <FiXCircle className="w-4 h-4" />;
      case 'warning':
        return <FiAlertTriangle className="w-4 h-4" />;
      case 'info':
      default:
        return <FiInfo className="w-4 h-4" />;
    }
  };

  const getTypeColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  const unreadCount = getUnreadCount();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-blue-500/20 rounded-2xl border border-white/20 max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <FiBell className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">
                {notifications.length === 0 
                  ? 'Aucune notification' 
                  : `${notifications.length} notification${notifications.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer toutes les notifications"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
              <p className="text-gray-600 text-sm">
                Vos notifications d'activité apparaîtront ici.
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`p-2 rounded-full ${getTypeColors(notification.type)} flex-shrink-0`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                        {notification.action && notification.entity && (
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {notification.action}
                            </span>
                            <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {notification.entity}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all duration-200"
                        title="Supprimer cette notification"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <button
              onClick={clearAllNotifications}
              className="w-full text-center text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              Supprimer toutes les notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}