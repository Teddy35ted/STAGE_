import { NextRequest, NextResponse } from 'next/server';
import { ContenuService } from '../../../Backend/services/collections/ContenuService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const contenuService = new ContenuService();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📖 Lecture contenu ID:', params.id);
    
    const contenu = await contenuService.getById(params.id);
    
    if (!contenu) {
      console.log('❌ Contenu non trouvé:', params.id);
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('✏️ Mise à jour contenu ID:', params.id);
    
    const data = await request.json();
    console.log('📝 Données de mise à jour:', data);
    
    // Vérifier que le contenu existe
    const existingContenu = await contenuService.getById(params.id);
    if (!existingContenu) {
      console.log('❌ Contenu à modifier non trouvé:', params.id);
      return NextResponse.json({ error: 'Contenu not found' }, { status: 404 });
    }
    
    // Nettoyer les données (enlever les champs non modifiables)
    const { id, createdAt, ...updateData } = data;
    
    await contenuService.update(params.id, updateData);
    
    // Récupérer le contenu mis à jour
    const updatedContenu = await contenuService.getById(params.id);
    
    console.log('✅ Contenu mis à jour:', updatedContenu?.nom);
    
    return NextResponse.json({ 
      success: true,
      message: 'Contenu mis à jour avec succès',
      contenu: updatedContenu
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour contenu:', error);
    return NextResponse.json({ 
      error: 'Failed to update contenu',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🗑️ Suppression contenu ID:', params.id);
    
    // Vérifier que le contenu existe
    const existingContenu = await contenuService.getById(params.id);
    if (!existingContenu) {
      console.log('❌ Contenu à supprimer non trouvé:', params.id);
      return NextResponse.json({ error: 'Contenu not found' }, { status: 404 });
    }
    
    // Vérifier les permissions (optionnel - l'utilisateur peut-il supprimer ce contenu ?)
    if (existingContenu.idCreateur !== auth.uid) {
      console.log('❌ Permission refusée pour suppression:', params.id);
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    await contenuService.delete(params.id);
    
    console.log('✅ Contenu supprimé:', existingContenu.nom);
    
    return NextResponse.json({ 
      success: true,
      message: 'Contenu supprimé avec succès',
      deletedContenu: {
        id: existingContenu.id,
        nom: existingContenu.nom
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression contenu:', error);
    return NextResponse.json({ 
      error: 'Failed to delete contenu',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}