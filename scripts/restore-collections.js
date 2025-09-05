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

// Structures de données par collection
const COLLECTION_STRUCTURES = {
  retraits: {
    description: "Gestion des demandes de retrait d'argent",
    sampleDocument: {
      userId: "user_id_example",
      montant: 50000,
      devise: "FCFA",
      methodePaiement: "mobile_money",
      numeroTelephone: "+237123456789",
      statut: "pending", // pending, approved, rejected, completed
      datedemande: admin.firestore.Timestamp.now(),
      dateTraitement: null,
      adminId: null,
      commentaireAdmin: "",
      frais: 500,
      montantNet: 49500,
      referenceTransaction: null,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  },
  
  laalas: {
    description: "Gestion des contenus Laala créés par les utilisateurs",
    sampleDocument: {
      idCreateur: "user_id_example",
      titre: "Exemple de Laala",
      description: "Description du contenu Laala",
      imageUrl: "",
      videoUrl: "",
      type: "video", // video, image, texte
      categories: ["education", "entertainment"],
      tags: ["exemple", "demo"],
      statut: "published", // draft, published, archived
      vues: 0,
      likes: 0,
      commentaires: 0,
      date: admin.firestore.Timestamp.now(),
      datePublication: admin.firestore.Timestamp.now(),
      duree: 0, // en secondes pour videos
      taille: 0, // en bytes
      monetisation: {
        enabled: false,
        prix: 0,
        devise: "FCFA"
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  },
  
  contenus: {
    description: "Contenus détaillés associés aux Laalas",
    sampleDocument: {
      idLaala: "laala_id_example",
      titre: "Contenu exemple",
      description: "Description détaillée du contenu",
      type: "video", // video, image, texte, audio
      url: "",
      thumbnailUrl: "",
      position: 1,
      duree: 0, // en secondes
      taille: 0, // en bytes
      statut: "active", // active, inactive, deleted
      metadata: {
        resolution: "1920x1080",
        format: "mp4",
        bitrate: "1000kbps"
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  },
  
  cogestionnaires: {
    description: "Gestion des co-gestionnaires de comptes",
    sampleDocument: {
      email: "cogestionnaire@example.com",
      nom: "Nom Exemple",
      prenom: "Prénom Exemple",
      proprietaireId: "user_id_proprietaire",
      statut: "actif", // actif, suspendu, inactif
      permissions: {
        laalas: ["read", "create", "update"],
        contenus: ["read", "update"],
        communications: ["read", "create"],
        campaigns: ["read"]
      },
      dateCreation: admin.firestore.Timestamp.now(),
      derniereConnexion: admin.firestore.Timestamp.now(),
      passwordHash: "", // Hash bcrypt du mot de passe
      requiresPasswordChange: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  }
};

// Vérifier l'existence des collections
async function checkCollectionExists(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).limit(1).get();
    return { exists: true, count: snapshot.size };
  } catch (error) {
    return { exists: false, count: 0 };
  }
}

// Créer une collection avec sa structure
async function createCollectionWithStructure(collectionName) {
  try {
    console.log(`\n📝 Création de la collection: ${collectionName}`);
    
    const structure = COLLECTION_STRUCTURES[collectionName];
    if (!structure) {
      throw new Error(`Structure non définie pour la collection: ${collectionName}`);
    }
    
    console.log(`   📋 Description: ${structure.description}`);
    
    // Créer un document d'exemple avec la structure
    const docRef = await db.collection(collectionName).add({
      ...structure.sampleDocument,
      _isExample: true,
      _note: `Document d'exemple pour la collection ${collectionName}. Peut être supprimé.`
    });
    
    console.log(`   ✅ Collection ${collectionName} créée avec document exemple`);
    console.log(`   📄 Document ID: ${docRef.id}`);
    
    return docRef.id;
    
  } catch (error) {
    console.error(`   ❌ Erreur création collection ${collectionName}:`, error.message);
    throw error;
  }
}

// Restaurer toutes les collections manquantes
async function restoreCollections() {
  console.log('🔧 === RESTAURATION DES COLLECTIONS MANQUANTES ===\n');
  
  const collectionsToCheck = Object.keys(COLLECTION_STRUCTURES);
  const results = {
    existing: [],
    created: [],
    errors: []
  };
  
  console.log('🔍 Vérification de l\'existence des collections...\n');
  
  for (const collectionName of collectionsToCheck) {
    try {
      const status = await checkCollectionExists(collectionName);
      
      if (status.exists) {
        console.log(`✅ ${collectionName}: Existe déjà (${status.count} documents)`);
        results.existing.push({ name: collectionName, count: status.count });
      } else {
        console.log(`❌ ${collectionName}: MANQUANTE - Création en cours...`);
        
        const docId = await createCollectionWithStructure(collectionName);
        results.created.push({ name: collectionName, docId });
      }
      
    } catch (error) {
      console.error(`❌ Erreur avec ${collectionName}:`, error.message);
      results.errors.push({ name: collectionName, error: error.message });
    }
  }
  
  // Résumé final
  console.log('\n📊 === RÉSUMÉ DE LA RESTAURATION ===');
  
  if (results.existing.length > 0) {
    console.log('\n✅ Collections existantes:');
    results.existing.forEach(col => {
      console.log(`   - ${col.name}: ${col.count} documents`);
    });
  }
  
  if (results.created.length > 0) {
    console.log('\n🆕 Collections créées:');
    results.created.forEach(col => {
      console.log(`   - ${col.name}: Document exemple créé`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ Erreurs rencontrées:');
    results.errors.forEach(error => {
      console.log(`   - ${error.name}: ${error.error}`);
    });
  }
  
  if (results.created.length > 0) {
    console.log('\n📝 ACTIONS SUIVANTES RECOMMANDÉES:');
    console.log('   1. Vérifiez les collections créées dans Firebase Console');
    console.log('   2. Supprimez les documents d\'exemple si nécessaire');
    console.log('   3. Configurez les règles de sécurité Firestore appropriées');
    console.log('   4. Testez les APIs correspondantes');
  }
  
  return results;
}

// Restaurer une collection spécifique
async function restoreSpecificCollection(collectionName) {
  console.log(`🔧 === RESTAURATION COLLECTION: ${collectionName} ===\n`);
  
  if (!COLLECTION_STRUCTURES[collectionName]) {
    throw new Error(`Collection non supportée: ${collectionName}`);
  }
  
  const status = await checkCollectionExists(collectionName);
  
  if (status.exists) {
    console.log(`✅ Collection ${collectionName} existe déjà (${status.count} documents)`);
    console.log('   Aucune action nécessaire');
    return null;
  }
  
  console.log(`❌ Collection ${collectionName} manquante - Création...`);
  const docId = await createCollectionWithStructure(collectionName);
  
  console.log(`\n✅ Collection ${collectionName} restaurée avec succès`);
  console.log(`📄 Document exemple créé avec ID: ${docId}`);
  
  return docId;
}

// Nettoyer les documents d'exemple
async function cleanupExampleDocuments() {
  console.log('🧹 === NETTOYAGE DES DOCUMENTS D\'EXEMPLE ===\n');
  
  const collectionsToClean = Object.keys(COLLECTION_STRUCTURES);
  let totalCleaned = 0;
  
  for (const collectionName of collectionsToClean) {
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
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 === SCRIPT DE RESTAURATION DES COLLECTIONS ===\n');
    
    // Vérification de la connexion Firebase
    console.log('🔗 Test de connexion Firebase...');
    await db.collection('_test').limit(1).get();
    console.log('✅ Connexion Firebase réussie\n');
    
    // Restauration des collections
    const results = await restoreCollections();
    
    // Messages finaux
    if (results.created.length === 0 && results.errors.length === 0) {
      console.log('\n🎉 Toutes les collections sont déjà présentes!');
    } else if (results.created.length > 0 && results.errors.length === 0) {
      console.log('\n🎉 Restauration terminée avec succès!');
    } else {
      console.log('\n⚠️  Restauration terminée avec des erreurs');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la restauration:', error);
    process.exit(1);
  }
}

// Exporter les fonctions
module.exports = {
  restoreCollections,
  restoreSpecificCollection,
  cleanupExampleDocuments,
  checkCollectionExists,
  main
};

// Exécuter si appelé directement
if (require.main === module) {
  main();
}
