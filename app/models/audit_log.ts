export interface AuditLog {
  id: string;
  timestamp: string;
  coGestionnaireId: string;
  coGestionnaireNom: string;
  coGestionnairePrenom: string;
  proprietaireId: string;
  action: string; // 'create', 'read', 'update', 'delete'
  resource: string; // 'laalas', 'contenus', etc.
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogCore {
  coGestionnaireId: string;
  coGestionnaireNom: string;
  coGestionnairePrenom: string;
  proprietaireId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}
