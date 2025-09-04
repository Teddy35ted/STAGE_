import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../../Backend/services/collections/AccountRequestService';

const accountRequestService = new AccountRequestService();

/**
 * Route de debug pour lister toutes les demandes (admin ou pas)
 * GET /api/admin/debug/all-requests
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer TOUTES les demandes, pas seulement pending
    const allRequests = await accountRequestService.getAll();

    return NextResponse.json({
      success: true,
      count: allRequests.length,
      requests: allRequests,
      debug: {
        collectionsPath: 'account-requests',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur debug all requests:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération debug',
      details: error.message
    }, { status: 500 });
  }
}
