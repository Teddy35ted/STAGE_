// API pour soumettre une demande de création de compte
// MODIFIÉ : Retour à l'ancien système direct sans approbation administrative
import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';
import { UserService } from '../../../Backend/services/collections/UserService';
import { PasswordGeneratorService } from '../../../Backend/services/utils/PasswordGeneratorService';
import { EmailService } from '../../../Backend/services/email/EmailService';

const accountRequestService = new AccountRequestService();
const userService = new UserService();
const emailService = new EmailService();

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

    console.log('✅ Aucun utilisateur existant, création directe du compte...');

    // ANCIEN SYSTÈME : Créer directement l'utilisateur avec mot de passe temporaire
    // Générer un mot de passe temporaire
    const temporaryPassword = PasswordGeneratorService.generateTemporaryPassword();
    console.log('🔐 Mot de passe temporaire généré');

    // Créer l'utilisateur directement
    const userId = await userService.createUserWithTemporaryPassword(email, temporaryPassword);
    console.log('✅ Utilisateur créé avec ID:', userId);

    // Envoyer l'email avec le mot de passe temporaire
    try {
      await emailService.sendWelcomeEmailWithTemporaryPassword(email, temporaryPassword);
      console.log('✅ Email de bienvenue envoyé à:', email);
    } catch (emailError) {
      console.warn('⚠️ Erreur envoi email (non bloquante):', emailError);
    }

    console.log('✅ Compte créé avec succès (ancien système direct)');

    return NextResponse.json({
      success: true,
      message: 'Votre compte a été créé avec succès ! Vous allez recevoir un email avec votre mot de passe temporaire.',
      userId
    });

  } catch (error: any) {
    console.error('❌ Erreur création de compte:', error);
    console.error('❌ Stack trace:', error.stack);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création du compte'
    }, { status: 500 });
  }
}
