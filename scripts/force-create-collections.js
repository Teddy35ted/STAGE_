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

// Collections à créer avec leurs structures
const COLLECTIONS_TO_CREATE = {
  users: {
    email: "example@test.com",
    nom: "Exemple",
    prenom: "Utilisateur",
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
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    _isExample: true
  },
  
  retraits: {
    userId: "user_example_id",
    montant: 50000,
    devise: "FCFA",
    methodePaiement: "mobile_money",
    numeroTelephone: "+237123456789",
    statut: "pending",
    datedemande: admin.firestore.Timestamp.now(),
    dateTraitement: null,
    adminId: null,
    commentaireAdmin: "",
    frais: 500,
    montantNet: 49500,
    referenceTransaction: null,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    _isExample: true
  },
  
  laalas: {
    idCreateur: "user_example_id",
    titre: "Exemple de Laala",
    description: "Description du contenu Laala exemple",
    imageUrl: "",
    videoUrl: "",
    type: "video",
    categories: ["education"],
    tags: ["exemple"],
    statut: "published",
    vues: 0,
    likes: 0,
    commentaires: 0,
    date: admin.firestore.Timestamp.now(),
    datePublication: admin.firestore.Timestamp.now(),
    duree: 0,
    taille: 0,
    monetisation: {
      enabled: false,
      prix: 0,
      devise: "FCFA"
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    _isExample: true
  },
  
  contenus: {
    idLaala: "laala_example_id",
    titre: "Contenu exemple",
    description: "Description du contenu",
    type: "video",
    url: "",
    thumbnailUrl: "",
    position: 1,
    duree: 0,
    taille: 0,
    statut: "active",
    metadata: {
      resolution: "1920x1080",
      format: "mp4"
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    _isExample: true
  },
  
  cogestionnaires: {
    email: "cogestionnaire@example.com",
    nom: "Gestionnaire",
    prenom: "Co",
    proprietaireId: "user_example_id",
    statut: "actif",
    permissions: {
      laalas: ["read", "create"],
      contenus: ["read", "update"]
    },
    dateCreation: admin.firestore.Timestamp.now(),
    derniereConnexion: null,
    passwordHash: "",
    requiresPasswordChange: false,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    _isExample: true
  },
  
  'account-requests': {
    email: "demande@example.com",
    status: "pending",
    requestDate: admin.firestore.Timestamp.now().toDate().toISOString(),
    isFirstLogin: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    _isExample: true
  }
};

async function createCollections() {
  console.log('🔧 === CRÉATION FORCÉE DES COLLECTIONS ===\n');
  
  const results = {
    created: [],
    errors: []
  };
  
  for (const [collectionName, exampleData] of Object.entries(COLLECTIONS_TO_CREATE)) {
    try {
      console.log(`📝 Création de la collection: ${collectionName}`);
      
      // Créer le document d'exemple
      const docRef = await db.collection(collectionName).add(exampleData);
      
      console.log(`   ✅ Collection ${collectionName} créée`);
      console.log(`   📄 Document ID: ${docRef.id}`);
      
      results.created.push({
        collection: collectionName,
        docId: docRef.id
      });
      
    } catch (error) {
      console.error(`   ❌ Erreur création ${collectionName}:`, error.message);
      results.errors.push({
        collection: collectionName,
        error: error.message
      });
    }
  }
  
  console.log('\n📊 === RÉSUMÉ ===');
  console.log(`✅ Collections créées: ${results.created.length}`);
  console.log(`❌ Erreurs: ${results.errors.length}`);
  
  if (results.created.length > 0) {
    console.log('\n🆕 Collections créées:');
    results.created.forEach(item => {
      console.log(`   - ${item.collection}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ Erreurs:');
    results.errors.forEach(item => {
      console.log(`   - ${item.collection}: ${item.error}`);
    });
  }
  
  console.log('\n✅ Création des collections terminée');
  
  return results;
}

// Vérifier toutes les collections
async function verifyCollections() {
  console.log('\n🔍 === VÉRIFICATION DES COLLECTIONS ===\n');
  
  const allCollections = await db.listCollections();
  const collectionNames = allCollections.map(col => col.id);
  
  console.log('📂 Collections trouvées:');
  for (const name of collectionNames) {
    const snapshot = await db.collection(name).get();
    console.log(`   - ${name}: ${snapshot.size} documents`);
  }
  
  console.log(`\n📊 Total: ${collectionNames.length} collections`);
  
  return collectionNames;
}

async function main() {
  try {
    console.log('🚀 Initialisation...\n');
    
    // Test de connexion
    await db.collection('_test').limit(1).get();
    console.log('✅ Connexion Firebase réussie\n');
    
    // Créer les collections
    await createCollections();
    
    // Vérifier le résultat
    await verifyCollections();
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
