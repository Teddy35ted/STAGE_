// Diagnostic du système d'envoi aux demandeurs
const { EmailService } = require('./app/Backend/services/email/EmailService');

async function diagnoseDemandeurEmail() {
  console.log('🔍 DIAGNOSTIC: Envoi email aux demandeurs');
  console.log('=' .repeat(50));
  
  // Test 1: Vérifier l'EmailService
  console.log('\n1️⃣ Test EmailService...');
  try {
    const emailService = new EmailService();
    console.log('✅ EmailService initialisé');
    
    // Test avec un email externe (pas le vôtre)
    const testDemandeurEmail = 'test.demandeur@example.com'; // Email fictif pour test
    
    console.log(`📧 Test d'envoi vers: ${testDemandeurEmail}`);
    
    const result = await emailService.sendCustomAccountApprovalEmail(
      testDemandeurEmail,
      'Test Demandeur',
      'Votre compte a été approuvé',
      'motdepasse123',
      'Commentaire admin test'
    );
    
    console.log('✅ EmailService.sendCustomAccountApprovalEmail: OK');
    console.log('📨 Message ID:', result.messageId);
    
  } catch (error) {
    console.log('❌ Erreur EmailService:', error.message);
  }
  
  // Test 2: Vérifier un vrai demandeur
  console.log('\n2️⃣ Test avec un email de demandeur réel...');
  console.log('📝 Entrez un email de test pour simuler un demandeur:');
  console.log('   (ou utilisez un de vos autres emails)');
  
  // Exemple avec différents providers
  const testEmails = [
    'autre.email@gmail.com',
    'test@outlook.com', 
    'demandeur@yahoo.fr'
  ];
  
  console.log('\n📋 Emails de test suggérés:');
  testEmails.forEach((email, index) => {
    console.log(`   ${index + 1}. ${email}`);
  });
  
  // Test 3: Vérifier les paramètres d'envoi
  console.log('\n3️⃣ Vérification des paramètres...');
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER || 'NON DÉFINI');
  console.log('🔒 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Défini' : '❌ Non défini');
  
  // Test 4: Problèmes possibles
  console.log('\n🚨 PROBLÈMES POSSIBLES:');
  console.log('1. Email du demandeur dans les spam/indésirables');
  console.log('2. Email du demandeur incorrect dans la base de données');
  console.log('3. Restrictions Gmail sur les emails externes');
  console.log('4. Délai de livraison (peut prendre quelques minutes)');
  
  console.log('\n💡 SOLUTIONS À TESTER:');
  console.log('1. Vérifier la boîte spam du demandeur');
  console.log('2. Utiliser un de vos autres emails comme test');
  console.log('3. Vérifier les logs détaillés d\'envoi');
  console.log('4. Tester avec différents providers (Gmail, Outlook, Yahoo)');
}

// Test avec un email que vous contrôlez
async function testAvecAutreEmail() {
  console.log('\n🧪 TEST AVEC AUTRE EMAIL');
  console.log('=' .repeat(30));
  
  // Changez cet email pour un autre que vous possédez
  const autreEmail = 'votre.autre.email@gmail.com'; // ← Changez ça
  
  console.log(`📧 Test vers: ${autreEmail}`);
  
  try {
    const { EmailService } = require('./app/Backend/services/email/EmailService');
    const emailService = new EmailService();
    
    const result = await emailService.sendCustomAccountApprovalEmail(
      autreEmail,
      'Test Demandeur',
      '🎉 Votre compte Stage Notaire a été approuvé !',
      'MotDePasse123!',
      'Ceci est un test d\'envoi vers un demandeur. Si vous recevez cet email, le système fonctionne parfaitement !'
    );
    
    console.log('✅ Email envoyé avec succès !');
    console.log(`📨 ID: ${result.messageId}`);
    console.log(`📧 Vérifiez la boîte email: ${autreEmail}`);
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

diagnoseDemandeurEmail();
