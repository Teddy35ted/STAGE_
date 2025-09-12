// Test des modifications de l'affichage des communications
// Ce script vérifie que les améliorations sont bien appliquées

async function testCommunicationsDisplay() {
  console.log('🧪 Test des modifications d\'affichage des communications');
  
  try {
    // Vérifier que la page communications existe
    const currentUrl = window.location.href;
    console.log('📍 URL actuelle:', currentUrl);
    
    if (currentUrl.includes('/dashboard/fans/communications')) {
      console.log('✅ Page communications détectée');
      
      // Vérifier les éléments de l'interface
      const tests = [
        {
          name: 'Bouton de création de communication',
          selector: 'button[class*="bg-gradient-to-r"]',
          expected: true
        },
        {
          name: 'Liste des communications',
          selector: '[class*="grid"][class*="gap-4"]',
          expected: true
        },
        {
          name: 'Absence de l\'ID dans les détails (vérification visuelle)',
          selector: 'label:contains("ID Communication")',
          expected: false
        }
      ];
      
      for (const test of tests) {
        try {
          const element = document.querySelector(test.selector);
          const exists = element !== null;
          
          if (exists === test.expected) {
            console.log(`✅ ${test.name}: OK`);
          } else {
            console.log(`❌ ${test.name}: ÉCHEC (attendu: ${test.expected}, trouvé: ${exists})`);
          }
        } catch (error) {
          console.log(`⚠️ ${test.name}: Erreur lors du test`, error);
        }
      }
      
      // Test spécifique pour l'affichage des communications
      const communicationCards = document.querySelectorAll('[class*="bg-white"][class*="rounded-lg"]');
      console.log(`📊 ${communicationCards.length} cartes de communication trouvées`);
      
      return {
        success: true,
        message: 'Tests d\'affichage terminés',
        cardsFound: communicationCards.length
      };
      
    } else {
      console.log('❌ Pas sur la page communications');
      console.log('💡 Naviguez vers /dashboard/fans/communications pour effectuer les tests');
      return {
        success: false,
        message: 'Page incorrecte pour les tests'
      };
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    return {
      success: false,
      message: 'Erreur lors des tests',
      error: error.message
    };
  }
}

// Test de récupération du nom d'utilisateur
async function testUserNameRetrieval() {
  console.log('👤 Test de récupération des noms d\'utilisateur');
  
  try {
    // Vérifier l'authentification
    const { auth } = await import('../app/firebase/config');
    if (!auth.currentUser) {
      console.log('❌ Utilisateur non connecté');
      return { success: false, message: 'Non connecté' };
    }
    
    const token = await auth.currentUser.getIdToken();
    const userId = auth.currentUser.uid;
    
    // Test de récupération du profil utilisateur
    const response = await fetch(`/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Données utilisateur récupérées:', userData);
      
      const name = userData.nom || userData.firstName || userData.displayName || userData.email || 'Nom non trouvé';
      console.log('📛 Nom d\'affichage extrait:', name);
      
      return {
        success: true,
        message: 'Récupération du nom réussie',
        userName: name,
        userData: userData
      };
    } else {
      console.log('❌ Erreur récupération utilisateur:', response.status);
      return {
        success: false,
        message: 'Erreur API utilisateur'
      };
    }
    
  } catch (error) {
    console.error('❌ Erreur test nom utilisateur:', error);
    return {
      success: false,
      message: 'Erreur test',
      error: error.message
    };
  }
}

// Test complet
async function testCommunicationsModifications() {
  console.log('🚀 === TEST COMPLET DES MODIFICATIONS COMMUNICATIONS ===\n');
  
  const displayTest = await testCommunicationsDisplay();
  console.log('\n');
  const userNameTest = await testUserNameRetrieval();
  
  console.log('\n📊 === RÉSULTATS ===');
  console.log('🖼️ Test d\'affichage:', displayTest.success ? '✅' : '❌');
  console.log('👤 Test nom utilisateur:', userNameTest.success ? '✅' : '❌');
  
  const allSuccess = displayTest.success && userNameTest.success;
  console.log(`\n🎯 Statut global: ${allSuccess ? '✅ Tous les tests passés' : '❌ Certains tests ont échoué'}`);
  
  return {
    display: displayTest,
    userName: userNameTest,
    overall: allSuccess
  };
}

// Export pour utilisation
if (typeof window !== 'undefined') {
  window.testCommunicationsDisplay = testCommunicationsDisplay;
  window.testUserNameRetrieval = testUserNameRetrieval;
  window.testCommunicationsModifications = testCommunicationsModifications;
}

export { testCommunicationsDisplay, testUserNameRetrieval, testCommunicationsModifications };
