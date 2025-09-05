const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

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

async function cleanupAllExampleDocuments() {
  console.log('🧹 === NETTOYAGE COMPLET DES DOCUMENTS D\'EXEMPLE ===\n');
  
  const allCollections = ['users', 'retraits', 'laalas', 'contenus', 'cogestionnaires', 'account-requests'];
  let totalCleaned = 0;
  
  for (const collectionName of allCollections) {
    try {
      console.log(`🔍 Nettoyage ${collectionName}...`);
      
      const snapshot = await db.collection(collectionName)
        .where('_isExample', '==', true)
        .get();
      
      if (snapshot.empty) {
        console.log(`   ✅ Aucun document d'exemple trouvé`);
        continue;
      }
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`   🗑️  ${snapshot.size} documents d'exemple supprimés`);
      totalCleaned += snapshot.size;
      
    } catch (error) {
      console.error(`   ❌ Erreur nettoyage ${collectionName}:`, error.message);
    }
  }
  
  console.log(`\n✅ Nettoyage terminé: ${totalCleaned} documents supprimés`);
  
  // Vérification finale
  console.log('\n🔍 Vérification finale des collections...');
  for (const collectionName of allCollections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      console.log(`   - ${collectionName}: ${snapshot.size} documents`);
    } catch (error) {
      console.log(`   - ${collectionName}: Erreur de lecture`);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Initialisation du nettoyage...\n');
    
    // Test de connexion
    await db.collection('_test').limit(1).get();
    console.log('✅ Connexion Firebase réussie\n');
    
    await cleanupAllExampleDocuments();
    
    console.log('\n🎉 Nettoyage complet terminé!');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
