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
    const { CrudRecoveryService } = await import('../../utils/recovery');
    
    return CrudRecoveryService.safeCreate(
      {
        create: async (data: Partial<T>) => {
          try {
            console.log(`📝 Création dans ${this.collectionName}:`, data);
            
            const docData = {
              ...data,
              createdAt: dbUtils.timestamp(),
              updatedAt: dbUtils.timestamp(),
            };
            
            const docRef = await this.collection.add(docData);
            console.log(`✅ Document créé dans ${this.collectionName} avec ID:`, docRef.id);
            
            return docRef.id;
          } catch (error) {
            console.error(`❌ Erreur création ${this.collectionName}:`, error);
            throw new ServiceError(`Erreur lors de la création dans ${this.collectionName}`, error);
          }
        }
      },
      data,
      {
        maxRetries: 3,
        retryDelay: 1000,
        onRetry: (attempt, error) => {
          console.warn(`🔄 Retry création ${this.collectionName} (tentative ${attempt}):`, error.message);
        }
      }
    );
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
      
      const result = { id: doc.id, ...data } as unknown as T;
      console.log(`✅ Document ${id} trouvé dans ${this.collectionName}:`, result.id);
      
      return result;
    } catch (error) {
      console.error(`❌ Erreur lecture ${id} dans ${this.collectionName}:`, error);
      throw new ServiceError(`Erreur lors de la lecture de ${id} dans ${this.collectionName}`, error);
    }
  }

  async getAll(options: PaginationOptions = {}): Promise<T[]> {
    try {
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
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data } as unknown as T;
      });
    } catch (error) {
      throw new ServiceError(`Erreur lors de la lecture de ${this.collectionName}`, error);
    }
  }

  async query(filters: QueryFilter[], options: PaginationOptions = {}): Promise<T[]> {
    try {
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
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data } as unknown as T;
      });
    } catch (error) {
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
      const batch = adminDb.batch();
      const ids: string[] = [];
      
      items.forEach(item => {
        const docRef = this.collection.doc();
        const docData = {
          ...item,
          createdAt: dbUtils.timestamp(),
          updatedAt: dbUtils.timestamp(),
        };
        batch.set(docRef, docData);
        ids.push(docRef.id);
      });
      
      await batch.commit();
      return ids;
    } catch (error) {
      throw new ServiceError(`Erreur lors de la création en lot dans ${this.collectionName}`, error);
    }
  }

  async batchDelete(ids: string[]): Promise<void> {
    try {
      const batch = adminDb.batch();
      
      ids.forEach(id => {
        batch.delete(this.collection.doc(id));
      });
      
      await batch.commit();
    } catch (error) {
      throw new ServiceError(`Erreur lors de la suppression en lot dans ${this.collectionName}`, error);
    }
  }

  // UTILITIES
  async exists(id: string): Promise<boolean> {
    try {
      const doc = await this.collection.doc(id).get();
      return doc.exists;
    } catch (error) {
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
      return snapshot.data().count;
    } catch (error) {
      throw new ServiceError(`Erreur lors du comptage dans ${this.collectionName}`, error);
    }
  }
}