import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Vérification/Création utilisateur...');
    
    // Vérifier l'authentification
    const { verifyAuth } = await import('../../Backend/utils/authVerifier');
    const auth = await verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }
    
    console.log('✅ Utilisateur authentifié:', auth.uid);
    
    // Récupérer les données du body
    const body = await request.json();
    console.log('📝 Données utilisateur reçues:', body);
    
    // Importer les services
    const { UserService } = await import('../../Backend/services/collections/UserService');
    const userService = new UserService();
    
    // Vérifier si l'utilisateur existe déjà
    let existingUser = await userService.getById(auth.uid);
    
    if (existingUser) {
      console.log('👤 Utilisateur existant trouvé:', existingUser.nom);
      return NextResponse.json({
        success: true,
        message: 'Utilisateur existant',
        user: {
          id: existingUser.id,
          nom: existingUser.nom,
          email: existingUser.email,
          avatar: existingUser.avatar,
          iscert: existingUser.iscert
        },
        action: 'found'
      });
    }
    
    console.log('🆕 Création d\'un nouvel utilisateur...');
    
    // Créer un nouvel utilisateur avec des données par défaut
    const defaultUserData = {
      nom: body.nom || 'Utilisateur',
      prenom: body.prenom || 'Test',
      email: body.email || 'user@example.com',
      tel: body.tel || '00000000',
      password: 'defaultpassword', // Sera hashé automatiquement
      date_de_naissance: body.date_de_naissance || '1990-01-01',
      sexe: (body.sexe as 'Masculin' | 'Féminin' | 'Autre') || 'Masculin',
      pays: body.pays || 'Togo',
      ville: body.ville || 'Lomé',
      quartier: body.quartier || '',
      region: body.region || '',
      codePays: body.codePays || '+228'
    };
    
    // Créer l'utilisateur
    const userId = await userService.createUser(defaultUserData, auth.uid);
    console.log('✅ Utilisateur créé avec ID:', userId);
    
    // Récupérer l'utilisateur créé
    const newUser = await userService.getById(userId);
    
    return NextResponse.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser?.id,
        nom: newUser?.nom,
        email: newUser?.email,
        avatar: newUser?.avatar,
        iscert: newUser?.iscert
      },
      action: 'created'
    });
    
  } catch (error) {
    console.error('❌ Erreur ensure-user:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}