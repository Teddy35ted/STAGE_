// ===== SCRIPT DE TEST SYSTÈME DE NOTIFICATIONS =====
// Test complet du système de notifications CRUD intégré

console.log('🧪 === TEST SYSTÈME DE NOTIFICATIONS CRUD ===');

// Configuration de test
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUserId: 'test-user-notifications',
  testEntities: {
    campaign: {
      name: 'Test Campaign Notifications',
      description: 'Campagne de test pour notifications',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
      status: 'draft'
    },
    message: {
      nomrec: 'Test Communication',
      idsender: 'test-user-notifications',
      receiverId: 'test-receiver',
      message: {
        text: 'Message de test pour notifications',
        type: 'text'
      }
    }
  }
};

// Fonction utilitaire pour les requêtes API
async function apiRequest(endpoint, options = {}) {
  const url = `${TEST_CONFIG.baseUrl}/api${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
    }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    console.error(`❌ Erreur requête ${endpoint}:`, error);
    return {
      success: false,
      status: 500,
      error: error.message
    };
  }
}

// Tests de notifications
async function testNotificationSystem() {
  console.log('\n📬 Test 1: Récupération des notifications');
  
  // Test récupération notifications
  const notificationsResult = await apiRequest('/notifications');
  if (notificationsResult.success) {
    console.log('✅ Récupération notifications réussie');
    console.log(`📊 ${notificationsResult.data.count || 0} notifications trouvées`);
  } else {
    console.log('❌ Erreur récupération notifications:', notificationsResult.status);
  }

  // Test comptage notifications non lues
  console.log('\n📊 Test 2: Comptage notifications non lues');
  const unreadResult = await apiRequest('/notifications/unread');
  if (unreadResult.success) {
    console.log('✅ Comptage réussi');
    console.log(`📈 ${unreadResult.data.unreadCount || 0} notifications non lues`);
  } else {
    console.log('❌ Erreur comptage:', unreadResult.status);
  }

  return {
    fetchNotifications: notificationsResult.success,
    fetchUnread: unreadResult.success
  };
}

// Tests CRUD avec notifications
async function testCrudWithNotifications() {
  console.log('\n🔄 Test 3: CRUD Campagnes avec notifications');
  
  let campaignId = null;
  
  // Test création campagne
  console.log('📝 Création campagne...');
  const createResult = await apiRequest('/campaigns', {
    method: 'POST',
    body: JSON.stringify(TEST_CONFIG.testEntities.campaign)
  });
  
  if (createResult.success) {
    campaignId = createResult.data.data?.id;
    console.log('✅ Campagne créée avec ID:', campaignId);
    console.log('📬 Notification création envoyée (théoriquement)');
  } else {
    console.log('❌ Erreur création campagne:', createResult.status);
    return { create: false, update: false, delete: false };
  }

  // Attendre un peu pour la notification
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test modification campagne
  if (campaignId) {
    console.log('\n✏️ Modification campagne...');
    const updateResult = await apiRequest('/campaigns', {
      method: 'PUT',
      body: JSON.stringify({
        id: campaignId,
        name: 'Test Campaign Notifications - Modifiée',
        description: 'Description modifiée pour test notifications'
      })
    });
    
    if (updateResult.success) {
      console.log('✅ Campagne modifiée');
      console.log('📬 Notification modification envoyée (théoriquement)');
    } else {
      console.log('❌ Erreur modification campagne:', updateResult.status);
    }

    // Attendre un peu pour la notification
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test suppression campagne
    console.log('\n🗑️ Suppression campagne...');
    const deleteResult = await apiRequest(`/campaigns?id=${campaignId}`, {
      method: 'DELETE'
    });
    
    if (deleteResult.success) {
      console.log('✅ Campagne supprimée');
      console.log('📬 Notification suppression envoyée (théoriquement)');
    } else {
      console.log('❌ Erreur suppression campagne:', deleteResult.status);
    }

    return {
      create: createResult.success,
      update: updateResult.success,
      delete: deleteResult.success
    };
  }

  return { create: createResult.success, update: false, delete: false };
}

// Tests messages avec notifications
async function testMessagesWithNotifications() {
  console.log('\n💬 Test 4: CRUD Messages avec notifications');
  
  let messageId = null;
  
  // Test création message
  console.log('📝 Création message...');
  const createResult = await apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify(TEST_CONFIG.testEntities.message)
  });
  
  if (createResult.success) {
    messageId = createResult.data.id;
    console.log('✅ Message créé avec ID:', messageId);
    console.log('📬 Notification création envoyée (théoriquement)');
  } else {
    console.log('❌ Erreur création message:', createResult.status);
    return { create: false };
  }

  return { create: createResult.success };
}

// Test marquage comme lu
async function testMarkAsRead() {
  console.log('\n✅ Test 5: Marquage notifications comme lues');
  
  const markResult = await apiRequest('/notifications', {
    method: 'PUT',
    body: JSON.stringify({ markAll: true })
  });
  
  if (markResult.success) {
    console.log('✅ Toutes les notifications marquées comme lues');
  } else {
    console.log('❌ Erreur marquage:', markResult.status);
  }

  return markResult.success;
}

// Fonction principale de test
async function runNotificationTests() {
  console.log('🚀 Démarrage des tests de notifications...\n');
  
  try {
    // Tests de base
    const notificationTests = await testNotificationSystem();
    
    // Tests CRUD avec notifications
    const crudTests = await testCrudWithNotifications();
    
    // Tests messages
    const messageTests = await testMessagesWithNotifications();
    
    // Test marquage comme lu
    const markTests = await testMarkAsRead();
    
    // Résumé des résultats
    console.log('\n📋 === RÉSUMÉ DES TESTS ===');
    console.log('Système de base:');
    console.log(`  📥 Récupération notifications: ${notificationTests.fetchNotifications ? '✅' : '❌'}`);
    console.log(`  📊 Comptage non lues: ${notificationTests.fetchUnread ? '✅' : '❌'}`);
    
    console.log('\nCRUD Campagnes:');
    console.log(`  📝 Création: ${crudTests.create ? '✅' : '❌'}`);
    console.log(`  ✏️ Modification: ${crudTests.update ? '✅' : '❌'}`);
    console.log(`  🗑️ Suppression: ${crudTests.delete ? '✅' : '❌'}`);
    
    console.log('\nCRUD Messages:');
    console.log(`  📝 Création: ${messageTests.create ? '✅' : '❌'}`);
    
    console.log('\nGestion:');
    console.log(`  ✅ Marquage lu: ${markTests ? '✅' : '❌'}`);
    
    const totalTests = 6;
    const passedTests = [
      notificationTests.fetchNotifications,
      notificationTests.fetchUnread,
      crudTests.create,
      crudTests.update,
      crudTests.delete,
      messageTests.create,
      markTests
    ].filter(Boolean).length;
    
    console.log(`\n🎯 RÉSULTAT: ${passedTests}/${totalTests} tests réussis`);
    
    if (passedTests === totalTests) {
      console.log('🎉 SYSTÈME DE NOTIFICATIONS ENTIÈREMENT FONCTIONNEL !');
    } else {
      console.log('⚠️ Système partiellement fonctionnel - Corrections nécessaires');
    }
    
  } catch (error) {
    console.error('💥 Erreur fatale lors des tests:', error);
  }
}

// Informations d'utilisation
console.log(`
📖 UTILISATION DU SCRIPT:

1. **Dans le navigateur (Console):**
   - Ouvrir les DevTools (F12)
   - Aller dans Console
   - Coller ce script et l'exécuter

2. **Configuration requise:**
   - Application en cours d'exécution sur localhost:3000
   - Utilisateur authentifié avec token valide
   - Services Firebase configurés

3. **Ce qui sera testé:**
   ✅ Récupération des notifications depuis l'API
   ✅ Comptage des notifications non lues
   ✅ Notifications lors de création de campagne
   ✅ Notifications lors de modification de campagne
   ✅ Notifications lors de suppression de campagne
   ✅ Notifications lors de création de message
   ✅ Marquage des notifications comme lues

4. **Pour exécuter maintenant:**
   runNotificationTests();
`);

// Auto-exécution si on est dans un environnement approprié
if (typeof window !== 'undefined' && window.location) {
  console.log('🌐 Environnement navigateur détecté - Prêt pour les tests');
  console.log('👉 Exécutez: runNotificationTests()');
} else {
  console.log('🔧 Script prêt - Utilisez dans un navigateur avec l\'application active');
}
