// Test du système de retraits automatiques
// Ce script peut être exécuté pour tester le traitement automatique

async function testRetraitAutomatique() {
  console.log('🧪 Test du système de retrait automatique');
  
  try {
    // 1. Vérifier les retraits en attente
    console.log('📋 Vérification des retraits en attente...');
    const statusResponse = await fetch('/api/retraits/process', {
      method: 'GET'
    });
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('📊 Statut actuel:', statusData);
    }
    
    // 2. Déclencher le traitement
    console.log('⚡ Déclenchement du traitement automatique...');
    const processResponse = await fetch('/api/retraits/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (processResponse.ok) {
      const processData = await processResponse.json();
      console.log('✅ Résultat du traitement:', processData);
      
      if (processData.retraitsTraites && processData.retraitsTraites.length > 0) {
        console.log(`🎉 ${processData.retraitsTraites.length} retraits ont été traités avec succès!`);
        
        processData.retraitsTraites.forEach(retrait => {
          console.log(`💰 Retrait ${retrait.id}: ${retrait.montant} FCFA - ${retrait.statut}`);
        });
      } else {
        console.log('ℹ️ Aucun retrait à traiter pour le moment');
      }
    } else {
      console.error('❌ Erreur lors du traitement:', await processResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Fonction pour simuler un retrait de test
async function creerRetraitTest() {
  const retraitTest = {
    montant: 10000,
    tel: '+228 99 99 99 99',
    operateur: 'Flooz',
    statut: 'En attente',
    dateCreation: new Date().toISOString(),
    dateTraitement: new Date(Date.now() + 10000).toISOString(), // 10 secondes dans le futur pour test rapide
    montantDebite: false
  };
  
  try {
    const response = await fetch('/api/retraits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(retraitTest),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Retrait de test créé:', result);
      return result;
    } else {
      console.error('❌ Erreur lors de la création du retrait de test');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exporter les fonctions pour utilisation
if (typeof window !== 'undefined') {
  window.testRetraitAutomatique = testRetraitAutomatique;
  window.creerRetraitTest = creerRetraitTest;
}

export { testRetraitAutomatique, creerRetraitTest };
