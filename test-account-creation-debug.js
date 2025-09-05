// Script de diagnostic pour les demandes de compte
// Test des API de création et récupération des demandes

const BASE_URL = 'http://localhost:3000';

// Function pour tester la création d'une demande
async function testCreateRequest() {
  console.log('🧪 TEST: Création d\'une demande de compte');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/request-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test${Date.now()}@test.com`
      })
    });
    
    const data = await response.json();
    console.log('📡 Réponse status:', response.status);
    console.log('📄 Réponse data:', data);
    
    if (response.ok) {
      console.log('✅ Création réussie, ID:', data.requestId);
      return data.requestId;
    } else {
      console.log('❌ Échec création:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur réseau création:', error);
    return null;
  }
}

// Function pour tester la récupération des demandes
async function testGetRequests() {
  console.log('🧪 TEST: Récupération des demandes par l\'admin');
  
  // Token admin de test (vous devrez le remplacer par un vrai token)
  const adminToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test'; // Token factice
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/account-requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    console.log('📡 Réponse status:', response.status);
    console.log('📄 Réponse data:', data);
    
    if (response.ok) {
      console.log('✅ Récupération réussie, nombre de demandes:', data.requests?.length || 0);
      return data.requests;
    } else {
      console.log('❌ Échec récupération:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur réseau récupération:', error);
    return null;
  }
}

// Test de connectivité Firebase
async function testFirebaseConnection() {
  console.log('🧪 TEST: Connectivité Firebase via diagnostic API');
  
  try {
    const response = await fetch(`${BASE_URL}/api/diagnostic/firebase-test`);
    const data = await response.json();
    console.log('📡 Diagnostic Firebase:', data);
    return data.success;
  } catch (error) {
    console.error('❌ Erreur test Firebase:', error);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 DÉBUT DES TESTS DE DIAGNOSTIC\n');
  
  // Test 1: Connectivité Firebase
  console.log('=== TEST 1: Firebase Connection ===');
  const firebaseOk = await testFirebaseConnection();
  console.log('');
  
  // Test 2: Création d'une demande
  console.log('=== TEST 2: Création demande ===');
  const requestId = await testCreateRequest();
  console.log('');
  
  // Test 3: Récupération des demandes
  console.log('=== TEST 3: Récupération demandes ===');
  const requests = await testGetRequests();
  console.log('');
  
  // Résumé
  console.log('📊 RÉSUMÉ DES TESTS:');
  console.log('Firebase connecté:', firebaseOk ? '✅' : '❌');
  console.log('Création demande:', requestId ? '✅' : '❌');
  console.log('Récupération demandes:', requests ? '✅' : '❌');
}

// Exécuter si le script est appelé directement
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}
