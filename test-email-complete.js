// Test complet du système email avec votre configuration
const nodemailer = require('nodemailer');

async function testEmailSystem() {
  console.log('🧪 TEST COMPLET DU SYSTÈME EMAIL');
  console.log('=' .repeat(50));
  
  // Configuration depuis .env.local
  const emailUser = 'tedkouevi701@gmail.com';
  const emailPassword = 'etci jcbp njaf gizp';
  
  console.log('\n📋 Configuration détectée:');
  console.log(`✅ EMAIL_USER: ${emailUser}`);
  console.log(`✅ EMAIL_PASSWORD: ${emailPassword.replace(/./g, '*')} (${emailPassword.length} caractères)`);
  
  console.log('\n🔧 Test de connexion Gmail...');
  
  try {
    // Créer le transporteur
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      debug: true, // Activer les logs détaillés
      logger: true
    });
    
    console.log('✅ Transporteur créé avec succès');
    
    // Vérifier la connexion
    console.log('\n🔍 Vérification de la connexion...');
    await transporter.verify();
    console.log('✅ Connexion Gmail réussie !');
    
    // Test d'envoi d'email
    console.log('\n📧 Test d\'envoi d\'email...');
    const mailOptions = {
      from: emailUser,
      to: emailUser, // S'envoyer à soi-même
      subject: '🧪 Test du système email - Stage Notaire',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Test Email Réussi !</h2>
          <p>Félicitations ! Votre système d'email est maintenant <strong>opérationnel</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669;">🎯 Configuration validée :</h3>
            <ul>
              <li>✅ Mot de passe d'application Gmail</li>
              <li>✅ Connexion Nodemailer</li>
              <li>✅ Envoi d'emails fonctionnel</li>
            </ul>
          </div>
          
          <p><strong>Prochaines étapes :</strong></p>
          <ol>
            <li>Tester l'approbation de comptes depuis le dashboard admin</li>
            <li>Vérifier les notifications automatiques</li>
            <li>Utiliser la preview email avant envoi</li>
          </ol>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Email envoyé le ${new Date().toLocaleString()} depuis le système Stage Notaire
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès !');
    console.log(`📨 Message ID: ${result.messageId}`);
    
    console.log('\n🎉 RÉSULTAT FINAL:');
    console.log('✅ Système email COMPLÈTEMENT OPÉRATIONNEL !');
    console.log('✅ Vous pouvez maintenant:');
    console.log('   - Approuver/rejeter des comptes avec notifications');
    console.log('   - Utiliser la preview email');
    console.log('   - Recevoir des emails automatiquement');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ ERREUR:');
    console.log(`Type: ${error.name}`);
    console.log(`Message: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 SOLUTION:');
      console.log('- Vérifiez que l\'authentification 2FA est activée');
      console.log('- Régénérez un nouveau mot de passe d\'application');
      console.log('- Vérifiez qu\'il n\'y a pas d\'espaces en trop');
    }
    
    return false;
  }
}

// Fonction pour tester via API
async function testEmailAPI() {
  console.log('\n🌐 Test de l\'API email...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'tedkouevi701@gmail.com',
        subject: 'Test API Email',
        message: 'Test depuis l\'API'
      })
    });
    
    const result = await response.json();
    console.log('✅ Résultat API:', result);
    
  } catch (error) {
    console.log('❌ Erreur API:', error.message);
  }
}

// Exécuter les tests
testEmailSystem()
  .then(success => {
    if (success) {
      console.log('\n📧 Vérifiez votre boîte email pour confirmer la réception !');
    }
  })
  .catch(console.error);
