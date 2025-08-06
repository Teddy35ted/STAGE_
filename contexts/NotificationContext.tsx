'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
  action?: string; // Type d'action CRUD
  entity?: string; // Entité concernée (laala, contenu, boutique, etc.)
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getUnreadCount: () => number;
  markAllAsRead: () => void;
  // Méthodes spécifiques pour les actions CRUD
  notifyCRUD: (action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE', entity: string, entityName: string, success: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Générer un ID unique pour chaque notification
  const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Ajouter une notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-suppression après 5 secondes pour les notifications de succès
    if (notification.type === 'success') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }

    console.log('📬 Nouvelle notification ajoutée:', newNotification);
  };

  // Supprimer une notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Vider toutes les notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    console.log('🧹 Toutes les notifications supprimées');
  };

  // Compter les notifications non lues (moins de 1 heure)
  const getUnreadCount = () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return notifications.filter(notif => notif.timestamp > oneHourAgo).length;
  };

  // Marquer toutes comme lues (optionnel, pour usage futur)
  const markAllAsRead = () => {
    console.log('✅ Toutes les notifications marquées comme lues');
  };

  // Méthode spécialisée pour les notifications CRUD
  const notifyCRUD = (
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE', 
    entity: string, 
    entityName: string, 
    success: boolean
  ) => {
    const actionMessages = {
      CREATE: {
        success: { title: 'Création réussie', message: `${entity} "${entityName}" créé(e) avec succès` },
        error: { title: 'Échec de création', message: `Impossible de créer ${entity} "${entityName}"` }
      },
      READ: {
        success: { title: 'Données chargées', message: `${entity} récupéré(e)s avec succès` },
        error: { title: 'Erreur de chargement', message: `Impossible de charger ${entity}` }
      },
      UPDATE: {
        success: { title: 'Modification réussie', message: `${entity} "${entityName}" modifié(e) avec succès` },
        error: { title: 'Échec de modification', message: `Impossible de modifier ${entity} "${entityName}"` }
      },
      DELETE: {
        success: { title: 'Suppression réussie', message: `${entity} "${entityName}" supprimé(e) avec succès` },
        error: { title: 'Échec de suppression', message: `Impossible de supprimer ${entity} "${entityName}"` }
      }
    };

    const messageType = success ? 'success' : 'error';
    const notifType = success ? 'success' : 'error';
    const { title, message } = actionMessages[action][messageType];

    addNotification({
      title,
      message,
      type: notifType,
      action,
      entity
    });
  };

  // Nettoyer les notifications à l'unmount (fermeture de session)
  useEffect(() => {
    return () => {
      console.log('🔄 Session fermée - notifications nettoyées');
    };
  }, []);

  // Limiter le nombre de notifications (max 50)
  useEffect(() => {
    if (notifications.length > 50) {
      setNotifications(prev => prev.slice(0, 50));
    }
  }, [notifications.length]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
    markAllAsRead,
    notifyCRUD
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personnalisé pour les notifications CRUD
export const useCRUDNotifications = () => {
  const { notifyCRUD } = useNotifications();
  
  return {
    notifyCreate: (entity: string, entityName: string, success: boolean) => 
      notifyCRUD('CREATE', entity, entityName, success),
    notifyRead: (entity: string, success: boolean) => 
      notifyCRUD('READ', entity, '', success),
    notifyUpdate: (entity: string, entityName: string, success: boolean) => 
      notifyCRUD('UPDATE', entity, entityName, success),
    notifyDelete: (entity: string, entityName: string, success: boolean) => 
      notifyCRUD('DELETE', entity, entityName, success)
  };
};
