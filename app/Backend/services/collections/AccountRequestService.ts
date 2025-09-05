// Service pour la gestion des demandes de création de compte
import { BaseService } from '../base/BaseService';
import { AccountRequest, AccountRequestCore, generateAccountRequestAutoFields } from '../../../models/account-request';
import { NotificationService } from './NotificationService';
import { EmailService } from '../email/EmailService';
import { PasswordGeneratorService } from '../utils/PasswordGeneratorService';
import { AdminService } from './AdminService';
import { UserService } from './UserService';
import { COLLECTIONS } from '../../config/firebase-admin';
import crypto from 'crypto';

export class AccountRequestService extends BaseService<AccountRequest> {
  private notificationService: NotificationService;
  private emailService: EmailService;
  private adminService: AdminService;
  private userService: UserService;

  constructor() {
    super(COLLECTIONS.ACCOUNT_REQUESTS);
    this.notificationService = new NotificationService();
    this.emailService = new EmailService();
    this.adminService = new AdminService();
    this.userService = new UserService();
  }

  /**
   * Créer une nouvelle demande de compte
   */
  async createRequest(requestData: AccountRequestCore): Promise<string> {
    try {
      console.log('🔍 AccountRequestService.createRequest() - Démarrage');
      console.log('📧 Email de la demande:', requestData.email);
      
      // Vérifier si une demande existe déjà pour cet email
      const existingRequest = await this.getByEmail(requestData.email);
      if (existingRequest && existingRequest.status === 'pending') {
        console.log('❌ Demande déjà existante pour:', requestData.email);
        throw new Error('Une demande est déjà en cours de traitement pour cet email');
      }

      console.log('✅ Aucune demande existante, création...');
      
      // Générer les champs automatiques
      const autoFields = generateAccountRequestAutoFields(requestData);
      console.log('📝 Données à créer:', autoFields);
      
      // Utiliser la méthode create héritée de BaseService
      const documentId = await this.create(autoFields);
      console.log('✅ Document créé avec ID:', documentId);
      
      // COMMENTÉ - ANCIEN SYSTÈME DE CONFIRMATION ADMINISTRATIVE
      // Notifier les administrateurs - ne pas faire échouer si la notification échoue
      /* try {
        console.log('📢 Envoi notification aux admins...');
        await this.notificationService.notifyAdminsNewAccountRequest(requestData.email, documentId);
        console.log('✅ Notification envoyée');
      } catch (notifError) {
        console.warn('⚠️ Erreur notification (non bloquante):', notifError);
      } */
      
      return documentId;
    } catch (error) {
      console.error('❌ Erreur création demande:', error);
      throw error;
    }
  }

  /**
   * Récupérer une demande par email
   */
  async getByEmail(email: string): Promise<AccountRequest | null> {
    try {
      console.log('🔍 AccountRequestService.getByEmail() - Recherche pour:', email);
      
      const snapshot = await this.collection
        .where('email', '==', email)
        .orderBy('requestDate', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.log('❌ Aucune demande trouvée pour:', email);
        return null;
      }
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      const result = {
        id: doc.id, // CRITIQUE: Mapper l'ID Firestore
        ...data
      } as AccountRequest;
      
      console.log('✅ Demande trouvée:', { id: result.id, email: result.email, status: result.status });
      return result;
    } catch (error) {
      console.warn('⚠️ Erreur getByEmail (utilisation de requête simple):', error);
      // Fallback sans orderBy si l'index n'existe pas
      try {
        console.log('🔄 Fallback getByEmail sans orderBy pour:', email);
        const snapshot = await this.collection
          .where('email', '==', email)
          .limit(1)
          .get();

        if (snapshot.empty) {
          console.log('❌ Fallback: Aucune demande trouvée pour:', email);
          return null;
        }
        
        const doc = snapshot.docs[0];
        const data = doc.data();
        const result = {
          id: doc.id, // CRITIQUE: Mapper l'ID Firestore
          ...data
        } as AccountRequest;
        
        console.log('✅ Fallback: Demande trouvée:', { id: result.id, email: result.email });
        return result;
      } catch (fallbackError) {
        console.warn('⚠️ Erreur fallback getByEmail:', fallbackError);
        return null;
      }
    }
  }

