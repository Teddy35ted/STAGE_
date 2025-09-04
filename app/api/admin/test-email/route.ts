// API de test pour vérifier la configuration email
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '../../../Backend/services/email/EmailService';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Token d\'authentification requis'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Token invalide'
      }, { status: 401 });
    }

    const emailService = new EmailService();
    
    // Test de configuration
    const configTest = {
      emailUser: process.env.EMAIL_USER ? 'DÉFINI' : 'MANQUANT',
      emailPassword: process.env.EMAIL_PASSWORD ? 'DÉFINI' : 'MANQUANT',
      jwtSecret: process.env.JWT_SECRET ? 'DÉFINI' : 'MANQUANT',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'DÉFAUT'
    };

    // Test de connexion
    let connectionTest = 'NON TESTÉ';
    try {
      const isValid = await emailService.verifyConnection();
      connectionTest = isValid ? 'SUCCÈS' : 'ÉCHEC';
    } catch (error: any) {
      connectionTest = `ERREUR: ${error?.message || 'Erreur inconnue'}`;
    }

    return NextResponse.json({
      success: true,
      configuration: configTest,
      connectionTest,
      message: 'Test de configuration email terminé'
    });

  } catch (error: any) {
    console.error('❌ Erreur test email:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors du test email'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json({
        success: false,
        error: 'Email de test requis'
      }, { status: 400 });
    }

    const emailService = new EmailService();
    
    // Envoyer un email de test
    await emailService.sendCustomAccountApprovalEmail(
      testEmail,
      'TestPassword123',
      'admin@la-a-la.com',
      'Ceci est un email de test pour vérifier la configuration.',
      'Test de configuration email - La-a-La'
    );

    return NextResponse.json({
      success: true,
      message: `Email de test envoyé avec succès à ${testEmail}`
    });

  } catch (error: any) {
    console.error('❌ Erreur envoi test email:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi du test email'
    }, { status: 500 });
  }
}
