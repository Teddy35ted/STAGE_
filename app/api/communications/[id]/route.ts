import { NextRequest, NextResponse } from 'next/server';
import { PublicCommunication } from '../../../models/communication';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

// PUT - Mettre à jour une communication
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const updateData: Partial<PublicCommunication> = body;

    // TODO: Vérifier que l'utilisateur a le droit de modifier cette communication
    // TODO: Récupérer la communication existante et la mettre à jour

    const updatedCommunication: PublicCommunication = {
      id,
      title: updateData.title || 'Titre mis à jour',
      content: updateData.content || 'Contenu mis à jour',
      type: updateData.type || 'announcement',
      format: updateData.format || 'text',
      authorId: auth.uid,
      authorName: 'Utilisateur',
      targetAudience: updateData.targetAudience || {
        type: 'all',
        description: 'Tout le monde',
        estimatedReach: 0
      },
      status: updateData.status || 'draft',
      priority: updateData.priority || 'medium',
      tags: updateData.tags || [],
      category: updateData.category || '',
      createdAt: new Date().toISOString(), // TODO: Garder la date de création originale
      updatedAt: new Date().toISOString()
    };

    console.log('✅ Communication mise à jour:', updatedCommunication);

    return NextResponse.json(updatedCommunication);

  } catch (error) {
    console.error('❌ Erreur mise à jour communication:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la communication' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une communication
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = params;

    // TODO: Vérifier que l'utilisateur a le droit de supprimer cette communication
    // TODO: Supprimer la communication de la base de données

    console.log('✅ Communication supprimée:', id);

    return NextResponse.json({ message: 'Communication supprimée avec succès' });

  } catch (error) {
    console.error('❌ Erreur suppression communication:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la communication' },
      { status: 500 }
    );
  }
}