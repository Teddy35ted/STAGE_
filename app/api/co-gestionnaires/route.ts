import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../Backend/services/collections/CoGestionnaireService';
import { CoGestionnaireAuthService } from '../../Backend/services/auth/CoGestionnaireAuthService';
import { verifyAuth } from '../../Backend/utils/authVerifier';

const coGestionnaireService = new CoGestionnaireService();
const authService = new CoGestionnaireAuthService();

export async function POST(request: NextRequest) {
  console.log('POST /api/co-gestionnaires appelé');
  
  const auth = await verifyAuth(request);
  if (!auth) {
    console.log('Authentification échouée');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Création co-gestionnaire avec authentification...');
    
    const data = await request.json();
    console.log('Données reçues:', data);
    
    const { password, animatorEmail, ...coGestionnaireData } = data;
    
    // Validation
    if (!password) {
      return NextResponse.json(
        { error: 'Le mot de passe est requis' },
        { status: 400 }
      );
    }

    // Convertir l'ACCES en permissions spécifiques SEULEMENT si aucune permission n'est fournie
    const convertAccessToPermissions = (acces: string) => {
      const allActions = ['create', 'read', 'update', 'delete'];
      
      switch (acces) {
        case 'consulter':
          return [
            { resource: 'laalas', actions: ['read'] },
            { resource: 'contenus', actions: ['read'] }
          ];
        case 'gerer':
          return [
            { resource: 'laalas', actions: ['read', 'update'] },
            { resource: 'contenus', actions: ['read', 'update'] }
          ];
        case 'Ajouter':
          return [
            { resource: 'laalas', actions: ['create', 'read', 'update'] },
            { resource: 'contenus', actions: ['create', 'read', 'update'] }
          ];
        default:
          return [
            { resource: 'laalas', actions: ['read'] },
            { resource: 'contenus', actions: ['read'] }
          ];
      }
    };

    // Utiliser les permissions du formulaire si elles existent, sinon utiliser la conversion ACCES
    const finalPermissions = coGestionnaireData.permissions && coGestionnaireData.permissions.length > 0 
      ? coGestionnaireData.permissions 
      : convertAccessToPermissions(coGestionnaireData.ACCES);

    console.log('📋 Permissions du formulaire:', coGestionnaireData.permissions);
    console.log('🔧 Permissions finales utilisées:', finalPermissions);

    // Préparer les données complètes avec l'email de l'animateur créateur
    const completeData = {
      ...coGestionnaireData,
      permissions: finalPermissions,
      idProprietaire: auth.uid,
      createdBy: animatorEmail || 'animateur@laala.app', // Email de l'animateur qui crée
      dateCreation: new Date().toISOString(),
      dateInvitation: new Date().toISOString(),
      statut: 'actif' as const,
      role: 'assistant' as const
    };

    console.log('Données complètes:', completeData);

    // Créer le co-gestionnaire avec authentification
    const id = await authService.createCoGestionnaire(completeData, password);
    
    console.log('Co-gestionnaire créé avec ID:', id);
    
    return NextResponse.json({ 
      success: true,
      id,
      message: 'Co-gestionnaire créé avec succès'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur création co-gestionnaire:', error);
    
    return NextResponse.json({ 
      error: 'Échec de la création du co-gestionnaire',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Vérification de l'authentification
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Récupération des co-gestionnaires pour utilisateur:', auth.uid);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const coGestionnaire = await coGestionnaireService.getById(id);
      if (coGestionnaire) {
        // Vérifier que l'utilisateur a accès à ce co-gestionnaire
        if (coGestionnaire.idProprietaire !== auth.uid) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        return NextResponse.json(coGestionnaire);
      } else {
        return NextResponse.json({ error: 'Co-gestionnaire not found' }, { status: 404 });
      }
    } else {
      // Retourner uniquement les co-gestionnaires de l'utilisateur connecté
      const coGestionnaires = await coGestionnaireService.query([
        { field: 'idProprietaire', operator: '==', value: auth.uid }
      ]);
      console.log(`${coGestionnaires.length} co-gestionnaires récupérés`);
      return NextResponse.json(coGestionnaires);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch co-gestionnaires' }, { status: 500 });
  }
}
