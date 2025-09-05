const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { analyzeAccountRequestCollections, consolidateAccountRequestCollections } = require('./fix-account-request-duplication');
const { restoreCollections, cleanupExampleDocuments } = require('./restore-collections');
const { diagnosticDatabase } = require('./database-diagnostic');

// Menu interactif pour les opérations de base de données
function showMenu() {
  console.log('\n🔧 === MENU DE RÉPARATION BASE DE DONNÉES ===');
  console.log('');
  console.log('1. 🔍 Diagnostic complet de la base de données');
  console.log('2. 📊 Analyser les duplications account_request');
  console.log('3. 🔄 Consolider les collections account_request (simulation)');
  console.log('4. ⚡ Consolider les collections account_request (RÉEL)');
  console.log('5. 🔧 Restaurer les collections manquantes');
  console.log('6. 🧹 Nettoyer les documents d\'exemple');
  console.log('7. 🚀 Réparation automatique complète');
  console.log('8. ❌ Quitter');
  console.log('');
}

// Réparation automatique complète
async function fullAutoRepair() {
  console.log('🚀 === RÉPARATION AUTOMATIQUE COMPLÈTE ===\n');
  
  try {
    // 1. Diagnostic initial
    console.log('📋 Étape 1/4: Diagnostic initial...\n');
    const diagnostic = await diagnosticDatabase();
    
    // 2. Restauration des collections manquantes
    if (diagnostic.missingCollections && diagnostic.missingCollections.length > 0) {
      console.log('\n🔧 Étape 2/4: Restauration des collections manquantes...\n');
      await restoreCollections();
    } else {
      console.log('\n✅ Étape 2/4: Toutes les collections essentielles existent\n');
    }
    
    // 3. Analyse des duplications account_request
    console.log('📊 Étape 3/4: Analyse des duplications account_request...\n');
    const accountAnalysis = await analyzeAccountRequestCollections();
    
    if (accountAnalysis.recommendation === 'consolidate') {
      console.log('\n🔄 Consolidation des collections account_request...\n');
      
      // Simulation d'abord
      console.log('🧪 Simulation de la consolidation...\n');
      await consolidateAccountRequestCollections(true);
      
      console.log('\n⚠️  ATTENTION: Consolidation réelle requise');
      console.log('   Cette opération va modifier définitivement la base de données');
      console.log('   Exécutez manuellement: consolidateAccountRequestCollections(false)');
      
    } else {
      console.log('✅ Aucune duplication account_request détectée\n');
    }
    
    // 4. Nettoyage final
    console.log('🧹 Étape 4/4: Nettoyage des documents d\'exemple...\n');
    await cleanupExampleDocuments();
    
    console.log('\n🎉 === RÉPARATION AUTOMATIQUE TERMINÉE ===');
    console.log('');
    console.log('📋 RÉSUMÉ:');
    console.log(`   - Collections diagnostiquées: ${diagnostic.allCollections ? diagnostic.allCollections.length : 'N/A'}`);
    console.log(`   - Collections restaurées: ${diagnostic.missingCollections ? diagnostic.missingCollections.length : 0}`);
    console.log(`   - Duplications account_request: ${accountAnalysis.collections ? accountAnalysis.collections.length : 0} collections`);
    console.log('');
    
    if (accountAnalysis.recommendation === 'consolidate') {
      console.log('⚠️  ACTION MANUELLE REQUISE:');
      console.log('   Consolidation account_request en attente de confirmation');
      console.log('   Utilisez le menu option 4 pour l\'exécuter');
    } else {
      console.log('✅ Toutes les réparations automatiques sont terminées');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la réparation automatique:', error);
    throw error;
  }
}

// Interface de ligne de commande interactive
async function runInteractiveMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  };
  
  try {
    while (true) {
      showMenu();
      const choice = await askQuestion('Choisissez une option (1-8): ');
      
      console.log(''); // Ligne vide
      
      switch (choice) {
        case '1':
          await diagnosticDatabase();
          break;
          
        case '2':
          await analyzeAccountRequestCollections();
          break;
          
        case '3':
          await consolidateAccountRequestCollections(true);
          break;
          
        case '4':
          const confirm = await askQuestion('⚠️  ATTENTION: Cette opération est irréversible. Continuer ? (oui/non): ');
          if (confirm.toLowerCase() === 'oui' || confirm.toLowerCase() === 'o') {
            await consolidateAccountRequestCollections(false);
          } else {
            console.log('❌ Opération annulée');
          }
          break;
          
        case '5':
          await restoreCollections();
          break;
          
        case '6':
          await cleanupExampleDocuments();
          break;
          
        case '7':
          await fullAutoRepair();
          break;
          
        case '8':
          console.log('👋 Au revoir!');
          rl.close();
          return;
          
        default:
          console.log('❌ Option invalide, veuillez choisir entre 1 et 8');
      }
      
      console.log('\n' + '='.repeat(60));
      await askQuestion('Appuyez sur Entrée pour continuer...');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    rl.close();
  }
}

