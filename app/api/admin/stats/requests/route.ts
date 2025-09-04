import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../../Backend/services/collections/AccountRequestService';
import jwt from 'jsonwebtoken';

const accountRequestService = new AccountRequestService();

// Middleware pour vérifier l'authentification admin
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    
    if (!decoded.adminId || !decoded.permissions.includes('manage-accounts')) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Route pour obtenir les statistiques des demandes
 * GET /api/admin/stats/requests
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé'
      }, { status: 401 });
    }

    // Récupérer toutes les demandes pour les statistiques
    const allRequests = await accountRequestService.getAll();
    
    const stats = {
      total: allRequests.length,
      pending: allRequests.filter(r => r.status === 'pending').length,
      approved: allRequests.filter(r => r.status === 'approved').length,
      rejected: allRequests.filter(r => r.status === 'rejected').length,
      recent: allRequests.filter(r => {
        const requestDate = new Date(r.requestDate);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return requestDate > oneDayAgo;
      }).length
    };

    return NextResponse.json({
      success: true,
      stats,
      lastUpdate: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erreur stats demandes:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    }, { status: 500 });
  }
}
