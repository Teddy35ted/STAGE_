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

// Variantes possibles de la collection account_request
const ACCOUNT_REQUEST_VARIANTS = [
  'account_request',
  'account-request', 
  'account_requests',
  'account-requests',
  'accountRequest',
  'accountRequests'
];

// Collection cible standardisée
const TARGET_COLLECTION = 'account-requests';

// Analyser les collections account_request existantes
async function analyzeAccountRequestCollections() {
  console.log('🔍 === ANALYSE DES COLLECTIONS ACCOUNT_REQUEST ===\n');
  
  const foundCollections = [];
  
  for (const variant of ACCOUNT_REQUEST_VARIANTS) {
    try {
      const snapshot = await db.collection(variant).get();
      if (snapshot.size > 0) {
        
        // Analyser le contenu de la collection
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
          hasDate: !!doc.data().requestDate,
          hasStatus: !!doc.data().status,
          isRecent: doc.data().requestDate && 
            new Date(doc.data().requestDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
        }));
        
        // Calculer les statistiques
        const stats = {
          total: docs.length,
          withDates: docs.filter(d => d.hasDate).length,
          withStatus: docs.filter(d => d.hasStatus).length,
          recent: docs.filter(d => d.isRecent).length,
          pending: docs.filter(d => d.data.status === 'pending').length,
          approved: docs.filter(d => d.data.status === 'approved').length,
          rejected: docs.filter(d => d.data.status === 'rejected').length
        };
        
        foundCollections.push({
          name: variant,
          documents: docs,
          stats,
          score: calculateCollectionScore(stats)
        });
        
        console.log(`📂 Collection: ${variant}`);
        console.log(`   📊 Total documents: ${stats.total}`);
        console.log(`   📅 Avec dates: ${stats.withDates}`);
        console.log(`   🏷️  Avec statuts: ${stats.withStatus}`);
        console.log(`   🆕 Récents (30j): ${stats.recent}`);
        console.log(`   ⏳ Pending: ${stats.pending}`);
        console.log(`   ✅ Approved: ${stats.approved}`);
        console.log(`   ❌ Rejected: ${stats.rejected}`);
        console.log(`   🎯 Score: ${stats.score}\n`);
      }
    } catch (error) {
      // Collection n'existe pas ou erreur d'accès
    }
  }
  
  if (foundCollections.length === 0) {
    console.log('❌ Aucune collection account_request trouvée');
    return { collections: [], recommendation: null };
  }
  
  if (foundCollections.length === 1) {
    console.log('✅ Une seule collection trouvée - pas de duplication');
    const collection = foundCollections[0];
    
    if (collection.name !== TARGET_COLLECTION) {
      console.log(`⚠️  Collection trouvée: ${collection.name}`);
      console.log(`🎯 Collection recommandée: ${TARGET_COLLECTION}`);
      console.log('   Recommandation: Renommer la collection pour standardiser');
    }
    
    return { 
      collections: foundCollections, 
      recommendation: collection.name !== TARGET_COLLECTION ? 'rename' : 'none'
    };
  }
  
  // Plusieurs collections trouvées - duplication détectée
  console.log(`⚠️  DUPLICATION DÉTECTÉE: ${foundCollections.length} collections`);
  
  // Identifier la meilleure collection à conserver
  foundCollections.sort((a, b) => b.score - a.score);
  const primaryCollection = foundCollections[0];
  const duplicateCollections = foundCollections.slice(1);
  
  console.log(`\n🎯 RECOMMANDATION DE CONSOLIDATION:`);
  console.log(`   ✅ Conserver: ${primaryCollection.name} (score: ${primaryCollection.score})`);
  console.log(`   🗑️  Fusionner et supprimer:`);
  duplicateCollections.forEach(col => {
    console.log(`      - ${col.name} (${col.stats.total} docs, score: ${col.score})`);
  });
  
  return {
    collections: foundCollections,
    primary: primaryCollection,
    duplicates: duplicateCollections,
    recommendation: 'consolidate'
  };
}

