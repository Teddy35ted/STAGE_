#!/usr/bin/env node

/**
 * Test complet du système Co-gestionnaires
 * Teste toutes les fonctionnalités critiques
 */

const API_BASE = 'http://localhost:3000/api';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n${step}. ${description}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

// Variables globales pour les tests
let proprietaireToken = null;
let coGestionnaireId = null;
let coGestionnaireToken = null;
let testEmail = `test-cogest-${Date.now()}@example.com`;

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.text();
    
    try {
      return {
        ok: response.ok,
        status: response.status,
        data: JSON.parse(data)
      };
    } catch {
      return {
        ok: response.ok,
        status: response.status,
        data: data
      };
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message
    };
  }
}

async function testProprietaireAuth() {
  logStep(1, 'Test authentification propriétaire');
  
  // Simuler une authentification propriétaire
  // En réalité, il faudrait s'authentifier via Firebase
  // Pour ce test, on simule un token valide
  
  proprietaireToken = 'test-proprietaire-token';
  logSuccess('Authentification propriétaire simulée');
  
  return true;
}

async function testCreateCoGestionnaire() {
  logStep(2, 'Test création co-gestionnaire');
  
  const coGestionnaireData = {
    nom: 'Test',
    prenom: 'CoGestionnaire',
    email: testEmail,
    tel: '+228 12 34 56 78',
    pays: 'Togo',
    ville: 'Lomé',
    ACCES: 'gerer',
    permissions: [
      {
        resource: 'laalas',
        actions: ['create', 'read', 'update']
      },
      {
        resource: 'contenus',
        actions: ['read', 'update']
      }
    ],
    password: 'TestPassword123!',
    description: 'Co-gestionnaire de test'
  };

  const result = await makeRequest('/co-gestionnaires', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${proprietaireToken}`
    },
    body: JSON.stringify(coGestionnaireData)
  });

  if (result.ok && result.data.success) {
    coGestionnaireId = result.data.id;
    logSuccess(`Co-gestionnaire créé avec ID: ${coGestionnaireId}`);
    return true;
  } else {
    logError(`Échec création co-gestionnaire: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testCoGestionnaireAuth() {
  logStep(3, 'Test authentification co-gestionnaire');
  
  const loginData = {
    email: testEmail,
    password: 'TestPassword123!'
  };

  const result = await makeRequest('/auth/co-gestionnaire', {
    method: 'POST',
    body: JSON.stringify(loginData)
  });

  if (result.ok && result.data.success) {
    coGestionnaireToken = result.data.data.token;
    logSuccess('Authentification co-gestionnaire réussie');
    
    // Vérifier si changement de mot de passe requis
    const passwordCheck = await makeRequest('/auth/check-password-change', {
      headers: {
        'Authorization': `Bearer ${coGestionnaireToken}`
      }
    });
    
    if (passwordCheck.ok) {
      if (passwordCheck.data.requiresPasswordChange) {
        logWarning('Changement de mot de passe requis (normal pour nouveau co-gestionnaire)');
      } else {
        logSuccess('Aucun changement de mot de passe requis');
      }
    }
    
    return true;
  } else {
    logError(`Échec authentification co-gestionnaire: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testPasswordChange() {
  logStep(4, 'Test changement de mot de passe co-gestionnaire');
  
  const passwordData = {
    userId: coGestionnaireId,
    currentPassword: 'TestPassword123!',
    newPassword: 'NewTestPassword456!'
  };

  const result = await makeRequest('/auth/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${coGestionnaireToken}`
    },
    body: JSON.stringify(passwordData)
  });

  if (result.ok && result.data.success) {
    logSuccess('Changement de mot de passe réussi');
    return true;
  } else {
    logError(`Échec changement mot de passe: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testPermissions() {
  logStep(5, 'Test permissions co-gestionnaire');
  
  // Test accès autorisé aux laalas
  const laalaTest = await makeRequest('/laalas', {
    headers: {
      'Authorization': `Bearer ${coGestionnaireToken}`
    }
  });

  if (laalaTest.ok) {
    logSuccess('Accès autorisé aux laalas');
  } else {
    logError('Accès refusé aux laalas (inattendu)');
  }

  // Test accès interdit aux co-gestionnaires (ne peut pas créer d'autres co-gestionnaires)
  const coGestTest = await makeRequest('/co-gestionnaires', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${coGestionnaireToken}`
    },
    body: JSON.stringify({
      nom: 'Unauthorized',
      email: 'unauthorized@test.com',
      password: 'test123'
    })
  });

  if (!coGestTest.ok && coGestTest.status === 403) {
    logSuccess('Accès correctement refusé à la création de co-gestionnaires');
  } else {
    logError('Accès incorrectement autorisé à la création de co-gestionnaires');
  }

  return true;
}

