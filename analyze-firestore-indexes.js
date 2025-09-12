// ===== SCRIPT D'ANALYSE ET DÉPLOIEMENT DES INDEX FIRESTORE =====
// Identifie les requêtes problématiques et déploie les index nécessaires

console.log('🔍 === ANALYSE DES INDEX FIRESTORE REQUIS ===');

// Configuration
const PROJECT_ID = 'votre-project-id'; // À remplacer par votre Project ID Firebase
const REGION = 'europe-west1'; // Région par défaut

// Index identifiés comme nécessaires
const REQUIRED_INDEXES = {
  // Campagnes FanFriends
  campaigns_by_user: {
    collection: 'campaigns',
    fields: [
      { field: 'createdBy', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Pour récupérer les campagnes d\'un utilisateur triées par date'
  },

  // Notifications système
  notifications_by_user: {
    collection: 'notifications',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Pour récupérer les notifications d\'un utilisateur triées par date'
  },

  notifications_unread: {
    collection: 'notifications',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'isRead', order: 'ASCENDING' }
    ],
    description: 'Pour compter/récupérer les notifications non lues d\'un utilisateur'
  },

  // Contenus des Laalas
  contenus_by_laala: {
    collection: 'contenus',
    fields: [
      { field: 'idLaala', order: 'ASCENDING' },
      { field: 'position', order: 'ASCENDING' }
    ],
    description: 'Pour récupérer les contenus d\'un Laala triés par position'
  },

  // Laalas par créateur
  laalas_by_creator: {
    collection: 'laalas',
    fields: [
      { field: 'idCreateur', order: 'ASCENDING' },
      { field: 'date', order: 'DESCENDING' }
    ],
    description: 'Pour récupérer les Laalas d\'un créateur triés par date'
  },

  // Laalas populaires en cours
  laalas_trending: {
    collection: 'laalas',
    fields: [
      { field: 'encours', order: 'ASCENDING' },
      { field: 'vues', order: 'DESCENDING' }
    ],
    description: 'Pour récupérer les Laalas en cours triés par popularité'
  },

  // Messages par expéditeur
  messages_by_sender: {
    collection: 'messages',
    fields: [
      { field: 'idsender', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Pour récupérer les messages d\'un expéditeur triés par date'
  },

  messages_by_expediteur: {
    collection: 'messages',
    fields: [
      { field: 'idExpediteur', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Pour récupérer les messages d\'un expéditeur (champ alternatif)'
  },

  // Retraits par utilisateur
  retraits_by_user: {
    collection: 'retraits',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'dateCreation', order: 'DESCENDING' }
    ],
    description: 'Pour récupérer les retraits d\'un utilisateur triés par date'
  },

  retraits_by_status: {
    collection: 'retraits',
    fields: [
      { field: 'statut', order: 'ASCENDING' },
      { field: 'dateCreation', order: 'DESCENDING' }
    ],
    description: 'Pour récupérer les retraits par statut triés par date'
  },

  // Utilisateurs avec filtres
  users_by_country: {
    collection: 'users',
    fields: [
      { field: 'pays', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Pour filtrer les utilisateurs par pays'
  },

  users_by_city: {
    collection: 'users',
    fields: [
      { field: 'ville', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Pour filtrer les utilisateurs par ville'
  },

  users_certified: {
    collection: 'users',
    fields: [
      { field: 'iscert', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Pour filtrer les utilisateurs certifiés'
  },

  users_connected: {
    collection: 'users',
    fields: [
      { field: 'isconnect', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Pour filtrer les utilisateurs connectés'
  },

  // Co-gestionnaires
  cogestionnaires_by_laala: {
    collection: 'co_gestionnaires',
    fields: [
      { field: 'laalaId', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Pour récupérer les co-gestionnaires d\'un Laala'
  },

  cogestionnaires_active: {
    collection: 'co_gestionnaires',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'isActive', order: 'ASCENDING' }
    ],
    description: 'Pour récupérer les co-gestionnaires actifs d\'un utilisateur'
  }
};

// Fonction pour afficher les commandes de déploiement
function showDeploymentCommands() {
  console.log('\n🚀 === COMMANDES DE DÉPLOIEMENT ===');
  console.log('\n1. Déploiement automatique via Firebase CLI:');
  console.log('   firebase deploy --only firestore:indexes');
  
  console.log('\n2. Ou créer les index manuellement dans la console Firebase:');
  console.log('   https://console.firebase.google.com/project/' + PROJECT_ID + '/firestore/indexes');
  
  console.log('\n3. Vérifier le statut des index:');
  console.log('   firebase firestore:indexes');
}

// Fonction pour analyser les requêtes dans le code
function analyzeQueries() {
  console.log('\n📊 === ANALYSE DES REQUÊTES IDENTIFIÉES ===');
  
  const queryAnalysis = [
    {
      file: 'CampaignService.ts',
      method: 'getCampaignsByUser',
      query: "where('createdBy', '==', userId).orderBy('createdAt', 'desc')",
      status: '❌ Index requis',
      index: 'campaigns_by_user'
    },
    {
      file: 'NotificationService.ts',
      method: 'getUserNotifications',
      query: "where('userId', '==', userId).orderBy('createdAt', 'desc')",
      status: '❌ Index requis',
      index: 'notifications_by_user'
    },
    {
      file: 'NotificationService.ts',
      method: 'markAsRead + getUnreadCount',
      query: "where('userId', '==', userId).where('isRead', '==', false)",
      status: '❌ Index requis',
      index: 'notifications_unread'
    },
    {
      file: 'ContenuService.ts',
      method: 'getByLaala',
      query: "where('idLaala', '==', laalaId).orderBy('position', 'asc')",
      status: '❌ Index requis',
      index: 'contenus_by_laala'
    },
    {
      file: 'LaalaService.ts',
      method: 'getByCreator',
      query: "where('idCreateur', '==', creatorId).orderBy('date', 'desc')",
      status: '❌ Index requis (commenté)',
      index: 'laalas_by_creator'
    },
    {
      file: 'firebase-services.ts',
      method: 'getLaalasPopulaires',
      query: "where('encours', '==', true).orderBy('vues', 'desc')",
      status: '❌ Index requis',
      index: 'laalas_trending'
    }
  ];

  queryAnalysis.forEach((analysis, index) => {
    console.log(`\n${index + 1}. ${analysis.file} - ${analysis.method}`);
    console.log(`   Requête: ${analysis.query}`);
    console.log(`   Statut: ${analysis.status}`);
    console.log(`   Index: ${analysis.index}`);
  });
}

// Fonction pour vérifier les index existants
async function checkExistingIndexes() {
  console.log('\n🔍 === VÉRIFICATION DES INDEX EXISTANTS ===');
  console.log('Pour vérifier les index existants, utilisez:');
  console.log('firebase firestore:indexes --project=' + PROJECT_ID);
  
  console.log('\nOu consultez la console Firebase:');
  console.log('https://console.firebase.google.com/project/' + PROJECT_ID + '/firestore/indexes');
}

// Fonction pour générer le script de déploiement
function generateDeploymentScript() {
  console.log('\n📋 === SCRIPT DE DÉPLOIEMENT AUTOMATIQUE ===');
  
  const script = `
#!/bin/bash
# Script de déploiement des index Firestore

echo "🚀 Déploiement des index Firestore..."

# Vérifier que Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé"
    echo "Installez-le avec: npm install -g firebase-tools"
    exit 1
fi

# Se connecter à Firebase (si nécessaire)
firebase login

# Sélectionner le projet
firebase use ${PROJECT_ID}

# Déployer les index
firebase deploy --only firestore:indexes

# Vérifier le statut
firebase firestore:indexes

echo "✅ Déploiement terminé!"
echo "Les index peuvent prendre quelques minutes à se construire..."
  `;
  
  console.log(script);
}

// Fonction pour afficher les requêtes problématiques en temps réel
function showProblematicQueries() {
  console.log('\n⚠️ === REQUÊTES ACTUELLEMENT PROBLÉMATIQUES ===');
  
  const problematicQueries = [
    {
      service: 'CampaignService',
      method: 'getCampaignsByUser',
      line: '167-168',
      error: 'FAILED_PRECONDITION: The query requires an index',
      solution: 'Index campaigns_by_user requis'
    },
    {
      service: 'NotificationService',
      method: 'getUserNotifications',
      line: '67-70',
      error: 'FAILED_PRECONDITION: The query requires an index',
      solution: 'Index notifications_by_user requis'
    },
    {
      service: 'NotificationService',
      method: 'markAsRead/getUnreadCount',
      line: '100-101, 149-150',
      error: 'FAILED_PRECONDITION: The query requires an index',
      solution: 'Index notifications_unread requis'
    }
  ];

  problematicQueries.forEach((query, index) => {
    console.log(`\n${index + 1}. ${query.service}.${query.method}`);
    console.log(`   📍 Ligne: ${query.line}`);
    console.log(`   ❌ Erreur: ${query.error}`);
    console.log(`   💡 Solution: ${query.solution}`);
  });
}

// Fonction principale
function runIndexAnalysis() {
  console.log('🔥 Analyse complète des index Firestore requise...\n');
  
  analyzeQueries();
  showProblematicQueries();
  showDeploymentCommands();
  checkExistingIndexes();
  generateDeploymentScript();
  
  console.log('\n📝 === RÉSUMÉ ===');
  console.log(`✅ ${Object.keys(REQUIRED_INDEXES).length} index identifiés comme nécessaires`);
  console.log('📄 Fichier firestore.indexes.json créé');
  console.log('🚀 Prêt pour le déploiement');
  
  console.log('\n👉 PROCHAINES ÉTAPES:');
  console.log('1. Vérifiez le fichier firestore.indexes.json');
  console.log('2. Exécutez: firebase deploy --only firestore:indexes');
  console.log('3. Attendez la construction des index (peut prendre plusieurs minutes)');
  console.log('4. Activez les requêtes orderBy commentées dans le code');
}

// Informations d'utilisation
console.log(`
📖 UTILISATION:

1. **Configuration:**
   - Remplacez PROJECT_ID par votre ID de projet Firebase
   - Assurez-vous que Firebase CLI est installé

2. **Exécution:**
   runIndexAnalysis();

3. **Déploiement:**
   firebase deploy --only firestore:indexes

4. **Vérification:**
   firebase firestore:indexes
`);

// Auto-exécution
if (typeof window !== 'undefined') {
  console.log('🌐 Prêt pour l\'analyse - Exécutez: runIndexAnalysis()');
} else {
  console.log('🔧 Script prêt pour exécution');
}