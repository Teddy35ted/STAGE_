// API pour renvoyer l'email de rejet
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '../../../../Backend/services/email/EmailService';
import jwt from 'jsonwebtoken';

const emailService = new EmailService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API POST /api/admin/account-requests/resend-rejection appelée');
    
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

    const { requestId, email, comment } = await request.json();

    if (!requestId || !email) {
      return NextResponse.json({
        success: false,
        error: 'Données manquantes (requestId, email requis)'
      }, { status: 400 });
    }

    console.log(`📧 Renvoi email de rejet vers: ${email}`);

    // Envoyer l'email de rejet
    await emailService.sendCustomAccountRejectionEmail(
      email,
      'Utilisateur', // Nom par défaut
      'Demande de compte refusée',
      comment || 'Votre demande de compte a été rejetée après examen.'
    );

    console.log('✅ Email de rejet renvoyé avec succès');

    return NextResponse.json({
      success: true,
      message: 'Email de rejet renvoyé avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur renvoi email rejet:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du renvoi de l\'email'
    }, { status: 500 });
  }
}
