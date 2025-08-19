// ===== UTILITAIRES DE RÉCUPÉRATION =====
// Fonctions pour récupérer automatiquement des erreurs CRUD

import { ServiceError } from './errors';

export interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

export class RecoveryService {
  private static defaultOptions: RecoveryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    shouldRetry: (error) => {
      // Retry sur les erreurs temporaires
      const retryableErrors = [
        'UNAVAILABLE',
        'DEADLINE_EXCEEDED',
        'INTERNAL',
        'RESOURCE_EXHAUSTED',
        'ABORTED'
      ];
      
      return retryableErrors.some(code => 
        error.message.includes(code) || 
        error.message.includes('timeout') ||
        error.message.includes('network')
      );
    }
  };

  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RecoveryOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: Error;
    
    for (let attempt = 1; attempt <= (opts.maxRetries || 3); attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Vérifier si on doit retry
        if (attempt === opts.maxRetries || !opts.shouldRetry?.(lastError)) {
          throw lastError;
        }
        
        // Callback de retry
        opts.onRetry?.(attempt, lastError);
        
        // Délai avant retry
        const delay = opts.exponentialBackoff 
          ? (opts.retryDelay || 1000) * Math.pow(2, attempt - 1)
          : (opts.retryDelay || 1000);
          
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  static async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    options: RecoveryOptions = {}
  ): Promise<T> {
    try {
      return await this.withRetry(primaryOperation, options);
    } catch (primaryError) {
      const errorMessage = primaryError instanceof Error ? primaryError.message : 'Erreur inconnue';
      console.warn('🔄 Opération principale échouée, utilisation du fallback:', errorMessage);
      
      try {
        return await this.withRetry(fallbackOperation, options);
      } catch (fallbackError) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Erreur inconnue';
        console.error('❌ Fallback également échoué:', fallbackErrorMessage);
        throw new ServiceError(
          'Opération principale et fallback ont échoué',
          { primaryError, fallbackError }
        );
      }
    }
  }

  static async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    circuitBreakerKey: string,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      monitoringPeriod?: number;
    } = {}
  ): Promise<T> {
    const opts = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      ...options
    };

    const state = this.getCircuitBreakerState(circuitBreakerKey);
    
    // Vérifier l'état du circuit breaker
    if (state.isOpen && Date.now() - state.lastFailure < opts.resetTimeout) {
      throw new ServiceError(`Circuit breaker ouvert pour ${circuitBreakerKey}`);
    }
    
    try {
      const result = await operation();
      
      // Réinitialiser le compteur en cas de succès
      this.resetCircuitBreaker(circuitBreakerKey);
      
      return result;
    } catch (error) {
      // Incrémenter le compteur d'échecs
      this.recordFailure(circuitBreakerKey, opts.failureThreshold);
      throw error;
    }
  }

  private static circuitBreakerStates = new Map<string, {
    failures: number;
    lastFailure: number;
    isOpen: boolean;
  }>();

  private static getCircuitBreakerState(key: string) {
    if (!this.circuitBreakerStates.has(key)) {
      this.circuitBreakerStates.set(key, {
        failures: 0,
        lastFailure: 0,
        isOpen: false
      });
    }
    return this.circuitBreakerStates.get(key)!;
  }

  private static recordFailure(key: string, threshold: number) {
    const state = this.getCircuitBreakerState(key);
    state.failures++;
    state.lastFailure = Date.now();
    
    if (state.failures >= threshold) {
      state.isOpen = true;
      console.warn(`🚨 Circuit breaker ouvert pour ${key} (${state.failures} échecs)`);
    }
  }

  private static resetCircuitBreaker(key: string) {
    const state = this.getCircuitBreakerState(key);
    state.failures = 0;
    state.isOpen = false;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Décorateur pour ajouter automatiquement la récupération
export function withRecovery(options: RecoveryOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return RecoveryService.withRetry(
        () => originalMethod.apply(this, args),
        options
      );
    };
    
    return descriptor;
  };
}

// Utilitaires spécifiques pour les opérations CRUD
export class CrudRecoveryService {
  static async safeCreate<T>(
    service: any,
    data: T,
    options: RecoveryOptions = {}
  ): Promise<string> {
    return RecoveryService.withRetry(
      () => service.create(data),
      {
        ...options,
        onRetry: (attempt, error) => {
          console.warn(`🔄 Retry création (tentative ${attempt}):`, error.message);
        }
      }
    );
  }

