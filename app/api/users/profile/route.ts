import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
// Import de la configuration Firebase Admin existante
import { adminAuth } from '../../../Backend/config/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Profile: Début de la requête');
    
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Auth header présent:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ Token manquant ou format incorrect');
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('🔐 Token extrait, longueur:', token.length);
    
    // Vérifier le token avec adminAuth au lieu de getAuth()
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    console.log('✅ Token vérifié pour UID:', uid);

    // Récupérer les informations utilisateur
    const userRecord = await adminAuth.getUser(uid);
    console.log('👤 Utilisateur récupéré:', userRecord.email);
    
    // Extraire les informations du profil
    const profile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      nom: userRecord.customClaims?.nom || userRecord.displayName?.split(' ').pop(),
      prenom: userRecord.customClaims?.prenom || userRecord.displayName?.split(' ')[0],
    };

    console.log('✅ Profil préparé:', profile);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('❌ Erreur API Profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil', details: errorMessage },
      { status: 500 }
    );
  }
}
