import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Vérification du profil utilisateur...');
    
    // Vérifier l'authentification
    const { verifyAuth } = await import('../../Backend/utils/authVerifier');
    const auth = await verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié',
        hasProfile: false
      }, { status: 401 });
    }

    console.log('✅ Utilisateur authentifié:', auth.uid);
    
    // Importer le service utilisateur
    const { UserService } = await import('../../Backend/services/collections/UserService');
    const userService = new UserService();
    
    // Vérifier si l'utilisateur a un profil
    const user = await userService.getById(auth.uid);
    
    if (!user) {
      console.log('❌ Aucun profil trouvé pour:', auth.uid);
      return NextResponse.json({
        success: true,
        hasProfile: false,
        message: 'Profil utilisateur non trouvé',
        uid: auth.uid
      });
    }

    // Vérifier si le profil est complet
    const isComplete = !!(
      user.nom && 
      user.prenom && 
      user.email && 
      user.tel &&
      user.nom !== 'Utilisateur' && 
      user.prenom !== 'Test' &&
      user.email !== 'user@example.com' &&
      user.tel !== '00000000'
    );

    console.log('📋 Profil trouvé:', {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      tel: user.tel,
      isComplete
    });

    return NextResponse.json({
      success: true,
      hasProfile: true,
      isComplete,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        tel: user.tel,
        avatar: user.avatar,
        iscert: user.iscert,
        registerDate: user.registerDate
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur vérification profil:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      hasProfile: false
    }, { status: 500 });
  }
}