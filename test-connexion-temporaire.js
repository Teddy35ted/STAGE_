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

async function testConnexionTemporaire() {
    console.log('🔍 TEST DE CONNEXION TEMPORAIRE\n');
    
    try {
        // 1. Créer une demande de test avec mot de passe temporaire
        const testEmail = 'test.temporaire@example.com';
        const temporaryPassword = 'temp123456';
        
        console.log('📝 Création d\'une demande de test...');
        const demande = {
            email: testEmail,
            nom: 'Test',
            prenom: 'User',
            tel: '12345678',
            pays: 'Togo',
            ville: 'Lomé',
            status: 'approved',
            temporaryPassword: temporaryPassword,
            isFirstLogin: true,
            requestDate: new Date().toISOString(),
            approvalDate: new Date().toISOString()
        };
        
        // Nettoyer d'abord si existe
        const existingQuery = await db.collection('account_requests')
            .where('email', '==', testEmail)
            .get();
        
        for (const doc of existingQuery.docs) {
            await doc.ref.delete();
            console.log('🗑️ Ancienne demande supprimée:', doc.id);
        }
        
        // Créer nouvelle demande
        const docRef = await db.collection('account_requests').add(demande);
        console.log('✅ Demande créée avec ID:', docRef.id);
        
        // 2. Tester la récupération par email
        console.log('\n🔍 Test de récupération par email...');
        const snapshot = await db.collection('account_requests')
            .where('email', '==', testEmail)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            console.log('❌ Aucune demande trouvée');
            return;
        }
        
        const doc = snapshot.docs[0];
        const data = doc.data();
        const accountRequest = {
            id: doc.id,
            ...data
        };
        
        console.log('📊 Demande récupérée:', {
            id: accountRequest.id,
            email: accountRequest.email,
            status: accountRequest.status,
            hasTemporaryPassword: !!accountRequest.temporaryPassword,
            isFirstLogin: accountRequest.isFirstLogin
        });
        
        // 3. Tester l'API de connexion temporaire
        console.log('\n🌐 Test de l\'API de connexion temporaire...');
        
        const response = await fetch('http://localhost:3000/api/auth/login-temporary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: testEmail,
                temporaryPassword: temporaryPassword,
                newPassword: 'nouveauMotDePasse123'
            })
        });
        
        const result = await response.json();
        console.log('📊 Réponse API:', {
            status: response.status,
            success: result.success,
            message: result.message,
            error: result.error
        });
        
        if (!result.success) {
            console.log('❌ Erreur API:', result.error);
        } else {
            console.log('✅ API réussie');
        }
        
        // 4. Nettoyer
        await docRef.delete();
        console.log('\n🧹 Demande de test supprimée');
        
    } catch (error) {
        console.error('❌ Erreur dans le test:', error);
    }
}

// Fonction pour lister toutes les demandes actuelles
async function listerDemandes() {
    console.log('\n📋 LISTE DE TOUTES LES DEMANDES:\n');
    
    try {
        const snapshot = await db.collection('account_requests').get();
        
        if (snapshot.empty) {
            console.log('ℹ️ Aucune demande trouvée');
            return;
        }
        
        snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`${index + 1}. ID: ${doc.id}`);
            console.log(`   Email: ${data.email}`);
            console.log(`   Status: ${data.status}`);
            console.log(`   Mot de passe temporaire: ${data.temporaryPassword ? 'OUI' : 'NON'}`);
            console.log(`   Première connexion: ${data.isFirstLogin}`);
            console.log('   ---');
        });
        
    } catch (error) {
        console.error('❌ Erreur listing demandes:', error);
    }
}

async function main() {
    console.log('🚀 DIAGNOSTIC CONNEXION MOT DE PASSE TEMPORAIRE\n');
    
    // D'abord lister les demandes existantes
    await listerDemandes();
    
    // Puis tester la connexion temporaire
    await testConnexionTemporaire();
    
    console.log('\n✅ Test terminé');
    process.exit(0);
}

main().catch(console.error);
