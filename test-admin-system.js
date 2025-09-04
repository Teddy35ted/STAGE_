// Test de vérification de l'authentification admin et du système de notifications
console.log('🧪 === TEST AUTHENTIFICATION ADMIN ET NOTIFICATIONS ===');

async function testAdminAuth() {
  console.log('\n1. 🔐 Test de connexion administrateur...');
  
  try {
    const response = await fetch('http://localhost:3001/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'tedkouevi701@gmail.com',
        password: 'feiderus'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Connexion admin réussie !');
      console.log('📄 Token reçu:', result.token ? 'Oui' : 'Non');
      console.log('👤 Admin ID:', result.admin?.id || 'Non disponible');
      console.log('📧 Email admin:', result.admin?.email || 'Non disponible');
      console.log('🔑 Rôle:', result.admin?.role || 'Non disponible');
      return result.token;
    } else {
      console.log('❌ Échec de connexion admin');
      console.log('📄 Erreur:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
    return null;
  }
}

async function testAccountRequestCreation() {
  console.log('\n2. 📝 Test de création de demande de compte...');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/request-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test.user@example.com',
        role: 'animateur'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Demande de compte créée avec succès !');
      console.log('🆔 Request ID:', result.requestId);
      console.log('📧 Email demandeur:', 'test.user@example.com');
      console.log('🔔 Notification admin:', 'Devrait être envoyée automatiquement');
      return result.requestId;
    } else {
      console.log('❌ Échec de création de demande');
      console.log('📄 Erreur:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
    return null;
  }
}

async function testPendingRequests(adminToken) {
  console.log('\n3. 📋 Test de récupération des demandes en attente...');
  
  if (!adminToken) {
    console.log('❌ Pas de token admin disponible');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3001/api/admin/account-requests', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Demandes récupérées avec succès !');
      console.log('📊 Nombre de demandes:', result.requests?.length || 0);
      
      if (result.requests && result.requests.length > 0) {
        console.log('📝 Dernière demande:');
        const lastRequest = result.requests[0];
        console.log('  - Email:', lastRequest.email);
        console.log('  - Rôle:', lastRequest.role);
        console.log('  - Statut:', lastRequest.status);
        console.log('  - Date:', new Date(lastRequest.requestDate).toLocaleString('fr-FR'));
      }
    } else {
      console.log('❌ Échec de récupération des demandes');
      console.log('📄 Erreur:', result.error);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests...\n');
  
  // Test 1: Authentification admin
  const adminToken = await testAdminAuth();
  
  // Test 2: Création d'une demande de compte
  const requestId = await testAccountRequestCreation();
  
  // Test 3: Récupération des demandes
  await testPendingRequests(adminToken);
  
  console.log('\n🏁 === FIN DES TESTS ===');
  console.log('\n📋 RÉSUMÉ:');
  console.log('🔐 Authentification admin:', adminToken ? '✅ OK' : '❌ ÉCHEC');
  console.log('📝 Création demande:', requestId ? '✅ OK' : '❌ ÉCHEC');
  console.log('🔔 Système notifications:', '✅ Intégré (vérifier logs serveur)');
  
  console.log('\n💡 PROCHAINES ÉTAPES:');
  console.log('1. Vérifier les logs du serveur pour les notifications');
  console.log('2. Tester l\'interface admin via le navigateur');
  console.log('3. Tester l\'approbation/rejet des demandes');
  
  process.exit(0);
}

// Attendre un peu que le serveur soit prêt
setTimeout(runTests, 2000);
