import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../../Backend/services/collections/CoGestionnaireService';
import { adminAuth } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    const coGestionnaireService = new CoGestionnaireService();

    // Vérifier si l'utilisateur est un co-gestionnaire
    const coGestionnaires = await coGestionnaireService.query([
      { field: 'userId', operator: '==', value: userId }
    ]);
    
    if (coGestionnaires.length === 0) {
      // L'utilisateur n'est pas un co-gestionnaire
      return NextResponse.json(
        { isCoGestionnaire: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isCoGestionnaire: true,
      coGestionnaire: coGestionnaires[0]
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du co-gestionnaire:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
