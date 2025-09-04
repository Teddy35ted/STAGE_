// Script de diagnostic pour tester les APIs d'email
import { EmailService } from '../app/Backend/services/email/EmailService';
import { AccountRequestService } from '../app/Backend/services/collections/AccountRequestService';

async function testEmailAPIs() {
  console.log('🧪 DIAGNOSTIC DES APIs EMAIL');
  console.log('================================');

  // Test 1: Configuration EmailService
  console.log('\n📧 Test 1: Configuration EmailService');
  try {
    const emailService = new EmailService();
    const isValid = await emailService.verifyConnection();
    console.log('✅ Configuration email:', isValid ? 'VALIDE' : 'INVALIDE');
  } catch (error) {
    console.log('❌ Erreur configuration email:', error);
  }

  // Test 2: AccountRequestService
  console.log('\n📋 Test 2: AccountRequestService');
  try {
    const accountRequestService = new AccountRequestService();
    console.log('✅ AccountRequestService initialisé');
  } catch (error) {
    console.log('❌ Erreur AccountRequestService:', error);
  }

  // Test 3: Variables d'environnement
  console.log('\n🔧 Test 3: Variables d\'environnement');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ DÉFINI' : '❌ MANQUANT');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ DÉFINI' : '❌ MANQUANT');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ DÉFINI' : '❌ MANQUANT');
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'Valeur par défaut');

  // Test 4: Dépendances
  console.log('\n📦 Test 4: Dépendances');
  try {
    const nodemailer = require('nodemailer');
    const jwt = require('jsonwebtoken');
    console.log('✅ nodemailer: DISPONIBLE');
    console.log('✅ jsonwebtoken: DISPONIBLE');
  } catch (error) {
    console.log('❌ Erreur dépendances:', error);
  }
}

// Test d'API endpoint
async function testApproveEndpoint() {
  console.log('\n🔗 Test API Endpoint Approve');
  try {
    const testData = {
      requestId: 'test-request-id',
      comment: 'Test d\'approbation',
      temporaryPassword: 'TempPass123',
      customSubject: 'Test Subject',
      customAdminEmail: 'admin@test.com'
    };

    console.log('Données de test:', testData);
    console.log('⚠️  Pour un test complet, utilisez Postman ou le dashboard admin');
  } catch (error) {
    console.log('❌ Erreur test endpoint:', error);
  }
}

// Problèmes identifiés et solutions
function listIssuesAndSolutions() {
  console.log('\n🚨 PROBLÈMES IDENTIFIÉS ET SOLUTIONS');
  console.log('====================================');

  console.log('\n1. Configuration Gmail:');
  console.log('   ❌ Problème: Gmail peut rejeter les emails avec from personnalisé');
  console.log('   ✅ Solution: Utiliser toujours EMAIL_USER comme expéditeur');

  console.log('\n2. Variables d\'environnement:');
  console.log('   ❌ Problème: Certaines variables peuvent être manquantes');
  console.log('   ✅ Solution: Vérifier .env.local');

  console.log('\n3. Authentification JWT:');
  console.log('   ❌ Problème: Token admin pourrait être invalide');
  console.log('   ✅ Solution: Vérifier la génération et validation des tokens');

  console.log('\n4. Gestion d\'erreurs:');
  console.log('   ❌ Problème: Erreurs email silencieuses');
  console.log('   ✅ Solution: Améliorer les logs et la gestion d\'erreurs');
}

// Exécuter tous les tests
async function runAllTests() {
  await testEmailAPIs();
  await testApproveEndpoint();
  listIssuesAndSolutions();
}

runAllTests().catch(console.error);
