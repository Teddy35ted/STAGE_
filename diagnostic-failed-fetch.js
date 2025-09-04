// Diagnostic de l'erreur "Failed to fetch" dans AdminDashboard
console.log('🔍 DIAGNOSTIC ERREUR "Failed to fetch"');
console.log('=' .repeat(45));

async function diagnosticFailedFetch() {
  console.log('\n1️⃣ Test de l\'API sans authentification...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/account-requests');
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('✅ API répond (401 = normal sans token)');
    } else {
      const data = await response.text();
      console.log('📄 Réponse:', data.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Erreur fetch sans auth:', error.message);
  }
  
  console.log('\n2️⃣ Test avec un token factice...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/account-requests', {
      headers: {
        'Authorization': 'Bearer fake-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('📊 Status avec token fake:', response.status);
  } catch (error) {
    console.log('❌ Erreur fetch avec token fake:', error.message);
  }
  
  console.log('\n3️⃣ Vérification de localStorage...');
  
  // Simuler l'environnement navigateur
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    console.log('🔑 Token présent:', !!token);
    if (token) {
      console.log('📏 Longueur token:', token.length);
      console.log('🔍 Début token:', token.substring(0, 20) + '...');
    }
  } else {
    console.log('⚠️ localStorage non disponible (test Node.js)');
  }
  
  console.log('\n4️⃣ Solutions possibles...');
  console.log('✅ Vérifier que le serveur tourne sur localhost:3000');
  console.log('✅ Vérifier que le token JWT est valide');
  console.log('✅ Vérifier la console navigateur pour plus de détails');
  console.log('✅ Redémarrer le serveur si nécessaire');
  
  console.log('\n5️⃣ Test de reconnexion admin...');
  console.log('🔑 Pour tester, reconnectez-vous avec:');
  console.log('   Email: tedkouevi701@gmail.com');
  console.log('   Mot de passe: feiderus');
}

// Test réseau simple
async function testReseauSimple() {
  console.log('\n🌐 TEST RÉSEAU SIMPLE');
  console.log('=' .repeat(25));
  
  try {
    // Test du serveur principal
    const response = await fetch('http://localhost:3000/');
    console.log('✅ Serveur principal accessible:', response.ok);
    
    // Test d'une route API simple
    const apiTest = await fetch('http://localhost:3000/api/health');
    console.log('📡 Route API de test:', apiTest.status === 404 ? 'Serveur répond' : 'API accessible');
    
  } catch (error) {
    console.log('❌ Serveur inaccessible:', error.message);
    console.log('🔧 Solution: Vérifiez que "npm run dev" fonctionne');
  }
}

diagnosticFailedFetch();
testReseauSimple();
