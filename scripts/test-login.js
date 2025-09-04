#!/usr/bin/env node

/**
 * Script de test de l'API de connexion admin
 * Teste directement l'endpoint /api/admin/auth/login
 */

const http = require('http');

const testData = {
    email: 'tedkouevi701@gmail.com',
    password: 'feiderus'
};

console.log('🧪 Test de l\'API de connexion admin...\n');
console.log(`📧 Email: ${testData.email}`);
console.log(`🔑 Mot de passe: ${testData.password}`);
console.log('');

const data = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log(`📊 Statut HTTP: ${res.statusCode}`);
        
        try {
            const result = JSON.parse(responseData);
            
            if (res.statusCode === 200) {
                console.log('🎉 CONNEXION RÉUSSIE !');
                console.log('✅ Success:', result.success);
                console.log('📝 Message:', result.message);
                console.log('👤 Admin ID:', result.admin?.id);
                console.log('📧 Email:', result.admin?.email);
                console.log('🔑 Rôle:', result.admin?.role);
                console.log('🎫 Token généré:', result.token ? 'Oui' : 'Non');
                console.log('');
                console.log('💡 La connexion via l\'interface web devrait maintenant fonctionner !');
            } else {
                console.log('❌ ÉCHEC DE CONNEXION');
                console.log('📄 Erreur:', result.error || result.message);
                console.log('📄 Réponse complète:', responseData);
            }
        } catch (err) {
            console.log('❌ Erreur de parsing JSON');
            console.log('📄 Réponse brute:', responseData);
        }
        
        console.log('');
        console.log('🌐 Test complet ! Essayez maintenant sur:');
        console.log('   http://localhost:3000/login');
    });
});

req.on('error', (err) => {
    console.error('❌ Erreur de connexion:', err.message);
    console.log('');
    console.log('💡 Assurez-vous que le serveur est démarré avec:');
    console.log('   npm run dev');
});

req.write(data);
req.end();
