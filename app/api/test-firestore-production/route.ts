// ===== TEST FIRESTORE EN MODE PRODUCTION =====
// Test spécifique pour vérifier que Firestore fonctionne après activation

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Firestore en mode production...');
    
    // Import de la configuration Backend
    const { 
      adminDb, 
      validateFirebaseConfig, 
      testFirebaseConnection 
    } = await import('../../Backend/config/firebase-admin');
    
    // 1. Validation de la configuration
    validateFirebaseConfig();
    console.log('✅ Configuration validée');
    
    // 2. Test de connexion Firestore
    try {
      const testCollection = adminDb.collection('_connection_test');
      
      // Test d'écriture
      const docRef = await testCollection.add({
        message: 'Test de connexion Firestore',
        timestamp: new Date(),
        mode: 'production'
      });
      console.log('✅ Écriture Firestore réussie:', docRef.id);
      
      // Test de lecture
      const doc = await testCollection.doc(docRef.id).get();
      if (doc.exists) {
        console.log('✅ Lecture Firestore réussie');
        
        // Nettoyage - suppression du document de test
        await testCollection.doc(docRef.id).delete();
        console.log('✅ Suppression du document de test réussie');
      }
      
      return NextResponse.json({
        success: true,
        message: 'Firestore fonctionne parfaitement en mode production !',
        timestamp: new Date().toISOString(),
        tests: {
          configuration: '✅ Validée',
          write: '✅ Écriture réussie',
          read: '✅ Lecture réussie',
          delete: '✅ Suppression réussie'
        },
        nextSteps: [
          '✅ Firestore est opérationnel',
          '🚀 Vous pouvez maintenant développer votre backend',
          '⚠️ Pensez à sécuriser les règles Firestore avant la production'
        ]
      });
      
    } catch (firestoreError) {
      console.error('❌ Erreur Firestore:', firestoreError);
      
      // Analyse de l'erreur
      let errorAnalysis = 'Erreur inconnue';
      let solution = 'Vérifiez la configuration';
      
      if (firestoreError instanceof Error) {
        if (firestoreError.message.includes('PERMISSION_DENIED')) {
          errorAnalysis = 'Règles Firestore trop restrictives';
          solution = 'Modifiez les règles Firestore pour permettre l\'accès en développement';
        } else if (firestoreError.message.includes('NOT_FOUND')) {
          errorAnalysis = 'Base de données Firestore introuvable';
          solution = 'Vérifiez que Firestore est bien activé';
        }
      }
      
      return NextResponse.json({
        success: false,
        error: 'Erreur Firestore',
        details: {
          message: firestoreError instanceof Error ? firestoreError.message : 'Erreur inconnue',
          analysis: errorAnalysis,
          solution: solution
        },
        troubleshooting: [
          '1. Vérifiez que Firestore Database est activé',
          '2. Modifiez les règles Firestore (onglet Rules)',
          '3. Utilisez les règles temporaires pour le développement',
          '4. Attendez quelques minutes après modification des règles'
        ]
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de configuration',
      details: {
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }, { status: 500 });
  }
}