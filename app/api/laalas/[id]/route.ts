import { NextRequest, NextResponse } from 'next/server';
import { LaalaService } from '../../../Backend/services/collections/LaalaService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const laalaService = new LaalaService();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📖 Lecture laala ID:', params.id);
    
    const laala = await laalaService.getById(params.id);
    
    if (!laala) {
      console.log('❌ Laala non trouvé:', params.id);
      return NextResponse.json({ error: 'Laala not found' }, { status: 404 });
    }
    
    console.log('✅ Laala trouvé:', laala.nom);
    return NextResponse.json(laala);
    
  } catch (error) {
    console.error('❌ Erreur lecture laala:', error);
    return NextResponse.json({ 
      error: 'Failed to get laala',
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
    console.log('✏️ Mise à jour laala ID:', params.id);
    
    const data = await request.json();
    console.log('📝 Données de mise à jour:', data);
    
    // Vérifier que le laala existe
    const existingLaala = await laalaService.getById(params.id);
    if (!existingLaala) {
      console.log('❌ Laala à modifier non trouvé:', params.id);
      return NextResponse.json({ error: 'Laala not found' }, { status: 404 });
    }
    
    // Vérifier les permissions
    if (existingLaala.idCreateur !== auth.uid) {
      console.log('❌ Permission refusée pour modification:', params.id);
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Nettoyer les données
    const { id, createdAt, ...updateData } = data;
    
    await laalaService.update(params.id, updateData);
    
    // Récupérer le laala mis à jour
    const updatedLaala = await laalaService.getById(params.id);
    
    console.log('✅ Laala mis à jour:', updatedLaala?.nom);
    
    return NextResponse.json({ 
      success: true,
      message: 'Laala mis à jour avec succès',
      laala: updatedLaala
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour laala:', error);
    return NextResponse.json({ 
      error: 'Failed to update laala',
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
    console.log('🗑️ Suppression laala ID:', params.id);
    
    // Vérifier que le laala existe
    const existingLaala = await laalaService.getById(params.id);
    if (!existingLaala) {
      console.log('❌ Laala à supprimer non trouvé:', params.id);
      return NextResponse.json({ error: 'Laala not found' }, { status: 404 });
    }
    
    // Vérifier les permissions
    if (existingLaala.idCreateur !== auth.uid) {
      console.log('❌ Permission refusée pour suppression:', params.id);
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    await laalaService.delete(params.id);
    
    console.log('✅ Laala supprimé:', existingLaala.nom);
    
    return NextResponse.json({ 
      success: true,
      message: 'Laala supprimé avec succès',
      deletedLaala: {
        id: existingLaala.id,
        nom: existingLaala.nom
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression laala:', error);
    return NextResponse.json({ 
      error: 'Failed to delete laala',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}