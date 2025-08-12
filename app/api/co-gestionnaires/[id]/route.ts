import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../../Backend/services/collections/CoGestionnaireService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const coGestionnaireService = new CoGestionnaireService();

// GET - Récupérer un co-gestionnaire (seul le propriétaire peut voir ses co-gestionnaires)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📖 Lecture co-gestionnaire ID:', params.id);
    
    if (!params.id || params.id.trim() === '') {
      return NextResponse.json({ 
        error: 'ID manquant',
        details: 'L\'ID du co-gestionnaire est requis'
      }, { status: 400 });
    }

    const coGestionnaire = await coGestionnaireService.getById(params.id);
    
    if (!coGestionnaire) {
      console.log('❌ Co-gestionnaire non trouvé:', params.id);
      return NextResponse.json({ 
        error: 'Co-gestionnaire not found',
        details: `Aucun co-gestionnaire trouvé avec l'ID ${params.id}`
      }, { status: 404 });
    }

    // SÉCURITÉ: Vérifier que l'utilisateur connecté est le propriétaire de ce co-gestionnaire
    if (coGestionnaire.idProprietaire !== auth.uid) {
      console.log('❌ Accès refusé - utilisateur non propriétaire');
      return NextResponse.json({ 
        error: 'Access denied',
        details: 'Vous ne pouvez consulter que vos propres co-gestionnaires'
      }, { status: 403 });
    }

    console.log('✅ Co-gestionnaire trouvé:', coGestionnaire.nom, coGestionnaire.prenom);
    return NextResponse.json(coGestionnaire);
    
  } catch (error) {
    console.error('❌ Erreur lecture co-gestionnaire:', error);
    return NextResponse.json({ 
      error: 'Failed to get co-gestionnaire',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Modifier un co-gestionnaire (seul le propriétaire peut modifier ses co-gestionnaires)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('✏️ Mise à jour co-gestionnaire ID:', params.id);
    
    if (!params.id || params.id.trim() === '') {
      return NextResponse.json({ 
        error: 'ID manquant',
        details: 'L\'ID du co-gestionnaire est requis'
      }, { status: 400 });
    }

    const data = await request.json();
    console.log('📝 Données de mise à jour co-gestionnaire:', data);
    
    // Vérifier que le co-gestionnaire existe
    const existingCoGestionnaire = await coGestionnaireService.getById(params.id);
    if (!existingCoGestionnaire) {
      console.log('❌ Co-gestionnaire à modifier non trouvé:', params.id);
      return NextResponse.json({ 
        error: 'Co-gestionnaire not found',
        details: `Aucun co-gestionnaire trouvé avec l'ID ${params.id}`
      }, { status: 404 });
    }

    // SÉCURITÉ: Vérifier que l'utilisateur connecté est le propriétaire de ce co-gestionnaire
    if (existingCoGestionnaire.idProprietaire !== auth.uid) {
      console.log('❌ Accès refusé - utilisateur non propriétaire');
      return NextResponse.json({ 
        error: 'Access denied',
        details: 'Vous ne pouvez modifier que vos propres co-gestionnaires'
      }, { status: 403 });
    }
    
    // Nettoyer les données (enlever les champs non modifiables)
    const { 
      id, 
      idProprietaire, 
      dateCreation, 
      dateInvitation, 
      lastLogin,
      loginToken,
      tokenExpiry,
      ...cleanData 
    } = data;
    
    await coGestionnaireService.update(params.id, cleanData);
    
    // Récupérer le co-gestionnaire mis à jour
    const updatedCoGestionnaire = await coGestionnaireService.getById(params.id);
    
    console.log('✅ Co-gestionnaire mis à jour:', updatedCoGestionnaire?.nom, updatedCoGestionnaire?.prenom);
    
    return NextResponse.json({ 
      success: true,
      message: 'Co-gestionnaire mis à jour avec succès',
      data: updatedCoGestionnaire
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour co-gestionnaire:', error);
    return NextResponse.json({ 
      error: 'Failed to update co-gestionnaire',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Supprimer un co-gestionnaire avec révocation d'accès
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🗑️ Suppression co-gestionnaire ID:', params.id);
    
    if (!params.id || params.id.trim() === '') {
      return NextResponse.json({ 
        error: 'ID manquant',
        details: 'L\'ID du co-gestionnaire est requis'
      }, { status: 400 });
    }
    
    // Vérifier que le co-gestionnaire existe
    const existingCoGestionnaire = await coGestionnaireService.getById(params.id);
    if (!existingCoGestionnaire) {
      console.log('❌ Co-gestionnaire à supprimer non trouvé:', params.id);
      return NextResponse.json({ 
        error: 'Co-gestionnaire not found',
        details: `Aucun co-gestionnaire trouvé avec l'ID ${params.id}`
      }, { status: 404 });
    }

    // SÉCURITÉ: Vérifier que l'utilisateur connecté est le propriétaire de ce co-gestionnaire
    if (existingCoGestionnaire.idProprietaire !== auth.uid) {
      console.log('❌ Accès refusé - utilisateur non propriétaire');
      return NextResponse.json({ 
        error: 'Access denied',
        details: 'Vous ne pouvez supprimer que vos propres co-gestionnaires'
      }, { status: 403 });
    }

    console.log('📋 Co-gestionnaire trouvé pour suppression:', existingCoGestionnaire.nom, existingCoGestionnaire.prenom);

    // RÉVOCATION D'ACCÈS: Désactiver le co-gestionnaire avant suppression définitive
    console.log('🔒 Révocation d\'accès - Désactivation du co-gestionnaire...');
    await coGestionnaireService.update(params.id, { 
      statut: 'suspended'
    });

    // Attendre un moment pour que les tokens en cours deviennent invalides
    // (les tokens Firebase ont un TTL, la désactivation empêche les nouvelles authentifications)
    
    // Suppression définitive
    await coGestionnaireService.delete(params.id);
    
    // Vérifier que la suppression a bien eu lieu
    const deletedCheck = await coGestionnaireService.getById(params.id);
    if (deletedCheck) {
      console.error('❌ Échec de la suppression - le co-gestionnaire existe encore');
      return NextResponse.json({ 
        error: 'Delete operation failed',
        details: 'Le co-gestionnaire n\'a pas pu être supprimé'
      }, { status: 500 });
    }
    
    console.log('✅ Co-gestionnaire supprimé avec révocation d\'accès:', existingCoGestionnaire.nom, existingCoGestionnaire.prenom);
    
    return NextResponse.json({ 
      success: true,
      message: 'Co-gestionnaire supprimé avec succès et accès révoqué',
      deletedItem: {
        id: existingCoGestionnaire.id,
        name: `${existingCoGestionnaire.nom} ${existingCoGestionnaire.prenom}`,
        email: existingCoGestionnaire.email
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression co-gestionnaire:', error);
    return NextResponse.json({ 
      error: 'Failed to delete co-gestionnaire',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}