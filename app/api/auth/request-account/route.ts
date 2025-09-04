// API pour soumettre une demande de création de compte
import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';
import { UserService } from '../../../Backend/services/collections/UserService';

const accountRequestService = new AccountRequestService();
const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API POST /api/auth/request-account appelée');
    
    const { email } = await request.json();
    console.log('📧 Email reçu:', email);

    // Validation de base
    if (!email || !email.trim()) {
      console.log('❌ Email manquant');
      return NextResponse.json({
        success: false,
        error: 'L\'email est requis'
      }, { status: 400 });
    }

    // Vérifier que l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Email invalide:', email);
      return NextResponse.json({
        success: false,
        error: 'Format d\'email invalide'
      }, { status: 400 });
    }

    console.log('✅ Email valide, vérification utilisateur existant...');

    // Vérifier qu'aucun utilisateur n'existe déjà avec cet email
    const existingUser = await userService.getByEmail(email);
    if (existingUser) {
      console.log('❌ Utilisateur déjà existant:', email);
      return NextResponse.json({
        success: false,
        error: 'Un compte existe déjà avec cet email'
      }, { status: 409 });
    }

    console.log('✅ Aucun utilisateur existant, création de la demande...');

    // Créer la demande
    const requestId = await accountRequestService.createRequest({ email });

    console.log('✅ Demande de compte créée avec succès:', requestId);

    return NextResponse.json({
      success: true,
      message: 'Votre demande de création de compte a été soumise. Vous recevrez un email une fois qu\'un administrateur l\'aura validée.',
      requestId
    });

  } catch (error: any) {
    console.error('❌ Erreur demande de compte:', error);
    console.error('❌ Stack trace:', error.stack);

    if (error.message.includes('demande est déjà en cours')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la soumission de la demande'
    }, { status: 500 });
  }
}
