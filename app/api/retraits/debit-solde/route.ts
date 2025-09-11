import { NextRequest, NextResponse } from 'next/server';
import { RetraitService } from '../../../Backend/services/collections/RetraitService';

const retraitService = new RetraitService();

export async function POST(request: NextRequest) {
  try {
    const { retraitId, userId } = await request.json();

    if (!retraitId || !userId) {
      return NextResponse.json(
        { error: 'retraitId et userId sont requis' }, 
        { status: 400 }
      );
    }

    // Récupérer le retrait
    const retrait = await retraitService.getById(retraitId);
    
    if (!retrait) {
      return NextResponse.json(
        { error: 'Retrait non trouvé' }, 
        { status: 404 }
      );
    }

    if (retrait.statut !== 'Approuvé') {
      return NextResponse.json(
        { error: 'Le retrait doit être approuvé pour débiter le solde' }, 
        { status: 400 }
      );
    }

    if (retrait.montantDebite) {
      return NextResponse.json(
        { error: 'Le montant a déjà été débité pour ce retrait' }, 
        { status: 400 }
      );
    }

    // Marquer le retrait comme débité
    const retraitMisAJour = {
      ...retrait,
      montantDebite: true
    };

    await retraitService.update(retraitId, retraitMisAJour);

    return NextResponse.json({
      success: true,
      message: 'Solde débité avec succès',
      retraitId,
      montant: retrait.montant
    });

  } catch (error) {
    console.error('❌ Erreur lors du débit du solde:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du débit du solde',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}
