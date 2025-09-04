/**
 * Service d'auto-initialisation de l'administrateur
 * S'exécute automatiquement au démarrage de l'application
 */

import { AdminService } from '../Backend/services/collections/AdminService';
import { AdminPermission } from '../models/admin';

class AutoInitService {
  private static instance: AutoInitService;
  private adminService: AdminService;
  private initialized = false;

  private constructor() {
    this.adminService = new AdminService();
  }

  static getInstance(): AutoInitService {
    if (!AutoInitService.instance) {
      AutoInitService.instance = new AutoInitService();
    }
    return AutoInitService.instance;
  }

  /**
   * Initialise automatiquement l'admin s'il n'existe pas
   */
  async ensureAdminExists(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🔍 Vérification de l\'admin...');
      
      // Vérifier s'il existe des admins
      const hasAdmins = await this.adminService.hasAnyAdmins();
      
      if (!hasAdmins) {
        console.log('🔧 Création automatique de l\'admin...');
        
        const adminData = {
          email: 'tedkouevi701@gmail.com',
          nom: 'Kouevi',
          prenom: 'Ted',
          password: 'feiderus',
          role: 'super-admin' as const,
          permissions: [
            'manage-accounts',
            'manage-users', 
            'manage-admins',
            'view-analytics',
            'manage-content',
            'manage-payments'
          ] as AdminPermission[]
        };

        const adminId = await this.adminService.createAdmin(adminData);
        console.log('✅ Admin créé automatiquement:', adminId);
      } else {
        console.log('ℹ️  Admin existe déjà');
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Erreur auto-init admin:', error);
      // Ne pas bloquer l'application si l'init échoue
    }
  }

  /**
   * Force la recréation de l'admin (pour le développement)
   */
  async forceCreateAdmin(): Promise<string | null> {
    try {
      const adminData = {
        email: 'tedkouevi701@gmail.com',
        nom: 'Kouevi',
        prenom: 'Ted',
        password: 'feiderus',
        role: 'super-admin' as const,
        permissions: [
          'manage-accounts',
          'manage-users', 
          'manage-admins',
          'view-analytics',
          'manage-content',
          'manage-payments'
        ] as AdminPermission[]
      };

      const adminId = await this.adminService.createAdmin(adminData);
      console.log('✅ Admin forcé:', adminId);
      return adminId;
    } catch (error) {
      console.error('❌ Erreur création forcée:', error);
      return null;
    }
  }
}

export const autoInitService = AutoInitService.getInstance();
