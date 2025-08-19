import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireAuthService } from '../../../Backend/services/auth/CoGestionnaireAuthService';

const authService = new CoGestionnaireAuthService();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Authentifier le co-gestionnaire
    const authResult = await authService.authenticateCoGestionnaire(email, password);
    
    // Vérifier si le changement de mot de passe est requis
    const requiresPasswordChange = await authService.requiresPasswordChange(authResult.coGestionnaire.id);

    // Retourner les informations sans le mot de passe
    const { password: _, ...coGestionnaireWithoutPassword } = authResult.coGestionnaire;

    return NextResponse.json({
      success: true,
      coGestionnaire: coGestionnaireWithoutPassword,
      proprietaireId: authResult.proprietaireId,
      authToken: authResult.authToken,
      requiresPasswordChange
    });

  } catch (error: any) {
    console.error('Erreur lors de la connexion co-gestionnaire:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la connexion' },
      { status: 401 }
    );
  }
}
