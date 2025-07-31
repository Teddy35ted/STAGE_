// ===== TEST FIREBASE SIMPLIFIÉ =====
// Test minimal pour identifier le problème

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Firebase simplifié...');
    
    // Vérification des variables d'environnement de base
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!projectId || !clientEmail || !privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Variables d\'environnement manquantes',
        missing: {
          projectId: !projectId,
          clientEmail: !clientEmail,
          privateKey: !privateKey
        }
      }, { status: 400 });
    }
    
    // Test d'import Firebase Admin
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    
    console.log('✅ Import Firebase Admin réussi');
    
    // Configuration minimale
    const config = {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n')
    };
    
    // Initialisation
    const app = getApps().length === 0 
      ? initializeApp({
          credential: cert(config),
          projectId
        })
      : getApps()[0];
    
    console.log('✅ Initialisation Firebase réussie');
    
    // Test de connexion
    const db = getFirestore(app);
    const testDoc = await db.collection('_test').limit(1).get();
    
    console.log('✅ Test de connexion réussi');
    
    return NextResponse.json({
      success: true,
      message: 'Firebase fonctionne correctement',
      config: {
        projectId,
        clientEmail,
        privateKeyLength: privateKey.length,
        appsCount: getApps().length
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur dans le test simplifié:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: {
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : null
      }
    }, { status: 500 });
  }
}