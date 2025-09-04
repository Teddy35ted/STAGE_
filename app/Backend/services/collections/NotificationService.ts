// Service de notification pour les administrateurs
import { AdminService } from './AdminService';

export class NotificationService {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * Notifier tous les administrateurs actifs d'une nouvelle demande de compte
   */
  async notifyAdminsNewAccountRequest(requestEmail: string, requestId: string): Promise<void> {
    try {
      console.log('🔔 Notification nouvelle demande de compte...');
      
      // Récupérer tous les administrateurs actifs
      const activeAdmins = await this.adminService.getActiveAdmins();
      
      if (activeAdmins.length === 0) {
        console.warn('⚠️ Aucun administrateur actif trouvé pour notifier');
        return;
      }

      // Pour chaque administrateur, créer une notification
      for (const admin of activeAdmins) {
        await this.createNotification(admin.id, {
          type: 'account_request',
          title: 'Nouvelle demande de compte',
          message: `Une nouvelle demande de création de compte a été soumise par ${requestEmail}`,
          data: {
            requestId,
            requestEmail,
            timestamp: new Date().toISOString()
          }
        });

        // Log pour le développement (en production, envoyer un email)
        console.log(`📧 Notification envoyée à ${admin.email} pour la demande ${requestEmail}`);
      }

      console.log(`✅ ${activeAdmins.length} administrateur(s) notifié(s)`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la notification des administrateurs:', error);
    }
  }

  /**
   * Créer une notification dans la base de données
   */
  private async createNotification(adminId: string, notification: {
    type: string;
    title: string;
    message: string;
    data: any;
  }): Promise<void> {
    try {
      // Ici on pourrait stocker dans une collection 'notifications'
      // Pour l'instant, on log juste pour le développement
      console.log(`📝 Notification créée pour admin ${adminId}:`, {
        ...notification,
        createdAt: new Date().toISOString(),
        read: false
      });
      
      // TODO: Implémenter l'envoi d'email réel
      await this.sendEmailNotification(adminId, notification);
      
    } catch (error) {
      console.error('❌ Erreur création notification:', error);
    }
  }

  /**
   * Envoyer notification par email (simulation)
   */
  private async sendEmailNotification(adminId: string, notification: any): Promise<void> {
    // Récupérer les infos de l'admin
    const admin = await this.adminService.getById(adminId);
    if (!admin) return;

    // Simulation d'envoi d'email
    console.log(`📧 EMAIL SIMULÉ pour ${admin.email}:`);
    console.log(`Sujet: ${notification.title}`);
    console.log(`Message: ${notification.message}`);
    console.log(`Données: ${JSON.stringify(notification.data, null, 2)}`);
    console.log('---');

    // TODO: Intégrer un service d'email réel (SendGrid, Nodemailer, etc.)
    /*
    await emailService.send({
      to: admin.email,
      subject: notification.title,
      html: this.generateEmailTemplate(notification)
    });
    */
  }

  /**
   * Générer le template d'email HTML
   */
  private generateEmailTemplate(notification: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${notification.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Laala - Administration</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">${notification.title}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0; color: #495057; line-height: 1.5;">
            ${notification.message}
          </p>
          
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 12px 0; color: #495057; font-size: 16px;">Détails de la demande :</h3>
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              Email : <strong>${notification.data?.requestEmail}</strong><br>
              Date : <strong>${new Date(notification.data?.timestamp).toLocaleString('fr-FR')}</strong><br>
              ID : <code style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px;">${notification.data?.requestId}</code>
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="http://localhost:3001/admin/dashboard" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Traiter la demande
            </a>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
            Cette notification a été envoyée automatiquement par le système Laala.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Notifier un utilisateur de l'approbation de son compte
   */
  async notifyUserAccountApproved(userEmail: string, temporaryPassword: string): Promise<void> {
    try {
      console.log(`🎉 Notification d'approbation pour ${userEmail}`);
      
      // Simulation d'envoi d'email de bienvenue
      console.log(`📧 EMAIL APPROBATION SIMULÉ pour ${userEmail}:`);
      console.log(`Sujet: Votre compte Laala a été approuvé !`);
      console.log(`Message: Bienvenue sur Laala ! Votre compte a été approuvé.`);
      console.log(`Mot de passe temporaire: ${temporaryPassword}`);
      console.log(`Lien de connexion: http://localhost:3001/login`);
      console.log('---');

      // TODO: Intégrer un service d'email réel
      /*
      await emailService.send({
        to: userEmail,
        subject: 'Votre compte Laala a été approuvé !',
        html: this.generateApprovalEmailTemplate(userEmail, temporaryPassword)
      });
      */
      
    } catch (error) {
      console.error('❌ Erreur lors de la notification d\'approbation:', error);
    }
  }

  /**
   * Notifier un utilisateur du rejet de son compte
   */
  async notifyUserAccountRejected(userEmail: string, reason?: string): Promise<void> {
    try {
      console.log(`❌ Notification de rejet pour ${userEmail}`);
      
      // Simulation d'envoi d'email de rejet
      console.log(`📧 EMAIL REJET SIMULÉ pour ${userEmail}:`);
      console.log(`Sujet: Votre demande de compte Laala`);
      console.log(`Message: Votre demande de création de compte n'a pas été approuvée.`);
      if (reason) {
        console.log(`Raison: ${reason}`);
      }
      console.log('---');

      // TODO: Intégrer un service d'email réel
      /*
      await emailService.send({
        to: userEmail,
        subject: 'Votre demande de compte Laala',
        html: this.generateRejectionEmailTemplate(userEmail, reason)
      });
      */
      
    } catch (error) {
      console.error('❌ Erreur lors de la notification de rejet:', error);
    }
  }

  /**
   * Générer le template d'email d'approbation
   */
  private generateApprovalEmailTemplate(userEmail: string, temporaryPassword: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte approuvé - Laala</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎉 Bienvenue sur Laala !</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Votre compte a été approuvé</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0; color: #495057; line-height: 1.5;">
            Félicitations ! Votre demande de création de compte a été approuvée par notre équipe.
          </p>
          
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 12px 0; color: #495057; font-size: 16px;">Vos informations de connexion :</h3>
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              Email : <strong>${userEmail}</strong><br>
              Mot de passe temporaire : <code style="background: #f8f9fa; padding: 4px 8px; border-radius: 3px; font-family: monospace; color: #e83e8c;">${temporaryPassword}</code>
            </p>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 12px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              ⚠️ <strong>Important :</strong> Ce mot de passe est temporaire. Vous devrez le changer lors de votre première connexion.
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="http://localhost:3001/login" 
               style="display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Se connecter maintenant
            </a>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
            Cet email a été envoyé automatiquement par le système Laala.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Générer le template d'email de rejet
   */
  private generateRejectionEmailTemplate(userEmail: string, reason?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Demande de compte - Laala</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Laala - Demande de compte</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Mise à jour sur votre demande</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0; color: #495057; line-height: 1.5;">
            Nous vous remercions pour votre intérêt pour notre plateforme Laala.
          </p>
          
          <p style="margin: 0 0 16px 0; color: #495057; line-height: 1.5;">
            Malheureusement, nous ne pouvons pas donner suite à votre demande de création de compte pour le moment.
          </p>

          ${reason ? `
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #dc3545;">
            <h3 style="margin: 0 0 12px 0; color: #495057; font-size: 16px;">Raison :</h3>
            <p style="margin: 0; color: #6c757d; font-size: 14px;">${reason}</p>
          </div>
          ` : ''}
          
          <p style="margin: 16px 0 0 0; color: #495057; line-height: 1.5;">
            Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez obtenir plus d'informations, 
            n'hésitez pas à nous contacter.
          </p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
            Cet email a été envoyé automatiquement par le système Laala.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<void> {
    console.log(`✅ Notification ${notificationId} marquée comme lue`);
    // TODO: Mettre à jour en base de données
  }

  /**
   * Récupérer les notifications non lues d'un admin
   */
  async getUnreadNotifications(adminId: string): Promise<any[]> {
    console.log(`📋 Récupération notifications non lues pour admin ${adminId}`);
    // TODO: Récupérer depuis la base de données
    return [];
  }
}
