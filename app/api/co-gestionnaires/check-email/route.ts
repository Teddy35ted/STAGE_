import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../../Backend/services/collections/CoGestionnaireService';

const coGestionnaireService = new CoGestionnaireService();

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
          exists: false,
          message: 'Aucun co-gestionnaire trouvé avec cet email'
        },
        { status: 200 }
      );
    }

    // Vérifier le statut du co-gestionnaire
    if (coGestionnaire.statut !== 'actif') {
      console.log('❌ Co-gestionnaire inactif:', email, 'Statut:', coGestionnaire.statut);
      return NextResponse.json(
        { 
          exists: false,
          message: 'Votre compte co-gestionnaire a été désactivé. Contactez le propriétaire du compte.'
        },
        { status: 200 }
      );
    }

    console.log('✅ Co-gestionnaire trouvé et actif:', email);
    return NextResponse.json(
      { 
        exists: true,
        message: 'Co-gestionnaire trouvé'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Erreur vérification email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'email' },
      { status: 500 }
    );
  }
}
