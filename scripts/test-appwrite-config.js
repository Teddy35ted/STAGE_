/**
 * Script de test pour vérifier la configuration Appwrite
 * Ce script teste la connexion et la génération d'URLs
 */

import { appwriteMediaService } from '../lib/appwrite/media-service';

async function testAppwriteConfiguration() {
  console.log('🔧 Test de la configuration Appwrite...\n');

  try {
    // Test de connectivité
    console.log('1. Test de connectivité...');
    const connectionTest = await appwriteMediaService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Connexion Appwrite réussie');
    } else {
      console.log('❌ Erreur de connexion:', connectionTest.error);
      return;
    }

    // Test de génération d'URL
    console.log('\n2. Test de génération d\'URL...');
    const testFileId = 'test-file-id-123';
    const testUrl = appwriteMediaService.getFileUrl(testFileId);
    
    if (testUrl) {
      console.log('✅ URL générée:', testUrl);
      console.log('   Format:', testUrl.includes('appwrite.io') ? 'Valide' : 'Invalide');
    } else {
      console.log('❌ Échec de génération d\'URL');
    }

    // Affichage de la configuration
    console.log('\n3. Configuration actuelle:');
    console.log('   Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('   Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('   Bucket ID:', process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID);

    console.log('\n✅ Test terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécution du test si appelé directement
if (require.main === module) {
  testAppwriteConfiguration();
}

export { testAppwriteConfiguration };