  static async safeRead<T>(
    service: any,
    id: string,
    options: RecoveryOptions = {}
  ): Promise<T | null> {
    return RecoveryService.withRetry(
      () => service.getById(id),
      {
        ...options,
        onRetry: (attempt, error) => {
          console.warn(`🔄 Retry lecture ${id} (tentative ${attempt}):`, error.message);
        }
      }
    );
  }

  static async safeUpdate<T>(
    service: any,
    id: string,
    data: Partial<T>,
    options: RecoveryOptions = {}
  ): Promise<void> {
    return RecoveryService.withRetry(
      () => service.update(id, data),
      {
        ...options,
        onRetry: (attempt, error) => {
          console.warn(`🔄 Retry mise à jour ${id} (tentative ${attempt}):`, error.message);
        }
      }
    );
  }

  static async safeDelete(
    service: any,
    id: string,
    options: RecoveryOptions = {}
  ): Promise<void> {
    return RecoveryService.withRetry(
      () => service.delete(id),
      {
        ...options,
        onRetry: (attempt, error) => {
          console.warn(`🔄 Retry suppression ${id} (tentative ${attempt}):`, error.message);
        }
      }
    );
  }

  static async safeQuery<T>(
    service: any,
    filters: any[] = [],
    options: RecoveryOptions = {}
  ): Promise<T[]> {
    return RecoveryService.withRetry(
      () => service.query(filters),
      {
        ...options,
        onRetry: (attempt, error) => {
          console.warn(`🔄 Retry requête (tentative ${attempt}):`, error.message);
        }
      }
    );
  }
}

// Middleware de récupération pour les APIs
export function createRecoveryMiddleware(options: RecoveryOptions = {}) {
  return function (operation: () => Promise<any>) {
    return RecoveryService.withRetry(operation, {
      maxRetries: 2,
      retryDelay: 500,
      ...options,
      onRetry: (attempt, error) => {
        console.warn(`🔄 API Retry (tentative ${attempt}):`, error.message);
        options.onRetry?.(attempt, error);
      }
    });
  };
}

// Utilitaire pour les opérations batch avec récupération partielle
export class BatchRecoveryService {
  static async safeBatchOperation<T>(
    items: T[],
    operation: (item: T) => Promise<any>,
    options: {
      batchSize?: number;
      continueOnError?: boolean;
      recoveryOptions?: RecoveryOptions;
    } = {}
  ): Promise<{
    successful: Array<{ item: T; result: any }>;
    failed: Array<{ item: T; error: Error }>;
  }> {
    const opts = {
      batchSize: 10,
      continueOnError: true,
      recoveryOptions: {},
      ...options
    };

    const successful: Array<{ item: T; result: any }> = [];
    const failed: Array<{ item: T; error: Error }> = [];

    // Traiter par batch
    for (let i = 0; i < items.length; i += opts.batchSize) {
      const batch = items.slice(i, i + opts.batchSize);
      
      const batchPromises = batch.map(async (item) => {
        try {
          const result = await RecoveryService.withRetry(
            () => operation(item),
            opts.recoveryOptions
          );
          successful.push({ item, result });
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          failed.push({ item, error: err });
          
          if (!opts.continueOnError) {
            throw err;
          }
        }
      });

      await Promise.allSettled(batchPromises);
    }

    return { successful, failed };
  }
}

// Monitoring des opérations de récupération
export class RecoveryMonitor {
  private static stats = new Map<string, {
    totalOperations: number;
    successfulOperations: number;
    retriedOperations: number;
    failedOperations: number;
    averageRetries: number;
  }>();

  static recordOperation(
    operationType: string,
    success: boolean,
    retries: number = 0
  ) {
    if (!this.stats.has(operationType)) {
      this.stats.set(operationType, {
        totalOperations: 0,
        successfulOperations: 0,
        retriedOperations: 0,
        failedOperations: 0,
        averageRetries: 0
      });
    }

    const stats = this.stats.get(operationType)!;
    stats.totalOperations++;
    
    if (success) {
      stats.successfulOperations++;
    } else {
      stats.failedOperations++;
    }
    
    if (retries > 0) {
      stats.retriedOperations++;
    }
    
    // Recalculer la moyenne des retries
    stats.averageRetries = (stats.averageRetries * (stats.totalOperations - 1) + retries) / stats.totalOperations;
  }

  static getStats(operationType?: string) {
    if (operationType) {
      return this.stats.get(operationType);
    }
    return Object.fromEntries(this.stats);
  }

  static resetStats(operationType?: string) {
    if (operationType) {
      this.stats.delete(operationType);
    } else {
      this.stats.clear();
    }
  }
}