// API pour gérer les demandes de compte par les administrateurs
import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';
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

// GET - Récupérer toutes les demandes en attente
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API GET /api/admin/account-requests appelée');
    
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      console.log('❌ Authentification admin échouée');
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé'
      }, { status: 401 });
    }

    console.log('✅ Admin authentifié:', admin.adminId);
    console.log('🔍 Récupération de TOUTES les demandes...');
    
    const allRequests = await accountRequestService.getAllRequests();
    
    console.log(`📊 Demandes trouvées: ${allRequests?.length || 0}`);
    
    return NextResponse.json({
      success: true,
      requests: allRequests || []
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération demandes:', error);
    console.error('❌ Stack:', error.stack);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des demandes'
    }, { status: 500 });
  }
}

// PUT - Approuver ou rejeter une demande
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé'
      }, { status: 401 });
    }

    const { requestId, action, comment } = await request.json();

    if (!requestId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides'
      }, { status: 400 });
    }

    if (action === 'approve') {
      const result = await accountRequestService.approveRequest(
        requestId, 
        admin.adminId, 
        comment
      );
      
      return NextResponse.json({
        success: true,
        message: 'Demande approuvée avec succès',
        temporaryPassword: result.temporaryPassword
      });
    } else {
      if (!comment || !comment.trim()) {
        return NextResponse.json({
          success: false,
          error: 'Un commentaire est requis pour le rejet'
        }, { status: 400 });
      }

      await accountRequestService.rejectRequest(
        requestId, 
        admin.adminId, 
        comment
      );
      
      return NextResponse.json({
        success: true,
        message: 'Demande rejetée avec succès'
      });
    }

  } catch (error: any) {
    console.error('❌ Erreur traitement demande:', error);
    
    if (error.message.includes('déjà été traitée') || error.message.includes('introuvable')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Erreur lors du traitement de la demande'
    }, { status: 500 });
  }
}
