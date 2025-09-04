// API pour renvoyer l'email d'approbation
import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../../Backend/services/collections/AccountRequestService';
import { EmailService } from '../../../../Backend/services/email/EmailService';
import jwt from 'jsonwebtoken';

const accountRequestService = new AccountRequestService();
const emailService = new EmailService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API POST /api/admin/account-requests/resend-approval appelée');
    
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Token d\'authentification requis'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let adminPayload;
    
    try {
      adminPayload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Token invalide'
      }, { status: 401 });
    }

    const { requestId, email, temporaryPassword } = await request.json();

    if (!requestId || !email || !temporaryPassword) {
      return NextResponse.json({
        success: false,
        error: 'Données manquantes (requestId, email, temporaryPassword requis)'
      }, { status: 400 });
    }

    console.log(`📧 Renvoi email d'approbation vers: ${email}`);

    // Envoyer l'email d'approbation
    await emailService.sendCustomAccountApprovalEmail(
      email,
      'Utilisateur', // Nom par défaut
      'Votre compte a été approuvé - Accès autorisé',
      temporaryPassword,
      'Voici vos informations de connexion. Connectez-vous dès maintenant avec le mot de passe temporaire.'
    );

    console.log('✅ Email d\'approbation renvoyé avec succès');

    return NextResponse.json({
      success: true,
      message: 'Email d\'approbation renvoyé avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur renvoi email approbation:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du renvoi de l\'email'
    }, { status: 500 });
  }
}
