import { BaseService } from '../base/BaseService';
import { LaalaDashboard, LaalaCore, generateLaalaAutoFields } from '../../../models/laala';
import { COLLECTIONS, dbUtils } from '../../config/database';
import { ServiceError } from '../../utils/errors';

export class LaalaService extends BaseService<LaalaDashboard> {
  constructor() {
    super(COLLECTIONS.LAALAS || 'laalas');
  }

  async createLaala(
    laalaCore: LaalaCore,
    creatorInfo: { nom: string; avatar: string; iscert: boolean }
  ): Promise<string> {
    try {
      console.log('📝 Création laala avec données:', laalaCore);
      
      // Générer les champs automatiques SANS l'ID (Firestore le générera)
      const autoFields = generateLaalaAutoFields(laalaCore, creatorInfo);
      
      // Enlever l'ID généré automatiquement car Firestore va créer le sien
      const { id: _, ...autoFieldsWithoutId } = autoFields;
      
      const completeLaala = {
        ...laalaCore,
        ...autoFieldsWithoutId,
        createdAt: dbUtils.timestamp(),
        updatedAt: dbUtils.timestamp(),
      };
      
      console.log('📄 Données complètes pour création laala:', completeLaala);
      
      // Créer directement dans Firestore
      const docRef = await this.collection.add(completeLaala);
      const firestoreId = docRef.id;
      
      console.log('✅ Laala créé avec ID Firestore:', firestoreId);
      
      return firestoreId;
      
    } catch (error) {
      console.error('❌ Erreur création laala:', error);
      throw new ServiceError('Erreur lors de la création du laala', error);
    }
  }

  async getById(id: string): Promise<LaalaDashboard | null> {
    try {
      console.log(`📖 Récupération laala ID:`, id);
      
      if (!id || id.trim() === '') {
        console.warn('⚠️ ID vide pour récupération laala');
        return null;
      }
      
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        console.log(`❌ Laala ${id} non trouvé`);
        return null;
      }
      
      const data = doc.data();
      if (!data) {
        console.log(`❌ Données vides pour laala ${id}`);
        return null;
      }
      
      // S'assurer que l'ID Firestore est utilisé
      const result: LaalaDashboard = {
        ...data,
        id: doc.id // Utiliser l'ID Firestore
      } as LaalaDashboard;
      
      console.log(`✅ Laala récupéré:`, result.nom, 'ID:', result.id);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Erreur récupération laala ${id}:`, error);
      throw new ServiceError(`Erreur lors de la récupération du laala ${id}`, error);
    }
  }

  async getAll(options: any = {}): Promise<LaalaDashboard[]> {
    try {
      console.log('📋 Récupération de tous les laalas...');
      
      let query = this.collection;
      
      if (options.orderBy) {
        query = query.orderBy(options.orderBy, options.orderDirection || 'asc') as any;
      }
      
      if (options.limit) {
        query = query.limit(options.limit) as any;
      }
      
      const snapshot = await query.get();
      
      const laalas = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id // S'assurer que l'ID Firestore est utilisé
        } as LaalaDashboard;
      });
      
      console.log(`✅ ${laalas.length} laalas récupérés`);
      
      // Vérifier que tous les laalas ont un ID
      const laalasWithIds = laalas.filter(l => l.id);
      if (laalasWithIds.length !== laalas.length) {
        console.warn(`⚠️ ${laalas.length - laalasWithIds.length} laalas sans ID détectés`);
      }
      
      return laalas;
      
    } catch (error) {
      console.error('❌ Erreur récupération tous laalas:', error);
      throw new ServiceError('Erreur lors de la récupération des laalas', error);
    }
  }

  async update(id: string, data: Partial<LaalaDashboard>): Promise<void> {
    try {
      console.log(`✏️ Mise à jour laala ID:`, id);
      console.log(`📝 Données de mise à jour:`, data);
      
      if (!id || id.trim() === '') {
        throw new ServiceError('ID vide pour mise à jour laala');
      }
      
      // Vérifier que le laala existe
      const existingDoc = await this.collection.doc(id).get();
      if (!existingDoc.exists) {
        throw new ServiceError(`Laala ${id} non trouvé pour mise à jour`);
      }
      
      // Nettoyer les données (enlever les champs non modifiables)
      const { id: _, createdAt, ...cleanData } = data as any;
      
      const updateData = {
        ...cleanData,
        updatedAt: dbUtils.timestamp(),
      };
      
      await this.collection.doc(id).update(updateData);
      console.log(`✅ Laala ${id} mis à jour avec succès`);
      
    } catch (error) {
      console.error(`❌ Erreur mise à jour laala ${id}:`, error);
      throw new ServiceError(`Erreur lors de la mise à jour du laala ${id}`, error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Suppression laala ID:`, id);
      
      if (!id || id.trim() === '') {
        throw new ServiceError('ID vide pour suppression laala');
      }
      
      // Vérifier que le laala existe
      const existingDoc = await this.collection.doc(id).get();
      if (!existingDoc.exists) {
        console.warn(`⚠️ Laala ${id} déjà supprimé ou inexistant`);
        return; // Ne pas lever d'erreur si déjà supprimé
      }
      
      const existingData = existingDoc.data();
      console.log(`📋 Laala à supprimer:`, existingData?.nom || 'Sans nom');
      
      await this.collection.doc(id).delete();
      console.log(`✅ Laala ${id} supprimé avec succès`);
      
      // Vérifier que la suppression a bien eu lieu
      const deletedDoc = await this.collection.doc(id).get();
      if (deletedDoc.exists) {
        throw new ServiceError(`Échec de la suppression du laala ${id}`);
      }
      
    } catch (error) {
      console.error(`❌ Erreur suppression laala ${id}:`, error);
      throw new ServiceError(`Erreur lors de la suppression du laala ${id}`, error);
    }
  }

  async getByCreator(creatorId: string): Promise<LaalaDashboard[]> {
    try {
      console.log('📋 Récupération laalas pour créateur:', creatorId);
      
      // Requête temporaire sans orderBy en attendant la création de l'index composite
      // TODO: Remettre .orderBy('date', 'desc') une fois l'index créé
      const query = this.collection
        .where('idCreateur', '==', creatorId);
      
      const snapshot = await query.get();
      
      const laalas = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id // S'assurer que l'ID Firestore est utilisé
        } as LaalaDashboard;
      });
      
      // Tri côté client en attendant l'index composite Firestore
      laalas.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA; // Tri décroissant (plus récent en premier)
      });
      
      console.log(`✅ ${laalas.length} laalas trouvés pour créateur ${creatorId}`);
      
      return laalas;
      
    } catch (error) {
      console.error(`❌ Erreur récupération laalas créateur ${creatorId}:`, error);
      throw new ServiceError(`Erreur lors de la récupération des laalas du créateur ${creatorId}`, error);
    }
  }
}
