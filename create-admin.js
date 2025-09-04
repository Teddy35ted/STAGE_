// Script pour créer l'administrateur
console.log('🔧 Création de l\'administrateur...');

// Fonction pour créer l'admin
async function createAdmin() {
    try {
        console.log('📡 Appel API /api/admin/init...');
        
        const response = await fetch('http://localhost:3002/api/admin/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'tedkouevi701@gmail.com',
                password: 'feiderus',
                name: 'Administrateur Principal'
            })
        });

        console.log('📄 Statut de la réponse:', response.status);
        const result = await response.json();
        console.log('📄 Réponse complète:', JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log('✅ Administrateur créé avec succès !');
            console.log('📧 Email:', result.admin?.email);
            console.log('🆔 ID Admin:', result.admin?.id);
            
            // Test de connexion immédiatement après
            console.log('\n🔐 Test de connexion...');
            await testLogin();
        } else {
            console.log('❌ Erreur:', result.error);
            if (result.error === 'Des administrateurs existent déjà') {
                console.log('ℹ️ L\'admin existe déjà, test de connexion...');
                await testLogin();
            }
        }
    } catch (error) {
        console.error('❌ Erreur réseau:', error.message);
    }
}

// Fonction pour tester la connexion
async function testLogin() {
    try {
        const response = await fetch('http://localhost:3002/api/admin/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'tedkouevi701@gmail.com',
                password: 'feiderus'
            })
        });

        console.log('📄 Statut connexion:', response.status);
        const result = await response.json();
        console.log('📄 Réponse connexion:', JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log('✅ CONNEXION RÉUSSIE !');
            console.log('🎫 Token reçu:', result.token ? 'Oui' : 'Non');
            console.log('👤 Admin connecté:', result.admin?.email);
        } else {
            console.log('❌ Échec de connexion:', result.error);
        }
    } catch (error) {
        console.error('❌ Erreur connexion:', error.message);
    }
}

// Attendre que le serveur soit prêt puis exécuter
setTimeout(createAdmin, 1000);
