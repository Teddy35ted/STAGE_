import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';

const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Finalisation de l\'inscription utilisateur...');
    
    const userData = await request.json();
    console.log('📋 Données utilisateur reçues:', { ...userData, newPassword: userData.newPassword ? '***' : undefined });

    // Validation des données requises
    if (!userData.nom || !userData.prenom || !userData.email) {
      return NextResponse.json({
        success: false,
        error: 'Nom, prénom et email sont requis'
      }, { status: 400 });
    }

    // Validation du nouveau mot de passe
    if (!userData.newPassword || userData.newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Un nouveau mot de passe d\'au moins 6 caractères est requis'
      }, { status: 400 });
    }

    // Trouver l'utilisateur par email
    const existingUser = await userService.getByEmail(userData.email);
    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé'
      }, { status: 404 });
    }

    console.log('👤 Utilisateur trouvé, mise à jour du profil et mot de passe...');
    
    // Préparer les données de mise à jour
    const updateData: any = {
      nom: userData.nom,
      prenom: userData.prenom,
      tel: userData.tel || '00000000',
      date_de_naissance: userData.date_de_naissance || '1990-01-01',
      sexe: userData.sexe || 'Masculin',
      pays: userData.pays || 'Togo',
      ville: userData.ville || 'Lomé',
      quartier: userData.quartier || '',
      region: userData.region || '',
      codePays: userData.codePays || '+228',
      requiresPasswordChange: false // Plus besoin de changer le mot de passe
    };
    
    // Hasher et inclure le nouveau mot de passe
    console.log('🔐 Mise à jour du mot de passe...');
    const bcrypt = await import('bcryptjs');
    updateData.password = await bcrypt.hash(userData.newPassword, 10);
    console.log('✅ Mot de passe mis à jour et hashé');
    
    // Mettre à jour avec les vraies données
    await userService.update(existingUser.id!, updateData);
    
    const updatedUser = await userService.getById(existingUser.id!);
    
    return NextResponse.json({
      success: true,
      message: 'Profil complété avec succès',
      user: {
        id: updatedUser?.id,
        nom: updatedUser?.nom,
        prenom: updatedUser?.prenom,
        email: updatedUser?.email,
        avatar: updatedUser?.avatar,
        iscert: updatedUser?.iscert
      },
      action: 'completed'
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la finalisation:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la finalisation du profil'
    }, { status: 500 });
  }
}