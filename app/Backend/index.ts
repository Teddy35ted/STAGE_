// Export principal du Backend
export * from './services';
export * from './types';
export * from './config/database';

// Services principaux
export { AnimatorsService } from './services/collections/AnimatorsService';
// export { EventsService } from './services/collections/EventsService';

// Configuration
export { adminDb, adminAuth } from './config/firebase-admin';

// Utilitaires principaux (import explicite pour éviter les conflits)
export { 
  ServiceError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  RateLimitError,
  ErrorHandler
} from './utils/errors';

export { 
  Validator, 
  AnimatorValidator, 
  EventValidator 
} from './utils/validators';

export { DataFormatter, BusinessCalculator } from './utils/formatters';