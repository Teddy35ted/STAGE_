import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '../../Backend/services';
import { adminAuth } from '../../Backend/config/firebase-admin';

// Instances des services
const campaignService = new CampaignService();

// GET - Récupérer toutes les campagnes ou celles d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' }, 
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const currentUserId = decodedToken.uid;

    console.log('🔍 Récupération campagnes pour utilisateur:', currentUserId);

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let campaigns;
    if (userId && userId !== 'all') {
      // Récupérer les campagnes d'un utilisateur spécifique
      campaigns = await campaignService.getCampaignsByUser(userId);
    } else {
      // Récupérer toutes les campagnes ou celles de l'utilisateur actuel
      campaigns = await campaignService.getCampaignsByUser(currentUserId);
    }

    console.log(`✅ ${campaigns.length} campagnes récupérées`);

    return NextResponse.json({
      success: true,
      data: campaigns,
      message: `${campaigns.length} campagne(s) récupérée(s)`
    });

  } catch (error) {
    console.error('❌ Erreur GET campaigns:', error);
    
    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json(
        { error: 'Token invalide' }, 
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des campagnes',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle campagne
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' }, 
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const currentUserId = decodedToken.uid;

    console.log('📝 Création campagne par utilisateur:', currentUserId);

    // Récupérer les données du body
    const campaignData = await request.json();
    console.log('📄 Données campagne reçues:', campaignData);

    // Validation basique
    if (!campaignData.name || !campaignData.description) {
      return NextResponse.json(
        { error: 'Nom et description requis' }, 
        { status: 400 }
      );
    }

    // Ajouter l'ID de l'utilisateur créateur
    const dataWithUser = {
      ...campaignData,
      createdBy: currentUserId
    };

    // Créer la campagne
    const campaignId = await campaignService.create(dataWithUser);

    console.log('✅ Campagne créée avec ID:', campaignId);

    // Récupérer la campagne créée pour la retourner
    const createdCampaign = await campaignService.getById(campaignId);

    return NextResponse.json({
      success: true,
      data: createdCampaign,
      message: 'Campagne créée avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur POST campaigns:', error);
    
    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json(
        { error: 'Token invalide' }, 
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la campagne',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une campagne
export async function PUT(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' }, 
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const currentUserId = decodedToken.uid;

    console.log('✏️ Mise à jour campagne par utilisateur:', currentUserId);

    // Récupérer les données du body
    const updateData = await request.json();
    console.log('📄 Données mise à jour campagne:', updateData);

    // Validation basique
    if (!updateData.id) {
      return NextResponse.json(
        { error: 'ID de la campagne requis' }, 
        { status: 400 }
      );
    }

    const { id, ...dataToUpdate } = updateData;

    // Vérifier que la campagne existe et appartient à l'utilisateur
    const existingCampaign = await campaignService.getById(id);
    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campagne non trouvée' }, 
        { status: 404 }
      );
    }

    if (existingCampaign.createdBy !== currentUserId) {
      return NextResponse.json(
        { error: 'Non autorisé à modifier cette campagne' }, 
        { status: 403 }
      );
    }

    // Mettre à jour la campagne
    await campaignService.update(id, dataToUpdate);

    console.log('✅ Campagne mise à jour:', id);

    // Récupérer la campagne mise à jour
    const updatedCampaign = await campaignService.getById(id);

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campagne mise à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur PUT campaigns:', error);
    
    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json(
        { error: 'Token invalide' }, 
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour de la campagne',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une campagne
export async function DELETE(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' }, 
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const currentUserId = decodedToken.uid;

    console.log('🗑️ Suppression campagne par utilisateur:', currentUserId);

    // Récupérer l'ID depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'ID de la campagne requis' }, 
        { status: 400 }
      );
    }

    // Vérifier que la campagne existe et appartient à l'utilisateur
    const existingCampaign = await campaignService.getById(campaignId);
    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campagne non trouvée' }, 
        { status: 404 }
      );
    }

    if (existingCampaign.createdBy !== currentUserId) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer cette campagne' }, 
        { status: 403 }
      );
    }

    // Supprimer la campagne
    await campaignService.delete(campaignId);

    console.log('✅ Campagne supprimée:', campaignId);

    return NextResponse.json({
      success: true,
      message: 'Campagne supprimée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur DELETE campaigns:', error);
    
    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json(
        { error: 'Token invalide' }, 
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression de la campagne',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    );
  }
}
