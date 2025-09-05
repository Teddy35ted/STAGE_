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

    // Récupérer l'utilisateur par email
    const user = await userService.getByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe
    const isValidPassword = await userService.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}