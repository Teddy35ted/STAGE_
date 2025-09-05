const admin = require('firebase-admin');

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
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

// Diagnostic complet de la base de données
async function diagnosticDatabase() {
  console.log('🔍 === DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES ===\n');
  
  try {
    // 1. Lister toutes les collections
    console.log('📂 1. COLLECTIONS EXISTANTES:');
    const collections = await db.listCollections();
    const collectionNames = collections.map(col => col.id);
    
    collectionNames.forEach(name => {
      console.log(`   - ${name}`);
    });
    
    console.log(`\n📊 Total: ${collectionNames.length} collections trouvées\n`);
    
    // 2. Vérifier la duplication de account_request
    console.log('🔍 2. VÉRIFICATION DUPLICATION ACCOUNT_REQUEST:');
    
    const accountRequestVariants = [
      'account_request',
      'account-request', 
      'account_requests',
      'account-requests',
      'accountRequest',
      'accountRequests'
    ];
    
    const foundAccountCollections = [];
    
    for (const variant of accountRequestVariants) {
      if (collectionNames.includes(variant)) {
        const snapshot = await db.collection(variant).get();
        foundAccountCollections.push({
          name: variant,
          count: snapshot.size
        });
        console.log(`   ✅ ${variant}: ${snapshot.size} documents`);
      }
    }
    
    if (foundAccountCollections.length > 1) {
      console.log('\n⚠️  DUPLICATION DÉTECTÉE!');
      foundAccountCollections.forEach(col => {
        console.log(`   - ${col.name}: ${col.count} documents`);
      });
    } else if (foundAccountCollections.length === 1) {
      console.log('\n✅ Une seule collection account_request trouvée');
    } else {
      console.log('\n❌ Aucune collection account_request trouvée');
    }
    
    // 3. Vérifier les collections manquantes
    console.log('\n🔍 3. VÉRIFICATION COLLECTIONS ESSENTIELLES:');
    
    const essentialCollections = [
      'retraits',
      'laalas', 
      'contenus',
      'cogestionnaires',
      'users',
      'admins'
    ];
    
    const missingCollections = [];
    const existingCollections = [];
    
    for (const collectionName of essentialCollections) {
      if (collectionNames.includes(collectionName)) {
        const snapshot = await db.collection(collectionName).get();
        existingCollections.push({
          name: collectionName,
          count: snapshot.size
        });
        console.log(`   ✅ ${collectionName}: ${snapshot.size} documents`);
      } else {
        missingCollections.push(collectionName);
        console.log(`   ❌ ${collectionName}: MANQUANTE`);
      }
    }
    
    // 4. Résumé et recommandations
    console.log('\n📋 4. RÉSUMÉ ET RECOMMANDATIONS:');
    
    if (foundAccountCollections.length > 1) {
      console.log('\n🔧 ACTIONS REQUISES POUR ACCOUNT_REQUEST:');
      console.log('   1. Identifier la collection principale à conserver');
      console.log('   2. Migrer les données vers une collection unique');
      console.log('   3. Supprimer les collections dupliquées');
    }
    
    if (missingCollections.length > 0) {
      console.log('\n🔧 COLLECTIONS À RECRÉER:');
      missingCollections.forEach(col => {
        console.log(`   - ${col}`);
      });
      console.log('\n⚠️  Ces collections ont été supprimées par erreur');
      console.log('   Elles doivent être recréées avec leurs structures appropriées');
    }
    
    if (existingCollections.length > 0) {
      console.log('\n✅ COLLECTIONS EXISTANTES:');
      existingCollections.forEach(col => {
        console.log(`   - ${col.name}: ${col.count} documents`);
      });
    }
    
    return {
      allCollections: collectionNames,
      accountCollections: foundAccountCollections,
      missingCollections,
      existingCollections
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    throw error;
  }
}

// Script de restauration des collections
async function restoreCollections() {
  console.log('\n🔧 === RESTAURATION DES COLLECTIONS ===\n');
  
  const diagnostic = await diagnosticDatabase();
  
  if (diagnostic.missingCollections.length === 0) {
    console.log('✅ Toutes les collections essentielles existent déjà');
    return;
  }
  
  console.log('🔨 Création des collections manquantes...\n');
  
  // Créer les collections manquantes avec des documents d'exemple
  for (const collectionName of diagnostic.missingCollections) {
    try {
      console.log(`📝 Création de la collection: ${collectionName}`);
      
      // Créer un document temporaire pour initialiser la collection
      const tempDoc = {
        _temp: true,
        createdAt: admin.firestore.Timestamp.now(),
        note: `Collection ${collectionName} recréée automatiquement`
      };
      
      await db.collection(collectionName).add(tempDoc);
      console.log(`✅ Collection ${collectionName} créée avec succès`);
      
    } catch (error) {
      console.error(`❌ Erreur création collection ${collectionName}:`, error);
    }
  }
  
  console.log('\n✅ Restauration des collections terminée');
}

// Script de nettoyage des duplications
async function cleanupDuplicateAccountRequests() {
  console.log('\n🔧 === NETTOYAGE DUPLICATIONS ACCOUNT_REQUEST ===\n');
  
  const diagnostic = await diagnosticDatabase();
  
  if (diagnostic.accountCollections.length <= 1) {
    console.log('✅ Aucune duplication détectée');
    return;
  }
  
  console.log('🔍 Duplication détectée, analyse des collections...\n');
  
  // Identifier la collection principale (celle avec le plus de données récentes)
  let mainCollection = null;
  let maxScore = 0;
  
  for (const col of diagnostic.accountCollections) {
    const snapshot = await db.collection(col.name)
      .orderBy('requestDate', 'desc')
      .limit(10)
      .get();
    
    // Score basé sur le nombre de documents et la récence
    const score = col.count + (snapshot.size * 2);
    
    console.log(`📊 ${col.name}: score ${score} (${col.count} docs, ${snapshot.size} récents)`);
    
    if (score > maxScore) {
      maxScore = score;
      mainCollection = col;
    }
  }
  
  console.log(`\n🎯 Collection principale identifiée: ${mainCollection.name}`);
  
  // Proposer la migration des données
  console.log('\n⚠️  ATTENTION: Cette opération va:');
  console.log(`   1. Conserver: ${mainCollection.name}`);
  
  const collectionsToRemove = diagnostic.accountCollections.filter(col => col.name !== mainCollection.name);
  collectionsToRemove.forEach(col => {
    console.log(`   2. Supprimer: ${col.name} (${col.count} documents)`);
  });
  
  console.log('\n🔧 Pour procéder à la migration, appelez la fonction migrateAccountRequestData()');
}

// Migration des données account_request
async function migrateAccountRequestData() {
  console.log('\n🔄 === MIGRATION DONNÉES ACCOUNT_REQUEST ===\n');
  
  // Cette fonction doit être appelée manuellement après confirmation
  console.log('⚠️  Cette fonction nécessite une confirmation manuelle');
  console.log('   Veuillez décommenter le code de migration si vous êtes sûr de vouloir procéder');
  
  /*
  // Code de migration (décommenté manuellement)
  const sourceCollection = 'account_request'; // À ajuster selon diagnostic
  const targetCollection = 'account-requests'; // À ajuster selon diagnostic
  
  const sourceSnapshot = await db.collection(sourceCollection).get();
  const batch = db.batch();
  
  sourceSnapshot.docs.forEach(doc => {
    const targetRef = db.collection(targetCollection).doc();
    batch.set(targetRef, doc.data());
  });
  
  await batch.commit();
  
  // Supprimer l'ancienne collection
  await deleteCollection(sourceCollection);
  */
}

// Utilitaire pour supprimer une collection
async function deleteCollection(collectionName, batchSize = 100) {
  const collectionRef = db.collection(collectionName);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve, reject);
  });
}

async function deleteQueryBatch(db, query, resolve, reject) {
  try {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
      resolve();
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Récursivement supprimer le batch suivant
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve, reject);
    });
  } catch (error) {
    reject(error);
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Démarrage du diagnostic de base de données...\n');
    
    // Diagnostic complet
    const diagnostic = await diagnosticDatabase();
    
    // Restauration si nécessaire
    if (diagnostic.missingCollections.length > 0) {
      await restoreCollections();
    }
    
    // Nettoyage des duplications si nécessaire
    if (diagnostic.accountCollections.length > 1) {
      await cleanupDuplicateAccountRequests();
    }
    
    console.log('\n✅ Diagnostic terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    process.exit(1);
  }
}

// Exporter les fonctions pour utilisation individuelle
module.exports = {
  diagnosticDatabase,
  restoreCollections,
  cleanupDuplicateAccountRequests,
  migrateAccountRequestData,
  main
};

// Exécuter si appelé directement
if (require.main === module) {
  main();
}