// Calculer un score pour déterminer la meilleure collection
function calculateCollectionScore(stats) {
  let score = 0;
  
  // Points pour le nombre total de documents
  score += stats.total * 10;
  
  // Points bonus pour les documents avec dates
  score += stats.withDates * 5;
  
  // Points bonus pour les documents avec statuts
  score += stats.withStatus * 5;
  
  // Points bonus pour les documents récents
  score += stats.recent * 15;
  
  // Points pour les documents pending (actifs)
  score += stats.pending * 20;
  
  return score;
}

// Consolider les collections dupliquées
async function consolidateAccountRequestCollections(dryRun = true) {
  console.log('🔄 === CONSOLIDATION DES COLLECTIONS ACCOUNT_REQUEST ===\n');
  
  if (dryRun) {
    console.log('🧪 MODE TEST (DRY RUN) - Aucune modification réelle\n');
  } else {
    console.log('⚠️  MODE PRODUCTION - Les modifications seront appliquées\n');
  }
  
  const analysis = await analyzeAccountRequestCollections();
  
  if (analysis.recommendation !== 'consolidate') {
    console.log('ℹ️  Aucune consolidation nécessaire');
    return analysis;
  }
  
  const { primary, duplicates } = analysis;
  
  console.log(`📋 Plan de consolidation:`);
  console.log(`   🎯 Collection cible: ${TARGET_COLLECTION}`);
  console.log(`   📂 Collection source principale: ${primary.name}`);
  console.log(`   📦 Collections à fusionner: ${duplicates.map(d => d.name).join(', ')}\n`);
  
  // Étape 1: Créer/préparer la collection cible
  let targetExists = false;
  try {
    const targetSnapshot = await db.collection(TARGET_COLLECTION).limit(1).get();
    targetExists = targetSnapshot.size > 0;
  } catch (error) {
    targetExists = false;
  }
  
  console.log(`🎯 Collection cible ${TARGET_COLLECTION}: ${targetExists ? 'Existe' : 'À créer'}`);
  
  // Étape 2: Collecter tous les documents uniques
  const allDocuments = new Map(); // email -> document
  let totalDocuments = 0;
  let duplicateDocuments = 0;
  
  console.log('\n📥 Collecte des documents...');
  
  // Commencer par la collection principale
  for (const doc of primary.documents) {
    const email = doc.data.email;
    if (email) {
      allDocuments.set(email, {
        ...doc.data,
        _originalCollection: primary.name,
        _consolidatedAt: admin.firestore.Timestamp.now()
      });
      totalDocuments++;
    }
  }
  
  // Ajouter les documents des collections dupliquées
  for (const collection of duplicates) {
    for (const doc of collection.documents) {
      const email = doc.data.email;
      if (email) {
        if (allDocuments.has(email)) {
          console.log(`   ⚠️  Doublon détecté pour email: ${email}`);
          
          // Garder le document le plus récent ou avec le meilleur statut
          const existing = allDocuments.get(email);
          const current = doc.data;
          
          if (shouldReplaceDocument(existing, current)) {
            allDocuments.set(email, {
              ...current,
              _originalCollection: collection.name,
              _consolidatedAt: admin.firestore.Timestamp.now(),
              _replacedDuplicate: true
            });
            console.log(`      📝 Remplacé par version de ${collection.name}`);
          } else {
            console.log(`      📝 Conservé version de ${existing._originalCollection}`);
          }
          
          duplicateDocuments++;
        } else {
          allDocuments.set(email, {
            ...doc.data,
            _originalCollection: collection.name,
            _consolidatedAt: admin.firestore.Timestamp.now()
          });
          totalDocuments++;
        }
      }
    }
  }
  
  console.log(`\n📊 Résumé de la collecte:`);
  console.log(`   📄 Total documents collectés: ${totalDocuments}`);
  console.log(`   🔄 Doublons résolus: ${duplicateDocuments}`);
  console.log(`   📋 Documents finaux uniques: ${allDocuments.size}`);
  
  if (!dryRun) {
    console.log('\n💾 Écriture dans la collection cible...');
    
    // Écrire les documents par batch
    const documents = Array.from(allDocuments.values());
    const batchSize = 500;
    let written = 0;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = documents.slice(i, i + batchSize);
      
      for (const docData of batchDocs) {
        const docRef = db.collection(TARGET_COLLECTION).doc();
        batch.set(docRef, docData);
      }
      
      await batch.commit();
      written += batchDocs.length;
      console.log(`   ✅ Écrit ${written}/${documents.length} documents`);
    }
    
    console.log('\n🗑️  Suppression des collections dupliquées...');
    
    // Supprimer les collections sources (sauf si c'est déjà la cible)
    const collectionsToDelete = [primary, ...duplicates]
      .filter(col => col.name !== TARGET_COLLECTION);
    
    for (const collection of collectionsToDelete) {
      console.log(`   🗑️  Suppression de ${collection.name}...`);
      await deleteCollection(collection.name);
      console.log(`   ✅ ${collection.name} supprimée`);
    }
    
    console.log('\n✅ Consolidation terminée avec succès!');
  } else {
    console.log('\n🧪 Simulation terminée - pour exécuter réellement:');
    console.log('   consolidateAccountRequestCollections(false)');
  }
  
  return {
    ...analysis,
    consolidation: {
      totalDocuments,
      duplicateDocuments,
      uniqueDocuments: allDocuments.size,
      targetCollection: TARGET_COLLECTION
    }
  };
}

