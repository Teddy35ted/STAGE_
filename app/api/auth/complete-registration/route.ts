import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';
import { UserCore } from '../../../models/user';

const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Finalisation de l\'inscription utilisateur...');
    
    // Vérifier l'authentification
    const { verifyAuth } = await import('../../../Backend/utils/authVerifier');
    const auth = await verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }

    const userData = await request.json();
    console.log('📋 Données utilisateur reçues:', userData);

    // Validation des données requises
    if (!userData.nom || !userData.prenom || !userData.email) {
      return NextResponse.json({
        success: false,
        error: 'Nom, prénom et email sont requis'
      }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await userService.getById(auth.uid);
    if (existingUser) {
      console.log('👤 Utilisateur existant trouvé, mise à jour...');
      
      // Mettre à jour avec les vraies données
      await userService.update(auth.uid, {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        tel: userData.tel || '00000000',
        date_de_naissance: userData.date_de_naissance || '1990-01-01',
        sexe: userData.sexe || 'Masculin',
        pays: userData.pays || 'Togo',
        ville: userData.ville || 'Lomé',
        quartier: userData.quartier || '',
        region: userData.region || '',
        codePays: userData.codePays || '+228'
      });
      
      const updatedUser = await userService.getById(auth.uid);
      
      return NextResponse.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        user: {
          id: updatedUser?.id,
          nom: updatedUser?.nom,
          prenom: updatedUser?.prenom,
          email: updatedUser?.email,
          avatar: updatedUser?.avatar,
          iscert: updatedUser?.iscert
        },
        action: 'updated'
      });
    }

    console.log('🆕 Création nouveau profil utilisateur...');

    // Créer les données complètes pour l'utilisateur
    const completeUserData: UserCore = {
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      tel: userData.tel || '00000000',
      password: 'firebase-auth', // Mot de passe géré par Firebase Auth
      date_de_naissance: userData.date_de_naissance || '1990-01-01',
      sexe: userData.sexe || 'Masculin',
      pays: userData.pays || 'Togo',
      ville: userData.ville || 'Lomé',
      quartier: userData.quartier || '',
      region: userData.region || '',
      codePays: userData.codePays || '+228'
    };

    // Créer l'utilisateur avec les vraies données
    const userId = await userService.createUser(completeUserData, auth.uid);
    console.log('✅ Profil utilisateur créé avec ID:', userId);

    // Récupérer l'utilisateur créé
    const newUser = await userService.getById(userId);

    return NextResponse.json({
      success: true,
      message: 'Profil créé avec succès',
      user: {
        id: newUser?.id,
        nom: newUser?.nom,
        prenom: newUser?.prenom,
        email: newUser?.email,
        avatar: newUser?.avatar,
        iscert: newUser?.iscert
      },
      action: 'created'
    });

  } catch (error) {
    console.error('❌ Erreur finalisation inscription:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}