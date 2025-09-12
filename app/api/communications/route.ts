import { NextRequest, NextResponse } from 'next/server';
import { PublicCommunication } from '../../models/communication';
import { CommunicationService } from '../../Backend/services';
import { verifyAuth } from '../../Backend/utils/authVerifier';

// Instance du service
const communicationService = new CommunicationService();

// GET - Récupérer toutes les communications
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    console.log('🔍 Récupération des communications pour utilisateur:', auth.uid);

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');
    const status = searchParams.get('status') as PublicCommunication['status'];

    let communications: PublicCommunication[];

    if (authorId) {
      // Récupérer les communications d'un auteur spécifique
      communications = await communicationService.getByAuthor(authorId);
    } else if (status) {
      // Récupérer les communications par statut
      communications = await communicationService.getByStatus(status);
    } else {
      // Récupérer toutes les communications
      communications = await communicationService.getAll();
    }

    console.log(`✅ ${communications.length} communications récupérées`);
    return NextResponse.json(communications);

  } catch (error) {
    console.error('❌ Erreur récupération communications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des communications' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle communication
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const communicationData: Partial<PublicCommunication> = body;

    console.log('📝 Création communication avec données:', communicationData);

    // Valider les données requises
    if (!communicationData.title || !communicationData.content) {
      return NextResponse.json(
        { error: 'Titre et contenu sont requis' },
        { status: 400 }
      );
    }

    // Préparer les données complètes
    const dataToCreate: Partial<PublicCommunication> = {
      title: communicationData.title,
      content: communicationData.content,
      type: communicationData.type || 'announcement',
      format: communicationData.format || 'text',
      authorId: auth.uid,
      authorName: 'Utilisateur',
      targetAudience: communicationData.targetAudience || {
        type: 'all',
        description: 'Tout le monde',
        estimatedReach: 0
      },
      status: communicationData.status || 'draft',
      priority: communicationData.priority || 'medium',
      tags: communicationData.tags || [],
      publishDate: communicationData.publishDate,
      category: communicationData.category
    };

    // Créer la communication
    const communicationId = await communicationService.create(dataToCreate, auth.uid);

    // Récupérer la communication créée
    const createdCommunication = await communicationService.getById(communicationId);

    console.log('✅ Communication créée avec succès:', communicationId);

    return NextResponse.json({
      message: 'Communication créée avec succès',
      communication: createdCommunication
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur création communication:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la communication' },
      { status: 500 }
    );
  }
}