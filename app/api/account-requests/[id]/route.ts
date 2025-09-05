import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';

const accountRequestService = new AccountRequestService();

// SYSTÈME DÉSACTIVÉ - RETOUR À L'ANCIEN SYSTÈME DIRECT
// Cette API était utilisée pour l'approbation/rejet par les administrateurs
// Maintenant que nous utilisons l'ancien système direct, ces fonctionnalités sont désactivées

// Approuver une demande de compte (DÉSACTIVÉ)
export async function POST(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const requestId = params.id;
    
    return NextResponse.json({
      success: false,
      error: 'Système d\'approbation administrative désactivé. Les comptes sont maintenant créés automatiquement.',
      info: 'L\'ancien système direct est maintenant utilisé - les utilisateurs reçoivent immédiatement leurs identifiants par email.',
      requestId: requestId
    }, { status: 410 }); // 410 Gone - Cette fonctionnalité n'est plus disponible

    /* ANCIEN CODE COMMENTÉ - SYSTÈME D'APPROBATION ADMINISTRATIVE
    const { action, adminComment, customPassword } = await request.json();
    const requestId = params.id;
    
    // TODO: Vérifier que l'utilisateur est admin
    const adminId = 'admin-temp'; // À remplacer par l'ID réel de l'admin connecté
    
    if (action === 'approve') {
      let result;
      
      if (customPassword) {
        // Approbation avec mot de passe personnalisé
        result = await accountRequestService.approveRequestWithCustomData(
          requestId,
          adminId,
          customPassword,
          adminComment
        );
      } else {
        // Approbation avec mot de passe auto-généré
        result = await accountRequestService.approveRequest(
          requestId,
          adminId,
          adminComment
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Demande approuvée avec succès',
        temporaryPassword: result.temporaryPassword
      });
      
    } else if (action === 'reject') {
      await accountRequestService.rejectRequest(
        requestId,
        adminId,
        adminComment || 'Demande rejetée'
      );
      
      return NextResponse.json({
        success: true,
      return NextResponse.json({
        success: true,
        message: 'Demande rejetée avec succès'
      });
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'Action non valide. Utilisez "approve" ou "reject"'
      }, { status: 400 });
    }
    */
    
  } catch (error) {
    console.error('❌ Erreur traitement demande:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json({
      success: false,
      error: 'Système d\'approbation administrative désactivé',
      originalError: errorMessage
    }, { status: 410 });
  }
}

// Récupérer une demande spécifique (CONSERVÉ pour compatibilité)
export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const requestId = params.id;
    const accountRequest = await accountRequestService.getById(requestId);
    
    if (!accountRequest) {
      return NextResponse.json({
        success: false,
        error: 'Demande non trouvée'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: accountRequest,
      info: 'Note: Le système d\'approbation administrative a été désactivé. Les nouveaux comptes sont créés automatiquement.'
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération demande:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération de la demande'
    }, { status: 500 });
  }
}
