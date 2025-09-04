// Diagnostic des demandes de compte
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Configuration Firebase Admin
if (!getApps().length) {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: "etudenotaire-9e21c",
      private_key_id: "7a2c5a8e9b7f1c3d8e9f0a6b4c2d8e7f9a1b5c3e",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC+vL8fJ5dN6Xms\n...\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk-h8mz3@etudenotaire-9e21c.iam.gserviceaccount.com",
      client_id: "118234567890123456789",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/service-accounts/v1/metadata/x509/firebase-adminsdk-h8mz3%40etudenotaire-9e21c.iam.gserviceaccount.com"
    };

    initializeApp({
      credential: cert(serviceAccount),
      projectId: "etudenotaire-9e21c"
    });
    
    console.log('✅ Firebase initialisé pour diagnostic');
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error);
  }
}

async function diagnosticDemandes() {
  try {
    console.log('🔍 DIAGNOSTIC DES DEMANDES DE COMPTE');
    console.log('=' .repeat(40));
    
    const db = getFirestore();
    const collection = db.collection('account-requests');
    
    console.log('\n📊 Vérification de la collection account-requests...');
    
    // Récupérer toutes les demandes
    const snapshot = await collection.get();
    
    console.log(`📋 Nombre total de demandes: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('⚠️  Aucune demande trouvée dans la collection');
      console.log('\n💡 Causes possibles:');
      console.log('1. Collection vide');
      console.log('2. Problème de permissions Firebase');
      console.log('3. Nom de collection incorrect');
      return;
    }
    
    // Analyser les demandes par statut
    const demandes = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      demandes.push({
        id: doc.id,
        email: data.email,
        status: data.status,
        requestDate: data.requestDate,
        processedDate: data.processedDate
      });
    });
    
    console.log('\n📈 Répartition par statut:');
    const stats = {
      pending: demandes.filter(d => d.status === 'pending').length,
      approved: demandes.filter(d => d.status === 'approved').length,
      rejected: demandes.filter(d => d.status === 'rejected').length,
      other: demandes.filter(d => !['pending', 'approved', 'rejected'].includes(d.status)).length
    };
    
    console.log(`✅ En attente (pending): ${stats.pending}`);
    console.log(`✅ Approuvées (approved): ${stats.approved}`);
    console.log(`❌ Rejetées (rejected): ${stats.rejected}`);
    console.log(`❓ Autres statuts: ${stats.other}`);
    
    console.log('\n📋 Détail des demandes:');
    demandes.forEach((demande, index) => {
      console.log(`${index + 1}. ${demande.email} - ${demande.status} - ${demande.requestDate}`);
    });
    
    // Test de requête "pending" spécifiquement
    console.log('\n🔍 Test requête demandes en attente...');
    const pendingSnapshot = await collection
      .where('status', '==', 'pending')
      .get();
    
    console.log(`📊 Demandes en attente trouvées: ${pendingSnapshot.size}`);
    
    if (pendingSnapshot.size > 0) {
      console.log('✅ Requête pending fonctionne');
    } else {
      console.log('⚠️  Aucune demande en attente trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
    
    if (error.code === 7) {
      console.log('🔒 Problème de permissions Firebase');
    } else if (error.code === 5) {
      console.log('🔍 Collection introuvable');
    }
  }
}

// Exporter pour utilisation
if (require.main === module) {
  diagnosticDemandes()
    .then(() => {
      console.log('\n🎯 Diagnostic terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { diagnosticDemandes };
