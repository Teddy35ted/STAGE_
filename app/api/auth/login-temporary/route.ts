// API pour la connexion avec mot de passe temporaire et changement obligatoire
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';

const userService = new UserService();
const accountRequestService = new AccountRequestService();

export async function POST(request: NextRequest) {
  try {
    const { email, temporaryPassword, newPassword } = await request.json();

    console.log('🔍 Tentative de connexion temporaire:', { 
      email, 
      hasTemporaryPassword: !!temporaryPassword,
      hasNewPassword: !!newPassword 
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
      status: accountRequest?.status,
      isFirstLogin: accountRequest?.isFirstLogin,
      hasTemporaryPassword: !!accountRequest?.temporaryPassword,
      temporaryPasswordMatch: accountRequest?.temporaryPassword === temporaryPassword
    });
    
    if (!accountRequest || accountRequest.status !== 'approved') {
      console.log('❌ Demande non trouvée ou non approuvée');
      return NextResponse.json({
        success: false,
        error: 'Aucune demande approuvée trouvée pour cet email'
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

    // Si c'est la première connexion, un nouveau mot de passe est requis
    // Par défaut, on considère que c'est toujours la première connexion si isFirstLogin n'est pas défini
    const isFirstLogin = accountRequest.isFirstLogin !== false; // true si undefined ou true
    
    console.log('🔍 État de première connexion:', { isFirstLogin, hasNewPassword: !!newPassword });
    
    if (isFirstLogin) {
      if (!newPassword || newPassword.length < 6) {
        console.log('❌ Nouveau mot de passe requis ou trop court');
        return NextResponse.json({
          success: false,
          error: 'Un nouveau mot de passe d\'au moins 6 caractères est requis'
        }, { status: 400 });
      }

      console.log('✅ Création du nouveau compte utilisateur');
      // Créer l'utilisateur avec le nouveau mot de passe
      const userData = {
        nom: 'Utilisateur',
        prenom: 'Nouveau',
        email: email,
        tel: '00000000',
        password: newPassword,
        date_de_naissance: '1990-01-01',
        sexe: 'Masculin' as const,
        pays: 'Togo',
        ville: 'Lomé',
        quartier: '',
        region: '',
        codePays: '+228'
      };

      const userId = await userService.create(userData);
      console.log('✅ Utilisateur créé avec ID:', userId);

      // Marquer la demande comme utilisée (première connexion terminée)
      await accountRequestService.update(accountRequest.id, {
        isFirstLogin: false,
        temporaryPassword: undefined // Supprimer le mot de passe temporaire
      });
      console.log('✅ Demande mise à jour');

      return NextResponse.json({
        success: true,
        message: 'Compte créé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
        userId,
        requiresProfileCompletion: true
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
