import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../../Backend/services/collections/CoGestionnaireService';
import { adminAuth } from '../../../lib/firebase-admin';

// Fonction de vérification d'authentification Firebase
async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, user: null };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier le token Firebase
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return { 
      success: true, 
      user: { uid: decodedToken.uid, email: decodedToken.email }
    };
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return { success: false, user: null };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const userId = authResult.user.uid;
    const coGestionnaireService = new CoGestionnaireService();

    // Vérifier si l'utilisateur est un co-gestionnaire
    const coGestionnaires = await coGestionnaireService.query([
      { field: 'userId', operator: '==', value: userId }
    ]);
    
    if (coGestionnaires.length === 0) {
      // L'utilisateur n'est pas un co-gestionnaire
      return NextResponse.json(
        { error: 'Utilisateur non trouvé comme co-gestionnaire' },
        { status: 404 }
      );
    }

    const coGestionnaire = coGestionnaires[0];

    // Récupérer les informations de l'animateur qui a créé ce co-gestionnaire
    const animatorEmail = coGestionnaire.createdBy || 'animateur@laala.app';

    // Transformer les permissions complexes en format simple pour l'interface
    const simplifiedPermissions = {
      laalas: coGestionnaire.permissions.some(p => p.resource === 'laalas'),
      contenus: coGestionnaire.permissions.some(p => p.resource === 'contenus')
    };

    const response = {
      id: coGestionnaire.id,
      email: coGestionnaire.email,
      permissions: simplifiedPermissions,
      animatorEmail,
      isCoGestionnaire: true
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
