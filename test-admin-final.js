console.log('🧪 Test des API Admin - Port 3002');

// Test 1: Créer l'administrateur
async function createAdmin() {
    console.log('\n1. 🔧 Création de l\'administrateur...');
    try {
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
        
        const result = await response.json();
        console.log('📄 Statut:', response.status);
        console.log('📄 Réponse:', result);
        
        if (response.ok) {
            console.log('✅ Admin créé avec succès !');
            return true;
        } else {
            console.log('❌ Erreur création admin:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur réseau:', error.message);
        return false;
    }
}

// Test 2: Connexion admin
async function loginAdmin() {
    console.log('\n2. 🔐 Test connexion admin...');
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
        
        const result = await response.json();
        console.log('📄 Statut:', response.status);
        console.log('📄 Réponse:', result);
        
        if (response.ok) {
            console.log('✅ Connexion admin réussie !');
            console.log('🎫 Token reçu:', result.token ? 'Oui' : 'Non');
            return result.token;
        } else {
            console.log('❌ Erreur connexion:', result.error);
            return null;
        }
    } catch (error) {
        console.error('❌ Erreur réseau:', error.message);
        return null;
    }
}

// Test 3: Créer une demande de compte
async function createAccountRequest() {
    console.log('\n3. 📝 Test création demande de compte...');
    try {
        const testEmail = `test.user.${Date.now()}@example.com`;
        const response = await fetch('http://localhost:3002/api/auth/request-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                role: 'animateur'
            })
        });
        
        const result = await response.json();
        console.log('📄 Statut:', response.status);
        console.log('📄 Réponse:', result);
        
        if (response.ok) {
            console.log('✅ Demande créée avec succès !');
            console.log('📧 Email:', testEmail);
            console.log('🆔 Request ID:', result.requestId);
            return result.requestId;
        } else {
            console.log('❌ Erreur création demande:', result.error);
            return null;
        }
    } catch (error) {
        console.error('❌ Erreur réseau:', error.message);
        return null;
    }
}

// Exécuter tous les tests
async function runAllTests() {
    console.log('🚀 Démarrage des tests complets...\n');
    
    // Test 1: Créer admin
    const adminCreated = await createAdmin();
    
    // Test 2: Connexion admin
    const token = await loginAdmin();
    
    // Test 3: Créer demande
    const requestId = await createAccountRequest();
    
    console.log('\n🏁 === RÉSUMÉ DES TESTS ===');
    console.log('🔧 Création admin:', adminCreated ? '✅ OK' : '❌ ÉCHEC');
    console.log('🔐 Connexion admin:', token ? '✅ OK' : '❌ ÉCHEC');
    console.log('📝 Création demande:', requestId ? '✅ OK' : '❌ ÉCHEC');
    
    if (adminCreated && token) {
        console.log('\n🎉 SUCCÈS ! Le système admin fonctionne correctement.');
        console.log('🌐 Vous pouvez maintenant vous connecter sur: http://localhost:3002/login');
        console.log('📧 Email: tedkouevi701@gmail.com');
        console.log('🔑 Mot de passe: feiderus');
    } else {
        console.log('\n⚠️ Il y a encore des problèmes à résoudre.');
    }
}

// Attendre que le serveur soit prêt puis exécuter
setTimeout(runAllTests, 3000);
