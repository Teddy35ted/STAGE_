const https = require('https');
const http = require('http');

// Configuration pour ignorer les erreurs SSL en développement
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function testAPI() {
  console.log('🧪 Test de l\'API de demande de compte...');
  
  const data = JSON.stringify({
    email: `test-${Date.now()}@example.com`,
    nom: 'Test',
    prenom: 'API',
    raison: 'Test automatisé'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/request-account',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          console.log('✅ Réponse reçue:', jsonResponse);
          resolve(jsonResponse);
        } catch (error) {
          console.log('📄 Réponse brute:', responseData);
          resolve({ raw: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erreur de requête:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testLoginTemporary() {
  console.log('\n🔐 Test de connexion temporaire...');
  
  const data = JSON.stringify({
    email: 'test@example.com',
    temporaryPassword: 'TEMP123',
    newPassword: 'NouveauPassword123!',
    isFirstLogin: true
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login-temporary',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          console.log('✅ Réponse reçue:', jsonResponse);
          resolve(jsonResponse);
        } catch (error) {
          console.log('📄 Réponse brute:', responseData);
          resolve({ raw: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erreur de requête:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Début des tests API\n');
  
  try {
    // Test 1: Création d'une demande
    await testAPI();
    
    // Test 2: Connexion temporaire
    await testLoginTemporary();
    
    console.log('\n✅ Tests terminés');
  } catch (error) {
    console.error('\n❌ Erreur globale:', error);
  }
}

// Exécuter les tests
runTests();
