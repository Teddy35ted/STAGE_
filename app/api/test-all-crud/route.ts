import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    auth: null,
    services: {},
    operations: {},
    errors: []
  };

  try {
    console.log('🧪 Test complet de toutes les opérations CRUD...');
    
    // Test 1: Authentification
    try {
      const { verifyAuth } = await import('../../Backend/utils/authVerifier');
      const auth = await verifyAuth(request);
      
      if (!auth) {
        results.errors.push('Authentification échouée');
        return NextResponse.json(results, { status: 401 });
      }
      
      results.auth = {
        success: true,
        uid: auth.uid,
        token: 'PRÉSENT'
      };
      
      console.log('✅ Authentification réussie:', auth.uid);
      
    } catch (error) {
      results.errors.push(`Erreur auth: ${error instanceof Error ? error.message : 'Inconnue'}`);
      return NextResponse.json(results, { status: 500 });
    }

    // Test 2: Services
    try {
      const { ContenuService } = await import('../../Backend/services/collections/ContenuService');
      const { UserService } = await import('../../Backend/services/collections/UserService');
      const { LaalaService } = await import('../../Backend/services/collections/LaalaService');
      const { MessageService } = await import('../../Backend/services/collections/MessageService');
      const { BoutiqueService } = await import('../../Backend/services/collections/BoutiqueService');
      
      const contenuService = new ContenuService();
      const userService = new UserService();
      const laalaService = new LaalaService();
      const messageService = new MessageService();
      const boutiqueService = new BoutiqueService();
      
      results.services = {
        ContenuService: 'OK',
        UserService: 'OK',
        LaalaService: 'OK',
        MessageService: 'OK',
        BoutiqueService: 'OK'
      };
      
      console.log('✅ Tous les services instanciés');
      
      // Test 3: Opérations CRUD pour chaque service
      const auth = results.auth;
      
      // Test User
      try {
        console.log('👤 Test User CRUD...');
        
        // Vérifier/créer utilisateur
        let user = await userService.getById(auth.uid);
        if (!user) {
          const userData = {
            nom: 'Test User',
            prenom: 'CRUD',
            email: 'test@crud.com',
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
        
        results.operations.user = {
          read: user ? 'OK' : 'ÉCHEC',
          create: user ? 'OK' : 'ÉCHEC'
        };
        
      } catch (error) {
        results.operations.user = { error: error instanceof Error ? error.message : 'Inconnue' };
        results.errors.push(`User CRUD: ${error instanceof Error ? error.message : 'Inconnue'}`);
      }

      // Test Contenu
      try {
        console.log('📄 Test Contenu CRUD...');
        
        const creatorInfo = await userService.getCreatorInfo(auth.uid);
        if (!creatorInfo) {
          throw new Error('Creator info non disponible');
        }
        
        // CREATE
        const testContenu = {
          nom: `Test CRUD ${Date.now()}`,
          idCreateur: auth.uid,
          idLaala: 'test-laala-crud',
          type: 'texte' as const,
          src: '',
          allowComment: true,
          htags: ['#test'],
          personnes: []
        };
        
        const contenuId = await contenuService.createContenu(testContenu, creatorInfo, 1);
        
        // READ
        const createdContenu = await contenuService.getById(contenuId);
        
        // UPDATE
        await contenuService.update(contenuId, { nom: `${testContenu.nom} - MODIFIÉ` });
        const updatedContenu = await contenuService.getById(contenuId);
        
        // DELETE
        await contenuService.delete(contenuId);
        const deletedContenu = await contenuService.getById(contenuId);
        
        results.operations.contenu = {
          create: contenuId ? 'OK' : 'ÉCHEC',
          read: createdContenu ? 'OK' : 'ÉCHEC',
          update: updatedContenu?.nom.includes('MODIFIÉ') ? 'OK' : 'ÉCHEC',
          delete: !deletedContenu ? 'OK' : 'ÉCHEC'
        };
        
      } catch (error) {
        results.operations.contenu = { error: error instanceof Error ? error.message : 'Inconnue' };
        results.errors.push(`Contenu CRUD: ${error instanceof Error ? error.message : 'Inconnue'}`);
      }

      // Test Laala
      try {
        console.log('🎯 Test Laala CRUD...');
        
        const creatorInfo = await userService.getCreatorInfo(auth.uid);
        if (!creatorInfo) {
          throw new Error('Creator info non disponible');
        }
        
        // CREATE
        const testLaala = {
          nom: `Test Laala CRUD ${Date.now()}`,
          idCreateur: auth.uid,
          type: 'public' as const,
          description: 'Test CRUD Laala',
          htags: ['#test'],
          personnes: []
        };
        
        const laalaId = await laalaService.createLaala(testLaala, creatorInfo);
        
        // READ
        const createdLaala = await laalaService.getById(laalaId);
        
        // UPDATE
        await laalaService.update(laalaId, { description: 'Description modifiée' });
        const updatedLaala = await laalaService.getById(laalaId);
        
        // DELETE
        await laalaService.delete(laalaId);
        const deletedLaala = await laalaService.getById(laalaId);
        
        results.operations.laala = {
          create: laalaId ? 'OK' : 'ÉCHEC',
          read: createdLaala ? 'OK' : 'ÉCHEC',
          update: updatedLaala?.description === 'Description modifiée' ? 'OK' : 'ÉCHEC',
          delete: !deletedLaala ? 'OK' : 'ÉCHEC'
        };
        
      } catch (error) {
        results.operations.laala = { error: error instanceof Error ? error.message : 'Inconnue' };
        results.errors.push(`Laala CRUD: ${error instanceof Error ? error.message : 'Inconnue'}`);
      }

      // Test Message
      try {
        console.log('💬 Test Message CRUD...');
        
        // CREATE
        const testMessage = {
          contenu: `Test message CRUD ${Date.now()}`,
          idExpediteur: auth.uid,
          idDestinataire: auth.uid, // Auto-message pour test
          type: 'text' as const
        };
        
        const messageId = await messageService.create(testMessage);
        
        // READ
        const createdMessage = await messageService.getById(messageId);
        
        // UPDATE
        await messageService.update(messageId, { contenu: 'Message modifié' });
        const updatedMessage = await messageService.getById(messageId);
        
        // DELETE
        await messageService.delete(messageId);
        const deletedMessage = await messageService.getById(messageId);
        
        results.operations.message = {
          create: messageId ? 'OK' : 'ÉCHEC',
          read: createdMessage ? 'OK' : 'ÉCHEC',
          update: updatedMessage?.contenu === 'Message modifié' ? 'OK' : 'ÉCHEC',
          delete: !deletedMessage ? 'OK' : 'ÉCHEC'
        };
        
      } catch (error) {
        results.operations.message = { error: error instanceof Error ? error.message : 'Inconnue' };
        results.errors.push(`Message CRUD: ${error instanceof Error ? error.message : 'Inconnue'}`);
      }

      // Test Boutique
      try {
        console.log('🏪 Test Boutique CRUD...');
        
        // CREATE
        const testBoutique = {
          nom: `Test Boutique CRUD ${Date.now()}`,
          idProprietaire: auth.uid,
          description: 'Test boutique',
          categorie: 'test',
          adresse: 'Test address',
          telephone: '12345678'
        };
        
        const boutiqueId = await boutiqueService.create(testBoutique);
        
        // READ
        const createdBoutique = await boutiqueService.getById(boutiqueId);
        
        // UPDATE
        await boutiqueService.update(boutiqueId, { description: 'Description modifiée' });
        const updatedBoutique = await boutiqueService.getById(boutiqueId);
        
        // DELETE
        await boutiqueService.delete(boutiqueId);
        const deletedBoutique = await boutiqueService.getById(boutiqueId);
        
        results.operations.boutique = {
          create: boutiqueId ? 'OK' : 'ÉCHEC',
          read: createdBoutique ? 'OK' : 'ÉCHEC',
          update: updatedBoutique?.description === 'Description modifiée' ? 'OK' : 'ÉCHEC',
          delete: !deletedBoutique ? 'OK' : 'ÉCHEC'
        };
        
      } catch (error) {
        results.operations.boutique = { error: error instanceof Error ? error.message : 'Inconnue' };
        results.errors.push(`Boutique CRUD: ${error instanceof Error ? error.message : 'Inconnue'}`);
      }
      
    } catch (error) {
      results.errors.push(`Erreur services: ${error instanceof Error ? error.message : 'Inconnue'}`);
    }

    // Résumé
    const totalOperations = Object.keys(results.operations).length * 4; // 4 opérations par service
    const successfulOperations = Object.values(results.operations).reduce((count, ops: any) => {
      if (ops.error) return count;
      return count + Object.values(ops).filter(op => op === 'OK').length;
    }, 0);
    
    results.summary = {
      totalServices: Object.keys(results.services).length,
      totalOperations,
      successfulOperations,
      successRate: `${Math.round((successfulOperations / totalOperations) * 100)}%`,
      hasErrors: results.errors.length > 0
    };

    console.log('📊 Résumé des tests:', results.summary);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ Erreur générale test CRUD:', error);
    results.errors.push(`Erreur générale: ${error instanceof Error ? error.message : 'Inconnue'}`);
    return NextResponse.json(results, { status: 500 });
  }
}