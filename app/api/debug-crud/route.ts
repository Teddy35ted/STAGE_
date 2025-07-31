import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Diagnostic CRUD - Début');
    
    // Test 1: Variables d'environnement
    const envVars = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'PRÉSENTE' : 'MANQUANTE',
      NODE_ENV: process.env.NODE_ENV
    };
    
    console.log('📋 Variables d\'environnement:', envVars);
    
    // Test 2: Import Firebase Admin
    let firebaseStatus = 'NON_TESTÉ';
    let dbStatus = 'NON_TESTÉ';
    let authStatus = 'NON_TESTÉ';
    
    try {
      const { adminDb, adminAuth } = await import('../../Backend/config/firebase-admin');
      firebaseStatus = 'IMPORTÉ';
      
      // Test connexion DB
      await adminDb.collection('_diagnostic').limit(1).get();
      dbStatus = 'CONNECTÉ';
      
      // Test Auth
      const authTest = adminAuth.app;
      authStatus = authTest ? 'CONNECTÉ' : 'ERREUR';
      
    } catch (error) {
      firebaseStatus = `ERREUR: ${error instanceof Error ? error.message : 'Inconnue'}`;
    }
    
    // Test 3: Services
    let servicesStatus: any = {};
    
    try {
      const { ContenuService } = await import('../../Backend/services/collections/ContenuService');
      const { UserService } = await import('../../Backend/services/collections/UserService');
      const { LaalaService } = await import('../../Backend/services/collections/LaalaService');
      
      servicesStatus = {
        ContenuService: 'IMPORTÉ',
        UserService: 'IMPORTÉ',
        LaalaService: 'IMPORTÉ'
      };
      
      // Test instanciation
      const contenuService = new ContenuService();
      const userService = new UserService();
      const laalaService = new LaalaService();
      
      servicesStatus.instanciation = 'RÉUSSIE';
      
    } catch (error) {
      servicesStatus.erreur = error instanceof Error ? error.message : 'Erreur inconnue';
    }
    
    // Test 4: Auth Verifier
    let authVerifierStatus = 'NON_TESTÉ';
    
    try {
      const { verifyAuth } = await import('../../Backend/utils/authVerifier');
      authVerifierStatus = 'IMPORTÉ';
      
      // Test avec une requête sans auth
      const authResult = await verifyAuth(request);
      authVerifierStatus = authResult ? 'AUTH_VALIDE' : 'AUTH_INVALIDE';
      
    } catch (error) {
      authVerifierStatus = `ERREUR: ${error instanceof Error ? error.message : 'Inconnue'}`;
    }
    
    // Test 5: Collections
    let collectionsStatus: any = {};
    
    try {
      const { COLLECTIONS } = await import('../../Backend/config/firebase-admin');
      collectionsStatus = {
        USERS: COLLECTIONS.USERS,
        LAALAS: COLLECTIONS.LAALAS,
        CONTENUS: COLLECTIONS.CONTENUS,
        MESSAGES: COLLECTIONS.MESSAGES,
        BOUTIQUES: COLLECTIONS.BOUTIQUES,
        CO_GESTIONNAIRES: COLLECTIONS.CO_GESTIONNAIRES,
        RETRAITS: COLLECTIONS.RETRAITS
      };
    } catch (error) {
      collectionsStatus.erreur = error instanceof Error ? error.message : 'Erreur inconnue';
    }
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environnement: envVars,
      firebase: {
        status: firebaseStatus,
        database: dbStatus,
        auth: authStatus
      },
      services: servicesStatus,
      authVerifier: authVerifierStatus,
      collections: collectionsStatus,
      url: request.url,
      method: request.method,
      headers: {
        authorization: request.headers.get('authorization') ? 'PRÉSENT' : 'ABSENT',
        contentType: request.headers.get('content-type')
      }
    };
    
    console.log('📊 Diagnostic complet:', diagnostic);
    
    return NextResponse.json({
      success: true,
      diagnostic
    });
    
  } catch (error) {
    console.error('❌ Erreur dans diagnostic:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test CRUD POST - Début');
    
    const body = await request.json();
    console.log('📝 Données reçues:', body);
    
    // Test d'authentification
    const { verifyAuth } = await import('../../Backend/utils/authVerifier');
    const auth = await verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié',
        details: 'Token d\'authentification manquant ou invalide'
      }, { status: 401 });
    }
    
    console.log('✅ Authentification réussie:', auth.uid);
    
    // Test de création d'un contenu
    const { ContenuService } = await import('../../Backend/services/collections/ContenuService');
    const { UserService } = await import('../../Backend/services/collections/UserService');
    
    const contenuService = new ContenuService();
    const userService = new UserService();
    
    // Récupérer les infos du créateur
    const creatorInfo = await userService.getCreatorInfo(auth.uid);
    
    if (!creatorInfo) {
      return NextResponse.json({
        success: false,
        error: 'Créateur non trouvé',
        details: `Aucun utilisateur trouvé avec l'ID: ${auth.uid}`
      }, { status: 404 });
    }
    
    console.log('👤 Créateur trouvé:', creatorInfo.nom);
    
    // Créer un contenu de test
    const testContenu = {
      nom: `Test CRUD ${Date.now()}`,
      idCreateur: auth.uid,
      idLaala: body.idLaala || 'test-laala-id',
      type: 'texte' as const,
      src: '',
      allowComment: true,
      htags: ['#test', '#crud'],
      personnes: []
    };
    
    console.log('📄 Création du contenu de test...');
    const contenuId = await contenuService.createContenu(testContenu, creatorInfo, 1);
    console.log('✅ Contenu créé avec ID:', contenuId);
    
    // Lire le contenu créé
    const createdContenu = await contenuService.getById(contenuId);
    console.log('📖 Contenu lu:', createdContenu?.nom);
    
    // Mettre à jour le contenu
    await contenuService.update(contenuId, { nom: `${testContenu.nom} - MODIFIÉ` });
    console.log('✏️ Contenu mis à jour');
    
    // Lire le contenu modifié
    const updatedContenu = await contenuService.getById(contenuId);
    console.log('📖 Contenu modifié lu:', updatedContenu?.nom);
    
    // Supprimer le contenu de test
    await contenuService.delete(contenuId);
    console.log('🗑️ Contenu de test supprimé');
    
    return NextResponse.json({
      success: true,
      message: 'Test CRUD complet réussi',
      auth: {
        uid: auth.uid,
        token: 'PRÉSENT'
      },
      creator: {
        nom: creatorInfo.nom,
        avatar: creatorInfo.avatar,
        iscert: creatorInfo.iscert
      },
      contenu: {
        id: contenuId,
        nom: testContenu.nom,
        nomModifie: updatedContenu?.nom
      },
      operations: {
        create: '✅',
        read: '✅',
        update: '✅',
        delete: '✅'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur dans test CRUD POST:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}