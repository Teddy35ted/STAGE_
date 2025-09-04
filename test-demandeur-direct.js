// Test rapide d'envoi vers un demandeur (changez l'email)
const nodemailer = require('nodemailer');

async function testDemandeurEmail() {
  console.log('🧪 TEST ENVOI VERS DEMANDEUR');
  console.log('=' .repeat(35));
  
  // ✏️ CHANGEZ CET EMAIL POUR TESTER
  const emailDemandeur = 'tedkouevi701@outlook.com'; // ← Changez par un autre email que vous avez
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tedkouevi701@gmail.com',
      pass: 'etci jcbp njaf gizp'
    }
  });
  
  console.log(`📧 Envoi vers le demandeur: ${emailDemandeur}`);
  
  try {
    const result = await transporter.sendMail({
      from: 'tedkouevi701@gmail.com',
      to: emailDemandeur,
      subject: '🎉 Votre compte Stage Notaire a été approuvé !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #059669; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h1>🎉 Compte Approuvé !</h1>
          </div>
          
          <div style="padding: 20px; background: #f9fafb; margin: 20px 0; border-radius: 8px;">
            <h2>Félicitations !</h2>
            <p>Votre demande de compte pour le système Stage Notaire a été <strong>approuvée</strong>.</p>
            
            <h3>🔑 Vos informations de connexion :</h3>
            <ul>
              <li><strong>Email :</strong> ${emailDemandeur}</li>
              <li><strong>Mot de passe temporaire :</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">MotDePasse123!</code></li>
            </ul>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>⚠️ Important :</strong> Changez votre mot de passe lors de votre première connexion.</p>
            </div>
            
            <p><strong>Commentaire de l'administrateur :</strong></p>
            <p style="font-style: italic; color: #6b7280;">Ceci est un test pour vérifier que les emails arrivent bien aux demandeurs.</p>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <a href="http://localhost:3000/auth/signin" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              🚀 Se connecter maintenant
            </a>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            Email envoyé le ${new Date().toLocaleString()} par le système Stage Notaire<br>
            Si vous n'êtes pas le destinataire, ignorez cet email.
          </p>
        </div>
      `
    });
    
    console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS !');
    console.log(`📨 Message ID: ${result.messageId}`);
    console.log(`📬 Vérifiez la boîte email: ${emailDemandeur}`);
    console.log('📁 Vérifiez aussi les dossiers spam/indésirables');
    
    console.log('\n🔍 SI VOUS NE RECEVEZ PAS L\'EMAIL:');
    console.log('1. Vérifiez les spams/indésirables');
    console.log('2. Attendez 2-3 minutes (délai de livraison)');
    console.log('3. Vérifiez que l\'email existe vraiment');
    console.log('4. Testez avec un autre provider (Outlook, Yahoo, etc.)');
    
  } catch (error) {
    console.log('❌ ERREUR:', error.message);
    
    if (error.code === 'EENVELOPE') {
      console.log('🚨 Email destinataire invalide ou rejeté');
    }
  }
}

testDemandeurEmail();
