import { BaseService } from '../base/BaseService';
import { ContenuDashboard, ContenuCore, generateContenuAutoFields } from '../../../models/contenu';
import { COLLECTIONS, adminDb, dbUtils } from '../../config/database';
import { ServiceError } from '../../utils/errors';

export class ContenuService extends BaseService<ContenuDashboard> {
  constructor() {
    super(COLLECTIONS.CONTENUS || 'contenus');
  }

  async createContenu(
    contenuCore: ContenuCore,
    creatorInfo: { nom: string; avatar: string; iscert: boolean },
    position: number = 1
  ): Promise<string> {
    try {
      console.log('📝 Création contenu avec données:', contenuCore);
      
      // Générer les champs automatiques SANS l'ID (Firestore le générera)
      const autoFields = generateContenuAutoFields(contenuCore, creatorInfo, position);
      
      // Enlever l'ID généré automatiquement car Firestore va créer le sien
      const { id: _, ...autoFieldsWithoutId } = autoFields;
      
      const completeContenu = {
        ...contenuCore,
        ...autoFieldsWithoutId,
        createdAt: dbUtils.timestamp(),
        updatedAt: dbUtils.timestamp(),
      };
      
      console.log('📄 Données complètes pour création:', completeContenu);
      
      // Créer directement dans Firestore
      const docRef = await this.collection.add(completeContenu);
      const firestoreId = docRef.id;
      
      console.log('✅ Contenu créé avec ID Firestore:', firestoreId);
      
      return firestoreId;
      
    } catch (error) {
      console.error('❌ Erreur création contenu:', error);
      throw new ServiceError('Erreur lors de la création du contenu', error);
    }
  }

  async getById(id: string): Promise<ContenuDashboard | null> {
    try {
      console.log(`📖 Récupération contenu ID:`, id);
      
      if (!id || id.trim() === '') {
        console.warn('⚠️ ID vide pour récupération contenu');
        return null;
      }
      
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        console.log(`❌ Contenu ${id} non trouvé`);
        return null;
      }
      
      const data = doc.data();
      if (!data) {
        console.log(`❌ Données vides pour contenu ${id}`);
        return null;
      }
      
      // S'assurer que l'ID Firestore est utilisé
      const result: ContenuDashboard = {
        ...data,
        id: doc.id // Utiliser l'ID Firestore
      } as ContenuDashboard;
      
      console.log(`✅ Contenu récupéré:`, result.nom, 'ID:', result.id);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Erreur récupération contenu ${id}:`, error);
      throw new ServiceError(`Erreur lors de la récupération du contenu ${id}`, error);
    }
  }

  async getAll(options: any = {}): Promise<ContenuDashboard[]> {
    try {
      console.log('📋 Récupération de tous les contenus...');
      
      let query = this.collection;
      
      if (options.orderBy) {
        query = query.orderBy(options.orderBy, options.orderDirection || 'asc') as any;
      }
      
      if (options.limit) {
        query = query.limit(options.limit) as any;
      }
      
      const snapshot = await query.get();
      
      const contenus = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id // S'assurer que l'ID Firestore est utilisé
        } as ContenuDashboard;
      });
      
      console.log(`✅ ${contenus.length} contenus récupérés`);
      
      // Vérifier que tous les contenus ont un ID
      const contenusWithIds = contenus.filter(c => c.id);
      if (contenusWithIds.length !== contenus.length) {
        console.warn(`⚠️ ${contenus.length - contenusWithIds.length} contenus sans ID détectés`);
      }
      
      return contenus;
      
    } catch (error) {
      console.error('❌ Erreur récupération tous contenus:', error);
      throw new ServiceError('Erreur lors de la récupération des contenus', error);
    }
  }

  async update(id: string, data: Partial<ContenuDashboard>): Promise<void> {
    try {
      console.log(`✏️ Mise à jour contenu ID:`, id);
      console.log(`📝 Données de mise à jour:`, data);
      
      if (!id || id.trim() === '') {
        throw new ServiceError('ID vide pour mise à jour contenu');
      }
      
      // Vérifier que le contenu existe
      const existingDoc = await this.collection.doc(id).get();
      if (!existingDoc.exists) {
        throw new ServiceError(`Contenu ${id} non trouvé pour mise à jour`);
      }
      
      // Nettoyer les données (enlever les champs non modifiables)
      const { id: _, createdAt, ...cleanData } = data as any;
      
      const updateData = {
        ...cleanData,
        updatedAt: dbUtils.timestamp(),
      };
      
      await this.collection.doc(id).update(updateData);
      console.log(`✅ Contenu ${id} mis à jour avec succès`);
      
    } catch (error) {
      console.error(`❌ Erreur mise à jour contenu ${id}:`, error);
      throw new ServiceError(`Erreur lors de la mise à jour du contenu ${id}`, error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Suppression contenu ID:`, id);
      
