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
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      
      const data = doc.data();
      if (!data) return null;
      
      return { id: doc.id, ...data } as unknown as T;
    } catch (error) {
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
      const updateData = {
        ...data,
        updatedAt: dbUtils.timestamp(),
      };
      
      await this.collection.doc(id).update(updateData);
    } catch (error) {
      throw new ServiceError(`Erreur lors de la mise à jour de ${id} dans ${this.collectionName}`, error);
    }
  }

  // DELETE
  async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
    } catch (error) {
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