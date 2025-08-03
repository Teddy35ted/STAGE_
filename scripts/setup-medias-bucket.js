#!/usr/bin/env node

/**
 * Script de vérification et configuration pour le bucket "medias"
 * Ce script vérifie que votre bucket "medias" est correctement configuré
 */

const { Client, Storage, Permission, Role } = require('appwrite');

// Configuration
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '688f85190004fa948692';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Clé API admin requise

// Configuration recommandée pour le bucket "medias"
const BUCKET_CONFIG = {
  id: 'medias',
  name: 'Médias La-à-La',
  permissions: [
    Permission.read(Role.any()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users())
  ],
  fileSecurity: true,
  enabled: true,
  maximumFileSize: 100 * 1024 * 1024, // 100MB
  allowedFileExtensions: [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
    // Vidéos
    'mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv'
  ],
  compression: 'gzip',
  encryption: true,
  antivirus: true
};

async function checkMediasBucket() {
  console.log('🔍 Vérification du bucket "medias"...\n');

  if (!APPWRITE_API_KEY) {
    console.log('⚠️  APPWRITE_API_KEY non fournie - vérification en mode lecture seule');
    console.log('💡 Pour une configuration complète, définissez APPWRITE_API_KEY\n');
  }

  // Initialiser le client Appwrite
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  if (APPWRITE_API_KEY) {
    client.setKey(APPWRITE_API_KEY);
  }

  const storage = new Storage(client);

  console.log(`📡 Connexion à Appwrite...`);
  console.log(`   Endpoint: ${APPWRITE_ENDPOINT}`);
  console.log(`   Project: ${APPWRITE_PROJECT_ID}\n`);

  try {
    // Vérifier si le bucket existe
    const bucket = await storage.getBucket(BUCKET_CONFIG.id);
    
    console.log(`✅ Bucket "${BUCKET_CONFIG.id}" trouvé !`);
    console.log(`   📝 Nom: ${bucket.name}`);
    console.log(`   📊 Fichiers: ${bucket.filesTotal || 0}`);
    console.log(`   📏 Taille totale: ${formatFileSize(bucket.filesTotalSize || 0)}`);
    console.log(`   📦 Taille max par fichier: ${formatFileSize(bucket.maximumFileSize || 0)}`);
    console.log(`   🔒 Sécurité des fichiers: ${bucket.fileSecurity ? 'Activée' : 'Désactivée'}`);
    console.log(`   ✅ Statut: ${bucket.enabled ? 'Activé' : 'Désactivé'}`);

    // Vérifier les extensions autorisées
    if (bucket.allowedFileExtensions && bucket.allowedFileExtensions.length > 0) {
      console.log(`   📎 Extensions autorisées: ${bucket.allowedFileExtensions.join(', ')}`);
    } else {
      console.log(`   📎 Extensions: Toutes autorisées`);
    }

    // Vérifier les permissions
    console.log(`\n🔐 Permissions:`);
    if (bucket.permissions && bucket.permissions.length > 0) {
      bucket.permissions.forEach(permission => {
        console.log(`   • ${permission}`);
      });
    } else {
      console.log(`   ⚠️  Aucune permission définie`);
    }

    // Recommandations
    console.log(`\n💡 Recommandations:`);
    
    if (bucket.maximumFileSize < BUCKET_CONFIG.maximumFileSize) {
      console.log(`   ⚠️  Taille max recommandée: ${formatFileSize(BUCKET_CONFIG.maximumFileSize)}`);
    } else {
      console.log(`   ✅ Taille maximale: OK`);
    }

    if (!bucket.fileSecurity) {
      console.log(`   ⚠️  Activez la sécurité des fichiers pour de meilleures permissions`);
    } else {
      console.log(`   ✅ Sécurité des fichiers: OK`);
    }

    if (!bucket.enabled) {
      console.log(`   ❌ Le bucket est désactivé - activez-le dans la console Appwrite`);
    } else {
      console.log(`   ✅ Bucket activé: OK`);
    }

    // Lister quelques fichiers pour voir l'organisation
    console.log(`\n📁 Organisation des fichiers:`);
    const files = await storage.listFiles(BUCKET_CONFIG.id, [], 10);
    
    if (files.files.length > 0) {
      console.log(`   Exemples de fichiers (${files.files.length} sur ${files.total}) :`);
      files.files.slice(0, 5).forEach(file => {
        console.log(`   📄 ${file.name} (${formatFileSize(file.sizeOriginal)})`);
      });
      
      // Analyser l'organisation
      const folders = {};
      files.files.forEach(file => {
        const pathParts = file.name.split('/');
        if (pathParts.length > 1) {
          const folder = pathParts[0];
          folders[folder] = (folders[folder] || 0) + 1;
        }
      });
      
      if (Object.keys(folders).length > 0) {
        console.log(`\n   📂 Dossiers détectés:`);
        Object.entries(folders).forEach(([folder, count]) => {
          console.log(`   • ${folder}/: ${count} fichier(s)`);
        });
      }
    } else {
      console.log(`   📁 Aucun fichier pour le moment`);
      console.log(`   💡 Testez l'upload depuis votre application`);
    }

    console.log(`\n🎉 Configuration du bucket "medias" vérifiée !`);
    console.log(`\n📋 Prochaines étapes:`);
    console.log(`1. Testez l'upload depuis votre application`);
    console.log(`2. Vérifiez que les fichiers sont organisés par dossiers`);
    console.log(`3. Confirmez que les URLs générées fonctionnent`);

  } catch (error) {
    if (error.code === 404) {
      console.log(`❌ Bucket "${BUCKET_CONFIG.id}" non trouvé !`);
      console.log(`\n📋 Pour créer le bucket "medias":`);
      console.log(`1. Allez dans votre console Appwrite`);
      console.log(`2. Section Storage > Create Bucket`);
      console.log(`3. Utilisez ces paramètres:`);
      console.log(`   • ID: ${BUCKET_CONFIG.id}`);
      console.log(`   • Nom: ${BUCKET_CONFIG.name}`);
      console.log(`   • Taille max: ${formatFileSize(BUCKET_CONFIG.maximumFileSize)}`);
      console.log(`   • Extensions: ${BUCKET_CONFIG.allowedFileExtensions.join(', ')}`);
      console.log(`   • Permissions:`);
      console.log(`     - Read: any`);
      console.log(`     - Create: users`);
      console.log(`     - Update: users`);
      console.log(`     - Delete: users`);
    } else {
      console.error(`❌ Erreur lors de la vérification:`, error.message);
      
      if (error.code === 401) {
        console.log(`💡 Vérifiez votre clé API ou les permissions`);
      }
    }
  }
}

