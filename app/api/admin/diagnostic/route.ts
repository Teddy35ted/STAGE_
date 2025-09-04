// API de diagnostic pour vérifier les données des demandes de compte
import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';

const accountRequestService = new AccountRequestService();

export async function GET() {
  try {
    console.log('🔍 Diagnostic des demandes de compte...');
    
    // Récupérer toutes les demandes
    const allRequests = await accountRequestService.getAllRequests();
    console.log('📊 Toutes les demandes:', allRequests.length);
    
    // Chercher spécifiquement la demande pour kouevited10@gmail.com
    const specificRequest = await accountRequestService.getByEmail('kouevited10@gmail.com');
    console.log('🎯 Demande spécifique:', specificRequest);
    
    return NextResponse.json({
      success: true,
      data: {
        totalRequests: allRequests.length,
        allRequests: allRequests.map((req: any) => ({
          id: req.id,
          email: req.email,
          status: req.status,
          isFirstLogin: req.isFirstLogin,
          temporaryPassword: req.temporaryPassword,
          requestDate: req.requestDate,
          processedDate: req.processedDate
        })),
        specificRequest: specificRequest ? {
          id: specificRequest.id,
          email: specificRequest.email,
          status: specificRequest.status,
          isFirstLogin: specificRequest.isFirstLogin,
          temporaryPassword: specificRequest.temporaryPassword,
          requestDate: specificRequest.requestDate,
          processedDate: specificRequest.processedDate
        } : null
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erreur diagnostic:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
