// Test simple pour l'API de vérification d'email co-gestionnaire

const testCheckEmail = async () => {
  const testEmails = [
    'test@exemple.com', // Email qui n'existe pas
    'cogest@test.com',  // Email qui pourrait exister
  ];

  for (const email of testEmails) {
    console.log(`\n🔍 Test avec email: ${email}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/co-gestionnaires/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log('Response:', data);
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  }
};

// Pour exécuter le test, ouvrir la console du navigateur et taper:
// testCheckEmail()

console.log('📋 Script de test chargé. Exécutez: testCheckEmail()');
