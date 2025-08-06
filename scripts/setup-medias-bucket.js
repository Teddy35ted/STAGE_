#!/usr/bin/env node

/**
 * Script de vérification et configuration pour le bucket "medias"
 * Ce script vérifie que votre bucket "medias" est correctement configuré
 */

const { Client, Storage, Permission, Role } = require('appwrite');

// Configuration
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '688fa4c00025e643934d';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Clé API admin requise

// Configuration du bucket "medias" existant
const BUCKET_CONFIG = {
  id: '688fa6db0002434c0735', // ID unique du bucket existant
  name: 'Médias La-a-La',
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
  console.log('🔍 Vérification du bucket "medias" existant...\n');

  if (!APPWRITE_API_KEY) {
    console.log('❌ APPWRITE_API_KEY manquante dans les variables d\'environnement');
    console.log('💡 Assurez-vous que APPWRITE_API_KEY est définie dans .env.local');
    console.log('💡 Redémarrez votre terminal après avoir modifié .env.local\n');
    return;
  }

  console.log('✅ Clé API Appwrite détectée');

  try {
    // Initialiser le client Appwrite
    const client = new Client();
    client
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);

    // Pour les versions récentes d'Appwrite, utiliser setKey
    if (typeof client.setKey === 'function') {
      client.setKey(APPWRITE_API_KEY);
    } else {
      // Pour les versions plus anciennes
      client.headers = {
        ...client.headers,
        'X-Appwrite-Key': APPWRITE_API_KEY
      };
    }

    const storage = new Storage(client);

    console.log(`📡 Connexion à Appwrite...`);
    console.log(`   Endpoint: ${APPWRITE_ENDPOINT}`);
    console.log(`   Project: ${APPWRITE_PROJECT_ID}`);
    console.log(`   Bucket ID: ${BUCKET_CONFIG.id}\n`);

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

    console.log(`\n🎉 Bucket "medias" configuré et prêt !`);
    console.log(`\n📋 Organisation automatique des fichiers :`);
    console.log(`   • users/avatars/YYYY-MM-DD/userId/filename`);
    console.log(`   • laalas/covers/YYYY-MM-DD/userId/laalaId/filename`);
    console.log(`   • contenus/media/YYYY-MM-DD/userId/contenuId/filename`);
    console.log(`   • boutiques/images/YYYY-MM-DD/userId/boutiqueId/filename`);
    
    console.log(`\n📋 Prochaines étapes:`);
    console.log(`1. Testez l'upload depuis votre application`);
    console.log(`2. Vérifiez que les fichiers sont organisés par dossiers`);
    console.log(`3. Confirmez que les URLs générées fonctionnent`);

  } catch (error) {
    if (error.code === 404) {
      console.log(`❌ Bucket "${BUCKET_CONFIG.id}" non trouvé !`);
      console.log(`\n📋 Vérifiez dans Appwrite Console :`);
      console.log(`1. Que le bucket existe bien`);
      console.log(`2. Que l'ID est correct : ${BUCKET_CONFIG.id}`);
      console.log(`3. Que le projet est correct : ${APPWRITE_PROJECT_ID}`);
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
  
  console.log(`📤 Simulation d'upload vers le bucket: ${BUCKET_CONFIG.id}`);
  console.log('   • user-avatar → users/avatars/2024-01-15/userId/avatar.jpg');
  console.log('   • laala-cover → laalas/covers/2024-01-15/userId/laalaId/cover.mp4');
  console.log('   • contenu-media → contenus/media/2024-01-15/userId/contenuId/video.mp4');
  console.log('   • boutique-image → boutiques/images/2024-01-15/userId/boutiqueId/image.jpg');
  
  console.log('\n💡 Pour tester réellement:');
  console.log('1. Utilisez les composants MediaUpload dans votre app');
  console.log('2. Vérifiez que userId est fourni');
  console.log('3. Confirmez l\'organisation automatique des fichiers');
  console.log(`4. Le bucket ID utilisé sera: ${BUCKET_CONFIG.id}`);
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
    console.log('Variables d\'environnement requises:');
    console.log('  APPWRITE_API_KEY - Clé API admin Appwrite');
    console.log('');
    console.log('Bucket configuré:');
    console.log(`  • ID: ${BUCKET_CONFIG.id}`);
    console.log(`  • Project: ${APPWRITE_PROJECT_ID}`);
    console.log(`  • Endpoint: ${APPWRITE_ENDPOINT}`);
    break;
}

module.exports = {
  checkMediasBucket,
  testUpload,
  BUCKET_CONFIG
};