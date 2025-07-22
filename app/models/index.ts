// ===== INDEX DES MODÈLES - ORGANISATION DASHBOARD =====
// Exportation centralisée des modèles par ordre d'importance

// === PRIORITÉ 1: UTILISATEURS ===
export * from './user';
export type {
  UserCore,
  UserDashboard,
  UserDashboardDisplay
} from './user';

// === PRIORITÉ 2: LAALAS (Projets/Contenus principaux) ===
export * from './laala';
export type {
  LaalaCore,
  LaalaDashboard,
  LaalaDashboardDisplay,
  LaalaQuickCreate,
  LaalaStats
} from './laala';

// === PRIORITÉ 3: CONTENUS (Médias) ===
export * from './contenu';
export type {
  ContenuCore,
  ContenuDashboard,
  ContenuDashboardDisplay,
  ContenuQuickCreate,
  ContenuStats,
  ContenuFilters
} from './contenu';

// === PRIORITÉ 4: MESSAGES (En attente) ===
export * from './message';

// ===== INTERFACES GLOBALES DASHBOARD =====

// Interface principale pour les statistiques du dashboard
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    certified: number;
    newThisMonth: number;
  };
  laalas: {
    total: number;
    active: number;
    completed: number;
    totalViews: number;
    totalLikes: number;
  };
  contenus: {
    total: number;
    images: number;
    videos: number;
    texts: number;
    totalViews: number;
    totalLikes: number;
  };
  engagement: {
    dailyActiveUsers: number;
    avgSessionTime: number;
    contentCreationRate: number;
    interactionRate: number;
  };
}

// Interface pour les données de création rapide
export interface QuickCreateData {
  user?: {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    pays: string;
    ville: string;
  };
  laala?: {
    nom: string;
    description: string;
    idCreateur: string;
    type?: string;
  };
  contenu?: {
    nom: string;
    idCreateur: string;
    idLaala: string;
    type: 'image' | 'video' | 'texte';
    src?: string;
  };
}

// Interface pour les filtres globaux du dashboard
export interface DashboardFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  userFilters?: {
    country?: string;
    city?: string;
    certified?: boolean;
    active?: boolean;
  };
  contentFilters?: {
    type?: 'laala' | 'contenu';
    category?: string;
    minViews?: number;
    minLikes?: number;
  };
}

// Interface pour les actions en lot
export interface BulkActions {
  users?: {
    ids: string[];
    action: 'activate' | 'deactivate' | 'certify' | 'delete';
  };
  laalas?: {
    ids: string[];
    action: 'feature' | 'unfeature' | 'archive' | 'delete';
  };
  contenus?: {
    ids: string[];
    action: 'approve' | 'reject' | 'feature' | 'delete';
  };
}

// Types utilitaires pour le dashboard
export type EntityType = 'user' | 'laala' | 'contenu' | 'message';
export type SortOrder = 'asc' | 'desc';
export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

// Interface pour les notifications dashboard
export interface DashboardNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  entityType?: EntityType;
  entityId?: string;
}

// Interface pour les métriques en temps réel
export interface RealTimeMetrics {
  activeUsers: number;
  onlineUsers: number;
  newRegistrations: number;
  newContent: number;
  systemLoad: number;
  lastUpdated: string;
}

// Constantes pour le dashboard
export const DASHBOARD_CONSTANTS = {
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  CACHE: {
    STATS_TTL: 300, // 5 minutes
    METRICS_TTL: 60  // 1 minute
  },
  LIMITS: {
    MAX_BULK_ACTIONS: 50,
    MAX_EXPORT_RECORDS: 1000
  }
} as const;

// Types pour l'export de données
export interface ExportOptions {
  entityType: EntityType;
  format: 'csv' | 'json' | 'xlsx';
  fields?: string[];
  filters?: DashboardFilters;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Interface pour les rapports
export interface DashboardReport {
  id: string;
  name: string;
  type: 'users' | 'content' | 'engagement' | 'revenue';
  schedule?: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  lastGenerated?: string;
  nextGeneration?: string;
}