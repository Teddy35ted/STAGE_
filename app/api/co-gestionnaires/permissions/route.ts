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

    console.log('🔍 DEBUG - Auth result:', authResult);

    const userId = authResult.user.uid;
    const coGestionnaireService = new CoGestionnaireService();

    // CORRECTION : Vérifier les claims personnalisés pour déterminer le mode d'authentification
    const decodedToken = authResult.decodedToken;
    console.log('🔍 DEBUG - Decoded token claims:', decodedToken);

    let coGestionnaire = null;

    // Si c'est un co-gestionnaire (déterminé par les claims)
    if (decodedToken?.isCoGestionnaire && decodedToken?.coGestionnaireId) {
      console.log('🔍 User is co-gestionnaire with ID:', decodedToken.coGestionnaireId);
      
      // Récupérer directement le co-gestionnaire par son ID depuis les claims
      coGestionnaire = await coGestionnaireService.getById(decodedToken.coGestionnaireId);
      
      if (!coGestionnaire) {
        console.log('❌ Co-gestionnaire non trouvé avec ID:', decodedToken.coGestionnaireId);
        return NextResponse.json(
          { error: 'Co-gestionnaire non trouvé' },
          { status: 404 }
        );
      }
      
      console.log('✅ Co-gestionnaire trouvé via claims:', coGestionnaire.email);
    } else {
      // Fallback : chercher par idProprietaire si pas de claims (ancien système)
      console.log('🔍 Fallback: searching co-gestionnaire by idProprietaire');
      
      const coGestionnaires = await coGestionnaireService.query([
        { field: 'idProprietaire', operator: '==', value: userId }
      ]);
      
      if (coGestionnaires.length === 0) {
        console.log('❌ Aucun co-gestionnaire trouvé pour userId:', userId);
        return NextResponse.json(
          { error: 'Utilisateur non trouvé comme co-gestionnaire' },
          { status: 404 }
        );
      }
      
      coGestionnaire = coGestionnaires[0];
    }

    console.log('🔍 DEBUG - Co-gestionnaire trouvé:', {
      id: coGestionnaire.id,
      email: coGestionnaire.email,
      permissions: coGestionnaire.permissions,
      permissionsType: typeof coGestionnaire.permissions,
      permissionsLength: coGestionnaire.permissions?.length,
      permissionsStringified: JSON.stringify(coGestionnaire.permissions, null, 2)
    });

    // Récupérer les informations de l'animateur qui a créé ce co-gestionnaire
    const animatorEmail = coGestionnaire.createdBy || 'animateur@laala.app';

    // Transformer les permissions complexes en format simple pour l'interface
    const simplifiedPermissions = {
      laalas: coGestionnaire.permissions?.some((p: ResourcePermission) => {
        console.log('🔍 Checking laalas permission:', p);
        return p.resource === 'laalas' && p.actions?.length > 0;
      }),
      contenus: coGestionnaire.permissions?.some((p: ResourcePermission) => {
        console.log('🔍 Checking contenus permission:', p);
        return p.resource === 'contenus' && p.actions?.length > 0;
      })
    };

    console.log('🔍 DEBUG - Permissions simplifiées:', simplifiedPermissions);

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
