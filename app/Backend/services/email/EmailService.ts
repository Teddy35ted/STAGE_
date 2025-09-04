// Service d'envoi d'emails pour les notifications
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuration du transporteur email
    this.transporter = nodemailer.createTransport({
      // Configuration pour Gmail (vous pouvez changer selon votre fournisseur)
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Votre email
        pass: process.env.EMAIL_PASSWORD, // Mot de passe d'application Gmail
      },
    });
  }

  /**
   * Envoyer un email d'acceptation de demande de compte
   */
  async sendAccountApprovalEmail(
    userEmail: string, 
    temporaryPassword: string, 
    adminEmail: string,
    comment?: string
  ): Promise<void> {
    const subject = 'Demande de compte approuvée - La-a-La';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #f01919; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .credentials { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .password { font-family: monospace; font-size: 16px; font-weight: bold; color: #2d5016; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .warning { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>La-a-La</h1>
            <h2>Demande de compte approuvée</h2>
          </div>
          
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Votre demande de création de compte a été <strong>approuvée</strong> par un administrateur.</p>
            
            ${comment ? `
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4>Message de l'administrateur :</h4>
              <p style="font-style: italic;">"${comment}"</p>
            </div>
            ` : ''}
            
            <div class="credentials">
              <h3>Vos identifiants de connexion :</h3>
              <p><strong>Email :</strong> ${userEmail}</p>
              <p><strong>Mot de passe temporaire :</strong> <span class="password">${temporaryPassword}</span></p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important :</strong></p>
              <ul>
                <li>Ce mot de passe est temporaire et doit être changé lors de votre première connexion</li>
                <li>Gardez ces informations confidentielles</li>
                <li>Connectez-vous dès que possible pour sécuriser votre compte</li>
              </ul>
            </div>
            
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth" 
                 style="background-color: #f01919; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                Se connecter maintenant
              </a>
            </p>
            
            <p>Bienvenue dans La-a-La !</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé par ${adminEmail}</p>
            <p>Si vous n'avez pas demandé de compte, ignorez cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
      from: adminEmail,
    });
  }

  /**
   * Envoyer un email d'approbation personnalisé
   */
  async sendCustomAccountApprovalEmail(
    userEmail: string, 
    temporaryPassword: string, 
    adminEmail: string,
    comment?: string,
    customSubject?: string
  ): Promise<void> {
    const subject = customSubject || 'Demande de compte approuvée - La-a-La';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #f01919; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .credentials { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .password { font-family: monospace; font-size: 16px; font-weight: bold; color: #2d5016; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .warning { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>La-a-La</h1>
            <h2>Demande de compte approuvée</h2>
          </div>
          
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Votre demande de création de compte a été <strong>approuvée</strong> par un administrateur.</p>
            
            ${comment ? `
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4>Message de l'administrateur :</h4>
              <p style="font-style: italic;">"${comment}"</p>
            </div>
            ` : ''}
            
            <div class="credentials">
              <h3>Vos identifiants de connexion :</h3>
              <p><strong>Email :</strong> ${userEmail}</p>
              <p><strong>Mot de passe temporaire :</strong> <span class="password">${temporaryPassword}</span></p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important :</strong></p>
              <ul>
                <li>Ce mot de passe est temporaire et doit être changé lors de votre première connexion</li>
                <li>Gardez ces informations confidentielles</li>
                <li>Connectez-vous dès que possible pour sécuriser votre compte</li>
              </ul>
            </div>
            
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth" 
                 style="background-color: #f01919; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                Se connecter maintenant
              </a>
            </p>
            
            <p>Bienvenue dans La-a-La !</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé par ${adminEmail}</p>
            <p>Si vous n'avez pas demandé de compte, ignorez cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
      from: adminEmail,
    });
  }

  /**
   * Envoyer un email de rejet de demande de compte
   */
  async sendAccountRejectionEmail(
    userEmail: string, 
    adminEmail: string,
    comment?: string
  ): Promise<void> {
    const subject = 'Demande de compte refusée - La-a-La';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .rejection-reason { background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>La-a-La</h1>
            <h2>Demande de compte refusée</h2>
          </div>
          
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Nous vous informons que votre demande de création de compte a été <strong>refusée</strong> par un administrateur.</p>
            
            ${comment ? `
            <div class="rejection-reason">
              <h4>Raison du refus :</h4>
              <p style="font-style: italic;">"${comment}"</p>
            </div>
            ` : ''}
            
            <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations, vous pouvez :</p>
            <ul>
              <li>Contacter l'administrateur à l'adresse : ${adminEmail}</li>
              <li>Soumettre une nouvelle demande avec des informations supplémentaires</li>
            </ul>
            
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/request-account" 
                 style="background-color: #f01919; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                Faire une nouvelle demande
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé par ${adminEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
      from: adminEmail,
    });
  }

  /**
   * Envoyer un email de rejet personnalisé
   */
  async sendCustomAccountRejectionEmail(
    userEmail: string, 
    adminEmail: string,
    comment?: string,
    customSubject?: string
  ): Promise<void> {
    const subject = customSubject || 'Demande de compte refusée - La-a-La';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .rejection-reason { background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>La-a-La</h1>
            <h2>Demande de compte refusée</h2>
          </div>
          
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Nous vous informons que votre demande de création de compte a été <strong>refusée</strong> par un administrateur.</p>
            
            ${comment ? `
            <div class="rejection-reason">
              <h4>Raison du refus :</h4>
              <p style="font-style: italic;">"${comment}"</p>
            </div>
            ` : ''}
            
            <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations, vous pouvez :</p>
            <ul>
              <li>Contacter l'administrateur à l'adresse : ${adminEmail}</li>
              <li>Soumettre une nouvelle demande avec des informations supplémentaires</li>
            </ul>
            
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/request-account" 
                 style="background-color: #f01919; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                Faire une nouvelle demande
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé par ${adminEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
      from: adminEmail,
    });
  }

  /**
   * Envoyer un email générique
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Validation des paramètres
      if (!options.to || !options.subject || !options.html) {
        throw new Error('Paramètres email manquants: to, subject, html requis');
      }

      // Validation de la configuration
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('Configuration email manquante: EMAIL_USER et EMAIL_PASSWORD requis');
      }

      const mailOptions = {
        from: `"La-a-La Admin" <${process.env.EMAIL_USER}>`, // Utiliser toujours EMAIL_USER pour éviter les rejets
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.from || process.env.EMAIL_USER, // Utiliser replyTo pour l'email de l'admin
      };

      console.log('📧 Envoi email vers:', options.to);
      console.log('📧 Sujet:', options.subject);
      console.log('📧 Reply-To:', mailOptions.replyTo);

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé avec succès:', result.messageId);
    } catch (error: any) {
      console.error('❌ Erreur envoi email:', error);
      console.error('❌ Configuration EMAIL_USER:', process.env.EMAIL_USER ? 'DÉFINI' : 'MANQUANT');
      console.error('❌ Configuration EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'DÉFINI' : 'MANQUANT');
      throw new Error(`Erreur lors de l'envoi de l'email: ${error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Vérifier la configuration email
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Configuration email valide');
      return true;
    } catch (error) {
      console.error('❌ Configuration email invalide:', error);
      return false;
    }
  }
}
