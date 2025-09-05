import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireAuthService } from '../../../../Backend/services/auth/CoGestionnaireAuthService';

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

    console.log('🔐 Tentative de connexion co-gestionnaire:', email);

    // Authentifier le co-gestionnaire
    const authResult = await authService.authenticateCoGestionnaire(email, password);

    console.log('✅ Co-gestionnaire connecté avec succès');

    return NextResponse.json({
      success: true,
      coGestionnaire: {
        id: authResult.coGestionnaire.id,
        nom: authResult.coGestionnaire.nom,
        prenom: authResult.coGestionnaire.prenom,
        email: authResult.coGestionnaire.email,
        permissions: authResult.coGestionnaire.permissions,
        proprietaireId: authResult.proprietaireId
      },
      authToken: authResult.authToken
    });

  } catch (error) {
    console.error('❌ Erreur lors de la connexion co-gestionnaire:', error);
    
    // Gestion des erreurs spécifiques
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    
    if (errorMessage.includes('non trouvé') || errorMessage.includes('inactif')) {
      return NextResponse.json(
        { error: 'Co-gestionnaire non trouvé ou compte inactif' },
        { status: 404 }
      );
    }
    
    if (errorMessage.includes('mot de passe') && errorMessage.includes('incorrect')) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    if (errorMessage.includes('mot de passe non défini')) {
      return NextResponse.json(
        { error: 'Votre mot de passe n\'est pas encore défini. Contactez votre administrateur.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur de connexion. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
