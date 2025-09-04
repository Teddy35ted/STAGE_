import { NextRequest, NextResponse } from 'next/server';
import { autoInitService } from '../../../lib/auto-init';

/**
 * Route API pour l'auto-initialisation instantanée de l'admin
 * GET /api/admin/auto-init - Vérifie et crée l'admin si nécessaire
 * POST /api/admin/auto-init - Force la création de l'admin
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Auto-initialisation admin...');
    
    await autoInitService.ensureAdminExists();
    
    return NextResponse.json({
      success: true,
      message: 'Admin auto-initialisé avec succès',
      credentials: {
        email: 'tedkouevi701@gmail.com',
        password: 'feiderus',
        loginUrl: 'http://localhost:3000/login'
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur auto-init:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'auto-initialisation',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Création forcée admin...');
    
    const adminId = await autoInitService.forceCreateAdmin();
    
    if (adminId) {
      return NextResponse.json({
        success: true,
        message: 'Admin créé avec succès (forcé)',
        adminId,
        credentials: {
          email: 'tedkouevi701@gmail.com',
          password: 'feiderus',
          loginUrl: 'http://localhost:3000/login'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Échec de la création forcée'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Erreur création forcée:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création forcée',
      details: error.message
    }, { status: 500 });
  }
}
