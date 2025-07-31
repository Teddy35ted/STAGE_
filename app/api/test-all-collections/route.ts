import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Test de toutes les collections...');
    
    // Vérifier l'authentification
    const { verifyAuth } = await import('../../Backend/utils/authVerifier');
    const auth = await verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      auth: { uid: auth.uid },
      collections: {}
    };

    // Importer tous les services
    const { ContenuService } = await import('../../Backend/services/collections/ContenuService');
    const { LaalaService } = await import('../../Backend/services/collections/LaalaService');
    const { MessageService } = await import('../../Backend/services/collections/MessageService');
    const { BoutiqueService } = await import('../../Backend/services/collections/BoutiqueService');
    const { RetraitService } = await import('../../Backend/services/collections/RetraitService');
    const { UserService } = await import('../../Backend/services/collections/UserService');
    const { CoGestionnaireService } = await import('../../Backend/services/collections/CoGestionnaireService');

    const services = {
      contenus: new ContenuService(),
      laalas: new LaalaService(),
      messages: new MessageService(),
      boutiques: new BoutiqueService(),
      retraits: new RetraitService(),
      users: new UserService(),
      'co-gestionnaires': new CoGestionnaireService()
    };

    console.log('✅ Tous les services chargés');

    // S'assurer que l'utilisateur existe
    const userService = services.users;
    let user = await userService.getById(auth.uid);
    
    if (!user) {
      console.log('👤 Création utilisateur pour test...');
      const userData = {
        nom: 'Test User',
        prenom: 'Collections',
        email: 'test@collections.com',
        tel: '12345678',
        password: 'testpass',
        date_de_naissance: '1990-01-01',
        sexe: 'Masculin' as const,
        pays: 'Togo',
        ville: 'Lomé',
        codePays: '+228'
      };
      await userService.createUser(userData, auth.uid);
      user = await userService.getById(auth.uid);
    }

    const creatorInfo = await userService.getCreatorInfo(auth.uid);

    // Tester chaque collection
    for (const [collectionName, service] of Object.entries(services)) {
      console.log(`\n🧪 Test collection ${collectionName}...`);
      
      const collectionResult: any = {
        name: collectionName,
        tests: {}
      };

      try {
        // Test 1: Vérifier l'intégrité des données existantes
        console.log(`📊 Vérification intégrité ${collectionName}...`);
        try {
          const integrity = await service.checkDataIntegrity();
          collectionResult.tests.integrity = {
            success: true,
            data: integrity
          };
          console.log(`✅ Intégrité ${collectionName}:`, integrity.healthStatus);
        } catch (error) {
          collectionResult.tests.integrity = {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          };
        }

        // Test 2: Récupérer tous les éléments
        console.log(`📋 Test getAll ${collectionName}...`);
        try {
          const allItems = await service.getAll({ limit: 5 });
          const itemsWithIds = allItems.filter(item => item.id && item.id.trim() !== '');
          
          collectionResult.tests.getAll = {
            success: true,
            totalItems: allItems.length,
            itemsWithIds: itemsWithIds.length,
            allHaveIds: itemsWithIds.length === allItems.length,
            sampleIds: itemsWithIds.slice(0, 3).map(item => item.id)
          };
          console.log(`✅ getAll ${collectionName}: ${allItems.length} éléments, ${itemsWithIds.length} avec ID`);
        } catch (error) {
          collectionResult.tests.getAll = {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          };
        }

        // Test 3: Créer un élément de test
        console.log(`➕ Test création ${collectionName}...`);
        try {
          let testData: any = {};
          let createdId: string = '';

          switch (collectionName) {
            case 'contenus':
              if (creatorInfo) {
                testData = {
                  nom: `Test ${collectionName} ${Date.now()}`,
                  idCreateur: auth.uid,
                  idLaala: 'test-collection-laala',
                  type: 'texte',
                  allowComment: true,
                  htags: ['#test-collection'],
                  personnes: []
                };
                createdId = await service.createContenu(testData, creatorInfo, 1);
              }
              break;

            case 'laalas':
              if (creatorInfo) {
                testData = {
                  nom: `Test ${collectionName} ${Date.now()}`,
                  idCreateur: auth.uid,
                  type: 'public',
                  description: 'Test collection',
                  htags: ['#test-collection'],
                  personnes: []
                };
                createdId = await service.createLaala(testData, creatorInfo);
              }
              break;

            case 'messages':
              testData = {
                contenu: `Test ${collectionName} ${Date.now()}`,
                idExpediteur: auth.uid,
                idDestinataire: auth.uid,
                type: 'text'
              };
              createdId = await service.create(testData);
              break;

            case 'boutiques':
              testData = {
                nom: `Test ${collectionName} ${Date.now()}`,
                idProprietaire: auth.uid,
                description: 'Test boutique',
                categorie: 'test',
                adresse: 'Test address',
                telephone: '12345678'
              };
              createdId = await service.create(testData);
              break;

            case 'retraits':
              testData = {
                montant: 100,
                idUtilisateur: auth.uid,
                methode: 'mobile_money',
                statut: 'en_attente',
                numeroCompte: '12345678'
              };
              createdId = await service.create(testData);
              break;

            case 'co-gestionnaires':
              testData = {
                idGestionnaire: auth.uid,
                idProprietaire: auth.uid,
                role: 'moderateur',
                permissions: ['read', 'write']
              };
              createdId = await service.create(testData);
              break;

            case 'users':
              // Skip création pour users car déjà créé
              collectionResult.tests.create = {
                success: true,
                skipped: 'Utilisateur déjà créé',
                id: auth.uid
              };
              break;

            default:
              testData = {
                nom: `Test ${collectionName} ${Date.now()}`,
                idCreateur: auth.uid
              };
              createdId = await service.create(testData);
          }

          if (collectionName !== 'users') {
            collectionResult.tests.create = {
              success: !!createdId,
              id: createdId,
              data: testData
            };
            console.log(`✅ Création ${collectionName}: ID ${createdId}`);

            // Test 4: Récupérer l'élément créé
            if (createdId) {
              console.log(`📖 Test getById ${collectionName}...`);
              try {
                const retrievedItem = await service.getById(createdId);
                collectionResult.tests.getById = {
                  success: !!retrievedItem,
                  hasCorrectId: retrievedItem?.id === createdId,
                  item: retrievedItem ? {
                    id: retrievedItem.id,
                    name: retrievedItem.nom || retrievedItem.contenu || 'Sans nom'
                  } : null
                };
                console.log(`✅ getById ${collectionName}: ${retrievedItem ? 'trouvé' : 'non trouvé'}`);
              } catch (error) {
                collectionResult.tests.getById = {
                  success: false,
                  error: error instanceof Error ? error.message : 'Erreur inconnue'
                };
              }

              // Test 5: Mettre à jour l'élément
              console.log(`✏️ Test update ${collectionName}...`);
              try {
                const updateData = { nom: `${testData.nom} - MODIFIÉ` };
                await service.update(createdId, updateData);
                
                const updatedItem = await service.getById(createdId);
                collectionResult.tests.update = {
                  success: !!updatedItem,
                  updated: updatedItem?.nom?.includes('MODIFIÉ') || false
                };
                console.log(`✅ Update ${collectionName}: ${updatedItem ? 'réussi' : 'échoué'}`);
              } catch (error) {
                collectionResult.tests.update = {
                  success: false,
                  error: error instanceof Error ? error.message : 'Erreur inconnue'
                };
              }

              // Test 6: Supprimer l'élément
              console.log(`🗑️ Test delete ${collectionName}...`);
              try {
                await service.delete(createdId);
                
                const deletedCheck = await service.getById(createdId);
                collectionResult.tests.delete = {
                  success: !deletedCheck,
                  verified: !deletedCheck
                };
                console.log(`✅ Delete ${collectionName}: ${!deletedCheck ? 'réussi' : 'échoué'}`);
              } catch (error) {
                collectionResult.tests.delete = {
                  success: false,
                  error: error instanceof Error ? error.message : 'Erreur inconnue'
                };
              }
            }
          }

        } catch (error) {
          collectionResult.tests.create = {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          };
        }

        // Calculer le score de santé de la collection
        const tests = Object.values(collectionResult.tests);
        const successfulTests = tests.filter((test: any) => test.success).length;
        const totalTests = tests.length;
        
        collectionResult.summary = {
          totalTests,
          successfulTests,
          failedTests: totalTests - successfulTests,
          successRate: Math.round((successfulTests / totalTests) * 100),
          healthStatus: successfulTests === totalTests ? 'Excellent' : 
                       successfulTests >= totalTests * 0.8 ? 'Bon' : 
                       successfulTests >= totalTests * 0.6 ? 'Problématique' : 'Critique'
        };

        console.log(`📊 ${collectionName}: ${collectionResult.summary.successRate}% (${collectionResult.summary.healthStatus})`);

      } catch (error) {
        collectionResult.error = error instanceof Error ? error.message : 'Erreur inconnue';
        collectionResult.summary = {
          totalTests: 0,
          successfulTests: 0,
          failedTests: 1,
          successRate: 0,
          healthStatus: 'Critique'
        };
      }

      results.collections[collectionName] = collectionResult;
    }

    // Résumé global
    const allCollections = Object.values(results.collections);
    const healthyCollections = allCollections.filter((col: any) => 
      col.summary?.healthStatus === 'Excellent' || col.summary?.healthStatus === 'Bon'
    ).length;
    
    results.globalSummary = {
      totalCollections: allCollections.length,
      healthyCollections,
      problematicCollections: allCollections.length - healthyCollections,
      overallHealth: healthyCollections === allCollections.length ? 'Excellent' :
                     healthyCollections >= allCollections.length * 0.8 ? 'Bon' :
                     healthyCollections >= allCollections.length * 0.6 ? 'Problématique' : 'Critique'
    };

    console.log('📊 Résumé global:', results.globalSummary);

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ Erreur test toutes collections:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}