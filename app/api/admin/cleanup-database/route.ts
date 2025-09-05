import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '../../../Backend/config/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Début du nettoyage de la base de données...');

    const { confirmClean } = await request.json();
    
    if (!confirmClean) {
      return NextResponse.json({
        error: 'Confirmation requise pour le nettoyage'
      }, { status: 400 });
    }

    // Collections à nettoyer (toutes sauf admins)
    const collectionsToClean = [
      COLLECTIONS.USERS,
      COLLECTIONS.LAALAS,
      COLLECTIONS.CONTENUS,
      COLLECTIONS.MESSAGES,
      COLLECTIONS.BOUTIQUES,
      COLLECTIONS.CO_GESTIONNAIRES,
      COLLECTIONS.RETRAITS,
      COLLECTIONS.CAMPAIGNS,
      COLLECTIONS.AUDIT_LOGS,
      COLLECTIONS.ACCOUNT_REQUESTS
    ];

    console.log('📋 Collections à nettoyer:', collectionsToClean);

    const cleanupResults = [];

    for (const collectionName of collectionsToClean) {
      try {
        console.log(`🗑️ Nettoyage de la collection: ${collectionName}`);
        
        const collectionRef = adminDb.collection(collectionName);
        const snapshot = await collectionRef.get();
        
        const deleteCount = snapshot.size;
        
        if (deleteCount > 0) {
          // Supprimer tous les documents en batch
          const batch = adminDb.batch();
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          await batch.commit();
          console.log(`✅ ${deleteCount} documents supprimés de ${collectionName}`);
        } else {
          console.log(`ℹ️ Collection ${collectionName} déjà vide`);
        }

        cleanupResults.push({
          collection: collectionName,
          deletedCount: deleteCount,
          status: 'success'
        });

      } catch (error) {
        console.error(`❌ Erreur lors du nettoyage de ${collectionName}:`, error);
        cleanupResults.push({
          collection: collectionName,
          deletedCount: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    // Vérification que la collection admins existe toujours
    const adminsRef = adminDb.collection('admins');
    const adminsSnapshot = await adminsRef.get();
    
    console.log('✅ Nettoyage terminé');
    console.log(`👤 Collection admins préservée: ${adminsSnapshot.size} documents`);

    return NextResponse.json({
      success: true,
      message: 'Base de données nettoyée avec succès',
      results: cleanupResults,
      adminsCount: adminsSnapshot.size,
      totalDeletedDocuments: cleanupResults.reduce((sum, result) => sum + result.deletedCount, 0)
    });

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du nettoyage de la base de données',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
