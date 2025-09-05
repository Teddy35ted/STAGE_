import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';

const accountRequestService = new AccountRequestService();

// Approuver une demande de compte
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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
        message: 'Demande rejetée avec succès'
      });
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'Action non valide. Utilisez "approve" ou "reject"'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Erreur traitement demande:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

// Récupérer une demande spécifique
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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
      data: accountRequest
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération demande:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération de la demande'
    }, { status: 500 });
  }
}
