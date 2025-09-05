import fetch from 'node-fetch';

async function testWithFetch() {
  console.log('🧪 Test avec fetch...');
  
  try {
    // Test 1: Page d'accueil
    console.log('1️⃣ Test page d\'accueil...');
    const homeResponse = await fetch('http://localhost:3000/');
    console.log(`✅ Page d'accueil - Status: ${homeResponse.status}`);
    
    // Test 2: API de demande de compte
    console.log('\n2️⃣ Test API demande de compte...');
    const requestData = {
      email: `test-${Date.now()}@example.com`,
      nom: 'Test',
      prenom: 'Fetch',
      raison: 'Test avec fetch'
    };
    
    const apiResponse = await fetch('http://localhost:3000/api/auth/request-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    console.log(`Status: ${apiResponse.status}`);
    const result = await apiResponse.json();
    console.log('Réponse:', result);
    
    if (result.success) {
      console.log('✅ Demande créée avec succès!');
      console.log('📄 ID de la demande:', result.data.id);
      
      // Test 3: Login temporaire (simulation)
      console.log('\n3️⃣ Test login temporaire...');
      const loginResponse = await fetch('http://localhost:3000/api/auth/login-temporary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: requestData.email,
          temporaryPassword: 'TEMP123456',
          newPassword: 'MonNouveauPassword123!',
          isFirstLogin: true
        })
      });
      
      const loginResult = await loginResponse.json();
      console.log(`Status: ${loginResponse.status}`);
      console.log('Réponse:', loginResult);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testWithFetch();
