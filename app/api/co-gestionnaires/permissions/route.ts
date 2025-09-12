import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../../Backend/services/collections/CoGestionnaireService';
import { adminAuth } from '../../../lib/firebase-admin';
import { ResourcePermission } from '../../../models/co_gestionnaire';

// Fonction de vérification d'authentification Firebase avec claims
async function verifyAuthWithClaims(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, user: null, decodedToken: null };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier le token Firebase et récupérer les claims
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return { 
      success: true, 
      user: { uid: decodedToken.uid, email: decodedToken.email },
      decodedToken: decodedToken
    };
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return { success: false, user: null, decodedToken: null };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyAuthWithClaims(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const userId = authResult.user.uid;
    const coGestionnaireService = new CoGestionnaireService();

    // CORRECTION : Vérifier les claims personnalisés pour déterminer le mode d'authentification
    const decodedToken = authResult.decodedToken;

    let coGestionnaire = null;

    // Si c'est un co-gestionnaire (déterminé par les claims)
    if (decodedToken?.isCoGestionnaire && decodedToken?.coGestionnaireId) {
      // Récupérer directement le co-gestionnaire par son ID depuis les claims
      coGestionnaire = await coGestionnaireService.getById(decodedToken.coGestionnaireId);
      
      if (!coGestionnaire) {
        return NextResponse.json(
          { error: 'Co-gestionnaire non trouvé' },
          { status: 404 }
        );
      }
    } else {
      // Fallback : chercher par idProprietaire si pas de claims (ancien système)
      const coGestionnaires = await coGestionnaireService.query([
        { field: 'idProprietaire', operator: '==', value: userId }
      ]);
      
      if (coGestionnaires.length === 0) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé comme co-gestionnaire' },
          { status: 404 }
        );
      }
      
      coGestionnaire = coGestionnaires[0];
    }

    // Récupérer les informations de l'animateur qui a créé ce co-gestionnaire
    const animatorEmail = coGestionnaire.createdBy || 'animateur@laala.app';

    // Transformer les permissions complexes en format simple pour l'interface
    const simplifiedPermissions = {
      laalas: coGestionnaire.permissions?.some((p: ResourcePermission) => {
        return p.resource === 'laalas' && p.actions?.length > 0;
      }),
      contenus: coGestionnaire.permissions?.some((p: ResourcePermission) => {
        return p.resource === 'contenus' && p.actions?.length > 0;
      })
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
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
