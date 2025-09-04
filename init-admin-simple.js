// Script d'initialisation admin sans dépendances externes
const http = require('http');

const data = JSON.stringify({
    email: 'tedkouevi701@gmail.com',
    password: 'feiderus',
    name: 'Administrateur Principal'
});

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

console.log('🔧 Création de l\'administrateur...');

const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Admin créé avec succès!');
            console.log('📄 Réponse:', responseData);
        } else {
            console.log('❌ Erreur:', res.statusCode, responseData);
        }
        
        console.log('\n🎉 Vous pouvez maintenant vous connecter avec:');
        console.log('📧 Email: tedkouevi701@gmail.com');
        console.log('🔑 Mot de passe: feiderus');
        console.log('🌐 URL: http://localhost:3000/login');
    });
});

req.on('error', (err) => {
    console.error('❌ Erreur de connexion:', err.message);
});

req.write(data);
req.end();