// Mode ligne de commande avec arguments
async function runCommandLineMode() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'diagnostic':
      await diagnosticDatabase();
      break;
      
    case 'analyze':
      await analyzeAccountRequestCollections();
      break;
      
    case 'consolidate':
      const dryRun = args[1] !== '--real';
      if (!dryRun) {
        console.log('⚠️  Mode RÉEL activé - les modifications seront appliquées');
      }
      await consolidateAccountRequestCollections(dryRun);
      break;
      
    case 'restore':
      await restoreCollections();
      break;
      
    case 'cleanup':
      await cleanupExampleDocuments();
      break;
      
    case 'auto':
      await fullAutoRepair();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showCommandLineHelp();
      break;
      
    default:
      console.log('🔧 === RÉPARATION BASE DE DONNÉES ===\n');
      console.log('Usage:');
      console.log('  node database-repair.js                 # Mode interactif');
      console.log('  node database-repair.js <command>       # Mode ligne de commande');
      console.log('');
      console.log('Commands:');
      console.log('  diagnostic     # Diagnostic complet');
      console.log('  analyze        # Analyser duplications account_request');
      console.log('  consolidate    # Consolider account_request (simulation)');
      console.log('  consolidate --real  # Consolider account_request (RÉEL)');
      console.log('  restore        # Restaurer collections manquantes');
      console.log('  cleanup        # Nettoyer documents d\'exemple');
      console.log('  auto           # Réparation automatique complète');
      console.log('  help           # Afficher cette aide');
      console.log('');
      
      // Si aucun argument, lancer le mode interactif
      if (args.length === 0) {
        await runInteractiveMode();
      }
  }
}

function showCommandLineHelp() {
  console.log('🔧 === AIDE - RÉPARATION BASE DE DONNÉES ===\n');
  console.log('Ce script résout les problèmes suivants:');
  console.log('  • Duplication de la table account_request');
  console.log('  • Collections manquantes (retraits, laalas, contenus, cogestionnaires)');
  console.log('  • Nettoyage des documents d\'exemple');
  console.log('');
  console.log('Usage:');
  console.log('  node database-repair.js                 # Mode interactif avec menu');
  console.log('  node database-repair.js <command>       # Exécution directe');
  console.log('');
  console.log('Commandes disponibles:');
  console.log('  diagnostic         Analyse complète de la base de données');
  console.log('  analyze           Analyser les duplications account_request');
  console.log('  consolidate       Simuler la consolidation account_request');
  console.log('  consolidate --real Exécuter la consolidation (ATTENTION: irréversible)');
  console.log('  restore           Recréer les collections manquantes');
  console.log('  cleanup           Supprimer les documents d\'exemple');
  console.log('  auto              Réparation automatique complète');
  console.log('');
  console.log('Exemples:');
  console.log('  node database-repair.js diagnostic');
  console.log('  node database-repair.js auto');
  console.log('  node database-repair.js consolidate --real');
  console.log('');
  console.log('Variables d\'environnement requises (.env.local):');
  console.log('  FIREBASE_PROJECT_ID');
  console.log('  FIREBASE_PRIVATE_KEY');
  console.log('  FIREBASE_CLIENT_EMAIL');
}

// Point d'entrée principal
async function main() {
  try {
    console.log('🚀 Initialisation du script de réparation...\n');
    
    // Vérifier les variables d'environnement
    const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Variables d\'environnement manquantes:');
      missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.error('\nVeuillez configurer ces variables dans .env.local');
      process.exit(1);
    }
    
    console.log('✅ Variables d\'environnement vérifiées\n');
    
    // Lancer le mode approprié
    await runCommandLineMode();
    
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exporter les fonctions pour utilisation externe
module.exports = {
  fullAutoRepair,
  runInteractiveMode,
  showCommandLineHelp,
  main
};

// Exécuter si appelé directement
if (require.main === module) {
  main();
}
