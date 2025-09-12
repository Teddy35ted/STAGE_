import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../../Backend/config/firebase-admin';
import { notificationService } from '../../../Backend/services/collections/NotificationService';

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

// GET - Récupérer le nombre de notifications non lues
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const currentUserId = await getUserFromRequest(request);
    if (!currentUserId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    console.log('📊 Comptage notifications non lues pour utilisateur:', currentUserId);

    // Compter les notifications non lues
    const unreadCount = await notificationService.getUnreadCount(currentUserId);

    return NextResponse.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('❌ Erreur GET unread count:', error);
    return NextResponse.json(
      { error: 'Erreur lors du comptage des notifications' },
      { status: 500 }
    );
  }
}
