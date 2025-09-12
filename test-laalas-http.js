/**
 * Test simple de l'API laalas via HTTP
 */

const http = require('http');
const fs = require('fs');

// Configuration
const API_BASE = 'http://localhost:3000'; // Ajustez selon votre port
const TEST_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // À remplacer par un vrai token

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: res.headers['content-type']?.includes('application/json') 
              ? JSON.parse(body) 
              : body
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testLaalasAPI() {
  console.log('🚀 Test de l\'API laalas via HTTP...\n');

  try {
    // Test 1: GET sans authentification (doit échouer)
    console.log('=== TEST 1: GET /api/laalas SANS AUTH ===');
    const result1 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/laalas',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${result1.status}`);
    console.log(`Body:`, result1.body);
    console.log('');

    // Test 2: GET avec authentification (si token fourni)
    if (TEST_TOKEN !== 'YOUR_AUTH_TOKEN_HERE') {
      console.log('=== TEST 2: GET /api/laalas AVEC AUTH ===');
      const result2 = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/laalas',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log(`Status: ${result2.status}`);
      console.log(`Body:`, result2.body);
      console.log('');
    } else {
      console.log('⏭️ Test avec auth ignoré (token non configuré)');
      console.log('   Pour tester avec authentification:');
      console.log('   1. Connectez-vous à votre app');
      console.log('   2. Ouvrez les DevTools');
      console.log('   3. Tapez: localStorage.getItem("firebase-token")');
      console.log('   4. Remplacez TEST_TOKEN dans ce script');
      console.log('');
    }

    // Test 3: Vérifier si le serveur Next.js est en marche
    console.log('=== TEST 3: VÉRIFICATION SERVEUR ===');
    try {
      const healthCheck = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET',
        timeout: 5000
      });
      console.log(`✅ Serveur répond (Status: ${healthCheck.status})`);
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      console.log('   Assurez-vous que le serveur Next.js est démarré avec: npm run dev');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Instructions pour l'utilisateur
console.log('📋 INSTRUCTIONS:');
console.log('1. Assurez-vous que votre serveur Next.js est démarré (npm run dev)');
console.log('2. Pour tester avec authentification, récupérez votre token:');
console.log('   - Connectez-vous à votre app');
console.log('   - Ouvrez DevTools > Console');
console.log('   - Tapez: localStorage.getItem("firebase-token")');
console.log('   - Copiez le token et remplacez TEST_TOKEN dans ce script');
console.log('3. Exécutez: node test-laalas-http.js\n');

// Vérifier si le serveur est probablement en marche
const serverRunning = process.argv.includes('--run');

if (serverRunning) {
  testLaalasAPI();
} else {
  console.log('🚦 Pour exécuter les tests: node test-laalas-http.js --run');
  console.log('   (Assurez-vous d\'abord que le serveur Next.js est démarré)');
}

module.exports = { testLaalasAPI };