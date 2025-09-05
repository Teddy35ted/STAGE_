import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';

const userService = new UserService();
const accountRequestService = new AccountRequestService();

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
      // Vérifier si l'utilisateur a une demande approuvée avec mot de passe temporaire
      const accountRequest = await accountRequestService.getByEmail(email.toLowerCase().trim());
      
      if (accountRequest && accountRequest.status === 'approved' && accountRequest.temporaryPassword && accountRequest.isFirstLogin) {
        return NextResponse.json({
          error: 'Vous avez un mot de passe temporaire. Utilisez la page de connexion temporaire pour créer votre compte.',
          hasTemporaryPassword: true
        }, { status: 401 });
      }
      
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