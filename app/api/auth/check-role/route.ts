import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();
    
    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'userId ou userEmail requis' },
        { status: 400 }
      );
    }

    // Vérifier le rôle basé sur les paramètres fournis
    const roleInfo = {
      userId: userId,
      userEmail: userEmail,
      isOwner: false,
      isCoGestionnaire: false,
      selectedRole: null as string | null
    };

    // Vérifier si c'est le propriétaire
    const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'teddy@laala.app';
    if (userEmail === OWNER_EMAIL) {
      roleInfo.isOwner = true;
      roleInfo.selectedRole = 'animateur';
    }

    return NextResponse.json({
      success: true,
      roleInfo
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du rôle:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
