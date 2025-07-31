// ===== ROUTE DE DIAGNOSTIC FIREBASE =====
// Route pour diagnostiquer les problèmes de connexion Firebase

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Début du diagnostic Firebase...');
    
    // 1. Vérification des variables d'environnement
    const envVars = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'PRÉSENTE' : 'MANQUANTE',
      FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL
    };
    
    console.log('📋 Variables d\'environnement:', envVars);
    
    // 2. Test d'import de la configuration
    let configImportError = null;
    try {
      console.log('📦 Test d\'import de la configuration...');
      const { validateFirebaseConfig } = await import('../../Backend/config/firebase-admin');
      console.log('✅ Import de configuration réussi');
      
      // 3. Test de validation
      console.log('🔍 Test de validation...');
      validateFirebaseConfig();
      console.log('✅ Validation réussie');
      
    } catch (error) {
      configImportError = error;
      console.error('❌ Erreur d\'import/validation:', error);
    }
    
    // 4. Test d'initialisation Firebase
    let firebaseInitError = null;
    try {
      console.log('🚀 Test d\'initialisation Firebase...');
      const { adminDb } = await import('../../Backend/config/firebase-admin');
      console.log('✅ Initialisation Firebase réussie');
      
      // 5. Test de connexion simple
      console.log('🔗 Test de connexion...');
      const testCollection = adminDb.collection('_diagnostic_test');
      const testQuery = await testCollection.limit(1).get();
      console.log('✅ Connexion Firestore réussie');
      
    } catch (error) {
      firebaseInitError = error;
      console.error('❌ Erreur Firebase:', error);
    }
    
    return NextResponse.json({
      success: configImportError === null && firebaseInitError === null,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        variables: envVars
      },
      tests: {
        configImport: {
          success: configImportError === null,
          error: configImportError?.message || null
        },
        firebaseInit: {
          success: firebaseInitError === null,
          error: firebaseInitError?.message || null
        }
      },
      errors: {
        configImport: configImportError ? {
          message: configImportError.message,
          stack: configImportError.stack
        } : null,
        firebaseInit: firebaseInitError ? {
          message: firebaseInitError.message,
          stack: firebaseInitError.stack
        } : null
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur critique dans le diagnostic:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur critique dans le diagnostic',
      details: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : null
      }
    }, { status: 500 });
  }
}