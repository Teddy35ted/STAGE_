import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireAuthService } from '../../../Backend/services/auth/CoGestionnaireAuthService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const authService = new CoGestionnaireAuthService();

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier s'il s'agit d'un co-gestionnaire
    const authContext = await authService.getAuthContext(auth);
    
    if (!authContext.isCoGestionnaire || !authContext.coGestionnaireId) {
      return NextResponse.json({ 
        requiresPasswordChange: false,
        message: 'Utilisateur principal - aucun changement requis'
      });
    }

    // Vérifier si le changement de mot de passe est requis
    const requiresPasswordChange = await authService.requiresPasswordChange(authContext.coGestionnaireId);

    return NextResponse.json({ 
      requiresPasswordChange,
      coGestionnaireId: authContext.coGestionnaireId,
      message: requiresPasswordChange ? 'Changement de mot de passe requis' : 'Aucun changement requis'
    });

  } catch (error: any) {
    console.error('Erreur vérification changement mot de passe:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
