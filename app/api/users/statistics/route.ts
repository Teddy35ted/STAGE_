import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const userService = new UserService();

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API statistics users appelée');
    
    // Vérification d'authentification (optionnelle)
    // const auth = await verifyAuth(request);
    // if (!auth) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const stats = await userService.getUserStatistics();

    console.log('✅ Statistiques récupérées');

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Erreur API statistics users:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du calcul des statistiques'
    }, { status: 500 });
  }
}
