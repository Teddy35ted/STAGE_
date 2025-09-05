const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Configuration Firebase
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function createTestAccountRequest() {
    console.log('🧪 CRÉATION DEMANDE DE TEST POUR CONNEXION TEMPORAIRE\n');
    
    const testEmail = 'test.connexion@example.com';
    const temporaryPassword = 'tempPass123';
    
    try {
        // Supprimer d'abord toute demande existante
        const existingSnapshot = await db.collection('account_requests')
            .where('email', '==', testEmail)
            .get();
        
        for (const doc of existingSnapshot.docs) {
            await doc.ref.delete();
            console.log('🗑️ Ancienne demande supprimée:', doc.id);
        }
        
        // Supprimer utilisateur existant
        const existingUserSnapshot = await db.collection('users')
            .where('email', '==', testEmail)
            .get();
        
        for (const doc of existingUserSnapshot.docs) {
            await doc.ref.delete();
            console.log('🗑️ Ancien utilisateur supprimé:', doc.id);
        }
        
        // Créer nouvelle demande approuvée
        const demande = {
            email: testEmail,
            nom: 'Test',
            prenom: 'Connexion',
            tel: '12345678',
            pays: 'Togo',
            ville: 'Lomé',
            status: 'approved',
            temporaryPassword: temporaryPassword,
            isFirstLogin: true,
            requestDate: new Date().toISOString(),
            approvalDate: new Date().toISOString(),
            adminId: 'test-admin',
            adminComment: 'Demande de test pour validation connexion temporaire'
        };
        
        const docRef = await db.collection('account_requests').add(demande);
        console.log('✅ Demande de test créée avec ID:', docRef.id);
        console.log('📧 Email:', testEmail);
        console.log('🔑 Mot de passe temporaire:', temporaryPassword);
        
        console.log('\n📋 DONNÉES POUR LE TEST:');
        console.log('Email:', testEmail);
        console.log('Mot de passe temporaire:', temporaryPassword);
        console.log('Nouveau mot de passe à saisir: monNouveauMotDePasse123');
        
        return { testEmail, temporaryPassword, docId: docRef.id };
        
    } catch (error) {
        console.error('❌ Erreur création demande de test:', error);
        throw error;
    }
}

async function testFullFlow() {
    console.log('\n🚀 TEST COMPLET DU FLUX DE CONNEXION TEMPORAIRE\n');
    
    try {
        // 1. Créer demande de test
        const { testEmail, temporaryPassword } = await createTestAccountRequest();
        
        console.log('\n🔄 ÉTAPE 1: Test de l\'API de connexion temporaire...');
        
        // 2. Tester l'API
        const newPassword = 'monNouveauMotDePasse123';
        
        const response = await fetch('http://localhost:3000/api/auth/login-temporary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: testEmail,
                temporaryPassword: temporaryPassword,
                newPassword: newPassword
            })
        });
        
        const result = await response.json();
        
        console.log('📊 Réponse API connexion temporaire:');
        console.log('Status:', response.status);
        console.log('Success:', result.success);
        console.log('Message:', result.message);
        console.log('Error:', result.error);
        
        if (result.success) {
            console.log('✅ Connexion temporaire réussie!');
            console.log('User ID créé:', result.userId);
            
            // 3. Tester connexion normale
            console.log('\n🔄 ÉTAPE 2: Test de connexion normale avec nouveau mot de passe...');
            
            const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: testEmail,
                    password: newPassword
                })
            });
            
            const loginResult = await loginResponse.json();
            
            console.log('📊 Réponse API connexion normale:');
            console.log('Status:', loginResponse.status);
            console.log('Success:', loginResult.success);
            console.log('Message:', loginResult.message);
            console.log('Error:', loginResult.error);
            
            if (loginResult.success) {
                console.log('✅ Connexion normale réussie!');
                console.log('🎉 FLUX COMPLET VALIDÉ!');
            } else {
                console.log('❌ Échec connexion normale - Le problème du hashage persiste');
            }
            
        } else {
            console.log('❌ Échec connexion temporaire:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Erreur dans le test:', error);
    }
}

// Lancer le test
if (require.main === module) {
    testFullFlow().then(() => {
        console.log('\n✅ Test terminé');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    });
}

module.exports = { createTestAccountRequest, testFullFlow };
