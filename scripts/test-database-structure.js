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

async function createTestAccountRequest() {
  console.log('📝 === CRÉATION D\'UNE DEMANDE DE COMPTE TEST ===\n');
  
  const testRequest = {
    email: "test.utilisateur@example.com",
    status: "pending",
    requestDate: new Date().toISOString(),
    isFirstLogin: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };
  
  try {
    const docRef = await db.collection('account-requests').add(testRequest);
    console.log('✅ Demande de compte créée avec succès');
    console.log(`📄 Document ID: ${docRef.id}`);
    console.log(`📧 Email: ${testRequest.email}`);
    console.log(`📅 Date: ${testRequest.requestDate}`);
    
    return {
      id: docRef.id,
      ...testRequest
    };
    
  } catch (error) {
    console.error('❌ Erreur création demande:', error);
    throw error;
  }
}

async function createTestUser() {
  console.log('\n👤 === CRÉATION D\'UN UTILISATEUR TEST ===\n');
  
  const testUser = {
    email: "test.utilisateur@example.com",
    nom: "Utilisateur",
    prenom: "Test",
    tel: "+237123456789",
    date_de_naissance: "1990-01-01",
    sexe: "M",
    pays: "Cameroun",
    ville: "Douala",
    quartier: "Akwa",
    region: "Littoral",
    codePays: "+237",
    solde: 0,
    statut: "actif",
    dateInscription: admin.firestore.Timestamp.now(),
    derniereConnexion: admin.firestore.Timestamp.now(),
    isFirstLogin: true,
    passwordHash: "$2b$10$example.hash.for.test",
    requiresPasswordChange: false,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };
  
  try {
    const docRef = await db.collection('users').add(testUser);
    console.log('✅ Utilisateur test créé avec succès');
    console.log(`📄 Document ID: ${docRef.id}`);
    console.log(`📧 Email: ${testUser.email}`);
    
    return {
      id: docRef.id,
      ...testUser
    };
    
  } catch (error) {
    console.error('❌ Erreur création utilisateur:', error);
    throw error;
  }
}

async function verifyDatabaseStructure() {
  console.log('\n🔍 === VÉRIFICATION STRUCTURE DE LA BASE ===\n');
  
  const collections = ['admins', 'account-requests', 'users', 'retraits', 'laalas', 'contenus', 'cogestionnaires'];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      console.log(`✅ ${collectionName}: ${snapshot.size} documents`);
      
      if (snapshot.size > 0) {
        // Afficher un exemple de structure
        const firstDoc = snapshot.docs[0];
        const data = firstDoc.data();
        const keys = Object.keys(data).slice(0, 5); // Premiers 5 champs
        console.log(`   📋 Champs: ${keys.join(', ')}${keys.length >= 5 ? '...' : ''}`);
      }
      
    } catch (error) {
      console.log(`❌ ${collectionName}: Erreur d'accès`);
    }
  }
}

async function cleanupTestData() {
  console.log('\n🧹 === NETTOYAGE DES DONNÉES TEST ===\n');
  
  try {
    // Supprimer les documents test dans account-requests
    const accountRequestsSnapshot = await db.collection('account-requests')
      .where('email', '==', 'test.utilisateur@example.com')
      .get();
    
    if (!accountRequestsSnapshot.empty) {
      const batch = db.batch();
      accountRequestsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`🗑️  ${accountRequestsSnapshot.size} demandes test supprimées`);
    }
    
    // Supprimer les utilisateurs test
    const usersSnapshot = await db.collection('users')
      .where('email', '==', 'test.utilisateur@example.com')
      .get();
    
    if (!usersSnapshot.empty) {
      const batch2 = db.batch();
      usersSnapshot.docs.forEach(doc => {
        batch2.delete(doc.ref);
      });
      await batch2.commit();
      console.log(`🗑️  ${usersSnapshot.size} utilisateurs test supprimés`);
    }
    
    console.log('✅ Nettoyage des données test terminé');
    
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
  }
}

async function main() {
  try {
    console.log('🚀 === TEST DE LA STRUCTURE DE BASE DE DONNÉES ===\n');
    
    // Test de connexion
    await db.collection('_test').limit(1).get();
    console.log('✅ Connexion Firebase réussie\n');
    
    // Vérifier la structure
    await verifyDatabaseStructure();
    
    // Créer des données test
    const accountRequest = await createTestAccountRequest();
    const user = await createTestUser();
    
    // Vérifier à nouveau
    console.log('\n🔍 Vérification après création des données test...');
    await verifyDatabaseStructure();
    
    console.log('\n📋 === RÉSUMÉ DU TEST ===');
    console.log('✅ Structure de base de données vérifiée');
    console.log('✅ Collections fonctionnelles');
    console.log('✅ Données test créées avec succès');
    console.log('\n🧪 Vous pouvez maintenant tester le flux d\'authentification complet');
    console.log('   1. Aller sur http://localhost:3000/auth/login-temporary');
    console.log('   2. Utiliser l\'email: test.utilisateur@example.com');
    console.log('   3. Utiliser un mot de passe temporaire (à définir par admin)');
    
    // Nettoyage optionnel
    const shouldCleanup = false; // Mettre à true pour nettoyer automatiquement
    if (shouldCleanup) {
      await cleanupTestData();
    } else {
      console.log('\n💡 Pour nettoyer les données test, appelez cleanupTestData()');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Exporter les fonctions
module.exports = {
  createTestAccountRequest,
  createTestUser,
  verifyDatabaseStructure,
  cleanupTestData,
  main
};

if (require.main === module) {
  main();
}
