// Test complet du système FanFriends - Campagnes et Communications
// Ce script teste toutes les opérations CRUD sur les campagnes et communications

class FanFriendsSystemTester {
  constructor() {
    this.baseUrl = window.location.origin;
    this.token = null;
    this.testResults = {
      communications: { create: false, read: false, update: false, delete: false },
      campaigns: { create: false, read: false, update: false, delete: false },
      apis: { messages: false, campaigns: false },
      pages: { communications: false, campaigns: false }
    };
  }

  async init() {
    console.log('🚀 Initialisation du test FanFriends...');
    await this.getAuthToken();
  }

  async getAuthToken() {
    try {
      // Importer Firebase auth
      const { auth } = await import('../app/firebase/config');
      if (auth.currentUser) {
        this.token = await auth.currentUser.getIdToken();
        console.log('✅ Token d\'authentification obtenu');
        return true;
      } else {
        console.error('❌ Utilisateur non connecté');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur obtention token:', error);
      return false;
    }
  }

  // Test des APIs Messages/Communications
  async testMessagesAPI() {
    console.log('\n📧 Test API Messages/Communications...');
    
    try {
      // Test GET - Récupération des messages
      const getResponse = await fetch(`${this.baseUrl}/api/messages`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (getResponse.ok) {
        const messages = await getResponse.json();
        console.log('✅ GET /api/messages - OK');
        console.log(`📊 ${Array.isArray(messages) ? messages.length : 'N/A'} messages récupérés`);
        this.testResults.communications.read = true;
      } else {
        console.error('❌ GET /api/messages - ÉCHEC:', getResponse.status);
      }

      // Test POST - Création d'un message de test
      const testMessage = {
        receiverId: 'test-user-id',
        message: {
          type: 'text',
          text: 'Message de test pour FanFriends',
          name: 'Test Communication'
        },
        nomrec: 'Test Recipient',
        nomsend: 'Test Sender'
      };

      const createResponse = await fetch(`${this.baseUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage)
      });

      if (createResponse.ok) {
        const result = await createResponse.json();
        console.log('✅ POST /api/messages - OK');
        console.log('📝 Message créé avec ID:', result.id);
        this.testResults.communications.create = true;

        // Test PUT - Mise à jour du message créé
        if (result.id) {
          const updateResponse = await fetch(`${this.baseUrl}/api/messages/${result.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...testMessage,
              message: {
                ...testMessage.message,
                text: 'Message de test mis à jour'
              }
            })
          });

          if (updateResponse.ok) {
            console.log('✅ PUT /api/messages/:id - OK');
            this.testResults.communications.update = true;
          } else {
            console.error('❌ PUT /api/messages/:id - ÉCHEC:', updateResponse.status);
          }

          // Test DELETE - Suppression du message créé
          const deleteResponse = await fetch(`${this.baseUrl}/api/messages/${result.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          });

          if (deleteResponse.ok) {
            console.log('✅ DELETE /api/messages/:id - OK');
            this.testResults.communications.delete = true;
          } else {
            console.error('❌ DELETE /api/messages/:id - ÉCHEC:', deleteResponse.status);
          }
        }
      } else {
        console.error('❌ POST /api/messages - ÉCHEC:', createResponse.status);
      }

      this.testResults.apis.messages = true;

    } catch (error) {
      console.error('❌ Erreur test API messages:', error);
      this.testResults.apis.messages = false;
    }
  }

  // Test des APIs Campaigns
  async testCampaignsAPI() {
    console.log('\n🎯 Test API Campaigns...');
    
    try {
      // Test GET - Récupération des campagnes
      const getResponse = await fetch(`${this.baseUrl}/api/campaigns`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (getResponse.ok) {
        const result = await getResponse.json();
        console.log('✅ GET /api/campaigns - OK');
        console.log(`📊 ${result.data ? result.data.length : 0} campagnes récupérées`);
        this.testResults.campaigns.read = true;
      } else {
        console.error('❌ GET /api/campaigns - ÉCHEC:', getResponse.status);
      }

      // Test POST - Création d'une campagne de test
      const testCampaign = {
        name: 'Campagne Test FanFriends',
        description: 'Campagne de test pour vérifier le système',
        status: 'draft',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
        communications: []
      };

      const createResponse = await fetch(`${this.baseUrl}/api/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCampaign)
      });

