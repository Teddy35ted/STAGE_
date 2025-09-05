import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../Backend/services/collections/AccountRequestService';

const accountRequestService = new AccountRequestService();

// Créer une nouvelle demande de compte
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    // Validation des champs requis - pour l'instant juste l'email
    if (!requestData.email || requestData.email.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'L\'email est requis'
      }, { status: 400 });
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      return NextResponse.json({
        success: false,
        error: 'Format d\'email invalide'
      }, { status: 400 });
    }
    
    const requestId = await accountRequestService.createRequest({
      email: requestData.email.toLowerCase().trim()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Demande de compte créée avec succès',
      requestId
    });
    
  } catch (error) {
    console.error('❌ Erreur création demande:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

// Récupérer les demandes (pour les admins)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let requests;
    
    if (status === 'pending') {
      requests = await accountRequestService.getPendingRequests();
    } else {
      // Récupérer toutes les demandes avec pagination
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      
      requests = await accountRequestService.getAll({
        limit,
        offset,
        orderBy: 'submittedAt',
        orderDirection: 'desc'
      });
    }
    
    // Obtenir les statistiques
    const statistics = await accountRequestService.getRequestStats();
    
    return NextResponse.json({
      success: true,
      data: requests,
      statistics,
      total: requests.length
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération demandes:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des demandes'
    }, { status: 500 });
  }
}
