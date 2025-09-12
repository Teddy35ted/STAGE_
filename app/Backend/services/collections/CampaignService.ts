import { BaseService } from '../base/BaseService';
import { CampaignCore, CampaignDashboard, calculateCampaignStats, CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS } from '../../../models/campaign';
import { COLLECTIONS, dbUtils } from '../../config/database';
import { ServiceError } from '../../utils/errors';
import { Timestamp } from 'firebase-admin/firestore';
import { notificationService } from './NotificationService';

export class CampaignService extends BaseService<CampaignCore> {
  constructor() {
    super(COLLECTIONS.CAMPAIGNS);
  }

  // Convertir un timestamp Firestore en nombre
  private convertTimestamp(timestamp: any): number {
    if (timestamp && typeof timestamp.toMillis === 'function') {
      return timestamp.toMillis();
    }
    if (typeof timestamp === 'number') {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp).getTime();
    }
    return Date.now();
  }

  async create(data: Partial<CampaignCore>, userId?: string): Promise<string> {
    try {
      console.log('📝 Création campagne avec données:', data);
      
      // Enlever l'ID s'il existe dans les données (Firestore le générera)
      const { id: _, ...cleanData } = data as any;
      
      const campaignData = {
        ...cleanData,
        createdAt: dbUtils.timestamp(),
        updatedAt: dbUtils.timestamp(),
        stats: {
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0
        }
      };
      
      console.log('📄 Données complètes pour création campagne:', campaignData);
      
      // Créer directement dans Firestore
      const docRef = await this.collection.add(campaignData);
      const firestoreId = docRef.id;
      
      console.log('✅ Campagne créée avec ID Firestore:', firestoreId);
      
      // Envoyer notification de succès
      if (userId) {
        try {
          await notificationService.notifyCRUD(
            userId,
            'CREATE',
            'Campagne',
            data.name || 'Sans nom',
            true,
            firestoreId
          );
          console.log('📬 Notification de création campagne envoyée');
        } catch (notifError) {
          console.error('⚠️ Erreur notification campagne (non bloquant):', notifError);
        }
      }
      
      return firestoreId;
      
    } catch (error) {
      console.error('❌ Erreur création campagne:', error);
      
      // Envoyer notification d'erreur
      if (userId) {
        try {
          await notificationService.notifyCRUD(
            userId,
            'CREATE',
            'Campagne',
            data.name || 'Sans nom',
            false
          );
        } catch (notifError) {
          console.error('⚠️ Erreur notification campagne (non bloquant):', notifError);
        }
      }
      
      throw new ServiceError('Erreur lors de la création de la campagne', error);
    }
  }

  async getById(id: string): Promise<CampaignCore | null> {
    try {
      console.log(`📖 Récupération campagne ID:`, id);
      
      if (!id || id.trim() === '') {
        console.warn('⚠️ ID vide pour récupération campagne');
        return null;
      }
      
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        console.log(`📭 Campagne non trouvée pour ID: ${id}`);
        return null;
      }
      
      const data = doc.data() as CampaignCore;
      const campaign: CampaignCore = {
        ...data,
        id: doc.id,
        createdAt: this.convertTimestamp(data.createdAt),
        updatedAt: this.convertTimestamp(data.updatedAt)
      };
      
      console.log('📋 Campagne récupérée:', campaign);
      return campaign;
      
    } catch (error) {
      console.error('❌ Erreur récupération campagne:', error);
      throw new ServiceError('Erreur lors de la récupération de la campagne', error);
    }
  }

  async getAll(): Promise<CampaignCore[]> {
    try {
      console.log('📚 Récupération de toutes les campagnes');
      
      const snapshot = await this.collection
        .orderBy('createdAt', 'desc')
        .get();
      
      if (snapshot.empty) {
        console.log('📭 Aucune campagne trouvée');
        return [];
      }
      
      const campaigns = snapshot.docs.map(doc => {
        const data = doc.data() as CampaignCore;
        return {
          ...data,
          id: doc.id,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as CampaignCore;
      });
      
      console.log(`📋 ${campaigns.length} campagnes récupérées`);
      return campaigns;
      
    } catch (error) {
      console.error('❌ Erreur récupération campagnes:', error);
      throw new ServiceError('Erreur lors de la récupération des campagnes', error);
    }
  }

  async getCampaignsByUser(userId: string): Promise<CampaignCore[]> {
    try {
      console.log('📚 Récupération campagnes par utilisateur:', userId);
      
      // Requête temporaire sans orderBy en attendant la création de l'index composite
      // TODO: Remettre .orderBy('createdAt', 'desc') une fois l'index créé
      const snapshot = await this.collection
        .where('createdBy', '==', userId)
        .get();
      
      if (snapshot.empty) {
        console.log('📭 Aucune campagne trouvée pour cet utilisateur');
        return [];
      }
      
      const campaigns = snapshot.docs.map(doc => {
        const data = doc.data() as CampaignCore;
        return {
          ...data,
          id: doc.id,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as CampaignCore;
      });
      
      // Tri côté client en attendant l'index composite Firestore
      campaigns.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      console.log(`📋 ${campaigns.length} campagnes récupérées pour l'utilisateur`);
      return campaigns;
      
    } catch (error) {
      console.error('❌ Erreur récupération campagnes utilisateur:', error);
      throw new ServiceError('Erreur lors de la récupération des campagnes de l\'utilisateur', error);
    }
  }

  async update(id: string, data: Partial<CampaignCore>, userId?: string): Promise<void> {
    try {
      console.log('✏️ Mise à jour campagne:', id, data);
      
      // Récupérer la campagne existante pour le nom
      const existingCampaign = await this.getById(id);
      const campaignName = existingCampaign?.name || data.name || 'Sans nom';
      
      const updateData = {
        ...data,
        updatedAt: dbUtils.timestamp()
      };
      
      // Enlever l'ID des données de mise à jour
      delete (updateData as any).id;
      
      await this.collection.doc(id).update(updateData);
      
      console.log('✅ Campagne mise à jour avec succès');
      
      // Envoyer notification de succès
      if (userId) {
        try {
          await notificationService.notifyCRUD(
            userId,
            'UPDATE',
            'Campagne',
            campaignName,
            true,
            id
          );
          console.log('📬 Notification de modification campagne envoyée');
        } catch (notifError) {
          console.error('⚠️ Erreur notification campagne (non bloquant):', notifError);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur mise à jour campagne:', error);
      
      // Envoyer notification d'erreur
      if (userId) {
        try {
          const campaignName = data.name || 'Sans nom';
          await notificationService.notifyCRUD(
            userId,
            'UPDATE',
            'Campagne',
            campaignName,
            false,
            id
          );
        } catch (notifError) {
          console.error('⚠️ Erreur notification campagne (non bloquant):', notifError);
        }
      }
      
      throw new ServiceError('Erreur lors de la mise à jour de la campagne', error);
    }
  }

  async delete(id: string, userId?: string): Promise<void> {
    try {
      console.log('🗑️ Suppression campagne:', id);
      
      // Récupérer la campagne avant suppression pour le nom
      const existingCampaign = await this.getById(id);
      const campaignName = existingCampaign?.name || 'Sans nom';
      
      await this.collection.doc(id).delete();
      
      console.log('✅ Campagne supprimée avec succès');
      
      // Envoyer notification de succès
      if (userId) {
        try {
          await notificationService.notifyCRUD(
            userId,
            'DELETE',
            'Campagne',
            campaignName,
            true,
            id
          );
          console.log('📬 Notification de suppression campagne envoyée');
        } catch (notifError) {
          console.error('⚠️ Erreur notification campagne (non bloquant):', notifError);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur suppression campagne:', error);
      
      // Envoyer notification d'erreur
      if (userId) {
        try {
          await notificationService.notifyCRUD(
            userId,
            'DELETE',
            'Campagne',
            'Campagne',
            false,
            id
          );
        } catch (notifError) {
          console.error('⚠️ Erreur notification campagne (non bloquant):', notifError);
        }
      }
      
      throw new ServiceError('Erreur lors de la suppression de la campagne', error);
    }
  }

  // Convertir une campagne en objet dashboard
  async toDashboard(campaign: CampaignCore): Promise<CampaignDashboard> {
    try {
      const extendedStats = calculateCampaignStats(campaign);
      
      // Formatage des dates
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const dashboardCampaign: CampaignDashboard = {
        ...campaign,
        displayTitle: campaign.name.length > 50 ? 
          campaign.name.substring(0, 47) + '...' : 
          campaign.name,
        displayDescription: campaign.description.length > 100 ? 
          campaign.description.substring(0, 97) + '...' : 
          campaign.description,
        displayStatus: {
          label: CAMPAIGN_STATUS_LABELS[campaign.status],
          color: CAMPAIGN_STATUS_COLORS[campaign.status],
          icon: this.getStatusIcon(campaign.status)
        },
        extendedStats,
        formattedDates: {
          start: startDate.toLocaleDateString('fr-FR'),
          end: endDate.toLocaleDateString('fr-FR'),
          duration: `${duration} jour${duration > 1 ? 's' : ''}`
        }
      };
      
      return dashboardCampaign;
    } catch (error) {
      console.error('❌ Erreur conversion dashboard campagne:', error);
      throw new ServiceError('Erreur lors de la conversion de la campagne', error);
    }
  }

  // Méthodes utilitaires
  private getStatusIcon(status: CampaignCore['status']): string {
    switch (status) {
      case 'draft': return 'FiEdit3';
      case 'active': return 'FiPlay';
      case 'paused': return 'FiPause';
      case 'completed': return 'FiCheck';
      case 'scheduled': return 'FiClock';
      default: return 'FiCircle';
    }
  }

  // Méthodes spécifiques aux campagnes
  async startCampaign(id: string): Promise<void> {
    await this.update(id, { status: 'active' });
  }

  async pauseCampaign(id: string): Promise<void> {
    await this.update(id, { status: 'paused' });
  }

  async completeCampaign(id: string): Promise<void> {
    await this.update(id, { status: 'completed' });
  }

  async scheduleCampaign(id: string, startDate: string): Promise<void> {
    await this.update(id, { 
      status: 'scheduled',
      startDate
    });
  }
}
