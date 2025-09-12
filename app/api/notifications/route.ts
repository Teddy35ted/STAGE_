import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../Backend/config/firebase-admin';
import { notificationService } from '../../Backend/services/collections/NotificationService';

// Fonction utilitaire pour obtenir l'utilisateur depuis la requête
async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('❌ Erreur authentification:', error);
    return null;
  }
}

// GET - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const currentUserId = await getUserFromRequest(request);
    if (!currentUserId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('📬 Récupération notifications pour utilisateur:', currentUserId);

    // Récupérer les notifications
    const notifications = await notificationService.getUserNotifications(currentUserId, limit);

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('❌ Erreur GET notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}

// PUT - Marquer les notifications comme lues
export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const currentUserId = await getUserFromRequest(request);
    if (!currentUserId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAll } = body;

    console.log('✅ Marquage notifications comme lues pour utilisateur:', currentUserId);

    if (markAll) {
      // Marquer toutes les notifications comme lues
      await notificationService.markAsRead(currentUserId);
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Marquer des notifications spécifiques comme lues
      await notificationService.markAsRead(currentUserId, notificationIds);
    } else {
      return NextResponse.json(
        { error: 'Paramètres invalides. Utilisez markAll:true ou notificationIds:[]' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marquées comme lues'
    });

  } catch (error) {
    console.error('❌ Erreur PUT notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors du marquage des notifications' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer les anciennes notifications
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification (seuls les admins peuvent nettoyer)
    const currentUserId = await getUserFromRequest(request);
    if (!currentUserId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    console.log('🧹 Nettoyage des anciennes notifications');

    // Nettoyer les anciennes notifications
    await notificationService.cleanOldNotifications();

    return NextResponse.json({
      success: true,
      message: 'Anciennes notifications supprimées'
    });

  } catch (error) {
    console.error('❌ Erreur DELETE notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage des notifications' },
      { status: 500 }
    );
  }
}
