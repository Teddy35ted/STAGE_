import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';
import { UserCore } from '../../../models/user';

const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    const userData: UserCore = await request.json();

    // Validation des données requises
    if (!userData.email || !userData.password || !userData.nom || !userData.prenom) {
      return NextResponse.json(
        { error: 'Données requises manquantes' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await userService.getByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      );
    }

    // Créer l'utilisateur (l'ID sera généré automatiquement)
    const userId = await userService.create(userData);

    return NextResponse.json({
      success: true,
      userId,
      message: 'Utilisateur créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}