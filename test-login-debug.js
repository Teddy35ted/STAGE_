// Test pour diagnostiquer le problème de connexion temporaire
const testLogin = async () => {
  console.log('🔍 Test de connexion temporaire...');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/login-temporary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'kouevited10@gmail.com',
        temporaryPassword: '6TK6ty8YhUVQ',
        newPassword: 'nouveauMotDePasse123' // Test avec nouveau mot de passe
      })
    });
    
    const data = await response.json();
    console.log('📊 Réponse:', {
      status: response.status,
      data: data
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

// Test aussi de récupération de la demande
const testAccountRequest = async () => {
  console.log('🔍 Test de récupération de demande...');
  
  try {
    const response = await fetch('http://localhost:3001/api/admin/account-requests', {
      headers: {
        'Authorization': 'Bearer test-admin-token'
      }
    });
    
    const data = await response.json();
    console.log('📊 Demandes:', data);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testLogin();
testAccountRequest();
