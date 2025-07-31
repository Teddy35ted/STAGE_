// ===== TEST FIREBASE AUTH SEULEMENT =====
// Test Firebase Admin sans Firestore

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Firebase Auth seulement...');
    
    // Vérification des variables d'environnement
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!projectId || !clientEmail || !privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Variables d\'environnement manquantes'
      }, { status: 400 });
    }
    
    // Import Firebase Admin
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    
    // Configuration
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
    
    // Test Auth (ne nécessite pas Firestore)
    const auth = getAuth(app);
    
    console.log('✅ Firebase Auth initialisé avec succès');
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Auth fonctionne correctement',
      config: {
        projectId,
        clientEmail,
        authInitialized: !!auth
      },
      nextSteps: [
        '1. Aller sur Firebase Console',
        '2. Activer Firestore Database',
        '3. Configurer les règles de sécurité',
        '4. Retester avec /api/test-firebase'
      ]
    });
    
  } catch (error) {
    console.error('❌ Erreur Firebase Auth:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }, { status: 500 });
  }
}