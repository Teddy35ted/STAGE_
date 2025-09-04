#!/usr/bin/env node

/**
 * Script pour créer manuellement l'administrateur
 * Usage: npm run admin:create
 */

const http = require('http');

const ADMIN_CREDENTIALS = {
    email: 'tedkouevi701@gmail.com',
    password: 'feiderus',
    name: 'Administrateur Principal'
};

console.log('🔧 Création de l\'administrateur...');
console.log('📧 Email:', ADMIN_CREDENTIALS.email);
console.log('🔑 Mot de passe:', ADMIN_CREDENTIALS.password);
console.log('');

const data = JSON.stringify(ADMIN_CREDENTIALS);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/init',
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
        try {
            const result = JSON.parse(responseData);
            
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log('✅ Administrateur créé avec succès!');
                console.log('📄 Réponse:', result.message || result);
            } else {
                console.log('❌ Erreur:', res.statusCode);
                console.log('📄 Détails:', result.message || responseData);
                
                if (result.message && result.message.includes('already exists')) {
                    console.log('ℹ️  L\'administrateur existe déjà - c\'est normal!');
                }
            }
        } catch (err) {
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log('✅ Administrateur créé avec succès!');
                console.log('📄 Réponse:', responseData);
            } else {
                console.log('❌ Erreur de parsing:', responseData);
            }
        }
        
        console.log('');
        console.log('🎉 Vous pouvez maintenant vous connecter avec:');
        console.log('📧 Email: tedkouevi701@gmail.com');
        console.log('🔑 Mot de passe: feiderus');
        console.log('🌐 URL: http://localhost:3000/login');
    });
});

req.on('error', (err) => {
    console.error('❌ Erreur de connexion:', err.message);
    console.log('');
    console.log('💡 Assurez-vous que le serveur est démarré avec:');
    console.log('   npm run dev');
    console.log('');
    console.log('   Puis relancez ce script avec:');
    console.log('   npm run admin:create');
});

req.write(data);
req.end();
