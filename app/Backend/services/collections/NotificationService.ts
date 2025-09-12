import { BaseService } from '../base/BaseService';
import { COLLECTIONS, dbUtils, adminDb } from '../../config/database';

// Interface pour les notifications stockées en base
export interface NotificationRecord {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: string; // Type d'action CRUD
  entity?: string; // Entité concernée
  entityId?: string; // ID de l'entité
  isRead: boolean;
  createdAt: number;
  updatedAt: number;
}

// Interface pour les notifications temps réel
export interface LiveNotification {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: string;
  entity?: string;
  entityId?: string;
}

export class NotificationService extends BaseService<NotificationRecord> {
  constructor() {
    super(COLLECTIONS.NOTIFICATIONS);
  }

  /**
   * Créer une notification en base de données
   */
  async createNotification(userId: string, notification: LiveNotification): Promise<string> {
    try {
      const notificationData: Omit<NotificationRecord, 'id'> = {
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        action: notification.action,
        entity: notification.entity,
        entityId: notification.entityId,
        isRead: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const docRef = await this.collection.add(notificationData);
      console.log('📬 Notification créée en base:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur création notification:', error);
      throw error;
    }
  }

  /**
   * Récupérer les notifications d'un utilisateur
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<NotificationRecord[]> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NotificationRecord));

      return notifications;
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return [];
    }
  }

  /**
   * Marquer les notifications comme lues
   */
  async markAsRead(userId: string, notificationIds?: string[]): Promise<void> {
    try {
      if (notificationIds && notificationIds.length > 0) {
        // Marquer des notifications spécifiques
        const batch = adminDb.batch();
        for (const id of notificationIds) {
          const docRef = this.collection.doc(id);
          batch.update(docRef, { isRead: true, updatedAt: Date.now() });
        }
        await batch.commit();
      } else {
        // Marquer toutes les notifications de l'utilisateur comme lues
        const snapshot = await this.collection
          .where('userId', '==', userId)
          .where('isRead', '==', false)
          .get();

        if (!snapshot.empty) {
          const batch = adminDb.batch();
          snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isRead: true, updatedAt: Date.now() });
          });
          await batch.commit();
        }
      }

      console.log('✅ Notifications marquées comme lues');
    } catch (error) {
      console.error('❌ Erreur marquage notifications lues:', error);
      throw error;
    }
  }

  /**
   * Supprimer les anciennes notifications (plus de 30 jours)
   */
  async cleanOldNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const snapshot = await this.collection
        .where('createdAt', '<', thirtyDaysAgo)
        .get();

      if (!snapshot.empty) {
        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`🧹 ${snapshot.docs.length} anciennes notifications supprimées`);
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage notifications:', error);
    }
  }

  /**
   * Compter les notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('❌ Erreur comptage notifications non lues:', error);
      return 0;
    }
  }

  /**
   * Notifier une opération CRUD
   */
  async notifyCRUD(
    userId: string,
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    entity: string,
    entityName: string,
    success: boolean,
    entityId?: string
  ): Promise<string | null> {
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
    const { title, message } = actionMessages[action][messageType];

    try {
      return await this.createNotification(userId, {
        title,
        message,
        type: success ? 'success' : 'error',
        action,
        entity,
        entityId
      });
    } catch (error) {
      console.error('❌ Erreur notification CRUD:', error);
      return null;
    }
  }
}

// Instance singleton
export const notificationService = new NotificationService();
