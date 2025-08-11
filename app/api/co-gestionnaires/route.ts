import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../Backend/services/collections/CoGestionnaireService';
import { CoGestionnaireAuthService } from '../../Backend/services/auth/CoGestionnaireAuthService';
import { verifyAuth } from '../../Backend/utils/authVerifier';

const coGestionnaireService = new CoGestionnaireService();
const authService = new CoGestionnaireAuthService();

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📝 Création co-gestionnaire avec authentification...');
    
    const data = await request.json();
    const { password, ...coGestionnaireData } = data;
    
    // Validation
    if (!password) {
      return NextResponse.json(
        { error: 'Le mot de passe est requis' },
        { status: 400 }
      );
    }

    // Préparer les données complètes
    const completeData = {
      ...coGestionnaireData,
      idProprietaire: auth.uid,
      dateCreation: new Date().toISOString(),
      dateInvitation: new Date().toISOString(),
      statut: 'actif' as const,
      role: 'assistant' as const
    };

    // Créer le co-gestionnaire avec authentification
    const id = await authService.createCoGestionnaire(completeData, password);
    
    console.log('✅ Co-gestionnaire créé avec ID:', id);
    
    return NextResponse.json({ 
      success: true,
      id,
      message: 'Co-gestionnaire créé avec succès'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Erreur création co-gestionnaire:', error);
    
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
    console.log('📋 Récupération des co-gestionnaires pour utilisateur:', auth.uid);
    
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
      console.log(`✅ ${coGestionnaires.length} co-gestionnaires récupérés`);
      return NextResponse.json(coGestionnaires);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch co-gestionnaires' }, { status: 500 });
  }
}
