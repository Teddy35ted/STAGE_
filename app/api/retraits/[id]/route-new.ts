import { NextRequest, NextResponse } from 'next/server';
import { RetraitService } from '../../../Backend/services/collections/RetraitService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const retraitService = new RetraitService();

// GET - Récupérer un retrait spécifique
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      console.log('❌ Authentification échouée pour GET retrait');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    console.log('📖 Lecture retrait ID:', id);
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ 
        error: 'ID manquant',
        details: 'L\'ID du retrait est requis'
      }, { status: 400 });
    }

    const retrait = await retraitService.getById(id);
    
    if (!retrait) {
      console.log('❌ Retrait non trouvé:', id);
      return NextResponse.json({ 
        error: 'Retrait not found',
        details: `Aucun retrait trouvé avec l'ID ${id}`
      }, { status: 404 });
    }

    console.log('✅ Retrait trouvé:', retrait.montant, 'FCFA');
    return NextResponse.json(retrait);
    
  } catch (error) {
    console.error('❌ Erreur lecture retrait:', error);
    return NextResponse.json({ 
      error: 'Failed to get retrait',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Modifier un retrait
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      console.log('❌ Authentification échouée pour PUT retrait');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    console.log('✏️ Mise à jour retrait ID:', id);
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ 
        error: 'ID manquant',
        details: 'L\'ID du retrait est requis'
      }, { status: 400 });
    }

    const data = await request.json();
    console.log('📝 Données de mise à jour retrait:', data);
    
    // Vérifier que le retrait existe
    const existingRetrait = await retraitService.getById(id);
    if (!existingRetrait) {
      console.log('❌ Retrait à modifier non trouvé:', id);
      return NextResponse.json({ 
        error: 'Retrait not found',
        details: `Aucun retrait trouvé avec l'ID ${id}`
      }, { status: 404 });
    }

    console.log('📋 Retrait existant:', existingRetrait.montant, 'FCFA', 'Statut:', existingRetrait.statut);
    
    // Nettoyer les données (enlever les champs non modifiables)
    const { id: _, createdAt, updatedAt, ...cleanData } = data;
    
    await retraitService.update(id, cleanData);
    
    // Récupérer le retrait mis à jour
    const updatedRetrait = await retraitService.getById(id);
    
    console.log('✅ Retrait mis à jour:', updatedRetrait?.montant, 'FCFA', 'Nouveau statut:', updatedRetrait?.statut);
    
    return NextResponse.json({ 
      success: true,
      message: 'Retrait mis à jour avec succès',
      data: updatedRetrait
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour retrait:', error);
    return NextResponse.json({ 
      error: 'Failed to update retrait',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Supprimer un retrait
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      console.log('❌ Authentification échouée pour DELETE retrait');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    console.log('🗑️ Suppression retrait ID:', id);
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ 
        error: 'ID manquant',
        details: 'L\'ID du retrait est requis'
      }, { status: 400 });
    }
    
    // Vérifier que le retrait existe
    const existingRetrait = await retraitService.getById(id);
    if (!existingRetrait) {
      console.log('❌ Retrait à supprimer non trouvé:', id);
      return NextResponse.json({ 
        error: 'Retrait not found',
        details: `Aucun retrait trouvé avec l'ID ${id}`
      }, { status: 404 });
    }

    console.log('📋 Retrait trouvé pour suppression:', existingRetrait.montant, 'FCFA', 'Statut:', existingRetrait.statut);
    
    await retraitService.delete(id);
    
    // Vérifier que la suppression a bien eu lieu
    const deletedCheck = await retraitService.getById(id);
    if (deletedCheck) {
      console.error('❌ Échec de la suppression - le retrait existe encore');
      return NextResponse.json({ 
        error: 'Delete operation failed',
        details: 'Le retrait n\'a pas pu être supprimé'
      }, { status: 500 });
    }
    
    console.log('✅ Retrait supprimé avec succès:', existingRetrait.montant, 'FCFA');
    
    return NextResponse.json({ 
      success: true,
      message: 'Retrait supprimé avec succès',
      deletedItem: {
        id: existingRetrait.id,
        montant: existingRetrait.montant,
        statut: existingRetrait.statut
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression retrait:', error);
    return NextResponse.json({ 
      error: 'Failed to delete retrait',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
