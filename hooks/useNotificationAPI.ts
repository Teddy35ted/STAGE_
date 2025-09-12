'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NotificationData {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: string;
  entity?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: number;
  updatedAt: number;
}

export function useNotificationAPI() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Récupérer les notifications depuis l'API
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
          console.log('📬 Notifications récupérées:', data.data.length);
        }
      } else {
        console.error('❌ Erreur récupération notifications:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le nombre de notifications non lues
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      
      const response = await fetch('/api/notifications/unread', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
          console.log('📊 Notifications non lues:', data.unreadCount);
        }
      }
    } catch (error) {
      console.error('❌ Erreur fetch unread count:', error);
    }
  };

  // Marquer les notifications comme lues
  const markAsRead = async (notificationIds?: string[]) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markAll: !notificationIds,
          notificationIds: notificationIds || []
        }),
      });

      if (response.ok) {
        console.log('✅ Notifications marquées comme lues');
        // Actualiser les données
        await fetchNotifications();
        await fetchUnreadCount();
      } else {
        console.error('❌ Erreur marquage notifications:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur mark as read:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    await markAsRead();
  };

  // Actualiser les données
  const refresh = async () => {
    await Promise.all([
      fetchNotifications(),
      fetchUnreadCount()
    ]);
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user]);

  // Actualiser périodiquement (toutes les 30 secondes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    fetchUnreadCount
  };
}
