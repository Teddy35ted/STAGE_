import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '../../../Backend/config/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Test de connexion à Firestore
    console.log('🔍 Test de connexion à la base de données...');
    console.log('📋 Configuration DB:', {
      dbType: typeof db,
      hasCollection: typeof db.collection === 'function'
    });
    
    // Test simple: récupérer quelques documents d'une collection
    const testRef = db.collection('campaigns').limit(1);
    console.log('📚 Collection reference créée');
    
    const snapshot = await testRef.get();
    console.log('📄 Snapshot récupéré, vide:', snapshot.empty);
    console.log('📊 Nombre de documents:', snapshot.size);
    
    // Test supplémentaire avec la collection users
    const usersRef = db.collection('users').limit(1);
    const usersSnapshot = await usersRef.get();
    console.log('👥 Users - vide:', usersSnapshot.empty, 'nombre:', usersSnapshot.size);
    
    // Lister toutes les collections
    const collections = await db.listCollections();
    const collectionNames = collections.map((col: any) => col.id);
    console.log('📚 Collections disponibles:', collectionNames);
    
    return NextResponse.json({
      success: true,
      message: 'Connexion à la base de données réussie',
      data: {
        connected: true,
        campaignsEmpty: snapshot.empty,
        campaignsCount: snapshot.size,
        usersEmpty: usersSnapshot.empty,
        usersCount: usersSnapshot.size,
        availableCollections: collectionNames
      }
    });

  } catch (error) {
    console.error('❌ Erreur connexion DB:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Pas de stack');
    
    return NextResponse.json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test d'écriture simple
    console.log('🔍 Test d\'écriture en base de données...');
    
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Test de connexion'
    };
    
    const docRef = await db.collection('test').add(testData);
    console.log('✅ Document test créé avec ID:', docRef.id);
    
    // Supprimer le document test
    await docRef.delete();
    console.log('🗑️ Document test supprimé');
    
    return NextResponse.json({
      success: true,
      message: 'Test d\'écriture en base de données réussi',
      data: {
        writeTest: true,
        documentId: docRef.id
      }
    });

  } catch (error) {
    console.error('❌ Erreur test écriture DB:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test d\'écriture',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}