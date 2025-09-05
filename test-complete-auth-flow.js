/**
 * Test complet du flux d'authentification
 * 1. Création d'une demande de compte
 * 2. Approbation par admin 
 * 3. Connexion avec mot de passe temporaire
 * 4. Création du compte utilisateur
 */

async function testCompleteAuthFlow() {
  const baseUrl = 'http://localhost:3001';
  const testEmail = `test-${Date.now()}@example.com`;
  
  console.log('🚀 Test du flux d\'authentification complet');
  console.log('📧 Email de test:', testEmail);
  
  try {
    // Étape 1: Créer une demande de compte
    console.log('\n1️⃣ Création d\'une demande de compte...');
    const createResponse = await fetch(`${baseUrl}/api/auth/request-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        raison: 'Test automatisé du système',
        nom: 'Test',
        prenom: 'Utilisateur'
      })
    });
    
    const createResult = await createResponse.json();
    console.log('Résultat création:', createResult);
    
    if (!createResult.success) {
      throw new Error('Échec création demande: ' + createResult.error);
    }
    
    const requestId = createResult.data.id;
    console.log('✅ Demande créée avec ID:', requestId);
    
    // Étape 2: Simuler l'approbation admin (directement via API)
    console.log('\n2️⃣ Approbation de la demande (simulation admin)...');
    const approveResponse = await fetch(`${baseUrl}/api/admin/account-requests/${requestId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: En réel, il faudrait un token JWT admin
        'Authorization': 'Bearer admin-token'
      },
      body: JSON.stringify({
        action: 'approve'
      })
    });
    
    const approveResult = await approveResponse.json();
    console.log('Résultat approbation:', approveResult);
    
    // Récupérer la demande pour obtenir le mot de passe temporaire
    console.log('\n3️⃣ Récupération du mot de passe temporaire...');
    const getRequestResponse = await fetch(`${baseUrl}/api/admin/account-requests`);
    const requestsData = await getRequestResponse.json();
    
    const approvedRequest = requestsData.data?.find(req => req.id === requestId);
    if (!approvedRequest || !approvedRequest.temporaryPassword) {
      throw new Error('Mot de passe temporaire non trouvé');
    }
    
    const tempPassword = approvedRequest.temporaryPassword;
    console.log('✅ Mot de passe temporaire:', tempPassword);
    
    // Étape 4: Première connexion avec mot de passe temporaire
    console.log('\n4️⃣ Première connexion avec mot de passe temporaire...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login-temporary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        temporaryPassword: tempPassword,
        newPassword: 'MonNouveauMotDePasse123!',
        isFirstLogin: true
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Résultat première connexion:', loginResult);
    
    if (!loginResult.success) {
      throw new Error('Échec première connexion: ' + loginResult.error);
    }
    
    console.log('✅ Première connexion réussie');
    
    // Étape 5: Vérifier que la connexion normale fonctionne maintenant
    console.log('\n5️⃣ Test connexion normale...');
    const normalLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'MonNouveauMotDePasse123!'
      })
    });
    
    const normalLoginResult = await normalLoginResponse.json();
    console.log('Résultat connexion normale:', normalLoginResult);
    
    if (normalLoginResult.success) {
      console.log('✅ Connexion normale réussie');
    } else {
      console.log('⚠️ Connexion normale échouée:', normalLoginResult.error);
    }
    
    console.log('\n🎉 Test complet terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur dans le test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Fonction pour tester juste la connexion temporaire
async function testTemporaryLogin() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🔐 Test de connexion temporaire simple');
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/login-temporary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        temporaryPassword: 'TEMP123',
        newPassword: 'NouveauPassword123!',
        isFirstLogin: true
      })
    });
    
    const result = await response.json();
    console.log('Résultat:', result);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exporter les fonctions pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCompleteAuthFlow, testTemporaryLogin };
}

// Auto-exécution si appelé directement
if (typeof window === 'undefined' && require.main === module) {
  console.log('Choisissez le test à exécuter:');
  console.log('1. Test complet (node test-complete-auth-flow.js complete)');
  console.log('2. Test temporaire simple (node test-complete-auth-flow.js temp)');
  
  const arg = process.argv[2];
  if (arg === 'complete') {
    testCompleteAuthFlow();
  } else if (arg === 'temp') {
    testTemporaryLogin();
  } else {
    console.log('Usage: node test-complete-auth-flow.js [complete|temp]');
  }
}
