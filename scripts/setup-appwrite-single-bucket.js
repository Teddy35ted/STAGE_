#!/usr/bin/env node

/**
 * Script de configuration automatique pour Appwrite avec un seul bucket
 * Ce script crée un bucket unique pour tous les médias avec organisation par dossiers
 */

const { Client, Storage, Permission, Role } = require('appwrite');

// Configuration
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '688fa4c00025e643934d';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Clé API admin requise

// Configuration du bucket unique
const BUCKET_CONFIG = {
  id: 'la-a-la-media',
  name: 'La-à-La Médias (Tous types)',
  permissions: [
    Permission.read(Role.any()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users())
  ],
  fileSecurity: true,
  enabled: true,
  maximumFileSize: 100 * 1024 * 1024, // 100MB (pour supporter les vidéos)
  allowedFileExtensions: [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
    // Vidéos
    'mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv',
    // Audio (optionnel)
    'mp3', 'wav', 'ogg',
    // Documents (optionnel)
    'pdf', 'doc', 'docx'
  ],
  compression: 'gzip',
  encryption: true,
  antivirus: true
};

// Structure des dossiers organisationnels
const FOLDER_STRUCTURE = {
  'users/avatars': 'Photos de profil des utilisateurs',
  'laalas/covers': 'Images et vidéos de couverture des Laalas',
  'contenus/media': 'Médias des contenus (images, vidéos)',
  'boutiques/images': 'Images de présentation des boutiques',
  'temp': 'Fichiers temporaires',
  'archives': 'Fichiers archivés'
};

async function setupAppwriteSingleBucket() {
  console.log('🚀 Configuration d\'Appwrite avec bucket unique pour La-à-La Dashboard...\n');

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

  try {
    console.log(`📁 Configuration du bucket unique "${BUCKET_CONFIG.name}" (${BUCKET_CONFIG.id})...`);

    // Vérifier si le bucket existe déjà
    try {
      await storage.getBucket(BUCKET_CONFIG.id);
      console.log(`   ⚠️  Le bucket "${BUCKET_CONFIG.id}" existe déjà, mise à jour...`);
      
      // Mettre à jour le bucket existant
      await storage.updateBucket(
        BUCKET_CONFIG.id,
        BUCKET_CONFIG.name,
        BUCKET_CONFIG.permissions,
        BUCKET_CONFIG.fileSecurity,
        BUCKET_CONFIG.enabled,
        BUCKET_CONFIG.maximumFileSize,
        BUCKET_CONFIG.allowedFileExtensions,
        BUCKET_CONFIG.compression,
        BUCKET_CONFIG.encryption,
        BUCKET_CONFIG.antivirus
      );
      
      console.log(`   ✅ Bucket "${BUCKET_CONFIG.id}" mis à jour avec succès`);
    } catch (error) {
      if (error.code === 404) {
        // Le bucket n'existe pas, le créer
        await storage.createBucket(
          BUCKET_CONFIG.id,
          BUCKET_CONFIG.name,
          BUCKET_CONFIG.permissions,
          BUCKET_CONFIG.fileSecurity,
          BUCKET_CONFIG.enabled,
          BUCKET_CONFIG.maximumFileSize,
          BUCKET_CONFIG.allowedFileExtensions,
          BUCKET_CONFIG.compression,
          BUCKET_CONFIG.encryption,
          BUCKET_CONFIG.antivirus
        );
        
        console.log(`   ✅ Bucket "${BUCKET_CONFIG.id}" créé avec succès`);
      } else {
        throw error;
      }
    }

    // Afficher les détails du bucket
    console.log(`\n📊 Détails du bucket :`);
    console.log(`   📦 ID: ${BUCKET_CONFIG.id}`);
    console.log(`   📝 Nom: ${BUCKET_CONFIG.name}`);
    console.log(`   📏 Taille max: ${formatFileSize(BUCKET_CONFIG.maximumFileSize)}`);
    console.log(`   📎 Extensions: ${BUCKET_CONFIG.allowedFileExtensions.join(', ')}`);
    console.log(`   🔒 Sécurité: ${BUCKET_CONFIG.fileSecurity ? 'Activée' : 'Désactivée'}`);
    console.log(`   🗜️  Compression: ${BUCKET_CONFIG.compression}`);
    console.log(`   🔐 Chiffrement: ${BUCKET_CONFIG.encryption ? 'Activé' : 'Désactivé'}`);
    console.log(`   🛡️  Antivirus: ${BUCKET_CONFIG.antivirus ? 'Activé' : 'Désactivé'}`);

    // Afficher la structure des dossiers
    console.log(`\n📁 Structure organisationnelle des dossiers :`);
    Object.entries(FOLDER_STRUCTURE).forEach(([folder, description]) => {
      console.log(`   📂 ${folder}/ - ${description}`);
    });

    console.log('\n🎉 Configuration terminée !');
    console.log('\n📋 Avantages du bucket unique :');
    console.log('✅ Gestion simplifiée des permissions');
    console.log('✅ Configuration unique à maintenir');
    console.log('✅ Quotas partagés entre tous les types de médias');
    console.log('�� Organisation par dossiers virtuels');
    console.log('✅ Facturation simplifiée');

    console.log('\n📋 Organisation des fichiers :');
    console.log('• users/avatars/YYYY-MM-DD/userId/filename');
    console.log('• laalas/covers/YYYY-MM-DD/userId/laalaId/filename');
    console.log('• contenus/media/YYYY-MM-DD/userId/contenuId/filename');
    console.log('• boutiques/images/YYYY-MM-DD/userId/boutiqueId/filename');

    console.log('\n📚 Prochaines étapes :');
    console.log('1. Vérifiez le bucket dans la console Appwrite');
    console.log('2. Testez l\'upload de fichiers dans votre application');
    console.log('3. Surveillez l\'organisation des fichiers par dossiers');
    console.log('4. Configurez les transformations d\'images si nécessaire');

  } catch (error) {
    console.error(`❌ Erreur lors de la configuration du bucket:`, error.message);
    
    if (error.code === 401) {
      console.error('💡 Vérifiez que votre clé API a les permissions Storage');
    }
    
    process.exit(1);
  }
}

