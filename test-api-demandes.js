// Test de l'API des demandes de compte
const jwt = require('jsonwebtoken');

async function testerAPIDemandes() {
  console.log('🧪 TEST API DEMANDES DE COMPTE');
  console.log('=' .repeat(35));
  
  try {
    // 1. Créer un token admin valide
    console.log('\n1️⃣ Génération du token admin...');
    const payload = {
      adminId: 'wCVLQ1Y8TdfW8fsNNFJC',
      email: 'tedkouevi701@gmail.com',
      permissions: ['manage-accounts'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 heure
    };
    
    const jwtSecret = 'a247cb7efc997015f8fb0360144061e09738e88c7141cfc0ac26d20a7587d77a';
    const token = jwt.sign(payload, jwtSecret);
    console.log('✅ Token généré');
    
    // 2. Tester l'API
    console.log('\n2️⃣ Test de l\'API /api/admin/account-requests...');
    
    const response = await fetch('http://localhost:3001/api/admin/account-requests', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Status HTTP: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse API reçue');
      console.log('📋 Données:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log(`📊 Nombre de demandes: ${data.requests?.length || 0}`);
        
        if (data.requests && data.requests.length > 0) {
          console.log('\n📋 Détail des demandes:');
          data.requests.forEach((request, index) => {
            console.log(`  ${index + 1}. ${request.email} - ${request.status} - ${request.requestDate}`);
          });
        } else {
          console.log('⚠️  Aucune demande trouvée');
        }
      } else {
        console.log('❌ Erreur API:', data.error);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur HTTP:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('🔌 Problème de connexion au serveur');
      console.log('💡 Vérifiez que le serveur tourne sur http://localhost:3001');
    }
  }
}

// Test spécifique du service
async function testerService() {
  console.log('\n🔧 TEST DIRECT DU SERVICE');
  console.log('=' .repeat(25));
  
  try {
    // Simuler l'appel du service (sans import ES6)
    console.log('📞 Test du service AccountRequestService...');
    
    // Créer une requête POST vers l'API pour simuler
    const testResponse = await fetch('http://localhost:3001/api/admin/account-requests', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Test avec token invalide: ${testResponse.status}`);
    
    if (testResponse.status === 401) {
      console.log('✅ Authentification fonctionne (401 attendu)');
    } else {
      console.log('⚠️  Comportement inattendu');
    }
    
  } catch (error) {
    console.log('❌ Erreur service:', error.message);
  }
}

// Exécuter les tests
async function executerTests() {
  await testerAPIDemandes();
  await testerService();
  
  console.log('\n🎯 RÉSUMÉ:');
  console.log('Si aucune demande n\'apparaît, causes possibles:');
  console.log('1. 📭 Collection Firebase vide');
  console.log('2. 🔒 Problème permissions Firebase');
  console.log('3. 🔧 Erreur dans AccountRequestService');
  console.log('4. 🌐 Problème de réseau/connexion');
}

executerTests();
