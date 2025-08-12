import { BaseService } from '../base/BaseService';
import { AuditLog } from '../../../models/audit_log';
import { COLLECTIONS } from '../../config/database';

export class AuditLogService extends BaseService<AuditLog> {
  constructor() {
    super(COLLECTIONS.AUDIT_LOGS);
  }

  /**
   * Récupère les logs d'audit pour un propriétaire
   */
  async getLogsByProprietaire(proprietaireId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.query([
      { field: 'proprietaireId', operator: '==', value: proprietaireId }
    ], {
      limit,
      orderBy: 'timestamp',
      orderDirection: 'desc'
    });
  }

  /**
   * Récupère les logs d'audit pour un co-gestionnaire spécifique
   */
  async getLogsByCoGestionnaire(coGestionnaireId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.query([
      { field: 'coGestionnaireId', operator: '==', value: coGestionnaireId }
    ], {
      limit,
      orderBy: 'timestamp',
      orderDirection: 'desc'
    });
  }

  /**
   * Récupère les logs d'audit pour une ressource spécifique
   */
  async getLogsByResource(resource: string, resourceId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.query([
      { field: 'resource', operator: '==', value: resource },
      { field: 'resourceId', operator: '==', value: resourceId }
    ], {
      limit,
      orderBy: 'timestamp',
      orderDirection: 'desc'
    });
  }
}
