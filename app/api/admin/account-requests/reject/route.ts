// API pour rejeter une demande de compte
import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../../Backend/services/collections/AccountRequestService';
import jwt from 'jsonwebtoken';

const accountRequestService = new AccountRequestService();

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

    const { requestId, comment, customSubject, customAdminEmail } = await request.json();

    if (!requestId) {
      return NextResponse.json({
        success: false,
        error: 'ID de demande requis'
      }, { status: 400 });
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Un commentaire expliquant le rejet est requis'
      }, { status: 400 });
    }

    // Rejeter la demande avec données personnalisées
    await accountRequestService.rejectRequestWithCustomData(
      requestId,
      (adminPayload as any).adminId,
      comment.trim(),
      customSubject,
      customAdminEmail
    );

    return NextResponse.json({
      success: true,
      message: 'Demande rejetée avec succès. Un email de notification a été envoyé.'
    });

  } catch (error: any) {
    console.error('❌ Erreur rejet demande:', error);
    console.error('❌ Stack trace:', error.stack);

    // Gestion d'erreurs spécifiques
    if (error.message?.includes('Demande introuvable')) {
      return NextResponse.json({
        success: false,
        error: 'Demande introuvable'
      }, { status: 404 });
    }

    if (error.message?.includes('déjà été traitée')) {
      return NextResponse.json({
        success: false,
        error: 'Cette demande a déjà été traitée'
      }, { status: 409 });
    }

    if (error.message?.includes('email')) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email. Vérifiez la configuration email.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors du rejet de la demande'
    }, { status: 500 });
  }
}
