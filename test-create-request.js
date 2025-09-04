// Test de création de nouvelle demande
async function testCreateRequest() {
  console.log('🧪 TEST CRÉATION NOUVELLE DEMANDE');
  console.log('=' .repeat(40));
  
  const testEmail = `test.${Date.now()}@example.com`;
  console.log(`📧 Email de test: ${testEmail}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/request-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail
      })
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    const data = await response.json();
    console.log('📋 Réponse:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Demande créée avec succès !');
      console.log(`🆔 ID de la demande: ${data.requestId}`);
    } else {
      console.log('❌ Erreur:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur réseau:', error.message);
  }
  
  console.log('\n🔍 Vérifiez maintenant le dashboard admin pour voir si la demande apparaît');
}

testCreateRequest();
