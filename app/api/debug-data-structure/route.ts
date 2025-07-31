import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Diagnostic de la structure des données...');
    
    // Vérifier l'authentification
    const { verifyAuth } = await import('../../Backend/utils/authVerifier');
    const auth = await verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }

    const body = await request.json();
    const { entity = 'contenus' } = body;

    console.log(`🧪 Analyse structure ${entity}...`);

    const results: any = {
      timestamp: new Date().toISOString(),
      entity,
      auth: { uid: auth.uid },
      analysis: {}
    };

    // Importer les services
    try {
      const { ContenuService } = await import('../../Backend/services/collections/ContenuService');
      const { LaalaService } = await import('../../Backend/services/collections/LaalaService');
      const { MessageService } = await import('../../Backend/services/collections/MessageService');
      const { BoutiqueService } = await import('../../Backend/services/collections/BoutiqueService');
      const { UserService } = await import('../../Backend/services/collections/UserService');
      
      const services: any = {
        contenus: new ContenuService(),
        laalas: new LaalaService(),
        messages: new MessageService(),
        boutiques: new BoutiqueService(),
        users: new UserService()
      };
      
      const service = services[entity];
      if (!service) {
        return NextResponse.json({
          success: false,
          error: `Service ${entity} non trouvé`,
          availableServices: Object.keys(services)
        }, { status: 400 });
      }

      console.log(`✅ Service ${entity} chargé`);

      // 1. Récupérer tous les éléments
      console.log('📋 Récupération de tous les éléments...');
      const allItems = await service.getAll({ limit: 5 });
      
      results.analysis.totalItems = allItems.length;
      results.analysis.sampleItems = allItems.map(item => ({
        id: item.id,
        hasId: !!item.id,
        idType: typeof item.id,
        keys: Object.keys(item),
        firstFewChars: item.id ? item.id.substring(0, 10) : 'NO_ID'
      }));

      console.log(`📊 ${allItems.length} éléments trouvés`);

      // 2. Analyser la structure d'un élément
      if (allItems.length > 0) {
        const firstItem = allItems[0];
        
        results.analysis.structure = {
          hasId: !!firstItem.id,
          idValue: firstItem.id,
          idType: typeof firstItem.id,
          allKeys: Object.keys(firstItem),
          requiredFields: {
            id: !!firstItem.id,
            nom: !!firstItem.nom,
            idCreateur: !!firstItem.idCreateur
          }
        };

        console.log('🔍 Structure premier élément:', results.analysis.structure);

        // 3. Test de récupération par ID
        console.log('🎯 Test récupération par ID...');
        try {
          const retrievedItem = await service.getById(firstItem.id);
          
          results.analysis.retrievalTest = {
            success: !!retrievedItem,
            originalId: firstItem.id,
            retrievedId: retrievedItem?.id,
            idsMatch: firstItem.id === retrievedItem?.id,
            retrievedKeys: retrievedItem ? Object.keys(retrievedItem) : []
          };

          console.log('✅ Test récupération:', results.analysis.retrievalTest);

        } catch (error) {
          results.analysis.retrievalTest = {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            originalId: firstItem.id
          };
          console.error('❌ Erreur récupération par ID:', error);
        }

        // 4. Test de suppression simulée (sans vraiment supprimer)
        console.log('🗑️ Test simulation suppression...');
        try {
          // Vérifier que l'élément existe avant "suppression"
          const beforeDelete = await service.getById(firstItem.id);
          
          results.analysis.deleteSimulation = {
            itemExists: !!beforeDelete,
            itemId: firstItem.id,
            canBeRetrieved: !!beforeDelete,
            message: beforeDelete ? 'Élément récupérable pour suppression' : 'Élément non récupérable'
          };

          console.log('🔍 Simulation suppression:', results.analysis.deleteSimulation);

        } catch (error) {
          results.analysis.deleteSimulation = {
            itemExists: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            itemId: firstItem.id
          };
          console.error('❌ Erreur simulation suppression:', error);
        }

      } else {
        results.analysis.structure = {
          message: 'Aucun élément trouvé pour analyser la structure'
        };
      }

      // 5. Test de création et suppression réelle
      console.log('🧪 Test création et suppression réelle...');
      try {
        let testData: any = {};
        
        switch (entity) {
          case 'contenus':
            // S'assurer que l'utilisateur existe
            const userService = services.users;
            let creatorInfo = await userService.getCreatorInfo(auth.uid);
            
            if (!creatorInfo) {
              const userData = {
                nom: 'Test User',
                prenom: 'Debug',
                email: 'test@debug.com',
                tel: '12345678',
                password: 'testpass',
                date_de_naissance: '1990-01-01',
                sexe: 'Masculin' as const,
                pays: 'Togo',
                ville: 'Lomé',
                codePays: '+228'
              };
              await userService.createUser(userData, auth.uid);
              creatorInfo = await userService.getCreatorInfo(auth.uid);
            }
            
            testData = {
              nom: `Test Debug ${Date.now()}`,
              idCreateur: auth.uid,
              idLaala: 'test-debug-laala',
              type: 'texte',
              allowComment: true,
              htags: ['#debug'],
              personnes: []
            };
            
            const contenuId = await service.createContenu(testData, creatorInfo, 1);
            
            // Vérifier que l'élément a été créé
            const createdContenu = await service.getById(contenuId);
            
            results.analysis.realTest = {
              created: !!createdContenu,
              createdId: contenuId,
              retrievedAfterCreate: !!createdContenu
            };
            
            // Tenter la suppression
            if (createdContenu) {
              await service.delete(contenuId);
              
              // Vérifier que l'élément a été supprimé
              const deletedContenu = await service.getById(contenuId);
              
              results.analysis.realTest.deleted = !deletedContenu;
              results.analysis.realTest.retrievedAfterDelete = !!deletedContenu;
            }
            
            break;
            
          default:
            testData = {
              nom: `Test ${entity} ${Date.now()}`,
              idCreateur: auth.uid
            };
            
            const createdId = await service.create(testData);
            const createdItem = await service.getById(createdId);
            
            results.analysis.realTest = {
              created: !!createdItem,
              createdId,
              retrievedAfterCreate: !!createdItem
            };
            
            if (createdItem) {
              await service.delete(createdId);
              const deletedItem = await service.getById(createdId);
              
              results.analysis.realTest.deleted = !deletedItem;
              results.analysis.realTest.retrievedAfterDelete = !!deletedItem;
            }
        }

        console.log('✅ Test réel terminé:', results.analysis.realTest);

      } catch (error) {
        results.analysis.realTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        };
        console.error('❌ Erreur test réel:', error);
      }

      // 6. Analyse des IDs
      console.log('🔢 Analyse des formats d\'ID...');
      if (allItems.length > 0) {
        const idAnalysis = allItems.map(item => ({
          id: item.id,
          length: item.id ? item.id.length : 0,
          isNumeric: item.id ? /^\d+$/.test(item.id) : false,
          isAlphanumeric: item.id ? /^[a-zA-Z0-9]+$/.test(item.id) : false,
          hasSpecialChars: item.id ? /[^a-zA-Z0-9]/.test(item.id) : false
        }));

        results.analysis.idFormats = {
          samples: idAnalysis.slice(0, 3),
          patterns: {
            allNumeric: idAnalysis.every(a => a.isNumeric),
            allAlphanumeric: idAnalysis.every(a => a.isAlphanumeric),
            hasSpecialChars: idAnalysis.some(a => a.hasSpecialChars),
            averageLength: idAnalysis.reduce((sum, a) => sum + a.length, 0) / idAnalysis.length
          }
        };

        console.log('📊 Analyse IDs:', results.analysis.idFormats);
      }

      // Résumé
      results.summary = {
        dataStructureOk: results.analysis.structure?.hasId || false,
        retrievalWorks: results.analysis.retrievalTest?.success || false,
        deletionWorks: results.analysis.realTest?.deleted || false,
        overallHealth: 'En cours d\'évaluation...'
      };

      const healthScore = [
        results.summary.dataStructureOk,
        results.summary.retrievalWorks,
        results.summary.deletionWorks
      ].filter(Boolean).length;

      results.summary.overallHealth = healthScore === 3 ? 'Excellent' : 
                                     healthScore === 2 ? 'Bon' : 
                                     healthScore === 1 ? 'Problématique' : 'Critique';

      console.log('📊 Résumé diagnostic:', results.summary);

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur générale diagnostic:', error);
    }

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ Erreur diagnostic structure:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}