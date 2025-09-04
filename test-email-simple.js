// Test simplifié du système email
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 TEST EMAIL SIMPLIFIÉ');
  console.log('========================');
  
  const config = {
    service: 'gmail',
    auth: {
      user: 'tedkouevi701@gmail.com',
      pass: 'etci jcbp njaf gizp'
    }
  };
  
  console.log('📧 Configuration email:');
  console.log(`Email: ${config.auth.user}`);
  console.log(`Mot de passe: ${'*'.repeat(config.auth.pass.length)} (${config.auth.pass.length} chars)`);
  
  try {
    console.log('\n🔧 Création du transporteur...');
    const transporter = nodemailer.createTransport(config);
    
    console.log('✅ Transporteur créé');
    
    console.log('\n🔍 Test de connexion...');
    await transporter.verify();
    console.log('✅ CONNEXION RÉUSSIE !');
    
    console.log('\n📨 Envoi d\'un email de test...');
    const result = await transporter.sendMail({
      from: 'tedkouevi701@gmail.com',
      to: 'tedkouevi701@gmail.com',
      subject: '✅ Test Email Système Stage Notaire',
      text: 'Votre système email fonctionne parfaitement !',
      html: `
        <h2>🎉 Félicitations !</h2>
        <p>Votre système email est <strong>opérationnel</strong> !</p>
        <p>Vous pouvez maintenant :</p>
        <ul>
          <li>✅ Approuver des comptes avec notification</li>
          <li>✅ Rejeter des comptes avec notification</li>
          <li>✅ Utiliser la preview email</li>
        </ul>
        <p><em>Email envoyé le ${new Date().toLocaleString()}</em></p>
      `
    });
    
    console.log(`✅ EMAIL ENVOYÉ AVEC SUCCÈS !`);
    console.log(`📨 ID: ${result.messageId}`);
    
    console.log('\n🎯 RÉSULTAT:');
    console.log('✅ Système email COMPLÈTEMENT OPÉRATIONNEL');
    console.log('✅ Vérifiez votre boîte email !');
    
  } catch (error) {
    console.log('\n❌ ERREUR:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('🔧 Problème d\'authentification');
      console.log('- Vérifiez le mot de passe d\'application');
      console.log('- Assurez-vous que 2FA est activé');
    }
  }
}

testEmail();