// Fonction de test du bucket
async function testBucket() {
  console.log('🧪 Test du bucket unique...\n');

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const storage = new Storage(client);

  try {
    const bucket = await storage.getBucket(BUCKET_CONFIG.id);
    console.log(`✅ ${BUCKET_CONFIG.name}: OK`);
    console.log(`   ID: ${bucket.$id}`);
    console.log(`   Fichiers: ${bucket.filesTotal || 0}`);
    console.log(`   Taille totale: ${formatFileSize(bucket.filesTotalSize || 0)}`);
    console.log(`   Taille max par fichier: ${formatFileSize(bucket.maximumFileSize || 0)}`);
    console.log(`   Extensions autorisées: ${bucket.allowedFileExtensions?.length || 0} types`);
    
    // Lister quelques fichiers pour voir l'organisation
    const files = await storage.listFiles(BUCKET_CONFIG.id, [], 10);
    if (files.files.length > 0) {
      console.log(`\n📁 Exemples de fichiers (${files.files.length} sur ${files.total}) :`);
      files.files.slice(0, 5).forEach(file => {
        console.log(`   📄 ${file.name} (${formatFileSize(file.sizeOriginal)})`);
      });
    } else {
      console.log(`\n📁 Aucun fichier dans le bucket pour le moment`);
    }

  } catch (error) {
    console.log(`❌ ${BUCKET_CONFIG.name}: ${error.message}`);
  }
}

// Fonction de nettoyage (suppression du bucket)
async function cleanupBucket() {
  console.log('🧹 Suppression du bucket unique...\n');
  
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const storage = new Storage(client);

  try {
    // Lister et supprimer tous les fichiers d'abord
    const files = await storage.listFiles(BUCKET_CONFIG.id, [], 1000);
    
    if (files.files.length > 0) {
      console.log(`🗑️  Suppression de ${files.files.length} fichiers...`);
      
      for (const file of files.files) {
        try {
          await storage.deleteFile(BUCKET_CONFIG.id, file.$id);
          console.log(`   ✅ Fichier supprimé: ${file.name}`);
        } catch (error) {
          console.log(`   ❌ Erreur suppression fichier ${file.name}: ${error.message}`);
        }
      }
    }

    // Supprimer le bucket
    await storage.deleteBucket(BUCKET_CONFIG.id);
    console.log(`🗑️  Bucket "${BUCKET_CONFIG.id}" supprimé avec succès`);
    
  } catch (error) {
    if (error.code === 404) {
      console.log(`⚠️  Bucket "${BUCKET_CONFIG.id}" n'existe pas`);
    } else {
      console.error(`❌ Erreur lors de la suppression du bucket:`, error.message);
    }
  }
}

