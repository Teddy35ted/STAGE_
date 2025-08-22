import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      return NextResponse.json({
        message: 'Token décodé avec succès',
        uid: decodedToken.uid,
        email: decodedToken.email,
        claims: {
          isCoGestionnaire: decodedToken.isCoGestionnaire,
          coGestionnaireId: decodedToken.coGestionnaireId,
          proprietaireId: decodedToken.proprietaireId,
          permissions: decodedToken.permissions
        },
        allClaims: decodedToken
      });
    } catch (tokenError) {
      return NextResponse.json({
        error: 'Token invalide',
        details: tokenError instanceof Error ? tokenError.message : 'Erreur inconnue'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Erreur debug token:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
