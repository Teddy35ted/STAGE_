// Test script pour vérifier l'endpoint de demande de compte
async function testAccountRequest() {
  try {
    console.log('🧪 Test de l\'endpoint de demande de compte...');
    
    const testEmail = 'test.user@example.com';
    
    const response = await fetch('http://localhost:3001/api/auth/request-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📊 Response data:', data);
    
    if (data.success) {
      console.log('✅ Demande créée avec succès');
    } else {
      console.log('❌ Erreur:', data.error);
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
}

testAccountRequest();
