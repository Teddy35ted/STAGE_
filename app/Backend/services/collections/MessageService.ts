import { BaseService } from '../base/BaseService';
import { ValidationMessageT } from '../../../models/message';
import { COLLECTIONS, dbUtils } from '../../config/database';
import { ServiceError } from '../../utils/errors';

export class MessageService extends BaseService<ValidationMessageT> {
  constructor() {
    super(COLLECTIONS.MESSAGES || 'messages');
  }

  async create(data: Partial<ValidationMessageT>): Promise<string> {
    try {
      console.log('📝 Création message avec données:', data);
      
      // Enlever l'ID s'il existe dans les données (Firestore le générera)
      const { id: _, ...cleanData } = data as any;
      
      const messageData = {
        ...cleanData,
        createdAt: dbUtils.timestamp(),
        updatedAt: dbUtils.timestamp(),
      };
      
      console.log('📄 Données complètes pour création message:', messageData);
      
      // Créer directement dans Firestore
      const docRef = await this.collection.add(messageData);
      const firestoreId = docRef.id;
      
      console.log('✅ Message créé avec ID Firestore:', firestoreId);
      
      return firestoreId;
      
    } catch (error) {
      console.error('❌ Erreur création message:', error);
      throw new ServiceError('Erreur lors de la création du message', error);
    }
  }

  async getById(id: string): Promise<ValidationMessageT | null> {
    try {
      console.log(`📖 Récupération message ID:`, id);
      
      if (!id || id.trim() === '') {
        console.warn('⚠️ ID vide pour récupération message');
        return null;
      }
      
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        console.log(`❌ Message ${id} non trouvé`);
        return null;
      }
      
      const data = doc.data();
      if (!data) {
        console.log(`❌ Données vides pour message ${id}`);
        return null;
      }
      
      // S'assurer que l'ID Firestore est utilisé
      const result: ValidationMessageT = {
        ...data,
        id: doc.id // Utiliser l'ID Firestore
      } as ValidationMessageT;
      
      console.log(`✅ Message récupéré:`, result.contenu || 'Message', 'ID:', result.id);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Erreur récupération message ${id}:`, error);
      throw new ServiceError(`Erreur lors de la récupération du message ${id}`, error);
    }
  }

  async getAll(options: any = {}): Promise<ValidationMessageT[]> {
    try {
      console.log('📋 Récupération de tous les messages...');
      
      let query = this.collection;
      
      if (options.orderBy) {
        query = query.orderBy(options.orderBy, options.orderDirection || 'asc') as any;
      }
      
      if (options.limit) {
        query = query.limit(options.limit) as any;
      }
      
      const snapshot = await query.get();
      
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id // S'assurer que l'ID Firestore est utilisé
        } as ValidationMessageT;
      });
      
      console.log(`✅ ${messages.length} messages récupérés`);
      
      // Vérifier que tous les messages ont un ID
      const messagesWithIds = messages.filter(m => m.id);
      if (messagesWithIds.length !== messages.length) {
        console.warn(`⚠️ ${messages.length - messagesWithIds.length} messages sans ID détectés`);
      }
      
      return messages;
      
    } catch (error) {
      console.error('❌ Erreur récupération tous messages:', error);
      throw new ServiceError('Erreur lors de la récupération des messages', error);
    }
  }

  async update(id: string, data: Partial<ValidationMessageT>): Promise<void> {
    try {
      console.log(`✏️ Mise à jour message ID:`, id);
      console.log(`📝 Données de mise à jour:`, data);
      
      if (!id || id.trim() === '') {
        throw new ServiceError('ID vide pour mise à jour message');
      }
      
      // Vérifier que le message existe
      const existingDoc = await this.collection.doc(id).get();
      if (!existingDoc.exists) {
        throw new ServiceError(`Message ${id} non trouvé pour mise à jour`);
      }
      
      // Nettoyer les données (enlever les champs non modifiables)
      const { id: _, createdAt, ...cleanData } = data as any;
      
      const updateData = {
        ...cleanData,
        updatedAt: dbUtils.timestamp(),
      };
      
      await this.collection.doc(id).update(updateData);
      console.log(`✅ Message ${id} mis à jour avec succès`);
      
    } catch (error) {
      console.error(`❌ Erreur mise à jour message ${id}:`, error);
      throw new ServiceError(`Erreur lors de la mise à jour du message ${id}`, error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Suppression message ID:`, id);
      
      if (!id || id.trim() === '') {
        throw new ServiceError('ID vide pour suppression message');
      }
      
      // Vérifier que le message existe
      const existingDoc = await this.collection.doc(id).get();
      if (!existingDoc.exists) {
        console.warn(`⚠️ Message ${id} déjà supprimé ou inexistant`);
        return; // Ne pas lever d'erreur si déjà supprimé
      }
      
      const existingData = existingDoc.data();
      console.log(`📋 Message à supprimer:`, existingData?.contenu || 'Sans contenu');
      
      await this.collection.doc(id).delete();
      console.log(`✅ Message ${id} supprimé avec succès`);
      
      // Vérifier que la suppression a bien eu lieu
      const deletedDoc = await this.collection.doc(id).get();
      if (deletedDoc.exists) {
        throw new ServiceError(`Échec de la suppression du message ${id}`);
      }
      
    } catch (error) {
      console.error(`❌ Erreur suppression message ${id}:`, error);
      throw new ServiceError(`Erreur lors de la suppression du message ${id}`, error);
    }
  }

  async getConversation(senderId: string, receiverId: string): Promise<ValidationMessageT | null> {
    try {
      console.log('💬 Récupération conversation entre:', senderId, 'et', receiverId);
      
      const results = await this.query([
        { field: 'chateurs', operator: 'array-contains', value: senderId }
      ]);
      
      const conversation = results.find(conv => conv.chateurs?.includes(receiverId)) || null;
      
      console.log(`✅ Conversation ${conversation ? 'trouvée' : 'non trouvée'}`);
      
      return conversation;
      
    } catch (error) {
      console.error(`❌ Erreur récupération conversation:`, error);
      throw new ServiceError('Erreur lors de la récupération de la conversation', error);
    }
  }

  async getMessagesByUser(userId: string): Promise<ValidationMessageT[]> {
    try {
      console.log('📋 Récupération messages pour utilisateur:', userId);
      
      const query = this.collection
        .where('idExpediteur', '==', userId)
        .orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id // S'assurer que l'ID Firestore est utilisé
        } as ValidationMessageT;
      });
      
      console.log(`✅ ${messages.length} messages trouvés pour utilisateur ${userId}`);
      
      return messages;
      
    } catch (error) {
      console.error(`❌ Erreur récupération messages utilisateur ${userId}:`, error);
      throw new ServiceError(`Erreur lors de la récupération des messages de l'utilisateur ${userId}`, error);
    }
  }
}
