import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../../Backend/services/collections/CoGestionnaireService';
import { UserService } from '../../../Backend/services/collections/UserService';

const coGestionnaireService = new CoGestionnaireService();
const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Vérification email co-gestionnaire...');
    
    const { email } = await request.json();
    
    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Rechercher le co-gestionnaire par email
    const coGestionnaire = await coGestionnaireService.getByEmail(email);
    
    if (!coGestionnaire) {
      console.log('❌ Aucun co-gestionnaire trouvé pour:', email);
      return NextResponse.json(
        { 
          error: 'Co-gestionnaire non trouvé',
          details: 'Aucun co-gestionnaire trouvé avec cet email. Vérifiez que vous avez été invité(e) par un animateur.'
        },
        { status: 404 }
      );
    }

    // Vérifier le statut du co-gestionnaire
    if (coGestionnaire.statut !== 'actif') {
      console.log('❌ Co-gestionnaire inactif:', email, 'Statut:', coGestionnaire.statut);
      return NextResponse.json(
        { 
          error: 'Compte inactif',
          details: 'Votre compte co-gestionnaire a été désactivé. Contactez le propriétaire du compte.'
        },
        { status: 403 }
      );
    }

    // Récupérer les informations du propriétaire pour affichage
    let proprietaireNom = 'Propriétaire';
    try {
      const proprietaire = await userService.getById(coGestionnaire.idProprietaire);
      if (proprietaire) {
        proprietaireNom = `${proprietaire.prenom} ${proprietaire.nom}`;
      }
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer les infos du propriétaire:', error);
    }

    console.log('✅ Co-gestionnaire trouvé:', coGestionnaire.nom, coGestionnaire.prenom);
    
    return NextResponse.json({
      success: true,
      message: 'Co-gestionnaire trouvé',
      coGestionnaire: {
        id: coGestionnaire.id,
        nom: coGestionnaire.nom,
        prenom: coGestionnaire.prenom,
        email: coGestionnaire.email,
        role: coGestionnaire.role,
        statut: coGestionnaire.statut,
        proprietaireId: coGestionnaire.idProprietaire,
        proprietaireNom,
        permissions: coGestionnaire.permissions || []
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur vérification email co-gestionnaire:', error);
    
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
