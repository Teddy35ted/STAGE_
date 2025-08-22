import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../../Backend/services/collections/CoGestionnaireService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

// ENDPOINT TEMPORAIRE POUR DEBUG DES PERMISSIONS
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coGestionnaireService = new CoGestionnaireService();
    
    // Récupérer TOUS les co-gestionnaires pour debug
    const allCoGestionnaires = await coGestionnaireService.getAll();
    
    const debugData = allCoGestionnaires.map(cg => ({
      id: cg.id,
      nom: cg.nom,
      prenom: cg.prenom,
      email: cg.email,
      ACCES: cg.ACCES,
      permissions: cg.permissions,
      permissionsType: typeof cg.permissions,
      permissionsIsArray: Array.isArray(cg.permissions),
      permissionsLength: cg.permissions?.length,
      permissionsStringified: JSON.stringify(cg.permissions),
      hasLaalasPermission: cg.permissions?.some(p => p.resource === 'laalas'),
      hasContenusPermission: cg.permissions?.some(p => p.resource === 'contenus'),
      laalasActions: cg.permissions?.find(p => p.resource === 'laalas')?.actions,
      contenusActions: cg.permissions?.find(p => p.resource === 'contenus')?.actions
    }));

    return NextResponse.json({
      message: 'Debug des permissions des co-gestionnaires',
      totalCoGestionnaires: allCoGestionnaires.length,
      data: debugData
    });

  } catch (error) {
    console.error('❌ Erreur debug permissions:', error);
    return NextResponse.json({ 
      error: 'Erreur interne',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
