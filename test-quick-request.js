// Test rapide de création de demande pour vérifier le système
const testData = {
  email: `test.${Date.now()}@example.com`
};

console.log('🧪 TEST RAPIDE - Création nouvelle demande');
console.log('========================================');
console.log('📧 Email de test:', testData.email);

fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📊 Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Réponse complète:', data);
  console.log('\n🔍 Vérifiez maintenant le dashboard admin pour voir si la demande apparaît');
})
.catch(error => {
  console.error('❌ Erreur réseau:', error.message);
  console.log('\n🔍 Vérifiez maintenant le dashboard admin pour voir si la demande apparaît');
});
