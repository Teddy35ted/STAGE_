/**
 * Test de diagnostic pour l'API des laalas
 * Vérifie la récupération des données depuis la base
 */

const testLaalasAPI = async () => {
  console.log('🔍 === TEST DIAGNOSTIC API LAALAS ===\n');

  try {
    // Test 1: Vérifier l'authentification
    console.log('1. Test d\'authentification...');
    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.log('❌ Pas de token d\'authentification trouvé');
      console.log('📝 Assurez-vous d\'être connecté et réessayez');
      return;
    }
    console.log('✅ Token d\'authentification trouvé');

    // Test 2: Appel API laalas
    console.log('\n2. Test appel API /api/laalas...');
    
    const response = await fetch('/api/laalas', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Status de la réponse:', response.status);
    console.log('📡 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ Erreur API:', response.status, errorData);
      
      if (response.status === 401) {
        console.log('🔐 Problème d\'authentification - Token peut-être expiré');
      } else if (response.status === 500) {
        console.log('🔥 Erreur serveur - Vérifier les logs du serveur');
      }
      return;
    }

    // Test 3: Analyse des données reçues
    console.log('\n3. Analyse des données reçues...');
    
    const data = await response.json();
    console.log('📊 Type de données reçues:', typeof data);
    console.log('📊 Données reçues:', data);

    if (Array.isArray(data)) {
      console.log(`✅ ${data.length} laalas récupérés avec succès`);
      
      if (data.length > 0) {
        console.log('📋 Premier laala exemple:');
        const firstLaala = data[0];
        console.log('  - ID:', firstLaala.id);
        console.log('  - Nom:', firstLaala.nom || 'Non défini');
        console.log('  - Créateur:', firstLaala.idCreateur || 'Non défini');
        console.log('  - Date:', firstLaala.date || 'Non définie');
        console.log('  - Champs disponibles:', Object.keys(firstLaala));
      } else {
        console.log('ℹ️ Aucun laala trouvé - Base vide ou filtre trop restrictif');
      }
    } else {
      console.log('⚠️ Format de données inattendu:', data);
    }

    // Test 4: Vérifier les requêtes avec paramètres
    console.log('\n4. Test avec paramètre creatorId...');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.uid) {
      const responseWithCreator = await fetch(`/api/laalas?creatorId=${user.uid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (responseWithCreator.ok) {
        const creatorData = await responseWithCreator.json();
        console.log(`✅ ${creatorData.length} laalas trouvés pour l'utilisateur ${user.uid}`);
      } else {
        console.log('❌ Erreur avec paramètre creatorId:', responseWithCreator.status);
      }
    } else {
      console.log('⚠️ Pas d\'informations utilisateur pour tester creatorId');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.log('🔧 Vérifications à faire:');
    console.log('  - Le serveur est-il démarré ?');
    console.log('  - Les services Firebase sont-ils configurés ?');
    console.log('  - Y a-t-il des erreurs dans la console du serveur ?');
  }

  console.log('\n🏁 === FIN DU TEST ===');
};

// Auto-exécution si on est dans le navigateur
if (typeof window !== 'undefined') {
  testLaalasAPI();
} else {
  console.log('Ce script doit être exécuté dans la console du navigateur');
}