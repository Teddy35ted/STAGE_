/**
 * Test de diagnostic côté serveur pour l'API laalas
 */

const { adminDb } = require('./app/Backend/config/firebase-admin.ts');

async function testFirestoreConnection() {
  try {
    console.log('🔍 Test de connexion Firestore...');
    
    // Test de connexion basique
    const testDoc = await adminDb.collection('_test').limit(1).get();
    console.log('✅ Connexion Firestore réussie');
    
    // Test de lecture collection laalas
    console.log('🔍 Test de lecture collection laalas...');
    const laalasSnapshot = await adminDb.collection('laalas').limit(5).get();
    
    console.log(`📊 Nombre de documents dans laalas: ${laalasSnapshot.size}`);
    
    if (laalasSnapshot.size > 0) {
      console.log('📋 Exemple de documents laalas:');
      laalasSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ID: ${doc.id}`);
        console.log(`     Nom: ${data.nom || 'N/A'}`);
        console.log(`     Créateur: ${data.idCreateur || 'N/A'}`);
        console.log(`     Date: ${data.date ? data.date.toDate() : 'N/A'}`);
        console.log('     ---');
      });
    } else {
      console.log('⚠️ Aucun document trouvé dans la collection laalas');
    }
    
    // Test de requête avec filtre
    console.log('🔍 Test de requête filtrée...');
    const filteredSnapshot = await adminDb.collection('laalas')
      .orderBy('date', 'desc')
      .limit(3)
      .get();
    
    console.log(`📊 Nombre de documents avec tri: ${filteredSnapshot.size}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test Firestore:', error);
    
    if (error.code === 'failed-precondition') {
      console.log('⚠️ Index composite manquant. Vérifiez firestore.indexes.json');
    }
    
    return false;
  }
}

async function testLaalaService() {
  try {
    console.log('🔍 Test du LaalaService...');
    
    // Import dynamique du service
    const { LaalaService } = require('./app/Backend/services/collections/LaalaService.ts');
    const service = new LaalaService();
    
    // Test getAll
    console.log('📋 Test getAll...');
    const allLaalas = await service.getAll({ limit: 5 });
    console.log(`✅ getAll retourné: ${allLaalas.length} laalas`);
    
    if (allLaalas.length > 0) {
      // Test getByCreator avec un créateur existant
      const firstCreator = allLaalas[0].idCreateur;
      console.log(`🔍 Test getByCreator pour: ${firstCreator}...`);
      
      const creatorLaalas = await service.getByCreator(firstCreator);
      console.log(`✅ getByCreator retourné: ${creatorLaalas.length} laalas`);
      
      if (creatorLaalas.length > 0) {
        // Test getById
        const firstId = creatorLaalas[0].id;
        console.log(`🔍 Test getById pour: ${firstId}...`);
        
        const singleLaala = await service.getById(firstId);
        console.log(`✅ getById retourné:`, singleLaala ? 'OK' : 'NULL');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test LaalaService:', error);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 Démarrage des diagnostics serveur laalas...\n');
  
  const results = {
    firestore: false,
    service: false
  };
  
  // Test 1: Connexion Firestore
  console.log('=== TEST 1: CONNEXION FIRESTORE ===');
  results.firestore = await testFirestoreConnection();
  console.log('');
  
  // Test 2: Service LaalaService
  if (results.firestore) {
    console.log('=== TEST 2: LAALA SERVICE ===');
    results.service = await testLaalaService();
    console.log('');
  } else {
    console.log('⏭️ Test service ignoré (connexion Firestore échouée)');
  }
  
  // Résumé
  console.log('=== RÉSUMÉ DES TESTS ===');
  console.log(`Firestore: ${results.firestore ? '✅' : '❌'}`);
  console.log(`Service: ${results.service ? '✅' : '❌'}`);
  
  if (results.firestore && results.service) {
    console.log('\n🎉 Tous les tests réussis ! Le problème pourrait être au niveau de l\'authentification ou du frontend.');
  } else {
    console.log('\n❌ Des problèmes détectés. Vérifiez les erreurs ci-dessus.');
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runDiagnostics().catch(console.error);
}

module.exports = { runDiagnostics, testFirestoreConnection, testLaalaService };