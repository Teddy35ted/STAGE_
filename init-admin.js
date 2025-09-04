const fetch = require('node-fetch');

async function createAdmin() {
    try {
        console.log('🔧 Création de l\'administrateur...');
        
        const response = await fetch('http://localhost:3000/api/admin/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'tedkouevi701@gmail.com',
                password: 'feiderus',
                name: 'Administrateur Principal'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Admin créé avec succès!');
            console.log('📄 Réponse:', result);
        } else {
            console.log('❌ Erreur:', response.status, result);
        }
        
        console.log('\n🎉 Vous pouvez maintenant vous connecter avec:');
        console.log('📧 Email: tedkouevi701@gmail.com');
        console.log('🔑 Mot de passe: feiderus');
        console.log('🌐 URL: http://localhost:3000/login');
        
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
    }
}

createAdmin();
