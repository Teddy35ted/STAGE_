import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';

const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    const { userId, profileData } = await request.json();

    // Validation des données
    if (!userId || !profileData) {
      return NextResponse.json({
        success: false,
        error: 'ID utilisateur et données de profil requis'
      }, { status: 400 });
    }

    // Validation des champs essentiels
    const requiredFields = ['nom', 'prenom', 'tel', 'pays'];
    const missingFields = requiredFields.filter(field => 
      !profileData[field] || profileData[field].trim() === ''
    );

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Champs requis manquants: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Validation du sexe si fourni
    if (profileData.sexe && !['Masculin', 'Féminin', 'Autre'].includes(profileData.sexe)) {
      return NextResponse.json({
        success: false,
        error: 'Valeur de sexe invalide'
      }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe
    const user = await userService.getById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé'
      }, { status: 404 });
    }

    // Compléter le profil
    await userService.completeProfile(userId, {
      nom: profileData.nom?.trim(),
      prenom: profileData.prenom?.trim(),
      tel: profileData.tel?.trim(),
      date_de_naissance: profileData.date_de_naissance,
      sexe: profileData.sexe,
      pays: profileData.pays?.trim(),
      ville: profileData.ville?.trim(),
      quartier: profileData.quartier?.trim(),
      region: profileData.region?.trim(),
      codePays: profileData.codePays?.trim()
    });

    return NextResponse.json({
      success: true,
      message: 'Profil complété avec succès',
      nextStep: 'dashboard'
    });

  } catch (error) {
    console.error('❌ Erreur complétion profil:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
