// Test simple pour vérifier la connectivité
const http = require('http');

function testBasicConnection() {
  console.log('🔍 Test de connectivité basique...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Connexion réussie - Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Réponse reçue (${data.length} caractères)`);
      console.log('🎯 Test de l\'API auth maintenant...');
      testAuthAPI();
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de connexion basique:', error.message);
  });

  req.end();
}

function testAuthAPI() {
  const data = JSON.stringify({
    email: `test-${Date.now()}@example.com`,
    nom: 'Test',
    prenom: 'NodeJS',
    raison: 'Test de connectivité'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/request-account',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  console.log('📡 Envoi requête vers:', `http://${options.hostname}:${options.port}${options.path}`);
  console.log('📦 Données:', data);

  const req = http.request(options, (res) => {
    console.log(`✅ Réponse API - Status: ${res.statusCode}`);
    console.log('📋 Headers:', res.headers);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Réponse complète:', responseData);
      try {
        const json = JSON.parse(responseData);
        console.log('🎯 Réponse JSON:', json);
      } catch (e) {
        console.log('⚠️ Réponse non-JSON');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur API:', error.message);
    console.error('🔍 Code erreur:', error.code);
    console.error('🔍 Détails:', error);
  });

  req.write(data);
  req.end();
}

// Démarrer le test
console.log('🚀 Démarrage des tests de connectivité...');
testBasicConnection();
