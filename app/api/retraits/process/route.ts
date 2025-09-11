import { NextRequest, NextResponse } from 'next/server';
import { RetraitService } from '../../../Backend/services/collections/RetraitService';

const retraitService = new RetraitService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Démarrage du processus de traitement automatique des retraits...');
    
    // Récupérer tous les retraits en attente
    const retraits = await retraitService.getAll();
    const retraitsEnAttente = retraits.filter(retrait => 
      retrait.statut === 'En attente' && 
      retrait.dateTraitement && 
      new Date(retrait.dateTraitement) <= new Date()
    );

    console.log(`📋 ${retraitsEnAttente.length} retraits trouvés prêts pour traitement`);

    const retraitsTraites = [];

    for (const retrait of retraitsEnAttente) {
      try {
        // Mettre à jour le statut du retrait
        const retraitMisAJour = {
          ...retrait,
          statut: 'Approuvé' as const,
          dateApprobation: new Date().toISOString(),
          istraite: true,
          operation: `Retrait approuvé de ${retrait.montant} FCFA via ${retrait.operateur}`
        };

        await retraitService.update(retrait.id, retraitMisAJour);
        
        retraitsTraites.push({
          id: retrait.id,
          montant: retrait.montant,
          statut: 'Approuvé'
        });

        console.log(`✅ Retrait ${retrait.id} approuvé automatiquement`);
      } catch (error) {
        console.error(`❌ Erreur lors du traitement du retrait ${retrait.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${retraitsTraites.length} retraits traités avec succès`,
      retraitsTraites
    });

  } catch (error) {
    console.error('❌ Erreur lors du traitement automatique des retraits:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du traitement automatique des retraits',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// Endpoint pour vérifier les retraits en attente (GET)
export async function GET(request: NextRequest) {
  try {
    const retraits = await retraitService.getAll();
    const retraitsEnAttente = retraits.filter(retrait => 
      retrait.statut === 'En attente' && 
      retrait.dateTraitement
    );

    const retraitsPretsTraitement = retraitsEnAttente.filter(retrait =>
      new Date(retrait.dateTraitement!) <= new Date()
    );

    return NextResponse.json({
      totalEnAttente: retraitsEnAttente.length,
      pretsTraitement: retraitsPretsTraitement.length,
      retraits: retraitsEnAttente.map(retrait => ({
        id: retrait.id,
        montant: retrait.montant,
        dateCreation: retrait.dateCreation,
        dateTraitement: retrait.dateTraitement,
        tempsRestant: retrait.dateTraitement ? 
          Math.max(0, new Date(retrait.dateTraitement).getTime() - new Date().getTime()) : 0
      }))
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des retraits en attente:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des retraits en attente' }, 
      { status: 500 }
    );
  }
}