async function testUpload() {
  console.log('🧪 Test d\'upload (simulation)...\n');
  
  console.log('📤 Simulation d\'upload pour chaque catégorie:');
  console.log('   • user-avatar → medias/users/avatars/2024-01-15/userId/avatar.jpg');
  console.log('   • laala-cover → medias/laalas/covers/2024-01-15/userId/laalaId/cover.mp4');
  console.log('   • contenu-media → medias/contenus/media/2024-01-15/userId/contenuId/video.mp4');
  console.log('   • boutique-image → medias/boutiques/images/2024-01-15/userId/boutiqueId/image.jpg');
  
  console.log('\n💡 Pour tester réellement:');
  console.log('1. Utilisez les composants MediaUpload dans votre app');
  console.log('2. Vérifiez que userId est fourni');
  console.log('3. Confirmez l\'organisation automatique des fichiers');
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
  case 'check':
  case undefined:
    checkMediasBucket().catch(console.error);
    break;
  case 'test':
    testUpload();
    break;
  default:
    console.log('Usage:');
    console.log('  node scripts/setup-medias-bucket.js [check]  - Vérifier le bucket "medias"');
    console.log('  node scripts/setup-medias-bucket.js test     - Simuler les uploads');
    console.log('');
    console.log('Variables d\'environnement optionnelles:');
    console.log('  APPWRITE_API_KEY - Clé API admin pour configuration avancée');
    console.log('');
    console.log('Configuration requise dans Appwrite Console:');
    console.log('  • Bucket ID: medias');
    console.log('  • Taille max: 100MB');
    console.log('  • Extensions: jpg, jpeg, png, gif, webp, svg, mp4, avi, mov, wmv, webm, mkv');
    console.log('  • Permissions: read(any), create(users), update(users), delete(users)');
    break;
}

module.exports = {
  checkMediasBucket,
  testUpload,
  BUCKET_CONFIG
};