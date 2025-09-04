#!/usr/bin/env node

/**
 * Script de diagnostic pour la connexion admin
 * Vérifie l'état de la base de données et des admins
 */

const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Identifiants admin à vérifier
const TARGET_EMAIL = 'tedkouevi701@gmail.com';
const TARGET_PASSWORD = 'feiderus';

async function diagnosticAdmin() {
    try {
        console.log('🔍 Diagnostic de connexion admin...\n');
        
        // Initialiser Firebase Admin avec les variables d'environnement
        let app;
        try {
            app = admin.app();
        } catch (error) {
            // Créer la configuration à partir des variables d'environnement
            const serviceAccount = {
                type: process.env.FIREBASE_TYPE,
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: process.env.FIREBASE_AUTH_URI,
                token_uri: process.env.FIREBASE_TOKEN_URI,
                auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
                client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
                universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
            };
            
            console.log('🔧 Configuration Firebase depuis .env');
            console.log(`📋 Project ID: ${serviceAccount.project_id}`);
            console.log(`📧 Client Email: ${serviceAccount.client_email ? '✅' : '❌'}`);
            console.log(`🔑 Private Key: ${serviceAccount.private_key ? '✅' : '❌'}`);
            
            app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
        }
        
        const db = admin.firestore();
        console.log('✅ Firebase connecté');
        
        // 1. Vérifier la collection admins
        console.log('\n📊 Vérification de la collection admins...');
        const adminsSnapshot = await db.collection('admins').get();
        console.log(`📈 Nombre total d'admins: ${adminsSnapshot.size}`);
        
        if (adminsSnapshot.empty) {
            console.log('❌ Aucun admin trouvé dans la base de données !');
            console.log('💡 Création de l\'admin maintenant...');
            
            // Créer l'admin manquant
            const hashedPassword = await bcrypt.hash(TARGET_PASSWORD, 12);
            const newAdmin = {
                email: TARGET_EMAIL,
                nom: 'Kouevi',
                prenom: 'Ted',
                password: hashedPassword,
                role: 'super-admin',
                permissions: [
                    'manage-accounts',
                    'manage-users', 
                    'manage-admins',
                    'view-analytics',
                    'manage-content',
                    'manage-payments'
                ],
                isActive: true,
                createdDate: new Date().toISOString()
            };
            
            const docRef = await db.collection('admins').add(newAdmin);
            console.log(`✅ Admin créé avec l'ID: ${docRef.id}`);
            
        } else {
            // 2. Lister tous les admins
            console.log('\n👥 Liste des administrateurs:');
            adminsSnapshot.forEach(doc => {
                const data = doc.data();
                console.log(`  📧 ID: ${doc.id}`);
                console.log(`  📧 Email: ${data.email}`);
                console.log(`  👤 Nom: ${data.nom} ${data.prenom}`);
                console.log(`  🔑 Role: ${data.role}`);
                console.log(`  ✅ Actif: ${data.isActive}`);
                console.log(`  📅 Créé: ${data.createdDate}`);
                console.log(`  🔐 Mot de passe hashé: ${data.password ? 'Oui' : 'Non'}`);
                console.log('  ---');
            });
        }
        
        // 3. Test final
        console.log(`\n🎯 Test final pour: ${TARGET_EMAIL}`);
        const adminQuery = await db.collection('admins')
            .where('email', '==', TARGET_EMAIL)
            .limit(1)
            .get();
        
        if (!adminQuery.empty) {
            const adminData = adminQuery.docs[0].data();
            const passwordMatch = await bcrypt.compare(TARGET_PASSWORD, adminData.password);
            
            if (passwordMatch && adminData.isActive) {
                console.log('\n🎉 SUCCESS! La connexion devrait maintenant fonctionner !');
                console.log('\n🎯 Identifiants validés:');
                console.log(`📧 Email: ${TARGET_EMAIL}`);
                console.log(`🔑 Mot de passe: ${TARGET_PASSWORD}`);
                console.log('🌐 URL: http://localhost:3000/login');
                console.log('\n💡 Sélectionnez "Administrateur" dans le type de compte');
            } else {
                console.log('❌ Problème avec les identifiants');
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error.message);
    }
}

// Lancer le diagnostic
diagnosticAdmin();
