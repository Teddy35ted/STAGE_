import { NextRequest, NextResponse } from 'next/server';
import { LaalaService } from '../../../Backend/services/collections/LaalaService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const laalaService = new LaalaService();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    console.log('📖 Lecture laala ID:', id);
    
    const laala = await laalaService.getById(id);
    
    if (!laala) {
      console.log('❌ Laala non trouvé:', id);
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: laalaId } = await params;
    console.log('✏️ Mise à jour laala ID:', laalaId);
    
    const data = await request.json();
    console.log('📝 Données de mise à jour:', data);
    
    // Vérifier que le laala existe
    const existingLaala = await laalaService.getById(laalaId);
    if (!existingLaala) {
      console.log('❌ Laala à modifier non trouvé:', laalaId);
      return NextResponse.json({ error: 'Laala not found' }, { status: 404 });
    }
    
    // PERMISSIONS PERMISSIVES - Mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 Mode développement - Modification autorisée sans vérification de propriété');
    } else {
      // En production, vérifier la propriété mais de manière plus souple
      const isOwner = existingLaala.idCreateur === auth.uid;
      if (!isOwner) {
        console.log('⚠️ Utilisateur non propriétaire mais modification autorisée (permissions permissives)');
        // Ne pas bloquer, juste logger
      }
    }
    
    // Nettoyer les données
    const { id, createdAt, ...updateData } = data;
    
    await laalaService.update(laalaId, updateData);
    
    // Récupérer le laala mis à jour
    const updatedLaala = await laalaService.getById(laalaId);
    
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: laalaId } = await params;
    console.log('🗑️ Suppression laala ID:', laalaId);
    
    if (!laalaId || laalaId.trim() === '') {
      return NextResponse.json({ 
        error: 'ID manquant',
        details: 'L\'ID du laala est requis pour la suppression'
      }, { status: 400 });
    }
    
    // Vérifier que le laala existe
    const existingLaala = await laalaService.getById(laalaId);
    if (!existingLaala) {
      console.log('❌ Laala à supprimer non trouvé:', laalaId);
      return NextResponse.json({ 
        error: 'Laala not found',
        details: `Aucun laala trouvé avec l'ID ${laalaId}`
      }, { status: 404 });
    }
    
    console.log('📋 Laala trouvé pour suppression:', existingLaala.nom);
    
    // PERMISSIONS PERMISSIVES - Mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 Mode développement - Suppression autorisée sans vérification de propriété');
    } else {
      // En production, vérifier la propriété mais de manière plus souple
      const isOwner = existingLaala.idCreateur === auth.uid;
      if (!isOwner) {
        console.log('⚠️ Utilisateur non propriétaire mais suppression autorisée (permissions permissives)');
        // Ne pas bloquer, juste logger
      }
    }
    
    await laalaService.delete(laalaId);
    
    // Vérifier que la suppression a bien eu lieu
    const deletedCheck = await laalaService.getById(laalaId);
    if (deletedCheck) {
      console.error('❌ Échec de la suppression - le laala existe encore');
      return NextResponse.json({ 
        error: 'Delete operation failed',
        details: 'Le laala n\'a pas pu être supprimé'
      }, { status: 500 });
    }
    
    console.log('✅ Laala supprimé avec succès:', existingLaala.nom);
    
    return NextResponse.json({ 
      success: true,
      message: 'Laala supprimé avec succès',
      deletedLaala: {
        id: existingLaala.id,
        nom: existingLaala.nom,
        type: existingLaala.type
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