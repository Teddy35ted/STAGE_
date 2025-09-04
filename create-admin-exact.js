// Script pour créer l'administrateur avec les identifiants exacts
const http = require('http');

const adminData = {
    email: 'tedkouevi701@gmail.com',
    password: 'feiderus',
    name: 'Administrateur Principal'
};

console.log('🔧 Création de l\'administrateur avec les identifiants:');
console.log('📧 Email:', adminData.email);
console.log('🔑 Mot de passe:', adminData.password);
console.log('');

const data = JSON.stringify(adminData);

const options = {
    hostname: 'localhost',
    port: 3001,
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
        console.log(`📊 Statut de la réponse: ${res.statusCode}`);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Admin créé avec succès!');
            try {
                const result = JSON.parse(responseData);
                console.log('📄 Réponse:', JSON.stringify(result, null, 2));
            } catch (e) {
                console.log('📄 Réponse brute:', responseData);
            }
        } else {
            console.log('❌ Erreur lors de la création:');
            console.log('📄 Réponse:', responseData);
        }
        
        console.log('\n🎯 Maintenant testez la connexion avec:');
        console.log('📧 Email: tedkouevi701@gmail.com');
        console.log('🔑 Mot de passe: feiderus');
        console.log('🌐 URL: http://localhost:3001/login');
    });
});

req.on('error', (err) => {
    console.error('❌ Erreur de connexion:', err.message);
    console.log('🔍 Vérifiez que le serveur fonctionne sur http://localhost:3001');
});

req.write(data);
req.end();
