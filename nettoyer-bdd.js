#!/usr/bin/env node

// Script de nettoyage direct de la base de données
// Exécution simple : node nettoyer-bdd.js

const admin = require('firebase-admin');
const path = require('path');

console.log('🗃️ NETTOYAGE DIRECT DE LA BASE DE DONNÉES');
console.log('=========================================\n');

// Configuration Firebase
let db;

async function initFirebase() {
    try {
        // Charger les variables d'environnement
        require('dotenv').config({ path: '.env.local' });
        
        // Configuration Firebase avec variables séparées
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
        
        // Vérification des variables essentielles
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error('Configuration Firebase incomplète dans .env.local');
        }
        
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        
        db = admin.firestore();
        console.log('✅ Firebase initialisé avec succès');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur initialisation Firebase:', error.message);
        return false;
    }
}

async function cleanDatabase() {
    console.log('\n🧹 Début du nettoyage...\n');
    
    // Collections à nettoyer (TOUT SAUF admins)
    const COLLECTIONS_TO_CLEAN = [
        'users',
        'laalas', 
        'contenus',
        'co_gestionnaires',
        'retraits',
        'account_requests',
        'boutiques',
        'messages',
        'campaigns',
        'audit_logs'
    ];
    
    const results = {};
    let totalDeleted = 0;
    
    for (const collectionName of COLLECTIONS_TO_CLEAN) {
        try {
            console.log(`🔄 Nettoyage collection: ${collectionName}`);
            
            const collection = db.collection(collectionName);
            const snapshot = await collection.get();
            
            if (snapshot.empty) {
                console.log(`   ✅ ${collectionName}: Déjà vide`);
                results[collectionName] = 0;
                continue;
            }
            
            // Supprimer par batch (Firebase limite à 500)
            const batch = db.batch();
            let count = 0;
            
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                count++;
            });
            
            if (count > 0) {
                await batch.commit();
                console.log(`   ✅ ${collectionName}: ${count} documents supprimés`);
                results[collectionName] = count;
                totalDeleted += count;
            }
            
        } catch (error) {
            console.error(`   ❌ Erreur ${collectionName}:`, error.message);
            results[collectionName] = `Erreur: ${error.message}`;
        }
    }
    
    return { results, totalDeleted };
}

async function verifyAdmins() {
    try {
        const adminsSnapshot = await db.collection('admins').get();
        console.log(`ℹ️  Collection 'admins' préservée: ${adminsSnapshot.size} documents`);
        return adminsSnapshot.size;
    } catch (error) {
        console.error('⚠️ Erreur vérification admins:', error.message);
        return 0;
    }
}

// Fonction principale
async function main() {
    // 1. Initialiser Firebase
    const firebaseOk = await initFirebase();
    if (!firebaseOk) {
        console.log('\n❌ Impossible de se connecter à Firebase. Vérifiez votre configuration.');
        process.exit(1);
    }
    
    // 2. Vérifier qu'on a bien des admins
    console.log('\n🔍 Vérification préalable...');
    const adminCount = await verifyAdmins();
    
    if (adminCount === 0) {
        console.log('\n⚠️ ATTENTION: Aucun admin trouvé. Voulez-vous continuer ?');
        console.log('(Le nettoyage va supprimer toutes les données sauf la collection admins)');
    }
    
    // 3. Demander confirmation
    console.log('\n⚠️ AVERTISSEMENT:');
    console.log('Cette opération va SUPPRIMER DÉFINITIVEMENT toutes les données');
    console.log('SAUF la collection "admins".');
    console.log('\nPour continuer, tapez "OUI" (en majuscules):');
    
    // Lire l'entrée utilisateur
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const confirmation = await new Promise(resolve => {
        readline.question('> ', resolve);
    });
    readline.close();
    
    if (confirmation !== 'OUI') {
        console.log('\n❌ Opération annulée.');
        process.exit(0);
    }
    
    // 4. Exécuter le nettoyage
    console.log('\n🚀 Confirmation reçue. Démarrage du nettoyage...');
    
    const { results, totalDeleted } = await cleanDatabase();
    
    // 5. Afficher les résultats
    console.log('\n🎉 NETTOYAGE TERMINÉ !');
    console.log('=====================');
    console.log(`📊 RÉSULTATS DÉTAILLÉS:\n`);
    
    Object.keys(results).forEach(collection => {
        const count = results[collection];
        if (typeof count === 'number') {
            console.log(`   ${collection}: ${count} documents supprimés`);
        } else {
            console.log(`   ${collection}: ${count}`);
        }
    });
    
    console.log(`\n✅ TOTAL SUPPRIMÉ: ${totalDeleted} documents`);
    
    // 6. Vérification finale
    await verifyAdmins();
    
    console.log('\n🎯 Base de données nettoyée avec succès !');
    console.log('Vous pouvez maintenant utiliser votre application avec des données propres.');
    
    process.exit(0);
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
    console.error('\n❌ ERREUR CRITIQUE:', error.message);
    process.exit(1);
});

// Lancement du script
main().catch(error => {
    console.error('\n❌ ERREUR:', error.message);
    process.exit(1);
});
