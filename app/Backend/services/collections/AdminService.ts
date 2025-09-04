// Service pour la gestion des administrateurs
import { BaseService } from '../base/BaseService';
import { AdminUser, AdminUserCore, generateAdminAutoFields } from '../../../models/admin';
import bcrypt from 'bcryptjs';

export class AdminService extends BaseService<AdminUser> {
  constructor() {
    super('admins');
  }

  /**
   * Créer un nouvel administrateur
   */
  async createAdmin(adminData: AdminUserCore, createdBy?: string): Promise<string> {
    // Vérifier si l'email existe déjà
    const existingAdmin = await this.getByEmail(adminData.email);
    if (existingAdmin) {
      throw new Error('Un administrateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    
    const autoFields = generateAdminAutoFields({
      ...adminData,
      password: hashedPassword
    });

    const completeAdmin: AdminUser = {
      ...autoFields,
      createdBy,
      id: ''
    };

    const docRef = await this.collection.add(completeAdmin);
    
    return docRef.id;
  }

  /**
   * Récupérer un admin par email
   */
  async getByEmail(email: string): Promise<AdminUser | null> {
    const snapshot = await this.collection
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as AdminUser;
  }

  /**
   * Vérifier les identifiants de connexion
   */
  async verifyCredentials(email: string, password: string): Promise<AdminUser | null> {
    const admin = await this.getByEmail(email);
    if (!admin || !admin.isActive) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return null;
    }

    // Mettre à jour la date de dernière connexion
    await this.update(admin.id, {
      lastLoginDate: new Date().toISOString()
    });

    return admin;
  }

  /**
   * Changer le mot de passe d'un admin
   */
  async changePassword(adminId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.update(adminId, {
      password: hashedPassword
    });
  }

  /**
   * Désactiver un admin
   */
  async deactivateAdmin(adminId: string): Promise<void> {
    await this.update(adminId, {
      isActive: false
    });
  }

  /**
   * Réactiver un admin
   */
  async activateAdmin(adminId: string): Promise<void> {
    await this.update(adminId, {
      isActive: true
    });
  }

  /**
   * Récupérer tous les admins actifs
   */
  async getActiveAdmins(): Promise<AdminUser[]> {
    try {
      // Essayer d'abord avec l'index composé
      const snapshot = await this.collection
        .where('isActive', '==', true)
        .orderBy('createdDate', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AdminUser));
    } catch (error: any) {
      // Si l'index n'existe pas, utiliser une requête simple
      if (error.code === 9 || error.message?.includes('index')) {
        console.log('⚠️  Index composé non disponible, utilisation d\'une requête simple');
        const snapshot = await this.collection
          .where('isActive', '==', true)
          .get();

        const admins = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AdminUser));

        // Trier manuellement par date de création
        return admins.sort((a, b) => 
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );
      }
      throw error;
    }
  }

  /**
   * Vérifier s'il existe des administrateurs (méthode simple pour l'initialisation)
   */
  async hasAnyAdmins(): Promise<boolean> {
    const snapshot = await this.collection.limit(1).get();
    return !snapshot.empty;
  }
}
