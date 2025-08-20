import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialiser Firebase Admin (si pas déjà fait)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    // Validation des données
    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email et nouveau mot de passe sont obligatoires' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const auth = getAuth();

    try {
      // Vérifier si l'utilisateur existe
      const userRecord = await auth.getUserByEmail(email);
      
      // Mettre à jour le mot de passe
      await auth.updateUser(userRecord.uid, {
        password: newPassword,
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Mot de passe modifié avec succès' 
      });

    } catch (authError: any) {
      console.error('Erreur Firebase Auth:', authError);
      
      if (authError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'Aucun compte trouvé avec cette adresse email' },
          { status: 404 }
        );
      }
      
      if (authError.code === 'auth/invalid-email') {
        return NextResponse.json(
          { error: 'Adresse email invalide' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la modification du mot de passe' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur serveur lors de la réinitialisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
