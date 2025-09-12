import { NextRequest, NextResponse } from 'next/server';
import { ContenuService } from '../../../Backend/services/collections/ContenuService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const contenuService = new ContenuService();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    console.log('📖 Lecture contenu ID:', id);
    
    const contenu = await contenuService.getById(id);
    
    if (!contenu) {
      console.log('❌ Contenu non trouvé:', id);
      return NextResponse.json({ error: 'Contenu not found' }, { status: 404 });
    }
    
    console.log('✅ Contenu trouvé:', contenu.nom);
    return NextResponse.json(contenu);
    
  } catch (error) {
    console.error('❌ Erreur lecture contenu:', error);
    return NextResponse.json({ 
      error: 'Failed to get contenu',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: contenuId } = await params;
    console.log('✏️ Mise à jour contenu ID:', contenuId);
    
    const data = await request.json();
    console.log('📝 Données de mise à jour:', data);
    
    // Vérifier que le contenu existe
    const existingContenu = await contenuService.getById(contenuId);
    if (!existingContenu) {
      console.log('❌ Contenu à modifier non trouvé:', contenuId);
      return NextResponse.json({ error: 'Contenu not found' }, { status: 404 });
    }
    
    // Nettoyer les données (enlever les champs non modifiables)
    const { id, createdAt, ...updateData } = data;
    
    await contenuService.update(contenuId, updateData);
    
    // Récupérer le contenu mis à jour
    const updatedContenu = await contenuService.getById(contenuId);
    
    console.log('✅ Contenu mis à jour:', updatedContenu?.nom);
    
    return NextResponse.json({ 
      success: true,
      message: 'Contenu mis à jour avec succès',
      contenu: updatedContenu
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour contenu:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour du contenu',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: contenuId } = await params;
    console.log('🗑️ Suppression contenu ID:', contenuId);
    
    if (!contenuId || contenuId.trim() === '') {
      return NextResponse.json({ 
        error: 'ID manquant',
        details: 'L\'ID du contenu est requis pour la suppression'
      }, { status: 400 });
    }
    
    // Vérifier que le contenu existe
    const existingContenu = await contenuService.getById(contenuId);
    if (!existingContenu) {
      console.log('❌ Contenu à supprimer non trouvé:', contenuId);
      return NextResponse.json({ 
        error: 'Contenu not found',
        details: `Aucun contenu trouvé avec l'ID ${contenuId}`
      }, { status: 404 });
    }
    
    console.log('📋 Contenu trouvé pour suppression:', existingContenu.nom);
    
    // PERMISSIONS PERMISSIVES - Mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 Mode développement - Suppression autorisée sans vérification de propriété');
    } else {
      // En production, vérifier la propriété mais de manière plus souple
      const isOwner = existingContenu.idCreateur === auth.uid;
      if (!isOwner) {
        console.log('⚠️ Utilisateur non propriétaire mais suppression autorisée (permissions permissives)');
        // Ne pas bloquer, juste logger
      }
    }
    
    await contenuService.delete(contenuId);
    
    // Vérifier que la suppression a bien eu lieu
    const deletedCheck = await contenuService.getById(contenuId);
    if (deletedCheck) {
      console.error('❌ Échec de la suppression - le contenu existe encore');
      return NextResponse.json({ 
        error: 'Delete operation failed',
        details: 'Le contenu n\'a pas pu être supprimé'
      }, { status: 500 });
    }
    
    console.log('✅ Contenu supprimé avec succès:', existingContenu.nom);
    
    return NextResponse.json({ 
      success: true,
      message: 'Contenu supprimé avec succès',
      deletedContenu: {
        id: existingContenu.id,
        nom: existingContenu.nom,
        type: existingContenu.type
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression contenu:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression du contenu',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}