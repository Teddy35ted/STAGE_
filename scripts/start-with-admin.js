#!/usr/bin/env node

/**
 * Script de pré-démarrage pour initialiser l'administrateur
 * Ce script crée automatiquement l'admin avant le démarrage du serveur
 */

const http = require('http');
const { spawn } = require('child_process');

// Identifiants de l'administrateur
const ADMIN_CREDENTIALS = {
    email: 'tedkouevi701@gmail.com',
    password: 'feiderus',
    name: 'Administrateur Principal'
};

// Configuration du serveur
const SERVER_CONFIG = {
    hostname: 'localhost',
    port: process.env.PORT || 3001, // Utiliser le port détecté par Next.js
    maxRetries: 30,
    retryDelay: 1000
};

console.log('🚀 Démarrage du système avec initialisation automatique...\n');

/**
 * Vérifie si le serveur est en cours d'exécution
 */
function checkServerStatus() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: SERVER_CONFIG.hostname,
            port: SERVER_CONFIG.port,
            path: '/api/health',
            method: 'GET',
            timeout: 2000
        }, (res) => {
            resolve(res.statusCode === 200);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

/**
 * Initialise l'administrateur via l'API
 */
function initializeAdmin() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(ADMIN_CREDENTIALS);
        
        const options = {
            hostname: SERVER_CONFIG.hostname,
            port: SERVER_CONFIG.port,
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
                try {
                    const result = JSON.parse(responseData);
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        resolve(result);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${result.message || responseData}`));
                    }
                } catch (err) {
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        resolve({ message: responseData });
                    } else {
                        reject(new Error(`Erreur de parsing: ${responseData}`));
                    }
                }
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.write(data);
        req.end();
    });
}

/**
 * Démarre le serveur Next.js
 */
function startNextServer() {
    return new Promise((resolve, reject) => {
        console.log('🌟 Démarrage du serveur Next.js...');
        
        const nextProcess = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            shell: true
        });
        
        nextProcess.on('error', (err) => {
            reject(err);
        });
        
        // Attendre que le serveur soit prêt
        setTimeout(() => {
            resolve(nextProcess);
        }, 3000);
    });
}

/**
 * Attend que le serveur soit disponible
 */
async function waitForServer() {
    console.log('⏳ Attente de la disponibilité du serveur...');
    
    for (let i = 0; i < SERVER_CONFIG.maxRetries; i++) {
        const isRunning = await checkServerStatus();
        if (isRunning) {
            console.log('✅ Serveur disponible !');
            return true;
        }
        
        if (i < SERVER_CONFIG.maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, SERVER_CONFIG.retryDelay));
        }
    }
    
    throw new Error('Le serveur n\'a pas pu être contacté dans les temps');
}

/**
 * Fonction principale
 */
async function main() {
    try {
        // 1. Démarrer le serveur Next.js
        const serverProcess = await startNextServer();
        
        // 2. Attendre que le serveur soit disponible
        await waitForServer();
        
        // 3. Initialiser l'administrateur
        console.log('🔧 Initialisation de l\'administrateur...');
        try {
            const result = await initializeAdmin();
            console.log('✅ Administrateur initialisé avec succès !');
            console.log('📄 Résultat:', result.message || result);
        } catch (adminError) {
            if (adminError.message.includes('Admin already exists') || 
                adminError.message.includes('déjà existe')) {
                console.log('ℹ️  L\'administrateur existe déjà - OK !');
            } else {
                console.warn('⚠️  Erreur lors de l\'initialisation admin:', adminError.message);
                console.log('ℹ️  Vous pouvez initialiser manuellement via /api/admin/init');
            }
        }
        
        // 4. Afficher les informations de connexion
        console.log('\n🎉 Système prêt !');
        console.log('📧 Email admin: tedkouevi701@gmail.com');
        console.log('🔑 Mot de passe: feiderus');
        console.log('🌐 URL de connexion: http://localhost:3000/login');
        console.log('🛠️  URL d\'admin: http://localhost:3000/admin');
        console.log('\n✨ Le serveur continue à fonctionner...\n');
        
        // Garder le processus en vie
        process.on('SIGINT', () => {
            console.log('\n🛑 Arrêt du serveur...');
            serverProcess.kill();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du démarrage:', error.message);
        process.exit(1);
    }
}

// Lancer le script
main().catch(console.error);
