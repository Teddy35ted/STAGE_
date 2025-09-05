// Script de test pour l'ancien système d'authentification direct
require('dotenv').config({ path: '.env.local' });

async function testOldAuthSystem() {
  console.log('🧪 === TEST DE L\'ANCIEN SYSTÈME D\'AUTHENTIFICATION ===\n');

  const testEmail = `test-${Date.now()}@example.com`;
  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: Créer un compte avec l'ancien système
    console.log('📧 Test 1: Création de compte direct');
    console.log(`Email de test: ${testEmail}`);
    
    const response = await fetch(`${baseUrl}/api/auth/request-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Compte créé avec succès!');
      console.log('📄 Réponse:', result);
      
      if (result.userId) {
        console.log(`🆔 ID utilisateur généré: ${result.userId}`);
      }
      
      console.log('📧 Un email avec le mot de passe temporaire devrait être envoyé\n');
      
      // Test 2: Vérifier que l'utilisateur existe
      console.log('🔍 Test 2: Vérification de l\'existence de l\'utilisateur');
      
      // Attendre un peu pour que l'utilisateur soit créé
      setTimeout(async () => {
        try {
          const checkResponse = await fetch(`${baseUrl}/api/auth/request-account`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: testEmail
            })
          });
          
          const checkResult = await checkResponse.json();
          
          if (checkResponse.status === 409) {
            console.log('✅ Vérification réussie: L\'utilisateur existe déjà');
            console.log('📄 Message:', checkResult.error);
          } else {
            console.log('❌ Erreur: L\'utilisateur n\'a pas été créé correctement');
          }
          
        } catch (checkError) {
          console.error('❌ Erreur lors de la vérification:', checkError.message);
        }
      }, 1000);
      
    } else {
      console.error('❌ Erreur lors de la création du compte:');
      console.error('📄 Réponse:', result);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Attendre que le serveur soit prêt
setTimeout(() => {
  testOldAuthSystem();
}, 2000);
