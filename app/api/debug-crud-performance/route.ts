import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Diagnostic des performances CRUD...');
    
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
    const { entity = 'contenu', operation = 'all' } = body;

    console.log(`🧪 Test ${operation} pour ${entity}...`);

    // Importer les services
    const { ContenuService } = await import('../../Backend/services/collections/ContenuService');
    const { UserService } = await import('../../Backend/services/collections/UserService');
    
    const contenuService = new ContenuService();
    const userService = new UserService();

    const results: any = {
      timestamp: new Date().toISOString(),
      entity,
      operation,
      auth: { uid: auth.uid },
      tests: {}
    };

    // S'assurer que l'utilisateur existe
    let user = await userService.getById(auth.uid);
    if (!user) {
      console.log('👤 Création utilisateur pour test...');
      const userData = {
        nom: 'Test User',
        prenom: 'Performance',
        email: 'test@performance.com',
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
    if (!creatorInfo) {
      throw new Error('Impossible de récupérer les informations du créateur');
    }

    // Test CREATE
    if (operation === 'all' || operation === 'create') {
      console.log('➕ Test CREATE...');
      const startTime = Date.now();
      
      const testData = {
        nom: `Test Performance ${Date.now()}`,
        idCreateur: auth.uid,
        idLaala: 'test-performance-laala',
        type: 'texte' as const,
        src: '',
        allowComment: true,
        htags: ['#performance', '#test'],
        personnes: []
      };

      try {
        const id = await contenuService.createContenu(testData, creatorInfo, 1);
        const createTime = Date.now() - startTime;
        
        results.tests.create = {
          success: true,
          id,
          duration: createTime,
          data: testData
        };
        
        console.log(`✅ CREATE réussi en ${createTime}ms, ID: ${id}`);
        
        // Stocker l'ID pour les autres tests
        results.createdId = id;
        
      } catch (error) {
        results.tests.create = {
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          duration: Date.now() - startTime
        };
        console.error('❌ CREATE échoué:', error);
      }
    }

    // Test READ (utiliser un ID existant ou celui créé)
    if (operation === 'all' || operation === 'read') {
      console.log('📖 Test READ...');
      
      // D'abord, récupérer tous les contenus pour avoir un ID valide
      const allContenus = await contenuService.getAll({ limit: 5 });
      console.log(`📋 ${allContenus.length} contenus trouvés`);
      
      if (allContenus.length > 0) {
        const testId = results.createdId || allContenus[0].id;
        console.log(`🔍 Test READ avec ID: ${testId}`);
        
        const startTime = Date.now();
        
        try {
          const contenu = await contenuService.getById(testId);
          const readTime = Date.now() - startTime;
          
          results.tests.read = {
            success: !!contenu,
            id: testId,
            duration: readTime,
            found: !!contenu,
            data: contenu ? { nom: contenu.nom, type: contenu.type } : null
          };
          
          console.log(`✅ READ réussi en ${readTime}ms, trouvé: ${!!contenu}`);
          
        } catch (error) {
          results.tests.read = {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            duration: Date.now() - startTime,
            id: testId
          };
          console.error('❌ READ échoué:', error);
        }
      } else {
        results.tests.read = {
          success: false,
          error: 'Aucun contenu disponible pour le test READ'
        };
      }
    }

    // Test UPDATE
    if (operation === 'all' || operation === 'update') {
      console.log('✏️ Test UPDATE...');
      
      const allContenus = await contenuService.getAll({ limit: 5 });
      const testId = results.createdId || (allContenus.length > 0 ? allContenus[0].id : null);
      
      if (testId) {
        console.log(`🔄 Test UPDATE avec ID: ${testId}`);
        
        const startTime = Date.now();
        
        try {
          // Vérifier que l'élément existe avant mise à jour
          const existingContenu = await contenuService.getById(testId);
          
          if (!existingContenu) {
            results.tests.update = {
              success: false,
              error: `Contenu ${testId} non trouvé pour mise à jour`,
              id: testId
            };
          } else {
            const updateData = {
              nom: `${existingContenu.nom} - MODIFIÉ ${Date.now()}`
            };
            
            await contenuService.update(testId, updateData);
            
            // Vérifier que la mise à jour a fonctionné
            const updatedContenu = await contenuService.getById(testId);
            const updateTime = Date.now() - startTime;
            
            const updateSuccess = updatedContenu && updatedContenu.nom.includes('MODIFIÉ');
            
            results.tests.update = {
              success: updateSuccess,
              id: testId,
              duration: updateTime,
              originalName: existingContenu.nom,
              updatedName: updatedContenu?.nom,
              verified: updateSuccess
            };
            
            console.log(`✅ UPDATE réussi en ${updateTime}ms, vérifié: ${updateSuccess}`);
          }
          
        } catch (error) {
          results.tests.update = {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            duration: Date.now() - startTime,
            id: testId
          };
          console.error('❌ UPDATE échoué:', error);
        }
      } else {
        results.tests.update = {
          success: false,
          error: 'Aucun contenu disponible pour le test UPDATE'
        };
      }
    }

    // Test DELETE
    if (operation === 'all' || operation === 'delete') {
      console.log('🗑️ Test DELETE...');
      
      // Créer un contenu spécifiquement pour le test de suppression
      let deleteTestId = null;
      
      try {
        const deleteTestData = {
          nom: `Test DELETE ${Date.now()}`,
          idCreateur: auth.uid,
          idLaala: 'test-delete-laala',
          type: 'texte' as const,
          src: '',
          allowComment: true,
          htags: ['#delete-test'],
          personnes: []
        };
        
        deleteTestId = await contenuService.createContenu(deleteTestData, creatorInfo, 1);
        console.log(`📝 Contenu créé pour test DELETE: ${deleteTestId}`);
        
        // Vérifier qu'il existe
        const beforeDelete = await contenuService.getById(deleteTestId);
        console.log(`🔍 Contenu avant suppression: ${beforeDelete ? 'trouvé' : 'non trouvé'}`);
        
        if (beforeDelete) {
          const startTime = Date.now();
          
          // Effectuer la suppression
          await contenuService.delete(deleteTestId);
          
          // Vérifier que la suppression a fonctionné
          const afterDelete = await contenuService.getById(deleteTestId);
          const deleteTime = Date.now() - startTime;
          
          const deleteSuccess = !afterDelete;
          
          results.tests.delete = {
            success: deleteSuccess,
            id: deleteTestId,
            duration: deleteTime,
            existedBefore: !!beforeDelete,
            existsAfter: !!afterDelete,
            verified: deleteSuccess
          };
          
          console.log(`✅ DELETE réussi en ${deleteTime}ms, vérifié: ${deleteSuccess}`);
          
        } else {
          results.tests.delete = {
            success: false,
            error: 'Contenu créé pour test DELETE non trouvé',
            id: deleteTestId
          };
        }
        
      } catch (error) {
        results.tests.delete = {
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          id: deleteTestId
        };
        console.error('❌ DELETE échoué:', error);
      }
    }

    // Test LIST (performance de récupération)
    if (operation === 'all' || operation === 'list') {
      console.log('📋 Test LIST...');
      
      const startTime = Date.now();
      
      try {
        const allContenus = await contenuService.getAll({ limit: 10 });
        const listTime = Date.now() - startTime;
        
        results.tests.list = {
          success: true,
          duration: listTime,
          count: allContenus.length,
          items: allContenus.map(c => ({ id: c.id, nom: c.nom, type: c.type }))
        };
        
        console.log(`✅ LIST réussi en ${listTime}ms, ${allContenus.length} éléments`);
        
      } catch (error) {
        results.tests.list = {
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          duration: Date.now() - startTime
        };
        console.error('❌ LIST échoué:', error);
      }
    }

    // Résumé des performances
    const successfulTests = Object.values(results.tests).filter((test: any) => test.success).length;
    const totalTests = Object.keys(results.tests).length;
    const averageDuration = Object.values(results.tests)
      .filter((test: any) => test.duration)
      .reduce((sum: number, test: any) => sum + test.duration, 0) / totalTests;

    results.summary = {
      totalTests,
      successfulTests,
      failedTests: totalTests - successfulTests,
      successRate: `${Math.round((successfulTests / totalTests) * 100)}%`,
      averageDuration: Math.round(averageDuration),
      performance: averageDuration < 500 ? 'Excellent' : averageDuration < 1000 ? 'Bon' : 'À améliorer'
    };

    console.log('📊 Résumé performance:', results.summary);

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ Erreur diagnostic performance:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}