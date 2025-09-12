// ===== SCRIPT DE TEST DES REQUÊTES FIRESTORE AVEC INDEX =====
// Teste toutes les requêtes nécessitant des index composites

console.log('🧪 === TEST DES REQUÊTES FIRESTORE AVEC INDEX ===');

// Configuration de test
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUserId: 'test-user-queries',
  testData: {
    // Données de test pour créer des documents si nécessaire
    campaign: {
      name: 'Test Campaign Index',
      description: 'Campagne pour tester les index',
      createdBy: 'test-user-queries',
      startDate: new Date().toISOString(),
      status: 'draft'
    },
    laala: {
      nom: 'Test Laala Index',
      idCreateur: 'test-user-queries',
      date: new Date().toISOString(),
      encours: true,
      vues: 100
    },
    notification: {
      userId: 'test-user-queries',
      title: 'Test Notification',
      message: 'Notification de test',
      type: 'info',
      isRead: false
    }
  }
};

// Tests des requêtes avec index
const QUERY_TESTS = [
  {
    name: 'Campagnes par utilisateur',
    collection: 'campaigns',
    query: 'createdBy == userId && orderBy createdAt desc',
    index: 'campaigns (createdBy ASC, createdAt DESC)',
    endpoint: '/api/campaigns',
    method: 'GET',
    params: '?userId=test-user-queries'
  },
  {
    name: 'Notifications par utilisateur',
    collection: 'notifications',
    query: 'userId == userId && orderBy createdAt desc',
    index: 'notifications (userId ASC, createdAt DESC)',
    endpoint: '/api/notifications',
    method: 'GET',
    params: ''
  },
  {
    name: 'Notifications non lues',
    collection: 'notifications',
    query: 'userId == userId && isRead == false',
    index: 'notifications (userId ASC, isRead ASC)',
    endpoint: '/api/notifications/unread',
    method: 'GET',
    params: ''
  },
  {
    name: 'Contenus par Laala',
    collection: 'contenus',
    query: 'idLaala == laalaId && orderBy position asc',
    index: 'contenus (idLaala ASC, position ASC)',
    endpoint: '/api/contenus',
    method: 'GET',
    params: '?laalaId=test-laala'
  },
  {
    name: 'Laalas par créateur',
    collection: 'laalas',
    query: 'idCreateur == userId && orderBy date desc',
    index: 'laalas (idCreateur ASC, date DESC)',
    endpoint: '/api/laalas',
    method: 'GET',
    params: '?creatorId=test-user-queries'
  },
  {
    name: 'Laalas populaires',
    collection: 'laalas',
    query: 'encours == true && orderBy vues desc',
    index: 'laalas (encours ASC, vues DESC)',
    endpoint: '/api/laalas/popular',
    method: 'GET',
    params: ''
  }
];