  /**
   * Récupérer toutes les demandes en attente
   */
  async getPendingRequests(): Promise<AccountRequest[]> {
    try {
      console.log('🔍 AccountRequestService.getPendingRequests() appelée');
      
      // Essayer d'abord avec l'index composé
      const snapshot = await this.collection
        .where('status', '==', 'pending')
        .orderBy('requestDate', 'desc')
        .get();

      console.log(`📊 Snapshot: ${snapshot.size} documents trouvés`);
      
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AccountRequest));
      
      console.log(`✅ Demandes mappées: ${requests.length}`);
      
      return requests;
    } catch (error: any) {
      // Si l'index n'existe pas, utiliser une requête simple
      if (error.code === 9 || error.message?.includes('index')) {
        console.log('⚠️  Index composé non disponible, utilisation d\'une requête simple');
        const snapshot = await this.collection
          .where('status', '==', 'pending')
          .get();

        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AccountRequest));

        // Trier manuellement par date de création
        return requests.sort((a, b) => 
          new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
        );
      }
      throw error;
    }
  }

  /**
   * Récupérer TOUTES les demandes (pending, approved, rejected)
   */
  async getAllRequests(): Promise<AccountRequest[]> {
    try {
      console.log('🔍 AccountRequestService.getAllRequests() appelée');
      
      // Récupérer toutes les demandes sans filtre de statut
      const snapshot = await this.collection
        .orderBy('requestDate', 'desc')
        .get();

      console.log(`📊 Snapshot (toutes): ${snapshot.size} documents trouvés`);
      
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AccountRequest));
      
      console.log(`✅ Toutes les demandes mappées: ${requests.length}`);
      
      return requests;
    } catch (error: any) {
      console.error('❌ Erreur getAllRequests:', error);
      // Si l'index n'existe pas, utiliser une requête simple
      if (error.code === 9 || error.message?.includes('index')) {
        console.log('⚠️  Index non disponible, utilisation d\'une requête simple');
        const snapshot = await this.collection.get();
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AccountRequest));
        return requests.sort((a, b) => 
          new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
        );
      }
      throw error;
    }
  }

  /**
   * Approuver une demande et générer un mot de passe temporaire
   * COMMENTÉ - ANCIEN SYSTÈME DE CONFIRMATION ADMINISTRATIVE
   */
  /* async approveRequest(
    requestId: string, 
    adminId: string, 
    adminComment?: string
  ): Promise<{ temporaryPassword: string }> {
    const request = await this.getById(requestId);
    if (!request) {
      throw new Error('Demande introuvable');
    }

    if (request.status !== 'pending') {
      throw new Error('Cette demande a déjà été traitée');
    }

    // Récupérer les informations de l'admin pour l'email
    const admin = await this.adminService.getById(adminId);
    if (!admin) {
      throw new Error('Administrateur introuvable');
    }

    // Générer un mot de passe temporaire sécurisé
    const temporaryPassword = PasswordGeneratorService.generateTemporaryPassword();

    // Créer l'utilisateur avec le mot de passe temporaire
    await this.userService.createUserFromApprovedRequest(
      request.email,
      temporaryPassword,
      adminComment
    );

    const updatedRequest: Partial<AccountRequest> = {
      status: 'approved',
      adminId,
      adminComment,
      processedDate: new Date().toISOString(),
      temporaryPassword,
      isFirstLogin: true
    };

    await this.update(requestId, updatedRequest);

    // Envoyer l'email d'approbation
    try {
      await this.emailService.sendAccountApprovalEmail(
        request.email,
        temporaryPassword,
        admin.email,
        adminComment
      );
      console.log('✅ Email d\'approbation envoyé à:', request.email);
    } catch (emailError) {
      console.warn('⚠️ Erreur envoi email (non bloquante):', emailError);
    }

    return { temporaryPassword };
  } */

  /**
   * Approuver une demande avec données personnalisées pour l'email
   * COMMENTÉ - ANCIEN SYSTÈME DE CONFIRMATION ADMINISTRATIVE
   */
  /* async approveRequestWithCustomData(
    requestId: string, 
    adminId: string, 
    adminComment?: string,
    customTemporaryPassword?: string,
    customSubject?: string,
    customAdminEmail?: string
  ): Promise<{ temporaryPassword: string }> {
    const request = await this.getById(requestId);
    if (!request) {
      throw new Error('Demande introuvable');
    }

    if (request.status !== 'pending') {
      throw new Error('Cette demande a déjà été traitée');
    }

    // Récupérer les informations de l'admin pour l'email
    const admin = await this.adminService.getById(adminId);
    if (!admin) {
      throw new Error('Administrateur introuvable');
    }

    console.log('✅ Admin trouvé:', admin.email);

    // Utiliser le mot de passe fourni ou en générer un nouveau
    const temporaryPassword = customTemporaryPassword || PasswordGeneratorService.generateTemporaryPassword();

    console.log('🔐 Mot de passe temporaire généré:', temporaryPassword);

    // Créer l'utilisateur avec le mot de passe temporaire
    await this.userService.createUserFromApprovedRequest(
      request.email,
      temporaryPassword,
      adminComment
    );

    const updatedRequest: Partial<AccountRequest> = {
      status: 'approved',
      adminId,
      adminComment,
      processedDate: new Date().toISOString(),
      temporaryPassword,
      isFirstLogin: true
    };

    await this.update(requestId, updatedRequest);

    // Envoyer l'email d'approbation avec données personnalisées
    try {
      await this.emailService.sendCustomAccountApprovalEmail(
        request.email,
        temporaryPassword,
        customAdminEmail || admin.email,
        adminComment,
        customSubject
      );
      console.log('✅ Email d\'approbation personnalisé envoyé à:', request.email);
    } catch (emailError) {
      console.warn('⚠️ Erreur envoi email (non bloquante):', emailError);
    }

    return { temporaryPassword };
  } */

  /**
   * Rejeter une demande
   * COMMENTÉ - ANCIEN SYSTÈME DE CONFIRMATION ADMINISTRATIVE
   */
  /* async rejectRequest(requestId: string, adminId: string, adminComment: string): Promise<void> {
    const request = await this.getById(requestId);
    if (!request) {
      throw new Error('Demande introuvable');
    }

    if (request.status !== 'pending') {
      throw new Error('Cette demande a déjà été traitée');
    }

    // Récupérer les informations de l'admin pour l'email
    const admin = await this.adminService.getById(adminId);
    if (!admin) {
      throw new Error('Administrateur introuvable');
    }

    const updatedRequest: Partial<AccountRequest> = {
      status: 'rejected',
      adminId,
      adminComment,
      processedDate: new Date().toISOString()
    };

    await this.update(requestId, updatedRequest);

    // Envoyer l'email de rejet
    try {
      await this.emailService.sendAccountRejectionEmail(
        request.email,
        admin.email,
        adminComment
      );
      console.log('✅ Email de rejet envoyé à:', request.email);
    } catch (emailError) {
      console.warn('⚠️ Erreur envoi email (non bloquante):', emailError);
    }
  } */

  /**
   * Rejeter une demande avec données personnalisées pour l'email
   * COMMENTÉ - ANCIEN SYSTÈME DE CONFIRMATION ADMINISTRATIVE
   */
  /* async rejectRequestWithCustomData(
    requestId: string, 
    adminId: string, 
    adminComment: string,
    customSubject?: string,
    customAdminEmail?: string
  ): Promise<void> {
    const request = await this.getById(requestId);
    if (!request) {
      throw new Error('Demande introuvable');
    }

    if (request.status !== 'pending') {
      throw new Error('Cette demande a déjà été traitée');
    }

    // Récupérer les informations de l'admin pour l'email
    const admin = await this.adminService.getById(adminId);
    if (!admin) {
      throw new Error('Administrateur introuvable');
    }

    const updatedRequest: Partial<AccountRequest> = {
      status: 'rejected',
      adminId,
      adminComment,
      processedDate: new Date().toISOString()
    };

    await this.update(requestId, updatedRequest);

    // Envoyer l'email de rejet personnalisé
    try {
      await this.emailService.sendCustomAccountRejectionEmail(
        request.email,
        customAdminEmail || admin.email,
        adminComment,
        customSubject
      );
      console.log('✅ Email de rejet personnalisé envoyé à:', request.email);
    } catch (emailError) {
      console.warn('⚠️ Erreur envoi email (non bloquante):', emailError);
    }
  } */

  /**
   * Générer un mot de passe temporaire sécurisé
   */
  private generateTemporaryPassword(): string {
    // Générer un mot de passe de 12 caractères avec lettres, chiffres et symboles
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Récupérer les statistiques des demandes
   */
  async getRequestStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const allRequests = await this.getAll();
    
    return {
      total: allRequests.length,
      pending: allRequests.filter(r => r.status === 'pending').length,
      approved: allRequests.filter(r => r.status === 'approved').length,
      rejected: allRequests.filter(r => r.status === 'rejected').length
    };
  }
}

export default AccountRequestService;
