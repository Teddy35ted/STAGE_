import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireAuthService } from '../../../Backend/services/auth/CoGestionnaireAuthService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const authService = new CoGestionnaireAuthService();

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    // Validation des données
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation de la force du mot de passe
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre' },
        { status: 400 }
      );
    }

    // Vérifier le mot de passe actuel et changer le mot de passe
    const success = await authService.changePassword(userId, currentPassword, newPassword);

    if (!success) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error: any) {
    console.error('Erreur changement de mot de passe:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du changement de mot de passe' },
      { status: 500 }
    );
  }
}
