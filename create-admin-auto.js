// Script simple pour créer l'admin sur le port courant
const http = require('http');

const ADMIN_CREDENTIALS = {
    email: 'tedkouevi701@gmail.com',
    password: 'feiderus',
    name: 'Administrateur Principal'
};

// Essayer différents ports
const POSSIBLE_PORTS = [3000, 3001, 3002, 3003];

async function tryCreateAdmin(port) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(ADMIN_CREDENTIALS);
        
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api/admin/init',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            },
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve({
                        port,
                        statusCode: res.statusCode,
                        result
                    });
                } catch (err) {
                    resolve({
                        port,
                        statusCode: res.statusCode,
                        result: { message: responseData }
                    });
                }
            });
        });
        
        req.on('error', (err) => {
            reject({ port, error: err.message });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject({ port, error: 'Timeout' });
        });
        
        req.write(data);
        req.end();
    });
}

async function findAndCreateAdmin() {
    console.log('🔍 Recherche du serveur Next.js...');
    
    for (const port of POSSIBLE_PORTS) {
        try {
            console.log(`   Essai sur le port ${port}...`);
            const response = await tryCreateAdmin(port);
            
            console.log(`✅ Serveur trouvé sur le port ${port}!`);
            console.log(`📊 Statut: ${response.statusCode}`);
            
            if (response.statusCode === 200 || response.statusCode === 201) {
                console.log('✅ Admin créé avec succès!');
                console.log('📄 Réponse:', response.result.message || response.result);
            } else if (response.statusCode === 409) {
                console.log('ℹ️  Admin existe déjà - c\'est normal!');
            } else {
                console.log('⚠️  Réponse inattendue:', response.result);
            }
            
            console.log('');
            console.log('🎉 Vous pouvez maintenant vous connecter avec:');
            console.log('📧 Email: tedkouevi701@gmail.com');
            console.log('🔑 Mot de passe: feiderus');
            console.log(`🌐 URL: http://localhost:${port}/login`);
            return;
            
        } catch (err) {
            console.log(`   ❌ Port ${err.port}: ${err.error}`);
        }
    }
    
    console.log('');
    console.log('❌ Aucun serveur Next.js trouvé sur les ports:', POSSIBLE_PORTS.join(', '));
    console.log('💡 Assurez-vous que le serveur est démarré avec:');
    console.log('   npm run dev');
    console.log('   ou');
    console.log('   npm run dev:admin');
}

findAndCreateAdmin().catch(console.error);
