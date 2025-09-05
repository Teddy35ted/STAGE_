// API pour la connexion avec mot de passe temporaire et changement obligatoire
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';

const userService = new UserService();
const accountRequestService = new AccountRequestService();

export async function POST(request: NextRequest) {
  try {
    const { email, temporaryPassword } = await request.json();

    console.log('🔍 Tentative de connexion temporaire:', { 
      email, 
      hasTemporaryPassword: !!temporaryPassword
    });

    // Validation de base
    if (!email || !temporaryPassword) {
      console.log('❌ Validation échouée: données manquantes');
      return NextResponse.json({
        success: false,
        error: 'Email et mot de passe temporaire requis'
      }, { status: 400 });
    }

    // Récupérer la demande approuvée
    console.log('🔍 Recherche de la demande pour:', email);
    const accountRequest = await accountRequestService.getByEmail(email);
    
    console.log('📊 Demande trouvée:', {
      found: !!accountRequest,
      id: accountRequest?.id,
      status: accountRequest?.status,
      isFirstLogin: accountRequest?.isFirstLogin,
      hasTemporaryPassword: !!accountRequest?.temporaryPassword,
      temporaryPasswordMatch: accountRequest?.temporaryPassword === temporaryPassword
    });
    
    if (!accountRequest) {
      console.log('❌ Aucune demande trouvée pour cet email');
      return NextResponse.json({
        success: false,
        error: 'Aucune demande trouvée pour cet email'
      }, { status: 404 });
    }

    if (!accountRequest.id) {
      console.error('❌ ID de demande manquant:', accountRequest);
      return NextResponse.json({
        success: false,
        error: 'Erreur interne: ID de demande manquant'
      }, { status: 500 });
    }
    
    if (accountRequest.status !== 'approved') {
      console.log('❌ Demande non approuvée, statut:', accountRequest.status);
      return NextResponse.json({
        success: false,
        error: 'Demande non approuvée par un administrateur'
      }, { status: 404 });
    }

    // Vérifier le mot de passe temporaire
    if (accountRequest.temporaryPassword !== temporaryPassword) {
      console.log('❌ Mot de passe temporaire invalide');
      return NextResponse.json({
        success: false,
        error: 'Mot de passe temporaire invalide'
      }, { status: 401 });
    }

    // Si c'est la première connexion, créer un utilisateur temporaire
    // Le nouveau mot de passe sera défini lors de la complétion du profil
    const isFirstLogin = accountRequest.isFirstLogin !== false; // true si undefined ou true
    
    console.log('🔍 État de première connexion:', { isFirstLogin });
    
    if (isFirstLogin) {
      // Vérifier si un utilisateur existe déjà (éviter doublons)
      console.log('🔍 Vérification utilisateur existant...');
      const existingUser = await userService.getByEmail(email);
      if (existingUser) {
        console.log('⚠️ Utilisateur déjà créé, marquer demande comme utilisée');
        // L'utilisateur existe déjà, marquer la demande comme utilisée
        await accountRequestService.update(accountRequest.id, {
          isFirstLogin: false,
          temporaryPassword: undefined // Supprimer le mot de passe temporaire
        });
        
        return NextResponse.json({
          success: true,
          message: 'Compte déjà créé. Redirection vers la complétion du profil.',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            nom: existingUser.nom,
            prenom: existingUser.prenom
          },
          requiresProfileCompletion: true,
          requiresPasswordChange: true
        });
      }

      console.log('✅ Création du compte utilisateur temporaire');
      
      // Créer l'utilisateur avec le mot de passe temporaire (sera changé lors de la complétion du profil)
      const userData = {
        nom: 'Utilisateur',
        prenom: 'Nouveau',
        email: email,
        tel: '00000000',
        password: temporaryPassword, // Garder temporairement
        date_de_naissance: '1990-01-01',
        sexe: 'Masculin' as const,
        pays: 'Togo',
        ville: 'Lomé',
        quartier: '',
        region: '',
        codePays: '+228',
        requiresPasswordChange: true // Flag pour indiquer qu'il faut changer le mot de passe
      };

      console.log('📝 Données utilisateur à créer:', { ...userData, password: '***MASQUÉ***' });
      const userId = await userService.create(userData);
      console.log('✅ Utilisateur créé avec ID:', userId);

      // Marquer la demande comme utilisée (première connexion terminée)
      console.log('🔄 Mise à jour de la demande ID:', accountRequest.id);
      await accountRequestService.update(accountRequest.id, {
        isFirstLogin: false,
        temporaryPassword: undefined // Supprimer le mot de passe temporaire
      });
      console.log('✅ Demande mise à jour avec succès');

      return NextResponse.json({
        success: true,
        message: 'Connexion réussie. Veuillez compléter votre profil.',
        userId,
        user: {
          id: userId,
          email: email,
          nom: 'Utilisateur',
          prenom: 'Nouveau'
        },
        requiresProfileCompletion: true,
        requiresPasswordChange: true,
        redirectTo: '/complete-profile'
      });
    } else {
      console.log('🔍 Connexion existante - recherche utilisateur');
      // Si ce n'est pas la première connexion, authentifier normalement
      const user = await userService.getByEmail(email);
      if (!user) {
        console.log('❌ Utilisateur introuvable');
        return NextResponse.json({
          success: false,
          error: 'Utilisateur introuvable'
        }, { status: 404 });
      }

      console.log('✅ Utilisateur trouvé');
      return NextResponse.json({
        success: true,
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Erreur connexion temporaire:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la connexion'
    }, { status: 500 });
  }
}
