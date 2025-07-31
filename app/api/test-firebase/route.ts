// ===== API ROUTE DE TEST FIREBASE =====
// Route pour tester la connexion Firebase et initialiser des données

import { NextRequest, NextResponse } from 'next/server';
import { 
  validateFirebaseConfig, 
  testFirebaseConnection 
} from '../../Backend/config/firebase-admin';
import { FirebaseDashboardService } from '../../lib/firebase-services';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test de la configuration Firebase...');
    
    // 1. Validation de la configuration
    validateFirebaseConfig();
    
    // 2. Test de connexion
    const connectionOk = await testFirebaseConnection();
    if (!connectionOk) {
      return NextResponse.json({
        success: false,
        error: 'Échec de la connexion Firebase'
      }, { status: 500 });
    }
    
    // 3. Récupération des statistiques (si des données existent)
    let stats = null;
    try {
      stats = await FirebaseDashboardService.getGlobalStats();
    } catch (error) {
      console.log('ℹ️ Aucune donnée existante, c\'est normal pour une première utilisation');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Firebase configuré et connecté avec succès',
      timestamp: new Date().toISOString(),
      stats: stats || {
        users: { total: 0, active: 0, certified: 0, newThisMonth: 0 },
        laalas: { total: 0, active: 0, completed: 0, totalViews: 0, totalLikes: 0 },
        contenus: { total: 0, images: 0, videos: 0, texts: 0, totalViews: 0, totalLikes: 0 }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test Firebase:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'initialize-test-data') {
      console.log('🚀 Initialisation des données de test...');
      
      const result = await FirebaseDashboardService.initializeTestData();
      
      return NextResponse.json({
        success: true,
        message: 'Données de test initialisées avec succès',
        data: result
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Action non reconnue'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Erreur initialisation données:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}