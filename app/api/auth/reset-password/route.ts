import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebase/config';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'L\'adresse email est requise' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    try {
      // Envoyer l'email de réinitialisation via Firebase
      await sendPasswordResetEmail(auth, email);

      return NextResponse.json({
        message: 'Email de réinitialisation envoyé avec succès',
        success: true
      });

    } catch (firebaseError: any) {
      console.error('Erreur Firebase lors de l\'envoi de l\'email:', firebaseError);
      
      let errorMessage = 'Erreur lors de l\'envoi de l\'email';
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cette adresse email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
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