// Fonction utilitaire pour les requêtes API
async function apiRequest(endpoint, options = {}) {
  const url = `${TEST_CONFIG.baseUrl}/api${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
    }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      error: response.ok ? null : data.error || 'Erreur inconnue'
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      error: error.message,
      data: null
    };
  }
}

// Test individuel d'une requête
async function testQuery(queryTest) {
  console.log(`\n🔍 Test: ${queryTest.name}`);
  console.log(`   Collection: ${queryTest.collection}`);
  console.log(`   Requête: ${queryTest.query}`);
  console.log(`   Index requis: ${queryTest.index}`);
  
  try {
    const result = await apiRequest(
      `${queryTest.endpoint}${queryTest.params}`,
      { method: queryTest.method }
    );

    if (result.success) {
      console.log(`   ✅ Succès (${result.status})`);
      
      // Analyser les données retournées
      if (result.data && result.data.data) {
        const items = Array.isArray(result.data.data) ? result.data.data : [result.data.data];
        console.log(`   📊 ${items.length} résultat(s) trouvé(s)`);
        
        // Vérifier le tri si applicable
        if (items.length > 1 && queryTest.query.includes('orderBy')) {
          const isDescending = queryTest.query.includes('desc');
          let isSorted = true;
          
          for (let i = 1; i < items.length; i++) {
            const current = items[i];
            const previous = items[i-1];
            
            // Vérification basique du tri par date
            if (current.createdAt && previous.createdAt) {
              const currentTime = new Date(current.createdAt).getTime();
              const previousTime = new Date(previous.createdAt).getTime();
              
              if (isDescending && currentTime > previousTime) {
                isSorted = false;
                break;
              } else if (!isDescending && currentTime < previousTime) {
                isSorted = false;
                break;
              }
            }
          }
          
          console.log(`   📈 Tri: ${isSorted ? '✅ Correct' : '❌ Incorrect'}`);
        }
      } else if (result.data && typeof result.data.unreadCount !== 'undefined') {
        console.log(`   📊 ${result.data.unreadCount} notification(s) non lue(s)`);
      }
      
      return { success: true, queryTest };
    } else {
      console.log(`   ❌ Échec (${result.status}): ${result.error}`);
      
      // Analyser les erreurs d'index
      if (result.error && result.error.includes('index')) {
        console.log(`   🔧 Index manquant détecté: ${queryTest.index}`);
      }
      
      return { success: false, queryTest, error: result.error };
    }
    
  } catch (error) {
    console.log(`   💥 Erreur fatale: ${error.message}`);
    return { success: false, queryTest, error: error.message };
  }
}

// Test de l'état des index via Firebase CLI (simulation)
function checkIndexStatus() {
  console.log('\n📋 === VÉRIFICATION DE L\'ÉTAT DES INDEX ===');
  console.log('Pour vérifier l\'état des index en temps réel:');
  console.log('1. firebase firestore:indexes');
  console.log('2. Console Firebase: https://console.firebase.google.com');
  
  console.log('\n📊 Index requis:');
  QUERY_TESTS.forEach((test, index) => {
    console.log(`${index + 1}. ${test.index}`);
  });
}

// Test de performance des requêtes
async function testQueryPerformance(queryTest) {
  console.log(`\n⚡ Test de performance: ${queryTest.name}`);
  
  const iterations = 5;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    const result = await apiRequest(
      `${queryTest.endpoint}${queryTest.params}`,
      { method: queryTest.method }
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (result.success) {
      times.push(duration);
    }
  }
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`   ⏱️ Temps moyen: ${avgTime.toFixed(2)}ms`);
    console.log(`   ⚡ Temps min: ${minTime.toFixed(2)}ms`);
    console.log(`   🐌 Temps max: ${maxTime.toFixed(2)}ms`);
    
    // Évaluation de la performance
    if (avgTime < 100) {
      console.log(`   🚀 Performance: Excellente`);
    } else if (avgTime < 500) {
      console.log(`   ✅ Performance: Bonne`);
    } else if (avgTime < 1000) {
      console.log(`   ⚠️ Performance: Acceptable`);
    } else {
      console.log(`   🐌 Performance: Lente - Vérifier les index`);
    }
  }
}

// Fonction principale de test
async function runQueryTests() {
  console.log('🚀 Démarrage des tests de requêtes avec index...\n');
  
  // Vérifier l'état des index
  checkIndexStatus();
  
  // Tester chaque requête
  const results = [];
  for (const queryTest of QUERY_TESTS) {
    const result = await testQuery(queryTest);
    results.push(result);
    
    // Test de performance si la requête fonctionne
    if (result.success) {
      await testQueryPerformance(queryTest);
    }
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Résumé des résultats
  console.log('\n📋 === RÉSUMÉ DES TESTS ===');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`✅ Requêtes réussies: ${successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('🎉 TOUS LES INDEX FONCTIONNENT CORRECTEMENT !');
    console.log('✅ Le système est entièrement opérationnel');
  } else {
    console.log('⚠️ Certaines requêtes échouent encore');
    console.log('📝 Actions recommandées:');
    
    results.filter(r => !r.success).forEach(result => {
      console.log(`   ❌ ${result.queryTest.name}: ${result.error}`);
      console.log(`   🔧 Vérifier l'index: ${result.queryTest.index}`);
    });
  }
  
  // Instructions de correction
  if (successCount < totalCount) {
    console.log('\n🔧 === INSTRUCTIONS DE CORRECTION ===');
    console.log('1. Vérifiez que tous les index sont déployés:');
    console.log('   firebase deploy --only firestore:indexes');
    console.log('2. Attendez que les index soient construits (statut "Ready")');
    console.log('3. Relancez ce test pour vérifier les corrections');
  }
}

// Informations d'utilisation
console.log(`
📖 UTILISATION DU SCRIPT:

1. **Prérequis:**
   - Application en cours d'exécution sur localhost:3000
   - Index Firestore déployés
   - Utilisateur test authentifié

2. **Exécution:**
   runQueryTests();

3. **Ce qui sera testé:**
   ✅ Requêtes avec index composites
   ✅ Performance des requêtes
   ✅ Tri des résultats
   ✅ Gestion d'erreurs

4. **Interprétation des résultats:**
   🟢 Toutes les requêtes réussies = Index OK
   🟡 Certaines requêtes échouent = Index en construction
   🔴 Beaucoup d'échecs = Index manquants ou mal configurés
`);

// Auto-exécution si dans un navigateur
if (typeof window !== 'undefined' && window.location) {
  console.log('🌐 Prêt pour les tests - Exécutez: runQueryTests()');
} else {
  console.log('🔧 Script prêt pour exécution');
}