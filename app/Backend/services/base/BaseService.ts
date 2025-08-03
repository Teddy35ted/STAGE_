import { adminDb, dbUtils } from '../../config/database';
import { CollectionReference, DocumentData, Query, WhereFilterOp } from 'firebase-admin/firestore';
import { ServiceError } from '../../utils/errors';

export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export abstract class BaseService<T extends DocumentData & { id?: string }> {
  protected collection: CollectionReference;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.collection = adminDb.collection(collectionName);
  }

  // CREATE
  async create(data: Partial<T>): Promise<string> {
    try {
      console.log(`📝 Création dans ${this.collectionName}:`, data);
      
      // Enlever l'ID s'il existe dans les données (Firestore le générera)
      const { id: _, ...cleanData } = data as any;
      
      const docData = {
        ...cleanData,
        createdAt: dbUtils.timestamp(),
        updatedAt: dbUtils.timestamp(),
      };
      
      const docRef = await this.collection.add(docData);
      console.log(`✅ Document créé dans ${this.collectionName} avec ID Firestore:`, docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error(`❌ Erreur création ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la création dans ${this.collectionName}`, error);
    }
  }

  // READ
  async getById(id: string): Promise<T | null> {
    try {
      console.log(`📖 Lecture ${this.collectionName} ID:`, id);
      
      if (!id || id.trim() === '') {
        console.warn(`⚠️ ID vide pour ${this.collectionName}`);
        return null;
      }
      
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        console.log(`❌ Document ${id} non trouvé dans ${this.collectionName}`);
        return null;
      }
      
      const data = doc.data();
      if (!data) {
        console.log(`❌ Données vides pour ${id} dans ${this.collectionName}`);
        return null;
      }
      
      // CORRECTION CRITIQUE : S'assurer que l'ID Firestore est toujours utilisé
      const result = { 
        ...data,
        id: doc.id // Forcer l'utilisation de l'ID Firestore
      } as unknown as T;
      
      console.log(`✅ Document ${id} trouvé dans ${this.collectionName}:`, result.id);
      
      return result;
    } catch (error) {
      console.error(`❌ Erreur lecture ${id} dans ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la lecture de ${id} dans ${this.collectionName}`, error);
    }
  }

  async getAll(options: PaginationOptions = {}): Promise<T[]> {
    try {
      console.log(`📋 Récupération tous ${this.collectionName}...`);
      
      let query: Query = this.collection;
      
      if (options.orderBy) {
        query = query.orderBy(options.orderBy, options.orderDirection || 'asc');
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.offset(options.offset);
      }

      const snapshot = await query.get();
      
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        // CORRECTION CRITIQUE : S'assurer que l'ID Firestore est toujours utilisé
        return { 
          ...data,
          id: doc.id // Forcer l'utilisation de l'ID Firestore
        } as unknown as T;
      });
      
      console.log(`✅ ${results.length} documents récupérés dans ${this.collectionName}`);
      
      // Vérifier que tous les éléments ont un ID
      const elementsWithIds = results.filter(r => r.id && r.id.trim() !== '');
      if (elementsWithIds.length !== results.length) {
        console.warn(`⚠️ ${results.length - elementsWithIds.length} éléments sans ID dans ${this.collectionName}`);
      }
      
      return results;
    } catch (error) {
      console.error(`❌ Erreur lecture tous ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la lecture de ${this.collectionName}`, error);
    }
  }

  async query(filters: QueryFilter[], options: PaginationOptions = {}): Promise<T[]> {
    try {
      console.log(`🔍 Requête ${this.collectionName} avec filtres:`, filters);
      
      let query: Query = this.collection;
      
      // Appliquer les filtres
      filters.forEach(filter => {
        query = query.where(filter.field, filter.operator, filter.value);
      });
      
      // Appliquer les options de pagination
      if (options.orderBy) {
        query = query.orderBy(options.orderBy, options.orderDirection || 'asc');
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        // CORRECTION CRITIQUE : S'assurer que l'ID Firestore est toujours utilisé
        return { 
          ...data,
          id: doc.id // Forcer l'utilisation de l'ID Firestore
        } as unknown as T;
      });
      
      console.log(`✅ ${results.length} documents trouvés avec requête dans ${this.collectionName}`);
      
      return results;
    } catch (error) {
      console.error(`❌ Erreur requête ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la requête dans ${this.collectionName}`, error);
    }
  }

  // UPDATE
  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      console.log(`✏️ Mise à jour ${this.collectionName} ID:`, id);
      console.log(`📝 Données de mise à jour:`, data);
      
      if (!id || id.trim() === '') {
        throw new ServiceError(`ID vide pour mise à jour dans ${this.collectionName}`);
      }
      
      // Vérifier que le document existe avant mise à jour
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        throw new ServiceError(`Document ${id} non trouvé dans ${this.collectionName} pour mise à jour`);
      }
      
      // Nettoyer les données (enlever les champs non modifiables)
      const { id: _, createdAt, ...cleanData } = data as any;
      
      const updateData = {
        ...cleanData,
        updatedAt: dbUtils.timestamp(),
      };
      
      await this.collection.doc(id).update(updateData);
      console.log(`✅ Mise à jour réussie pour ${id} dans ${this.collectionName}`);
      
    } catch (error) {
      console.error(`❌ Erreur mise à jour ${id} dans ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la mise à jour de ${id} dans ${this.collectionName}`, error);
    }
  }

  // DELETE
  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Suppression ${this.collectionName} ID:`, id);
      
      if (!id || id.trim() === '') {
        throw new ServiceError(`ID vide pour suppression dans ${this.collectionName}`);
      }
      
      // Vérifier que le document existe avant suppression
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        console.warn(`⚠️ Document ${id} déjà supprimé ou inexistant dans ${this.collectionName}`);
        return; // Ne pas lever d'erreur si déjà supprimé
      }
      
      const existingData = doc.data();
      console.log(`📋 Document à supprimer dans ${this.collectionName}:`, existingData?.nom || existingData?.contenu || 'Sans nom');
      
      await this.collection.doc(id).delete();
      console.log(`✅ Suppression réussie pour ${id} dans ${this.collectionName}`);
      
      // Vérifier que la suppression a bien eu lieu
      const deletedDoc = await this.collection.doc(id).get();
      if (deletedDoc.exists) {
        throw new ServiceError(`Échec de la suppression de ${id} dans ${this.collectionName}`);
      }
      
    } catch (error) {
      console.error(`❌ Erreur suppression ${id} dans ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la suppression de ${id} dans ${this.collectionName}`, error);
    }
  }

  // BATCH OPERATIONS
  async batchCreate(items: Partial<T>[]): Promise<string[]> {
    try {
      console.log(`📦 Création en lot dans ${this.collectionName}:`, items.length, 'éléments');
      
      const batch = adminDb.batch();
      const ids: string[] = [];
      
      items.forEach(item => {
        // Enlever l'ID s'il existe dans les données
        const { id: _, ...cleanItem } = item as any;
        
        const docRef = this.collection.doc();
        const docData = {
          ...cleanItem,
          createdAt: dbUtils.timestamp(),
          updatedAt: dbUtils.timestamp(),
        };
        batch.set(docRef, docData);
        ids.push(docRef.id);
      });
      
      await batch.commit();
      console.log(`✅ ${ids.length} documents créés en lot dans ${this.collectionName}`);
      
      return ids;
    } catch (error) {
      console.error(`❌ Erreur création en lot ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la création en lot dans ${this.collectionName}`, error);
    }
  }

  async batchDelete(ids: string[]): Promise<void> {
    try {
      console.log(`🗑️ Suppression en lot dans ${this.collectionName}:`, ids.length, 'éléments');
      
      const batch = adminDb.batch();
      
      ids.forEach(id => {
        batch.delete(this.collection.doc(id));
      });
      
      await batch.commit();
      console.log(`✅ ${ids.length} documents supprimés en lot dans ${this.collectionName}`);
      
    } catch (error) {
      console.error(`❌ Erreur suppression en lot ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la suppression en lot dans ${this.collectionName}`, error);
    }
  }

  // UTILITIES
  async exists(id: string): Promise<boolean> {
    try {
      if (!id || id.trim() === '') {
        return false;
      }
      
      const doc = await this.collection.doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error(`❌ Erreur vérification existence ${id} dans ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la vérification d'existence de ${id}`, error);
    }
  }

  async count(filters?: QueryFilter[]): Promise<number> {
    try {
      let query: Query = this.collection;
      
      if (filters) {
        filters.forEach(filter => {
          query = query.where(filter.field, filter.operator, filter.value);
        });
      }
      
      const snapshot = await query.count().get();
      const count = snapshot.data().count;
      
      console.log(`📊 Comptage ${this.collectionName}:`, count, 'éléments');
      
      return count;
    } catch (error) {
      console.error(`❌ Erreur comptage ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors du comptage dans ${this.collectionName}`, error);
    }
  }

  // Méthode utilitaire pour vérifier l'intégrité des données
  async checkDataIntegrity(): Promise<{
    collectionName: string;
    totalItems: number;
    itemsWithIds: number;
    itemsWithoutIds: number;
    sampleIds: string[];
    healthStatus: 'Excellent' | 'Bon' | 'Problématique' | 'Critique';
  }> {
    try {
      console.log(`🔍 Vérification intégrité ${this.collectionName}...`);
      
      const allItems = await this.getAll({ limit: 100 }); // Limiter pour la performance
      const itemsWithIds = allItems.filter(item => item.id && item.id.trim() !== '');
      const itemsWithoutIds = allItems.filter(item => !item.id || item.id.trim() === '');
      
      const healthScore = itemsWithIds.length / allItems.length;
      let healthStatus: 'Excellent' | 'Bon' | 'Problématique' | 'Critique';
      
      if (healthScore === 1) healthStatus = 'Excellent';
      else if (healthScore >= 0.9) healthStatus = 'Bon';
      else if (healthScore >= 0.7) healthStatus = 'Problématique';
      else healthStatus = 'Critique';
      
      const result = {
        collectionName: this.collectionName,
        totalItems: allItems.length,
        itemsWithIds: itemsWithIds.length,
        itemsWithoutIds: itemsWithoutIds.length,
        sampleIds: itemsWithIds.slice(0, 5).map(item => item.id).filter((id): id is string => typeof id === 'string'),
        healthStatus
      };
      
      console.log(`📊 Intégrité ${this.collectionName}:`, result);
      
      return result;
    } catch (error) {
      console.error(`❌ Erreur vérification intégrité ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la vérification de l'intégrité de ${this.collectionName}`, error);
    }
  }
}