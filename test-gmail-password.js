// Test pour démontrer que le mot de passe Gmail normal ne fonctionne pas
const nodemailer = require('nodemailer');

async function testGmailPassword() {
  console.log('🧪 TEST: Mot de passe Gmail normal vs Mot de passe d\'application');
  console.log('=' .repeat(60));
  
  // Simulation avec mot de passe normal (sera rejeté)
  console.log('\n❌ TENTATIVE 1: Avec mot de passe Gmail normal');
  console.log('Résultat attendu: ÉCHEC - "Username and Password not accepted"');
  
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'exemple@gmail.com',
        pass: 'mot-de-passe-normal-gmail' // ❌ Ceci sera rejeté par Gmail
      }
    });
    
    // Gmail va rejeter cette connexion
    console.log('⚠️  Gmail rejettera cette tentative de connexion');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
  
  console.log('\n✅ SOLUTION: Mot de passe d\'application Gmail');
  console.log('Étapes requises:');
  console.log('1. Activer l\'authentification à 2 facteurs');
  console.log('2. Générer un mot de passe d\'application (16 caractères)');
  console.log('3. Utiliser ce mot de passe d\'app dans EMAIL_PASSWORD');
  
  console.log('\n📋 Format du mot de passe d\'application:');
  console.log('xxxx xxxx xxxx xxxx (16 caractères avec espaces)');
  
  console.log('\n🔗 Liens directs:');
  console.log('- Authentification 2FA: https://myaccount.google.com/security');
  console.log('- Mots de passe d\'app: https://myaccount.google.com/apppasswords');
  
  console.log('\n💡 POURQUOI cette sécurité?');
  console.log('- Protection contre les violations de données');
  console.log('- Contrôle granulaire des accès applications');
  console.log('- Révocation facile si compromission');
}

testGmailPassword();
