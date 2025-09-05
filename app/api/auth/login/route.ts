import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';

const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Utiliser la nouvelle méthode d'authentification avec gestion des mots de passe temporaires
    const authResult = await userService.authenticateWithTemporaryPassword(
      email.toLowerCase().trim(),
      password
    );
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Retourner les informations de l'utilisateur (sans le mot de passe) et les flags
    const { password: _, ...userWithoutPassword } = authResult.user;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      requiresPasswordChange: authResult.requiresPasswordChange,
      requiresProfileCompletion: authResult.requiresProfileCompletion,
      nextStep: authResult.requiresPasswordChange 
        ? 'change-password' 
        : authResult.requiresProfileCompletion 
          ? 'complete-profile' 
          : 'dashboard'
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}