      if (!id || id.trim() === '') {
        throw new ServiceError('ID vide pour suppression contenu');
      }
      
      // Vérifier que le contenu existe
      const existingDoc = await this.collection.doc(id).get();
      if (!existingDoc.exists) {
        console.warn(`⚠️ Contenu ${id} déjà supprimé ou inexistant`);
        return; // Ne pas lever d'erreur si déjà supprimé
      }
      
      const existingData = existingDoc.data();
      console.log(`📋 Contenu à supprimer:`, existingData?.nom || 'Sans nom');
      
      await this.collection.doc(id).delete();
      console.log(`✅ Contenu ${id} supprimé avec succès`);
      
      // Vérifier que la suppression a bien eu lieu
      const deletedDoc = await this.collection.doc(id).get();
      if (deletedDoc.exists) {
        throw new ServiceError(`Échec de la suppression du contenu ${id}`);
      }
      
    } catch (error) {
      console.error(`❌ Erreur suppression contenu ${id}:`, error);
      throw new ServiceError(`Erreur lors de la suppression du contenu ${id}`, error);
    }
  }

  async getByLaala(laalaId: string): Promise<ContenuDashboard[]> {
    try {
      console.log('📋 Récupération contenus pour Laala:', laalaId);
      
      // Requête simple sans orderBy pour éviter l'erreur d'index
      const query = this.collection.where('idLaala', '==', laalaId);
      
      const snapshot = await query.get();
      
      const contenus = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id // S'assurer que l'ID Firestore est utilisé
        } as ContenuDashboard;
      });
      
      // Tri côté client par position
      contenus.sort((a, b) => (a.position || 0) - (b.position || 0));
      
      console.log(`✅ ${contenus.length} contenus trouvés pour Laala ${laalaId}`);
      
      return contenus;
      
    } catch (error) {
      console.error(`❌ Erreur récupération contenus Laala ${laalaId}:`, error);
      throw new ServiceError(`Erreur lors de la récupération des contenus du Laala ${laalaId}`, error);
    }
  }

  // Méthode utilitaire pour vérifier l'intégrité des données
  async checkDataIntegrity(): Promise<{
    collectionName: string;
    totalItems: number;
    itemsWithIds: number;
    itemsWithoutIds: number;
    sampleIds: string[];
    healthStatus: "Excellent" | "Bon" | "Problématique" | "Critique";
  }> {
    try {
      const allContenus = await this.getAll();
      const contenusWithIds = allContenus.filter(c => c.id && c.id.trim() !== '');
      const contenusWithoutIds = allContenus.filter(c => !c.id || c.id.trim() === '');
      
      // Déterminer le statut de santé
      const totalItems = allContenus.length;
      const itemsWithIds = contenusWithIds.length;
      const itemsWithoutIds = contenusWithoutIds.length;
      
      let healthStatus: "Excellent" | "Bon" | "Problématique" | "Critique";
      if (itemsWithoutIds === 0) {
        healthStatus = "Excellent";
      } else if (itemsWithoutIds < totalItems * 0.1) {
        healthStatus = "Bon";
      } else if (itemsWithoutIds < totalItems * 0.3) {
        healthStatus = "Problématique";
      } else {
        healthStatus = "Critique";
      }
      
      return {
        collectionName: 'contenus',
        totalItems,
        itemsWithIds,
        itemsWithoutIds,
        sampleIds: contenusWithIds.slice(0, 5).map(c => c.id),
        healthStatus
      };
    } catch (error) {
      console.error('❌ Erreur vérification intégrité:', error);
      throw new ServiceError('Erreur lors de la vérification de l\'intégrité des données', error);
    }
  }
}