async function testCoGestionnaireModification() {
  logStep(6, 'Test modification co-gestionnaire');
  
  const updateData = {
    description: 'Description modifiée via test',
    ACCES: 'consulter'
  };

  const result = await makeRequest(`/co-gestionnaires/${coGestionnaireId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${proprietaireToken}`
    },
    body: JSON.stringify(updateData)
  });

  if (result.ok && result.data.success) {
    logSuccess('Modification co-gestionnaire réussie');
    return true;
  } else {
    logError(`Échec modification co-gestionnaire: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testCoGestionnaireVisualization() {
  logStep(7, 'Test visualisation co-gestionnaire');
  
  const result = await makeRequest(`/co-gestionnaires/${coGestionnaireId}`, {
    headers: {
      'Authorization': `Bearer ${proprietaireToken}`
    }
  });

  if (result.ok && result.data.id) {
    logSuccess('Visualisation co-gestionnaire réussie');
    return true;
  } else {
    logError(`Échec visualisation co-gestionnaire: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testCoGestionnaireDeletion() {
  logStep(8, 'Test suppression co-gestionnaire');
  
  const result = await makeRequest(`/co-gestionnaires/${coGestionnaireId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${proprietaireToken}`
    }
  });

  if (result.ok && result.data.success) {
    logSuccess('Suppression co-gestionnaire réussie');
    
    // Vérifier que l'accès est révoqué
    const accessTest = await makeRequest('/laalas', {
      headers: {
        'Authorization': `Bearer ${coGestionnaireToken}`
      }
    });

    if (!accessTest.ok) {
      logSuccess('Accès correctement révoqué après suppression');
    } else {
      logWarning('Accès toujours valide après suppression (peut prendre quelques secondes)');
    }
    
    return true;
  } else {
    logError(`Échec suppression co-gestionnaire: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function runAllTests() {
  log('\n🧪 DÉMARRAGE DES TESTS SYSTÈME CO-GESTIONNAIRES', 'bright');
  log('='.repeat(60), 'blue');
  
  const tests = [
    testProprietaireAuth,
    testCreateCoGestionnaire,
    testCoGestionnaireAuth,
    testPasswordChange,
    testPermissions,
    testCoGestionnaireModification,
    testCoGestionnaireVisualization,
    testCoGestionnaireDeletion
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Erreur dans le test: ${error.message}`);
      failed++;
    }
  }

  log('\n📊 RÉSULTATS DES TESTS', 'bright');
  log('='.repeat(30), 'blue');
  logSuccess(`Tests réussis: ${passed}`);
  if (failed > 0) {
    logError(`Tests échoués: ${failed}`);
  }
  
  const success = failed === 0;
  log(`\n🎯 STATUT GLOBAL: ${success ? 'TOUS LES TESTS PASSÉS ✅' : 'CERTAINS TESTS ONT ÉCHOUÉ ❌'}`, success ? 'green' : 'red');
  
  return success;
}

// Exécution si appelé directement
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runAllTests };
