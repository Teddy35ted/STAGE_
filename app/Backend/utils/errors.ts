// Classe de base pour les erreurs du service
export class ServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public details?: any;
  public readonly timestamp: string;

  constructor(
    message: string,
    originalError?: any,
    code: string = 'SERVICE_ERROR',
    statusCode: number = 500
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    
    if (originalError) {
      this.details = {
        originalMessage: originalError.message,
        stack: originalError.stack,
      };
    }

    // Maintenir la stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }
  }
}

// Erreurs spécifiques
export class ValidationError extends ServiceError {
  constructor(message: string, field?: string) {
    super(message, null, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    if (field) {
      this.details = { field };
    }
  }
}

export class NotFoundError extends ServiceError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} avec l'ID ${id} introuvable`
      : `${resource} introuvable`;
    super(message, null, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
    this.details = { resource, id };
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message: string = 'Authentification requise') {
    super(message, null, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ServiceError {
  constructor(message: string = 'Permissions insuffisantes') {
    super(message, null, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string, conflictingField?: string) {
    super(message, null, 'CONFLICT_ERROR', 409);
    this.name = 'ConflictError';
    if (conflictingField) {
      this.details = { conflictingField };
    }
  }
}

export class RateLimitError extends ServiceError {
  constructor(message: string = 'Trop de requêtes') {
    super(message, null, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

// Gestionnaire d'erreurs centralisé
export class ErrorHandler {
  static handle(error: any): ServiceError {
    // Si c'est déjà une ServiceError, la retourner telle quelle
    if (error instanceof ServiceError) {
      return error;
    }

    // Gestion des erreurs Firebase spécifiques
    if (error.code) {
      return this.handleFirebaseError(error);
    }

    // Erreur générique
    return new ServiceError(
      error.message || 'Une erreur interne est survenue',
      error
    );
  }

  private static handleFirebaseError(error: any): ServiceError {
    const { code, message } = error;

    switch (code) {
      case 'permission-denied':
        return new AuthorizationError('Permissions insuffisantes pour cette opération');
      
      case 'not-found':
        return new NotFoundError('Document', 'spécifié');
      
      case 'already-exists':
        return new ConflictError('Le document existe déjà');
      
      case 'invalid-argument':
        return new ValidationError('Arguments invalides fournis');
      
      case 'failed-precondition':
        return new ValidationError('Conditions préalables non remplies');
      
      case 'resource-exhausted':
        return new RateLimitError('Quota Firebase dépassé');
      
      case 'unauthenticated':
        return new AuthenticationError('Authentification Firebase requise');
      
      case 'deadline-exceeded':
        return new ServiceError('Timeout de la requête Firebase', error, 'TIMEOUT_ERROR', 408);
      
      case 'unavailable':
        return new ServiceError('Service Firebase temporairement indisponible', error, 'SERVICE_UNAVAILABLE', 503);
      
      default:
        return new ServiceError(`Erreur Firebase: ${message}`, error, `FIREBASE_${code.toUpperCase()}`, 500);
    }
  }

  // Formatage des erreurs pour les réponses API
  static formatForResponse(error: ServiceError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        timestamp: error.timestamp,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.details,
          stack: error.stack,
        }),
      },
    };
  }

  // Logging des erreurs
  static log(error: ServiceError, context?: any) {
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: error.timestamp,
        stack: error.stack,
      },
      context,
    };

    if (error.statusCode >= 500) {
      console.error('🔴 Erreur serveur:', logData);
    } else if (error.statusCode >= 400) {
      console.warn('🟡 Erreur client:', logData);
    } else {
      console.info('ℹ️ Information:', logData);
    }
  }
}

// Décorateur pour la gestion automatique des erreurs
export function handleErrors(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      return await method.apply(this, args);
    } catch (error) {
      const serviceError = ErrorHandler.handle(error);
      ErrorHandler.log(serviceError, {
        service: target.constructor.name,
        method: propertyName,
        args: args.length,
      });
      throw serviceError;
    }
  };

  return descriptor;
}

// Types pour la gestion des erreurs
export interface ErrorContext {
  service?: string;
  method?: string;
  userId?: string;
  requestId?: string;
  additionalInfo?: any;
}

export interface ErrorLog {
  level: 'error' | 'warn' | 'info';
  message: string;
  error: ServiceError;
  context?: ErrorContext;
  timestamp: string;
}