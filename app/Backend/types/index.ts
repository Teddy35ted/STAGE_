// Export des types de collections
export * from './collections';

// Export des types de réponses
export * from './responses';

// Types utilitaires
export type DocumentId = string;
export type CollectionName = string;
export type Timestamp = import('firebase-admin/firestore').Timestamp;

// Types pour les services
export interface ServiceOptions {
  validateInput?: boolean;
  includeMetadata?: boolean;
  softDelete?: boolean;
}

// Types pour les middlewares
export interface AuthenticatedRequest {
  userId: string;
  userRole: string;
  permissions: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}