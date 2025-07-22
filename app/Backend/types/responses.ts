// Types de réponse standardisés
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ResponseMeta {
  total?: number;
  page?: number;
  limit?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Types pour les opérations CRUD
export interface CreateResponse {
  id: string;
  message: string;
}

export interface UpdateResponse {
  message: string;
  updatedFields?: string[];
}

export interface DeleteResponse {
  message: string;
  deletedId: string;
}

export interface BatchResponse {
  processed: number;
  failed: number;
  errors?: BatchError[];
}

export interface BatchError {
  index: number;
  error: string;
}

// Types pour les requêtes
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface FilterRequest {
  filters?: {
    field: string;
    operator: string;
    value: any;
  }[];
}

export interface SearchRequest extends PaginatedRequest, FilterRequest {
  query?: string;
  searchFields?: string[];
}