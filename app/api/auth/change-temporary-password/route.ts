import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';

const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword, confirmPassword } = await request.json();

    // Validation des données
    if (!userId || !newPassword || !confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'Tous les champs sont requis'
      }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'Les mots de passe ne correspondent pas'
      }, { status: 400 });
    }

    // Validation force du mot de passe
    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 8 caractères'
      }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe et a besoin de changer son mot de passe
    const user = await userService.getById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé'
      }, { status: 404 });
    }

    // Changer le mot de passe temporaire
    await userService.changeTemporaryPassword(userId, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Mot de passe changé avec succès',
      nextStep: 'complete-profile'
    });

  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
