#!/usr/bin/env node

/**
 * Script de configuration automatique pour Appwrite
 * Ce script crée automatiquement les buckets nécessaires pour le projet
 */

const { Client, Storage, Permission, Role } = require('appwrite');

// Configuration
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '688fa4c00025e643934d';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Clé API admin requise

// Configuration des buckets
const BUCKETS_CONFIG = [
  {
    id: 'user-avatars',
    name: 'Photos de profil utilisateurs',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    compression: 'gzip',
    encryption: true,
    antivirus: true
  },
  {
    id: 'laala-covers',
    name: 'Couvertures des Laalas',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 50 * 1024 * 1024, // 50MB
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov'],
    compression: 'gzip',
    encryption: true,
    antivirus: true
  },
  {
    id: 'contenu-media',
    name: 'Médias des contenus',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 100 * 1024 * 1024, // 100MB
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov'],
    compression: 'gzip',
    encryption: true,
    antivirus: true
  },
  {
    id: 'boutique-images',
    name: 'Images des boutiques',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    compression: 'gzip',
    encryption: true,
    antivirus: true
  }
];

async function setupAppwrite() {
  console.log('🚀 Configuration d\'Appwrite pour La-a-La Dashboard...\n');

  // Vérifier la clé API
  if (!APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY manquante dans les variables d\'environnement');
    console.log('💡 Obtenez votre clé API depuis la console Appwrite > Settings > API Keys');
    process.exit(1);
  }

  // Initialiser le client Appwrite
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const storage = new Storage(client);

  console.log(`📡 Connexion à Appwrite...`);
  console.log(`   Endpoint: ${APPWRITE_ENDPOINT}`);
  console.log(`   Project: ${APPWRITE_PROJECT_ID}\n`);

  // Créer les buckets
  for (const bucketConfig of BUCKETS_CONFIG) {
    try {
      console.log(`📁 Création du bucket "${bucketConfig.name}" (${bucketConfig.id})...`);

      // Vérifier si le bucket existe déjà
      try {
        await storage.getBucket(bucketConfig.id);
        console.log(`   ⚠️  Le bucket "${bucketConfig.id}" existe déjà, mise à jour...`);
        
        // Mettre à jour le bucket existant
        await storage.updateBucket(
          bucketConfig.id,
          bucketConfig.name,
          bucketConfig.permissions,
          bucketConfig.fileSecurity,
          bucketConfig.enabled,
          bucketConfig.maximumFileSize,
          bucketConfig.allowedFileExtensions,
          bucketConfig.compression,
          bucketConfig.encryption,
          bucketConfig.antivirus
        );
        
        console.log(`   ✅ Bucket "${bucketConfig.id}" mis à jour avec succès`);
      } catch (error) {
        if (error.code === 404) {
          // Le bucket n'existe pas, le créer
          await storage.createBucket(
            bucketConfig.id,
            bucketConfig.name,
            bucketConfig.permissions,
            bucketConfig.fileSecurity,
            bucketConfig.enabled,
            bucketConfig.maximumFileSize,
            bucketConfig.allowedFileExtensions,
            bucketConfig.compression,
            bucketConfig.encryption,
            bucketConfig.antivirus
          );
          
          console.log(`   ✅ Bucket "${bucketConfig.id}" créé avec succès`);
        } else {
          throw error;
        }
      }

      // Afficher les détails du bucket
      console.log(`   📊 Taille max: ${formatFileSize(bucketConfig.maximumFileSize)}`);
      console.log(`   📎 Extensions: ${bucketConfig.allowedFileExtensions.join(', ')}`);
      console.log(`   🔒 Sécurité: ${bucketConfig.fileSecurity ? 'Activée' : 'Désactivée'}`);
      console.log('');

    } catch (error) {
      console.error(`   ❌ Erreur lors de la création du bucket "${bucketConfig.id}":`, error.message);
      
      if (error.code === 401) {
        console.error('   💡 Vérifiez que votre clé API a les permissions Storage');
      }
      
      console.log('');
    }
  }

  console.log('🎉 Configuration terminée !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Vérifiez les buckets dans la console Appwrite');
  console.log('2. Testez l\'upload de fichiers dans votre application');
  console.log('3. Configurez les transformations d\'images si nécessaire');
  console.log('\n📚 Documentation : lib/appwrite/setup-instructions.md');
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Fonction de test des buckets
async function testBuckets() {
  console.log('🧪 Test des buckets...\n');

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const storage = new Storage(client);

  for (const bucketConfig of BUCKETS_CONFIG) {
    try {
      const bucket = await storage.getBucket(bucketConfig.id);
      console.log(`✅ ${bucketConfig.name}: OK`);
      console.log(`   ID: ${bucket.$id}`);
      console.log(`   Fichiers: ${bucket.filesTotal || 0}`);
      console.log(`   Taille: ${formatFileSize(bucket.filesTotalSize || 0)}`);
      console.log('');
    } catch (error) {
      console.log(`❌ ${bucketConfig.name}: ${error.message}`);
    }
  }
}

// Fonction de nettoyage (suppression des buckets)
async function cleanupBuckets() {
  console.log('🧹 Suppression des buckets...\n');
  
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const storage = new Storage(client);

  for (const bucketConfig of BUCKETS_CONFIG) {
    try {
      await storage.deleteBucket(bucketConfig.id);
      console.log(`🗑️  Bucket "${bucketConfig.id}" supprimé`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`⚠️  Bucket "${bucketConfig.id}" n'existe pas`);
      } else {
        console.error(`❌ Erreur lors de la suppression de "${bucketConfig.id}":`, error.message);
      }
    }
  }
}

// CLI
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupAppwrite().catch(console.error);
    break;
  case 'test':
    testBuckets().catch(console.error);
    break;
  case 'cleanup':
    cleanupBuckets().catch(console.error);
    break;
  default:
    console.log('Usage:');
    console.log('  node scripts/setup-appwrite.js setup   - Créer/mettre à jour les buckets');
    console.log('  node scripts/setup-appwrite.js test    - Tester les buckets existants');
    console.log('  node scripts/setup-appwrite.js cleanup - Supprimer tous les buckets');
    console.log('');
    console.log('Variables d\'environnement requises:');
    console.log('  APPWRITE_API_KEY - Clé API admin Appwrite');
    break;
}

module.exports = {
  setupAppwrite,
  testBuckets,
  cleanupBuckets,
  BUCKETS_CONFIG
};