      if (createResponse.ok) {
        const result = await createResponse.json();
        console.log('✅ POST /api/campaigns - OK');
        console.log('📝 Campagne créée avec ID:', result.data?.id);
        this.testResults.campaigns.create = true;

        // Test PUT - Mise à jour de la campagne créée
        if (result.data?.id) {
          const updateResponse = await fetch(`${this.baseUrl}/api/campaigns`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: result.data.id,
              name: 'Campagne Test FanFriends - Mise à jour',
              description: 'Campagne de test mise à jour'
            })
          });

          if (updateResponse.ok) {
            console.log('✅ PUT /api/campaigns - OK');
            this.testResults.campaigns.update = true;
          } else {
            console.error('❌ PUT /api/campaigns - ÉCHEC:', updateResponse.status);
          }

          // Test DELETE - Suppression de la campagne créée
          const deleteResponse = await fetch(`${this.baseUrl}/api/campaigns?id=${result.data.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          });

          if (deleteResponse.ok) {
            console.log('✅ DELETE /api/campaigns - OK');
            this.testResults.campaigns.delete = true;
          } else {
            console.error('❌ DELETE /api/campaigns - ÉCHEC:', deleteResponse.status);
          }
        }
      } else {
        console.error('❌ POST /api/campaigns - ÉCHEC:', createResponse.status);
      }

      this.testResults.apis.campaigns = true;

    } catch (error) {
      console.error('❌ Erreur test API campaigns:', error);
      this.testResults.apis.campaigns = false;
    }
  }

  // Test des pages frontend
  async testPages() {
    console.log('\n🌐 Test Pages Frontend...');
    
    try {
      // Test page Communications
      const commResponse = await fetch(`${this.baseUrl}/dashboard/fans/communications`);
      if (commResponse.ok) {
        console.log('✅ Page Communications accessible');
        this.testResults.pages.communications = true;
      } else {
        console.error('❌ Page Communications inaccessible:', commResponse.status);
      }

      // Test page Campaigns
      const campResponse = await fetch(`${this.baseUrl}/dashboard/fans/campaigns`);
      if (campResponse.ok) {
        console.log('✅ Page Campaigns accessible');
        this.testResults.pages.campaigns = true;
      } else {
        console.error('❌ Page Campaigns inaccessible:', campResponse.status);
      }

    } catch (error) {
      console.error('❌ Erreur test pages:', error);
    }
  }

  // Test complet
  async runCompleteTest() {
    console.log('🧪 === TEST COMPLET SYSTÈME FANFRIENDS ===\n');
    
    const authOk = await this.init();
    if (!authOk) {
      console.error('❌ Impossible de continuer sans authentification');
      return this.generateReport();
    }

    await this.testMessagesAPI();
    await this.testCampaignsAPI();
    await this.testPages();

    return this.generateReport();
  }

  // Génération du rapport
  generateReport() {
    console.log('\n📊 === RAPPORT DE TEST ===');
    
    const communications = this.testResults.communications;
    const campaigns = this.testResults.campaigns;
    const apis = this.testResults.apis;
    const pages = this.testResults.pages;

    console.log('\n📧 COMMUNICATIONS (CRUD):');
    console.log(`  Création (C): ${communications.create ? '✅' : '❌'}`);
    console.log(`  Lecture (R):  ${communications.read ? '✅' : '❌'}`);
    console.log(`  Mise à jour (U): ${communications.update ? '✅' : '❌'}`);
    console.log(`  Suppression (D): ${communications.delete ? '✅' : '❌'}`);

    console.log('\n🎯 CAMPAGNES (CRUD):');
    console.log(`  Création (C): ${campaigns.create ? '✅' : '❌'}`);
    console.log(`  Lecture (R):  ${campaigns.read ? '✅' : '❌'}`);
    console.log(`  Mise à jour (U): ${campaigns.update ? '✅' : '❌'}`);
    console.log(`  Suppression (D): ${campaigns.delete ? '✅' : '❌'}`);

    console.log('\n🔌 APIs:');
    console.log(`  Messages API: ${apis.messages ? '✅' : '❌'}`);
    console.log(`  Campaigns API: ${apis.campaigns ? '✅' : '❌'}`);

    console.log('\n🌐 PAGES:');
    console.log(`  Communications: ${pages.communications ? '✅' : '❌'}`);
    console.log(`  Campaigns: ${pages.campaigns ? '✅' : '❌'}`);

    // Score global
    const totalTests = Object.values(communications).length + 
                      Object.values(campaigns).length + 
                      Object.values(apis).length + 
                      Object.values(pages).length;
    
    const passedTests = [...Object.values(communications), 
                        ...Object.values(campaigns), 
                        ...Object.values(apis), 
                        ...Object.values(pages)]
                        .filter(Boolean).length;

    const score = Math.round((passedTests / totalTests) * 100);

    console.log(`\n🎯 SCORE GLOBAL: ${score}% (${passedTests}/${totalTests})`);
    
    if (score >= 90) {
      console.log('🟢 Système opérationnel - Excellent');
    } else if (score >= 70) {
      console.log('🟡 Système fonctionnel - Quelques améliorations possibles');
    } else if (score >= 50) {
      console.log('🟠 Système partiellement fonctionnel - Problèmes détectés');
    } else {
      console.log('🔴 Système non opérationnel - Intervention requise');
    }

    return {
      score,
      details: this.testResults,
      passed: passedTests,
      total: totalTests
    };
  }
}

// Fonction d'export pour utilisation
async function testFanFriendsSystem() {
  const tester = new FanFriendsSystemTester();
  return await tester.runCompleteTest();
}

// Export pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.testFanFriendsSystem = testFanFriendsSystem;
  window.FanFriendsSystemTester = FanFriendsSystemTester;
}

export { testFanFriendsSystem, FanFriendsSystemTester };
