import { CoGestionnaire, PermissionAction, PermissionResource } from '../../../models/co_gestionnaire';
import { CoGestionnaireService } from '../collections/CoGestionnaireService';
import { UserService } from '../collections/UserService';
import bcrypt from 'bcryptjs';
import { adminAuth } from '../../config/firebase-admin';

export interface CoGestionnaireAuthContext {
  isCoGestionnaire: boolean;
  coGestionnaireId?: string;
  proprietaireId: string; // ID du compte principal
  permissions: {
    laalas: PermissionAction[];
    contenus: PermissionAction[];
    communications: PermissionAction[];
    campaigns: PermissionAction[];
  };
  coGestionnaireInfo?: CoGestionnaire;
}

export class CoGestionnaireAuthService {
  private coGestionnaireService: CoGestionnaireService;
  private userService: UserService;

  constructor() {
    this.coGestionnaireService = new CoGestionnaireService();
    this.userService = new UserService();
  }

  /**
   * Crée un co-gestionnaire avec mot de passe
   */
  async createCoGestionnaire(
    coGestionnaireData: Omit<CoGestionnaire, 'id' | 'password' | 'isPasswordSet'>,
    plainPassword: string
  ): Promise<string> {
    try {
      console.log('👤 Création co-gestionnaire avec authentification...');
      
      // Vérifier que l'email n'existe pas déjà
      const existingCoGestionnaire = await this.coGestionnaireService.getByEmail(coGestionnaireData.email);
      if (existingCoGestionnaire) {
        throw new Error('Un co-gestionnaire avec cet email existe déjà');
      }

      // Vérifier que l'email n'est pas déjà utilisé par un utilisateur principal
      const existingUser = await this.userService.getByEmail(coGestionnaireData.email);
      if (existingUser) {
        throw new Error('Cet email est déjà utilisé par un compte principal');
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      // Créer le co-gestionnaire
      const completeCoGestionnaireData: Omit<CoGestionnaire, 'id'> = {
        ...coGestionnaireData,
        password: hashedPassword,
        isPasswordSet: true,
        isTemporaryPassword: true, // Marquer comme mot de passe temporaire
        mustChangePassword: true, // Forcer le changement
        role: 'assistant', // Toujours assistant
        statut: 'actif'
      };

      const id = await this.coGestionnaireService.create(completeCoGestionnaireData);
      console.log('✅ Co-gestionnaire créé avec ID:', id);
      
      return id;
    } catch (error) {
      console.error('❌ Erreur création co-gestionnaire:', error);
      throw error;
    }
  }

  /**
   * Authentifie un co-gestionnaire
   */
  async authenticateCoGestionnaire(email: string, password: string): Promise<{
    coGestionnaire: CoGestionnaire;
    proprietaireId: string;
    authToken: string;
  }> {
    try {
      console.log('🔐 Authentification co-gestionnaire:', email);

      // Rechercher le co-gestionnaire par email
      const coGestionnaire = await this.coGestionnaireService.getByEmail(email);
      if (!coGestionnaire || coGestionnaire.statut !== 'actif') {
        throw new Error('Co-gestionnaire non trouvé ou inactif');
      }

      // Vérifier le mot de passe
      if (!coGestionnaire.password || !coGestionnaire.isPasswordSet) {
        throw new Error('Mot de passe non défini pour ce co-gestionnaire');
      }

      const isValidPassword = await bcrypt.compare(password, coGestionnaire.password);
      if (!isValidPassword) {
        throw new Error('Mot de passe incorrect');
      }

      // Créer un token personnalisé Firebase pour l'authentification
      // Le token contiendra l'ID du propriétaire comme UID et des claims personnalisés
      const customClaims = {
        isCoGestionnaire: true,
        coGestionnaireId: coGestionnaire.id,
        proprietaireId: coGestionnaire.idProprietaire,
        permissions: this.formatPermissions(coGestionnaire.permissions || [])
      };

      const authToken = await adminAuth.createCustomToken(coGestionnaire.idProprietaire, customClaims);

      // Mettre à jour la dernière connexion
      await this.coGestionnaireService.update(coGestionnaire.id, {
        lastLogin: new Date().toISOString()
      });

      console.log('✅ Co-gestionnaire authentifié:', coGestionnaire.nom);

      return {
        coGestionnaire,
        proprietaireId: coGestionnaire.idProprietaire,
        authToken
      };
    } catch (error) {
      console.error('❌ Erreur authentification co-gestionnaire:', error);
      throw error;
    }
  }

  /**
   * Vérifie les permissions d'un co-gestionnaire pour une action sur une ressource
   */
  async checkPermission(
    coGestionnaireId: string,
    resource: PermissionResource,
    action: PermissionAction
  ): Promise<boolean> {
    try {
      const coGestionnaire = await this.coGestionnaireService.getById(coGestionnaireId);
      if (!coGestionnaire || coGestionnaire.statut !== 'actif') {
        return false;
      }

      const resourcePermission = coGestionnaire.permissions?.find(p => p.resource === resource);
      return resourcePermission?.actions.includes(action) || false;
    } catch (error) {
      console.error('❌ Erreur vérification permission:', error);
      return false;
    }
  }

  /**
   * Obtient le contexte d'authentification à partir d'un token décodé
   */
  async getAuthContext(decodedToken: any): Promise<CoGestionnaireAuthContext> {
    const isCoGestionnaire = decodedToken.isCoGestionnaire || false;
    
    if (!isCoGestionnaire) {
      // Utilisateur principal
      return {
        isCoGestionnaire: false,
        proprietaireId: decodedToken.uid,
        permissions: {
          laalas: ['create', 'read', 'update', 'delete'],
          contenus: ['create', 'read', 'update', 'delete'],
          communications: ['create', 'read', 'update', 'delete'],
          campaigns: ['create', 'read', 'update', 'delete']
        }
      };
    }

    // Co-gestionnaire
    const coGestionnaireId = decodedToken.coGestionnaireId;
    const proprietaireId = decodedToken.proprietaireId;
    const permissions = decodedToken.permissions || {};

    const coGestionnaireInfo = await this.coGestionnaireService.getById(coGestionnaireId);

    return {
      isCoGestionnaire: true,
      coGestionnaireId,
      proprietaireId,
      permissions,
      coGestionnaireInfo: coGestionnaireInfo || undefined
    };
  }

  /**
   * Formate les permissions pour les claims JWT
   */
  private formatPermissions(permissions: any[]): {
    laalas: PermissionAction[];
    contenus: PermissionAction[];
    communications: PermissionAction[];
    campaigns: PermissionAction[];
  } {
    const formatted = {
      laalas: [] as PermissionAction[],
      contenus: [] as PermissionAction[],
      communications: [] as PermissionAction[],
      campaigns: [] as PermissionAction[]
    };

    permissions.forEach(permission => {
      if (permission.resource && permission.actions) {
        formatted[permission.resource as PermissionResource] = permission.actions;
      }
    });

    return formatted;
  }

  /**
   * Valide qu'un co-gestionnaire a accès aux données d'un propriétaire
   */
  async validateAccess(coGestionnaireId: string, proprietaireId: string): Promise<boolean> {
    try {
      const coGestionnaire = await this.coGestionnaireService.getById(coGestionnaireId);
      
      // Vérifications de sécurité strictes
      if (!coGestionnaire) {
        console.log('❌ Co-gestionnaire non trouvé pour validation accès:', coGestionnaireId);
        return false;
      }
      
      if (coGestionnaire.idProprietaire !== proprietaireId) {
        console.log('❌ Co-gestionnaire ne correspond pas au propriétaire:', {
          coGestionnaireId,
          proprietaireActuel: coGestionnaire.idProprietaire,
          proprietaireAttendu: proprietaireId
        });
        return false;
      }
      
      if (coGestionnaire.statut !== 'actif') {
        console.log('❌ Co-gestionnaire inactif/suspendu:', {
          coGestionnaireId,
          statut: coGestionnaire.statut
        });
        return false;
      }
      
      console.log('✅ Accès validé pour co-gestionnaire:', coGestionnaire.nom, coGestionnaire.prenom);
      return true;
    } catch (error) {
      console.error('❌ Erreur validation accès:', error);
      return false;
    }
  }

  /**
   * Vérifie si un co-gestionnaire est encore actif (pour validation de token)
   */
  async isCoGestionnaireActive(coGestionnaireId: string): Promise<boolean> {
    try {
      const coGestionnaire = await this.coGestionnaireService.getById(coGestionnaireId);
      return coGestionnaire?.statut === 'actif';
    } catch (error) {
      console.error('❌ Erreur vérification statut co-gestionnaire:', error);
      return false;
    }
  }

  /**
   * Change le mot de passe d'un co-gestionnaire
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      console.log('🔐 Changement de mot de passe pour:', userId);

      // Rechercher le co-gestionnaire par ID
      const coGestionnaire = await this.coGestionnaireService.getById(userId);
      if (!coGestionnaire || coGestionnaire.statut !== 'actif') {
        throw new Error('Co-gestionnaire non trouvé ou inactif');
      }

      // Vérifier le mot de passe actuel
      if (!coGestionnaire.password || !coGestionnaire.isPasswordSet) {
        throw new Error('Mot de passe non défini pour ce co-gestionnaire');
      }

      const isValidPassword = await bcrypt.compare(currentPassword, coGestionnaire.password);
      if (!isValidPassword) {
        console.log('❌ Mot de passe actuel incorrect');
        return false;
      }

      // Hacher le nouveau mot de passe
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Mettre à jour le mot de passe
      await this.coGestionnaireService.update(userId, {
        password: hashedNewPassword,
        isPasswordSet: true,
        passwordChangedAt: new Date().toISOString(),
        // Marquer que le mot de passe n'est plus temporaire
        isTemporaryPassword: false
      });

      console.log('✅ Mot de passe changé avec succès pour:', coGestionnaire.nom);
      return true;
    } catch (error) {
      console.error('❌ Erreur changement de mot de passe:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un co-gestionnaire doit changer son mot de passe
   */
  async requiresPasswordChange(userId: string): Promise<boolean> {
    try {
      const coGestionnaire = await this.coGestionnaireService.getById(userId);
      if (!coGestionnaire) {
        return false;
      }

      // Si c'est un mot de passe temporaire ou si c'est la première connexion
      return coGestionnaire.isTemporaryPassword === true || !coGestionnaire.passwordChangedAt;
    } catch (error) {
      console.error('❌ Erreur vérification changement mot de passe requis:', error);
      return false;
    }
  }
}
