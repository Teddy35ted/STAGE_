import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Diagnostic des permissions de suppression...');
    
    // Vérifier l'authentification
    const { verifyAuth } = await import('../../Backend/utils/authVerifier');
    const auth = await verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié',
        details: 'Token d\'authentification manquant ou invalide'
      }, { status: 401 });
    }

    const body = await request.json();
    const { entity = 'contenus', itemId } = body;

    console.log(`🧪 Test suppression ${entity} ID: ${itemId}...`);

    const results: any = {
      timestamp: new Date().toISOString(),
      entity,
      itemId,
      auth: { uid: auth.uid },
      tests: {}
    };

    // Importer les services
    const services: any = {};
    
    try {
      const { ContenuService } = await import('../../Backend/services/collections/ContenuService');
      const { LaalaService } = await import('../../Backend/services/collections/LaalaService');
      const { MessageService } = await import('../../Backend/services/collections/MessageService');
      const { BoutiqueService } = await import('../../Backend/services/collections/BoutiqueService');
      const { RetraitService } = await import('../../Backend/services/collections/RetraitService');
      const { UserService } = await import('../../Backend/services/collections/UserService');
      
      services.contenus = new ContenuService();
      services.laalas = new LaalaService();
      services.messages = new MessageService();
      services.boutiques = new BoutiqueService();
      services.retraits = new RetraitService();
      services.users = new UserService();
      
      console.log('✅ Services chargés');
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Erreur chargement services',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, { status: 500 });
    }

    const service = services[entity];
    if (!service) {
      return NextResponse.json({
        success: false,
        error: `Service ${entity} non trouvé`,
        availableServices: Object.keys(services)
      }, { status: 400 });
    }

    // Test 1: Vérifier que l'élément existe
    console.log('📖 Test 1: Vérification existence...');
    try {
      let item = null;
      
      if (itemId) {
        item = await service.getById(itemId);
      } else {
        // Créer un élément de test si aucun ID fourni
        console.log('➕ Création d\'un élément de test...');
        
        let testData: any = {};
        
        switch (entity) {
          case 'contenus':
            testData = {
              nom: `Test Suppression ${Date.now()}`,
              idCreateur: auth.uid,
              idLaala: 'test-delete-laala',
              type: 'texte',
              allowComment: true,
              htags: ['#delete-test'],
              personnes: []
            };
            
            // Créer via le service spécialisé
            const userService = services.users;
            let creatorInfo = await userService.getCreatorInfo(auth.uid);
            
            if (!creatorInfo) {
              const userData = {
                nom: 'Test User',
                prenom: 'Delete',
                email: 'test@delete.com',
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
            
            const contenuId = await service.createContenu(testData, creatorInfo, 1);
            item = await service.getById(contenuId);
            break;
            
          case 'laalas':
            testData = {
              nom: `Test Laala Suppression ${Date.now()}`,
              idCreateur: auth.uid,
              type: 'public',
              description: 'Test suppression',
              htags: ['#delete-test'],
              personnes: []
            };
            
            const laalaUserService = services.users;
            let laalaCreatorInfo = await laalaUserService.getCreatorInfo(auth.uid);
            
            if (!laalaCreatorInfo) {
              const userData = {
                nom: 'Test User',
                prenom: 'Delete',
                email: 'test@delete.com',
                tel: '12345678',
                password: 'testpass',
                date_de_naissance: '1990-01-01',
                sexe: 'Masculin' as const,
                pays: 'Togo',
                ville: 'Lomé',
                codePays: '+228'
              };
              await laalaUserService.createUser(userData, auth.uid);
              laalaCreatorInfo = await laalaUserService.getCreatorInfo(auth.uid);
            }
            
            const laalaId = await service.createLaala(testData, laalaCreatorInfo);
            item = await service.getById(laalaId);
            break;
            
          default:
            testData = {
              nom: `Test ${entity} ${Date.now()}`,
              idCreateur: auth.uid
            };
            const createdId = await service.create(testData);
            item = await service.getById(createdId);
        }
      }
      
      results.tests.existence = {
        success: !!item,
        item: item ? {
          id: item.id,
          nom: item.nom || item.contenu,
          idCreateur: item.idCreateur,
          idProprietaire: item.idProprietaire,
          idExpediteur: item.idExpediteur
        } : null
      };
      
      if (!item) {
        return NextResponse.json({
          success: false,
          error: 'Élément non trouvé ou non créé',
          results
        }, { status: 404 });
      }
      
      console.log('✅ Élément trouvé:', item.nom || item.contenu);
      
    } catch (error) {
      results.tests.existence = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      console.error('❌ Erreur vérification existence:', error);
    }

    // Test 2: Vérifier les permissions de propriété
    console.log('🔐 Test 2: Vérification permissions...');
    try {
      const item = results.tests.existence.item;
      
      if (item) {
        const ownershipChecks = {
          isCreator: item.idCreateur === auth.uid,
          isProprietaire: item.idProprietaire === auth.uid,
          isExpediteur: item.idExpediteur === auth.uid,
          isSameId: item.id === auth.uid
        };
        
        const hasOwnership = Object.values(ownershipChecks).some(check => check);
        
        results.tests.permissions = {
          success: true,
          userId: auth.uid,
          ownershipChecks,
          hasOwnership,
          developmentMode: process.env.NODE_ENV === 'development'
        };
        
        console.log('🔍 Vérifications propriété:', ownershipChecks);
        console.log('✅ A la propriété:', hasOwnership);
        
      } else {
        results.tests.permissions = {
          success: false,
          error: 'Pas d\'élément à vérifier'
        };
      }
      
    } catch (error) {
      results.tests.permissions = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      console.error('❌ Erreur vérification permissions:', error);
    }

    // Test 3: Tester la suppression via API
    console.log('🗑️ Test 3: Test suppression via API...');
    try {
      const item = results.tests.existence.item;
      
      if (item) {
        // Simuler un appel API DELETE
        const deleteUrl = `/api/${entity}/${item.id}`;
        console.log('🌐 Test API DELETE:', deleteUrl);
        
        // Créer une requête simulée
        const mockRequest = new Request(`http://localhost:3000${deleteUrl}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Importer et tester l'API directement
        try {
          let apiResult = null;
          
          switch (entity) {
            case 'contenus':
              const { DELETE: deleteContenu } = await import(`../contenus/[id]/route`);
              apiResult = await deleteContenu(mockRequest as any, { params: { id: item.id } });
              break;
              
            case 'laalas':
              const { DELETE: deleteLaala } = await import(`../laalas/[id]/route`);
              apiResult = await deleteLaala(mockRequest as any, { params: { id: item.id } });
              break;
              
            case 'boutiques':
              const { DELETE: deleteBoutique } = await import(`../boutiques/[id]/route`);
              apiResult = await deleteBoutique(mockRequest as any, { params: { id: item.id } });
              break;
              
            case 'messages':
              const { DELETE: deleteMessage } = await import(`../messages/[id]/route`);
              apiResult = await deleteMessage(mockRequest as any, { params: { id: item.id } });
              break;
              
            default:
              throw new Error(`API DELETE non testable pour ${entity}`);
          }
          
          const responseData = await apiResult.json();
          const status = apiResult.status;
          
          results.tests.apiDelete = {
            success: status >= 200 && status < 300,
            status,
            response: responseData
          };
          
          console.log('📊 Résultat API DELETE:', status, responseData);
          
        } catch (apiError) {
          results.tests.apiDelete = {
            success: false,
            error: apiError instanceof Error ? apiError.message : 'Erreur API inconnue'
          };
          console.error('❌ Erreur test API:', apiError);
        }
        
      } else {
        results.tests.apiDelete = {
          success: false,
          error: 'Pas d\'élément à supprimer'
        };
      }
      
    } catch (error) {
      results.tests.apiDelete = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      console.error('❌ Erreur test suppression API:', error);
    }

    // Test 4: Tester la suppression directe via service
    console.log('⚙️ Test 4: Test suppression directe...');
    try {
      const item = results.tests.existence.item;
      
      if (item && results.tests.apiDelete?.success !== true) {
        // Si l'API a échoué, tester la suppression directe
        console.log('🔧 Test suppression directe via service...');
        
        await service.delete(item.id);
        
        // Vérifier que la suppression a fonctionné
        const deletedItem = await service.getById(item.id);
        
        results.tests.directDelete = {
          success: !deletedItem,
          verified: !deletedItem
        };
        
        console.log('✅ Suppression directe:', !deletedItem ? 'réussie' : 'échouée');
        
      } else {
        results.tests.directDelete = {
          success: true,
          skipped: 'API DELETE a réussi ou pas d\'élément'
        };
      }
      
    } catch (error) {
      results.tests.directDelete = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      console.error('❌ Erreur suppression directe:', error);
    }

    // Résumé
    const allTests = Object.values(results.tests);
    const successfulTests = allTests.filter((test: any) => test.success).length;
    const totalTests = allTests.length;
    
    results.summary = {
      totalTests,
      successfulTests,
      failedTests: totalTests - successfulTests,
      successRate: Math.round((successfulTests / totalTests) * 100),
      overallSuccess: successfulTests === totalTests
    };

    console.log('📊 Résumé diagnostic suppression:', results.summary);

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ Erreur diagnostic suppression:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}