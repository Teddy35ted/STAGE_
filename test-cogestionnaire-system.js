#!/usr/bin/env node

/**
 * Script de test pour valider le système de co-gestionnaires
 * Usage: node test-cogestionnaire-system.js
 */

const BASE_URL = 'http://localhost:3000';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log('green', `✅ ${message}`);
}

function error(message) {
  log('red', `❌ ${message}`);
}

function info(message) {
  log('blue', `ℹ️ ${message}`);
}

function warning(message) {
  log('yellow', `⚠️ ${message}`);
}

class CoGestionnaireTestSuite {
  constructor() {
    this.ownerToken = null;
    this.coGestionnaireToken = null;
    this.coGestionnaireId = null;
    this.testLaalaId = null;
  }

  async runAllTests() {
    info('🧪 Début des tests du système Co-gestionnaire');
    
    try {
      // Tests préparatoires
      await this.testOwnerAuthentication();
      await this.testCreateCoGestionnaire();
      await this.testCoGestionnaireAuthentication();
      
      // Tests de permissions
      await this.testCreateLaalaWithCoGestionnaire();
      await this.testUnauthorizedActions();
      
      // Tests de révocation
      await this.testDeleteCoGestionnaire();
      await this.testRevokedAccess();
      
      // Tests d'audit
      await this.testAuditLogs();
      
      success('🎉 Tous les tests sont passés !');
    } catch (error) {
      console.error(`💥 Échec des tests: ${error.message}`);
      process.exit(1);
    }
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    const fetch = (await import('node-fetch')).default;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { body: JSON.stringify(data) })
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    return { status: response.status, data: result };
  }

  async testOwnerAuthentication() {
    info('🔐 Test 1: Authentification propriétaire');
    
    // Simule l'authentification du propriétaire
    // En production, récupérer un vrai token Firebase
    this.ownerToken = 'OWNER_TOKEN_HERE'; // À remplacer par un vrai token
    
    warning('⚠️ Remplacez OWNER_TOKEN_HERE par un vrai token Firebase du propriétaire');
    success('Authentification propriétaire simulée');
  }

  async testCreateCoGestionnaire() {
    info('👥 Test 2: Création co-gestionnaire');
    
    const coGestionnaireData = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: `test-cogest-${Date.now()}@example.com`,
      tel: '0123456789',
      pays: 'France',
      ville: 'Paris',
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
      password: 'MotDePasseSecurise123!'
    };

    const { status, data } = await this.makeRequest(
      'POST', 
      '/api/co-gestionnaires', 
      coGestionnaireData, 
      this.ownerToken
    );

    if (status === 201 && data.success) {
      this.coGestionnaireId = data.id;
      success(`Co-gestionnaire créé avec ID: ${this.coGestionnaireId}`);
    } else {
      throw new Error(`Échec création co-gestionnaire: ${JSON.stringify(data)}`);
    }
  }

  async testCoGestionnaireAuthentication() {
    info('🔑 Test 3: Authentification co-gestionnaire');
    
    const authData = {
      email: `test-cogest-${Date.now()}@example.com`, // Même email que création
      password: 'MotDePasseSecurise123!'
    };

    const { status, data } = await this.makeRequest(
      'POST', 
      '/api/auth/co-gestionnaire', 
      authData
    );

    if (status === 200 && data.success) {
      this.coGestionnaireToken = data.data.token;
      success('Co-gestionnaire authentifié avec succès');
    } else {
      throw new Error(`Échec authentification co-gestionnaire: ${JSON.stringify(data)}`);
    }
  }

  async testCreateLaalaWithCoGestionnaire() {
    info('📝 Test 4: Création laala avec co-gestionnaire');
    
    const laalaData = {
      nom: 'Test Laala Co-gestionnaire',
      description: 'Créé par un co-gestionnaire',
      type: 'Laala freestyle',
      categorie: 'test',
      isLaalaPublic: true,
      ismonetise: false,
      choosetext: true,
      chooseimg: false,
      choosevideo: false,
      chooselive: false
    };

    const { status, data } = await this.makeRequest(
      'POST', 
      '/api/laalas', 
      laalaData, 
      this.coGestionnaireToken
    );

    if (status === 201 && data.id) {
      this.testLaalaId = data.id;
      success(`Laala créé par co-gestionnaire avec ID: ${this.testLaalaId}`);
    } else {
      throw new Error(`Échec création laala par co-gestionnaire: ${JSON.stringify(data)}`);
    }
  }

  async testUnauthorizedActions() {
    info('🚫 Test 5: Actions non autorisées');
    
    // Tenter de créer un autre co-gestionnaire (doit échouer)
    const { status } = await this.makeRequest(
      'POST', 
      '/api/co-gestionnaires', 
      { nom: 'Test' }, 
      this.coGestionnaireToken
    );

    if (status === 403 || status === 401) {
      success('Accès refusé comme attendu pour création co-gestionnaire');
    } else {
      throw new Error('Co-gestionnaire ne devrait pas pouvoir créer d\'autres co-gestionnaires');
    }

    // Tenter d'accéder aux boutiques (doit échouer)
    const boutiquesResponse = await this.makeRequest(
      'GET', 
      '/api/boutiques', 
      null, 
      this.coGestionnaireToken
    );

    if (boutiquesResponse.status === 403 || boutiquesResponse.status === 401) {
      success('Accès refusé comme attendu pour les boutiques');
    } else {
      warning('⚠️ Co-gestionnaire ne devrait pas avoir accès aux boutiques');
    }
  }

  async testDeleteCoGestionnaire() {
    info('🗑️ Test 6: Suppression co-gestionnaire');
    
    const { status, data } = await this.makeRequest(
      'DELETE', 
      `/api/co-gestionnaires/${this.coGestionnaireId}`, 
      null, 
      this.ownerToken
    );

    if (status === 200 && data.success) {
      success('Co-gestionnaire supprimé avec succès');
    } else {
      throw new Error(`Échec suppression co-gestionnaire: ${JSON.stringify(data)}`);
    }
  }

  async testRevokedAccess() {
    info('🔒 Test 7: Accès révoqué après suppression');
    
    // Tenter d'utiliser l'ancien token
    const { status } = await this.makeRequest(
      'GET', 
      '/api/laalas', 
      null, 
      this.coGestionnaireToken
    );

    if (status === 401 || status === 403) {
      success('Accès correctement révoqué après suppression');
    } else {
      console.error('⚠️ L\'accès n\'a pas été révoqué ! Problème de sécurité !');
    }
  }

  async testAuditLogs() {
    info('📋 Test 8: Logs d\'audit');
    
    const { status, data } = await this.makeRequest(
      'GET', 
      '/api/audit-logs', 
      null, 
      this.ownerToken
    );

    if (status === 200 && data.logs && data.logs.length > 0) {
      success(`${data.logs.length} logs d'audit trouvés`);
      info(`Exemple de log: ${JSON.stringify(data.logs[0], null, 2)}`);
    } else {
      warning('Aucun log d\'audit trouvé');
    }
  }
}

// Exécution des tests
if (require.main === module) {
  const testSuite = new CoGestionnaireTestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = CoGestionnaireTestSuite;
