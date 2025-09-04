#!/usr/bin/env node

/**
 * Script direct pour créer l'administrateur
 * Utilise directement Firebase Admin sans Next.js
 */

const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Configuration Firebase
const serviceAccountPath = path.join(process.cwd(), 'dashboard-4f9c8-firebase-adminsdk-lhh7g-cbdee1b5cb.json');

// Identifiants admin
const ADMIN_DATA = {
    email: 'tedkouevi701@gmail.com',
    password: 'feiderus',
    nom: 'Kouevi',
    prenom: 'Ted',
    role: 'super-admin',
    permissions: [
        'manage-accounts',
        'manage-users', 
        'manage-admins',
        'view-analytics',
        'manage-content',
        'manage-payments'
    ]
};

async function createAdminDirect() {
    try {
        console.log('🚀 Création directe de l\'administrateur...');
        
        // Initialiser Firebase Admin
        console.log('🔧 Initialisation Firebase...');
        
        let app;
        try {
            // Essayer de récupérer l'app existante
            app = admin.app();
        } catch (error) {
            // Créer une nouvelle app si elle n'existe pas
            const serviceAccount = require(serviceAccountPath);
            app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: 'dashboard-4f9c8'
            });
        }
        
        const db = admin.firestore();
        console.log('✅ Firebase initialisé');
        
        // Vérifier si un admin existe déjà
        console.log('🔍 Vérification des admins existants...');
        const adminsSnapshot = await db.collection('admins').limit(1).get();
        
        if (!adminsSnapshot.empty) {
            console.log('ℹ️  Un administrateur existe déjà');
            console.log('📧 Email: tedkouevi701@gmail.com');
            console.log('🔑 Mot de passe: feiderus');
            console.log('🌐 URL: http://localhost:3000/login');
            return;
        }
        
        // Hasher le mot de passe
        console.log('🔐 Hashage du mot de passe...');
        const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 12);
        
        // Créer l'admin
        console.log('👤 Création de l\'administrateur...');
        const adminRef = await db.collection('admins').add({
            email: ADMIN_DATA.email,
            nom: ADMIN_DATA.nom,
            prenom: ADMIN_DATA.prenom,
            password: hashedPassword,
            role: ADMIN_DATA.role,
            permissions: ADMIN_DATA.permissions,
            isActive: true,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            lastLogin: null,
            profileComplete: true
        });
        
        console.log('');
        console.log('✅ Administrateur créé avec succès !');
        console.log('🆔 ID:', adminRef.id);
        console.log('📧 Email:', ADMIN_DATA.email);
        console.log('🔑 Mot de passe:', ADMIN_DATA.password);
        console.log('👑 Rôle:', ADMIN_DATA.role);
        console.log('');
        console.log('🎉 Vous pouvez maintenant vous connecter sur:');
        console.log('🌐 http://localhost:3000/login');
        console.log('');
        
    } catch (error) {
        console.error('❌ Erreur lors de la création:', error.message);
        
        if (error.message.includes('ENOENT')) {
            console.log('💡 Le fichier de configuration Firebase est introuvable.');
            console.log('   Vérifiez que le fichier exists:', serviceAccountPath);
        }
        
        process.exit(1);
    }
}

// Lancer le script
createAdminDirect();
