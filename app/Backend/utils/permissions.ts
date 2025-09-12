// ===== SYSTÈME DE PERMISSIONS =====
// Gestion des autorisations pour les opérations CRUD

export interface PermissionContext {
  userId: string;
  operation: 'create' | 'read' | 'update' | 'delete';
  resource: string;
  resourceId?: string;
  resourceData?: any;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

// Configuration des permissions par défaut (très permissive pour le développement)
export const DEFAULT_PERMISSIONS = {
  // Autorisations par défaut pour chaque opération
  create: true,
  read: true,
  update: true,
  delete: true,
  
  // Autorisations spécifiques par ressource
  contenus: {
    create: true,
    read: true,
    update: true, // L'utilisateur peut modifier ses propres contenus
    delete: true  // L'utilisateur peut supprimer ses propres contenus
  },
  
  laalas: {
    create: true,
    read: true,
    update: true,
    delete: true
  },
  
  messages: {
    create: true,
    read: true,
    update: true,
    delete: true
  },
  
  boutiques: {
    create: true,
    read: true,
    update: true,
    delete: true
  },
  
  retraits: {
    create: true,
    read: true,
    update: true,
    delete: true
  },
  
  users: {
    create: true,
    read: true,
    update: true, // L'utilisateur peut modifier son propre profil
    delete: false // Pas de suppression d'utilisateurs par défaut
  }
};

// Fonction principale de vérification des permissions
export function checkPermission(context: PermissionContext): PermissionResult {
  // Pour le développement, on autorise tout par défaut
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true, reason: 'Mode développement' };
  }
  
  // Vérifier les permissions générales
  const generalPermission = DEFAULT_PERMISSIONS[context.operation];
  if (!generalPermission) {
    return { 
      allowed: false, 
      reason: `Opération ${context.operation} non autorisée par défaut` 
    };
  }
  
  // Vérifier les permissions spécifiques à la ressource
  const resourcePermissions = DEFAULT_PERMISSIONS[context.resource as keyof typeof DEFAULT_PERMISSIONS];
  if (resourcePermissions && typeof resourcePermissions === 'object') {
    const specificPermission = resourcePermissions[context.operation];
    if (specificPermission === false) {
      return { 
        allowed: false, 
        reason: `Opération ${context.operation} non autorisée pour ${context.resource}` 
      };
    }
  }
  
  // Vérifications spécifiques selon l'opération
  switch (context.operation) {
    case 'update':
    case 'delete':
      return checkOwnershipPermission(context);
    
    case 'create':
    case 'read':
    default:
      return { allowed: true, reason: 'Permission accordée' };
  }
}

// Vérification de propriété pour les opérations sensibles
function checkOwnershipPermission(context: PermissionContext): PermissionResult {
  // Si pas de données de ressource, on autorise (sera vérifié au niveau du service)
  if (!context.resourceData) {
    return { allowed: true, reason: 'Vérification de propriété différée' };
  }
  
  // Vérifier si l'utilisateur est le propriétaire
  const isOwner = context.resourceData.idCreateur === context.userId ||
                  context.resourceData.idProprietaire === context.userId ||
                  context.resourceData.idExpediteur === context.userId ||
                  context.resourceData.id === context.userId;
  
  if (isOwner) {
    return { allowed: true, reason: 'Propriétaire de la ressource' };
  }
  
  // Pour le développement, on autorise même si pas propriétaire
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true, reason: 'Mode développement - non-propriétaire autorisé' };
  }
  
  return { 
    allowed: false, 
    reason: 'Vous n\'êtes pas autorisé à modifier cette ressource' 
  };
}

// Middleware de permissions pour les APIs
export function createPermissionMiddleware(resource: string) {
  return function checkApiPermission(
    userId: string,
    operation: 'create' | 'read' | 'update' | 'delete',
    resourceId?: string,
    resourceData?: any
  ): PermissionResult {
    return checkPermission({
      userId,
      operation,
      resource,
      resourceId,
      resourceData
    });
  };
}

// Fonctions utilitaires pour les permissions spécifiques
export const PermissionUtils = {
  // Vérifier si l'utilisateur peut créer une ressource
  canCreate: (userId: string, resource: string): boolean => {
    return checkPermission({
      userId,
      operation: 'create',
      resource
    }).allowed;
  },
  
  // Vérifier si l'utilisateur peut lire une ressource
  canRead: (userId: string, resource: string, resourceData?: any): boolean => {
    return checkPermission({
      userId,
      operation: 'read',
      resource,
      resourceData
    }).allowed;
  },
  
  // Vérifier si l'utilisateur peut modifier une ressource
  canUpdate: (userId: string, resource: string, resourceData: any): boolean => {
    return checkPermission({
      userId,
      operation: 'update',
      resource,
      resourceData
    }).allowed;
  },
  
  // Vérifier si l'utilisateur peut supprimer une ressource
  canDelete: (userId: string, resource: string, resourceData: any): boolean => {
    return checkPermission({
      userId,
      operation: 'delete',
      resource,
      resourceData
    }).allowed;
  }
};

// Configuration des permissions par rôle (pour usage futur)
export const ROLE_PERMISSIONS = {
  admin: {
    '*': ['create', 'read', 'update', 'delete']
  },
  
  user: {
    contenus: ['create', 'read', 'update', 'delete'],
    laalas: ['create', 'read', 'update', 'delete'],
    messages: ['create', 'read', 'update', 'delete'],
    boutiques: ['create', 'read', 'update', 'delete'],
    retraits: ['create', 'read', 'update', 'delete'],
    users: ['read', 'update'] // Pas de création/suppression d'utilisateurs
  },
  
  guest: {
    contenus: ['read'],
    laalas: ['read'],
    boutiques: ['read']
  }
};

// Fonction pour obtenir le rôle d'un utilisateur (simplifié pour le moment)
export function getUserRole(userId: string): string {
  // Pour le moment, tous les utilisateurs authentifiés sont des "user"
  return userId ? 'user' : 'guest';
}

// Vérification des permissions basée sur les rôles
export function checkRolePermission(
  userId: string,
  resource: string,
  operation: string
): PermissionResult {
  const userRole = getUserRole(userId);
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  
  if (!rolePermissions) {
    return { allowed: false, reason: 'Rôle non reconnu' };
  }
  
  // Vérifier les permissions globales (admin)
  if ('*' in rolePermissions && rolePermissions['*'] && rolePermissions['*'].includes(operation)) {
    return { allowed: true, reason: 'Permission globale accordée' };
  }
  
  // Vérifier les permissions spécifiques à la ressource
  const resourcePermissions = rolePermissions[resource as keyof typeof rolePermissions] as string[] | undefined;
  if (resourcePermissions && Array.isArray(resourcePermissions) && resourcePermissions.includes(operation)) {
    return { allowed: true, reason: 'Permission spécifique accordée' };
  }
  
  return { 
    allowed: false, 
    reason: `Rôle ${userRole} non autorisé pour ${operation} sur ${resource}` 
  };
}