// Fonction pour analyser l'organisation des fichiers
async function analyzeBucket() {
  console.log('📊 Analyse de l\'organisation du bucket...\n');
  
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const storage = new Storage(client);

  try {
    const files = await storage.listFiles(BUCKET_CONFIG.id, [], 1000);
    
    if (files.files.length === 0) {
      console.log('📁 Aucun fichier à analyser');
      return;
    }

    // Analyser l'organisation par dossiers
    const folderStats = {};
    const typeStats = {};
    let totalSize = 0;

    files.files.forEach(file => {
      // Extraire le dossier principal du nom de fichier
      const pathParts = file.name.split('/');
      const mainFolder = pathParts.length > 1 ? pathParts[0] : 'racine';
      
      if (!folderStats[mainFolder]) {
        folderStats[mainFolder] = { count: 0, size: 0 };
      }
      folderStats[mainFolder].count++;
      folderStats[mainFolder].size += file.sizeOriginal;
      
      // Analyser les types de fichiers
      const extension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      if (!typeStats[extension]) {
        typeStats[extension] = { count: 0, size: 0 };
      }
      typeStats[extension].count++;
      typeStats[extension].size += file.sizeOriginal;
      
      totalSize += file.sizeOriginal;
    });

    console.log(`📊 Statistiques générales :`);
    console.log(`   📄 Total fichiers: ${files.files.length}`);
    console.log(`   📏 Taille totale: ${formatFileSize(totalSize)}`);
    console.log(`   📈 Taille moyenne: ${formatFileSize(totalSize / files.files.length)}`);

    console.log(`\n📁 Répartition par dossiers :`);
    Object.entries(folderStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([folder, stats]) => {
        const percentage = ((stats.size / totalSize) * 100).toFixed(1);
        console.log(`   📂 ${folder}: ${stats.count} fichiers, ${formatFileSize(stats.size)} (${percentage}%)`);
      });

    console.log(`\n📎 Répartition par types :`);
    Object.entries(typeStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10) // Top 10
      .forEach(([type, stats]) => {
        const percentage = ((stats.size / totalSize) * 100).toFixed(1);
        console.log(`   📄 .${type}: ${stats.count} fichiers, ${formatFileSize(stats.size)} (${percentage}%)`);
      });

  } catch (error) {
    console.error(`❌ Erreur lors de l'analyse:`, error.message);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// CLI
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupAppwriteSingleBucket().catch(console.error);
    break;
  case 'test':
    testBucket().catch(console.error);
    break;
  case 'cleanup':
    cleanupBucket().catch(console.error);
    break;
  case 'analyze':
    analyzeBucket().catch(console.error);
    break;
  default:
    console.log('Usage:');
    console.log('  node scripts/setup-appwrite-single-bucket.js setup   - Créer/mettre à jour le bucket unique');
    console.log('  node scripts/setup-appwrite-single-bucket.js test    - Tester le bucket');
    console.log('  node scripts/setup-appwrite-single-bucket.js analyze - Analyser l\'organisation des fichiers');
    console.log('  node scripts/setup-appwrite-single-bucket.js cleanup - Supprimer le bucket et tous les fichiers');
    console.log('');
    console.log('Variables d\'environnement requises:');
    console.log('  APPWRITE_API_KEY - Clé API admin Appwrite');
    console.log('');
    console.log('Avantages du bucket unique:');
    console.log('  ✅ Configuration simplifiée');
    console.log('  ✅ Gestion des permissions unifiée');
    console.log('  ✅ Organisation par dossiers virtuels');
    console.log('  ✅ Quotas partagés entre tous les médias');
    break;
}

module.exports = {
  setupAppwriteSingleBucket,
  testBucket,
  cleanupBucket,
  analyzeBucket,
  BUCKET_CONFIG,
  FOLDER_STRUCTURE
};