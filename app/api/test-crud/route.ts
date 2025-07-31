import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test de route API...');
    
    // Test 1: Vérifier les variables d'environnement
    const envCheck = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    };
    
    console.log('📋 Variables d\'environnement:', envCheck);
    
    // Test 2: Importer et initialiser Firebase
    const { adminDb } = await import('../../Backend/config/firebase-admin');
    console.log('🔥 Firebase Admin importé');
    
    // Test 3: Test simple de Firestore
    const testCollection = adminDb.collection('_test_api');
    const testDoc = await testCollection.add({
      test: true,
      timestamp: new Date(),
      message: 'Test depuis API Route',
      route: '/api/test-crud'
    });
    
    console.log('✅ Document créé avec ID:', testDoc.id);
    
    // Test 4: Lire le document
    const createdDoc = await testDoc.get();
    const data = createdDoc.data();
    
    console.log('📄 Document lu:', data);
    
    // Test 5: Supprimer le document
    await testDoc.delete();
    console.log('🗑️ Document supprimé');
    
    return NextResponse.json({
      success: true,
      message: 'Tous les tests CRUD réussis depuis l\'API Route',
      envCheck,
      testData: data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur dans test-crud:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Test POST avec données:', body);
    
    // Importer le service
    const { UserService } = await import('../../Backend/services/collections/UserService');
    const userService = new UserService();
    
    // Test de création d'un utilisateur de test
    const testUser = {
      nom: 'Test',
      prenom: 'User',
      email: `test-${Date.now()}@example.com`,
      tel: '1234567890',
      password: 'testpassword',
      date_de_naissance: '1990-01-01',
      sexe: 'Masculin' as const,
      pays: 'France',
      ville: 'Paris',
      codePays: '+33'
    };
    
    console.log('👤 Création d\'un utilisateur de test...');
    const userId = await userService.create(testUser);
    console.log('✅ Utilisateur créé avec ID:', userId);
    
    // Lire l'utilisateur créé
    const createdUser = await userService.getById(userId);
    console.log('📖 Utilisateur lu:', createdUser?.nom, createdUser?.email);
    
    // Supprimer l'utilisateur de test
    await userService.delete(userId);
    console.log('🗑️ Utilisateur de test supprimé');
    
    return NextResponse.json({
      success: true,
      message: 'Test CRUD utilisateur réussi',
      userId,
      userData: {
        nom: createdUser?.nom,
        email: createdUser?.email,
        id: createdUser?.id
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur dans test POST:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}