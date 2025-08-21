import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../../Backend/services/collections/CoGestionnaireService';

export async function GET(request: NextRequest) {
  try {
    const coGestionnaireService = new CoGestionnaireService();
    
    // Récupérer tous les co-gestionnaires
    const coGestionnaires = await coGestionnaireService.getAll();
    
    // Nettoyer les données sensibles
    const publicData = coGestionnaires.map(cg => ({
      id: cg.id,
      email: cg.email,
      nom: cg.nom,
      prenom: cg.prenom,
      permissions: cg.permissions,
      statut: cg.statut,
      dateCreation: cg.dateCreation,
      isPasswordSet: cg.isPasswordSet,
      lastLogin: cg.lastLogin || 'Jamais connecté'
    }));

    return NextResponse.json({
      count: publicData.length,
      coGestionnaires: publicData
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des co-gestionnaires:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
