import { NextRequest } from 'next/server';
import { adminAuth } from '../config/firebase-admin';
import { CoGestionnaireAuthService, CoGestionnaireAuthContext } from '../services/auth/CoGestionnaireAuthService';
import { AuditLogService } from '../services/collections/AuditLogService';
import { PermissionAction, PermissionResource } from '../../models/co_gestionnaire';
import { AuditLogCore } from '../../models/audit_log';

export interface AuthResult {
  isAuthenticated: boolean;
  context?: CoGestionnaireAuthContext;
  error?: string;
}

export class PermissionMiddleware {
  private authService: CoGestionnaireAuthService;
  private auditService: AuditLogService;

  constructor() {
    this.authService = new CoGestionnaireAuthService();
    this.auditService = new AuditLogService();
  }

  /**
   * Vérifie l'authentification et retourne le contexte d'autorisation
   */
  async verifyAuthentication(request: NextRequest): Promise<AuthResult> {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { isAuthenticated: false, error: 'Token manquant' };
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      const context = await this.authService.getAuthContext(decodedToken);
      
      // VALIDATION SUPPLÉMENTAIRE: Si c'est un co-gestionnaire, vérifier qu'il est toujours actif
      if (context.isCoGestionnaire && context.coGestionnaireId) {
        const isActive = await this.authService.isCoGestionnaireActive(context.coGestionnaireId);
        if (!isActive) {
          console.log('❌ Co-gestionnaire inactif/supprimé tentant d\'accéder aux ressources:', context.coGestionnaireId);
          return { 
            isAuthenticated: false, 
            error: 'Co-gestionnaire inactif ou supprimé - accès révoqué' 
          };
        }
      }
      
      return { isAuthenticated: true, context };
    } catch (error) {
      console.error('❌ Erreur vérification authentification:', error);
      return { isAuthenticated: false, error: 'Token invalide' };
    }
  }

  /**
   * Vérifie qu'un utilisateur/co-gestionnaire a la permission pour une action sur une ressource
   */
  async checkResourcePermission(
    context: CoGestionnaireAuthContext,
    resource: PermissionResource,
    action: PermissionAction
  ): Promise<boolean> {
    try {
      // Les propriétaires principaux ont toutes les permissions
      if (!context.isCoGestionnaire) {
        return true;
      }

      // Vérifier les permissions du co-gestionnaire
      const resourcePermissions = context.permissions[resource] || [];
      return resourcePermissions.includes(action);
    } catch (error) {
      console.error('❌ Erreur vérification permission ressource:', error);
      return false;
    }
  }

  /**
   * Vérifie qu'un utilisateur a accès aux données d'un propriétaire
   * (pour les co-gestionnaires, vérifie qu'ils travaillent pour ce propriétaire)
   */
  async validateDataAccess(
    context: CoGestionnaireAuthContext,
    dataOwnerId: string
  ): Promise<boolean> {
    try {
      // Si c'est le propriétaire principal, vérifier que c'est ses données
      if (!context.isCoGestionnaire) {
        return context.proprietaireId === dataOwnerId;
      }

      // Si c'est un co-gestionnaire, vérifier qu'il travaille pour ce propriétaire
      return context.proprietaireId === dataOwnerId;
    } catch (error) {
      console.error('❌ Erreur validation accès données:', error);
      return false;
    }
  }

  /**
   * Middleware complet pour vérifier l'authentification et les permissions
   */
  async verifyPermission(
    request: NextRequest,
    resource: PermissionResource,
    action: PermissionAction
  ): Promise<{
    isAuthorized: boolean;
    context?: CoGestionnaireAuthContext;
    error?: string;
  }> {
    try {
      // Vérifier l'authentification
      const authResult = await this.verifyAuthentication(request);
      if (!authResult.isAuthenticated || !authResult.context) {
        return { 
          isAuthorized: false, 
          error: authResult.error || 'Non authentifié' 
        };
      }

      // Vérifier les permissions
      const hasPermission = await this.checkResourcePermission(
        authResult.context,
        resource,
        action
      );

      if (!hasPermission) {
        return { 
          isAuthorized: false, 
          error: `Permission refusée pour ${action} sur ${resource}` 
        };
      }

      return { isAuthorized: true, context: authResult.context };
    } catch (error) {
      console.error('❌ Erreur middleware permission:', error);
      return { isAuthorized: false, error: 'Erreur interne' };
    }
  }

  /**
   * Génère un filtre de données basé sur le contexte d'authentification
   */
  getDataFilter(context: CoGestionnaireAuthContext): { field: string; value: string } {
    // Toujours filtrer par le propriétaire principal (même pour les co-gestionnaires)
    return {
      field: context.isCoGestionnaire ? 'idCreateur' : 'idCreateur', // ou idProprietaire selon le contexte
      value: context.proprietaireId
    };
  }

  /**
   * Logs d'audit pour les actions des co-gestionnaires avec persistance en base
   */
  async logCoGestionnaireAction(
    context: CoGestionnaireAuthContext,
    resource: PermissionResource,
    action: PermissionAction,
    resourceId?: string,
    request?: NextRequest,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    if (context.isCoGestionnaire && context.coGestionnaireInfo) {
      const logData: AuditLogCore = {
        coGestionnaireId: context.coGestionnaireId!,
        coGestionnaireNom: context.coGestionnaireInfo.nom,
        coGestionnairePrenom: context.coGestionnaireInfo.prenom,
        proprietaireId: context.proprietaireId,
        action,
        resource,
        resourceId,
        details: `Action ${action} sur ${resource}${resourceId ? ` (ID: ${resourceId})` : ''}`,
        ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
        userAgent: request?.headers.get('user-agent') || 'unknown',
        success,
        errorMessage
      };

      try {
        // Persister le log en base de données
        await this.auditService.create({
          ...logData,
          timestamp: new Date().toISOString()
        });

        // Log console pour développement
        const statusIcon = success ? '✅' : '❌';
        console.log(`📋 ${statusIcon} Action co-gestionnaire: ${context.coGestionnaireInfo.nom} ${context.coGestionnaireInfo.prenom} a effectué ${action} sur ${resource}${resourceId ? ` (ID: ${resourceId})` : ''} pour le compte de ${context.proprietaireId}`);
      } catch (error) {
        console.error('❌ Erreur persistance log audit:', error);
        // Ne pas empêcher l'action principale même si le log échoue
      }
    }
  }
}

// Instance singleton
export const permissionMiddleware = new PermissionMiddleware();