// Déterminer quel document garder en cas de doublon
function shouldReplaceDocument(existing, current) {
  // Priorité 1: Document avec statut pending
  if (current.status === 'pending' && existing.status !== 'pending') {
    return true;
  }
  if (existing.status === 'pending' && current.status !== 'pending') {
    return false;
  }
  
  // Priorité 2: Document le plus récent
  const existingDate = new Date(existing.requestDate || 0);
  const currentDate = new Date(current.requestDate || 0);
  
  return currentDate > existingDate;
}

// Supprimer une collection complètement
async function deleteCollection(collectionName, batchSize = 100) {
  const collectionRef = db.collection(collectionName);
  let deleted = 0;
  
  while (true) {
    const snapshot = await collectionRef.limit(batchSize).get();
    
    if (snapshot.empty) {
      break;
    }
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    deleted += snapshot.size;
    
    console.log(`      📄 ${deleted} documents supprimés...`);
  }
  
  return deleted;
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 === SCRIPT DE CONSOLIDATION ACCOUNT_REQUEST ===\n');
    
    // Test de connexion
    console.log('🔗 Test de connexion Firebase...');
    await db.collection('_test').limit(1).get();
    console.log('✅ Connexion réussie\n');
    
    // Analyse des collections
    const analysis = await analyzeAccountRequestCollections();
    
    if (analysis.recommendation === 'consolidate') {
      console.log('\n⚠️  DUPLICATION DÉTECTÉE - Consolidation recommandée');
      console.log('🧪 Exécution d\'une simulation...\n');
      
      // Simulation first
      await consolidateAccountRequestCollections(true);
      
      console.log('\n❓ Voulez-vous exécuter la consolidation réelle ?');
      console.log('   Pour continuer, appelez: consolidateAccountRequestCollections(false)');
      
    } else if (analysis.recommendation === 'rename') {
      console.log('\n📝 Collection trouvée mais nom non standard');
      console.log(`   Considérez renommer: ${analysis.collections[0].name} → ${TARGET_COLLECTION}`);
      
    } else {
      console.log('\n✅ Aucune action nécessaire');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

// Exporter les fonctions
module.exports = {
  analyzeAccountRequestCollections,
  consolidateAccountRequestCollections,
  main
};

// Exécuter si appelé directement
if (require.main === module) {
  main();
}
