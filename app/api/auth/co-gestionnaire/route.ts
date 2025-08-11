import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireAuthService } from '../../../Backend/services/auth/CoGestionnaireAuthService';

const authService = new CoGestionnaireAuthService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Tentative de connexion co-gestionnaire...');
    
    const { email, password } = await request.json();
    
    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Authentifier le co-gestionnaire
    const authResult = await authService.authenticateCoGestionnaire(email, password);
    
    console.log('✅ Co-gestionnaire connecté:', authResult.coGestionnaire.nom);
    
    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: authResult.coGestionnaire.id,
          nom: authResult.coGestionnaire.nom,
          prenom: authResult.coGestionnaire.prenom,
          email: authResult.coGestionnaire.email,
          role: authResult.coGestionnaire.role,
          permissions: authResult.coGestionnaire.permissions,
          isCoGestionnaire: true,
          proprietaireId: authResult.proprietaireId
        },
        token: authResult.authToken
      }
    });

  } catch (error) {
    console.error('❌ Erreur connexion co-gestionnaire:', error);
    
    return NextResponse.json(
      { 
        error: 'Échec de la connexion',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 401 }
    );
  }
}
