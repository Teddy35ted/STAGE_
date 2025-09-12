import { BaseService } from '../base/BaseService';
import { PublicCommunication } from '../../../models/communication';
import { COLLECTIONS, dbUtils } from '../../config/database';
import { ServiceError } from '../../utils/errors';
import { Timestamp } from 'firebase-admin/firestore';

export class CommunicationService extends BaseService<PublicCommunication> {
  constructor() {
    super(COLLECTIONS.COMMUNICATIONS);
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

  async create(data: Partial<PublicCommunication>, userId?: string): Promise<string> {
    try {
      console.log('📝 Création communication avec données:', data);
      
      // Enlever l'ID s'il existe dans les données (Firestore le générera)
      const { id: _, ...cleanData } = data as any;
      
      const communicationData = {
        ...cleanData,
        authorId: userId || cleanData.authorId,
        createdAt: dbUtils.timestamp(),
        updatedAt: dbUtils.timestamp(),
        stats: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0
        }
      };
      
      console.log('📄 Données complètes pour création communication:', communicationData);
      
      // Créer directement dans Firestore
      const docRef = await this.collection.add(communicationData);
      const firestoreId = docRef.id;
      
      console.log('✅ Communication créée avec ID Firestore:', firestoreId);
      return firestoreId;
      
    } catch (error) {
      console.error('❌ Erreur création communication:', error);
      throw new ServiceError('Impossible de créer la communication', 'CREATION_ERROR', error instanceof Error ? error.message : String(error));
    }
  }

  async getAll(): Promise<PublicCommunication[]> {
    try {
      console.log('🔍 Récupération de toutes les communications...');
      
      const snapshot = await this.collection
        .orderBy('createdAt', 'desc')
        .get();
      
      if (snapshot.empty) {
        console.log('📭 Aucune communication trouvée');
        return [];
      }
      
      const communications: PublicCommunication[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const communication: PublicCommunication = {
          id: doc.id,
          ...data,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as PublicCommunication;
        
        communications.push(communication);
      });
      
      console.log(`✅ ${communications.length} communications récupérées`);
      return communications;
      
    } catch (error) {
      console.error('❌ Erreur récupération communications:', error);
      throw new ServiceError('Impossible de récupérer les communications', 'FETCH_ERROR', error instanceof Error ? error.message : String(error));
    }
  }

  async getByAuthor(authorId: string): Promise<PublicCommunication[]> {
    try {
      console.log('🔍 Récupération communications pour auteur:', authorId);
      
      const snapshot = await this.collection
        .where('authorId', '==', authorId)
        .orderBy('createdAt', 'desc')
        .get();
      
      if (snapshot.empty) {
        console.log('📭 Aucune communication trouvée pour cet auteur');
        return [];
      }
      
      const communications: PublicCommunication[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const communication: PublicCommunication = {
          id: doc.id,
          ...data,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as PublicCommunication;
        
        communications.push(communication);
      });
      
      console.log(`✅ ${communications.length} communications trouvées pour l'auteur`);
      return communications;
      
    } catch (error) {
      console.error('❌ Erreur récupération communications par auteur:', error);
      throw new ServiceError('Impossible de récupérer les communications de l\'auteur', 'FETCH_ERROR', error instanceof Error ? error.message : String(error));
    }
  }

  async getByStatus(status: PublicCommunication['status']): Promise<PublicCommunication[]> {
    try {
      console.log('🔍 Récupération communications avec statut:', status);
      
      const snapshot = await this.collection
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();
      
      if (snapshot.empty) {
        console.log('📭 Aucune communication trouvée avec ce statut');
        return [];
      }
      
      const communications: PublicCommunication[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const communication: PublicCommunication = {
          id: doc.id,
          ...data,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as PublicCommunication;
        
        communications.push(communication);
      });
      
      console.log(`✅ ${communications.length} communications trouvées avec le statut ${status}`);
      return communications;
      
    } catch (error) {
      console.error('❌ Erreur récupération communications par statut:', error);
      throw new ServiceError('Impossible de récupérer les communications par statut', 'FETCH_ERROR', error instanceof Error ? error.message : String(error));
    }
  }

  async update(id: string, data: Partial<PublicCommunication>, userId?: string): Promise<void> {
    try {
      console.log('📝 Mise à jour communication:', id, data);
      
      const updateData = {
        ...data,
        updatedAt: dbUtils.timestamp()
      };
      
      // Enlever l'ID des données à mettre à jour
      delete (updateData as any).id;
      
      await this.collection.doc(id).update(updateData);
      console.log('✅ Communication mise à jour avec succès');
      
    } catch (error) {
      console.error('❌ Erreur mise à jour communication:', error);
      throw new ServiceError('Impossible de mettre à jour la communication', 'UPDATE_ERROR', error instanceof Error ? error.message : String(error));
    }
  }

  async delete(id: string, userId?: string): Promise<void> {
    try {
      console.log('🗑️ Suppression communication:', id);
      
      await this.collection.doc(id).delete();
      console.log('✅ Communication supprimée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur suppression communication:', error);
      throw new ServiceError('Impossible de supprimer la communication', 'DELETE_ERROR', error instanceof Error ? error.message : String(error));
    }
  }
}