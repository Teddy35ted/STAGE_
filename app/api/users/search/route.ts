import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API search users appelée');
    
    // Vérification d'authentification (optionnelle selon vos besoins)
    // const auth = await verifyAuth(request);
    // if (!auth) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchTerm, filters, pagination } = await request.json();

    console.log('📋 Paramètres de recherche:', {
      searchTerm,
      filters,
      pagination
    });

    let results = [];

    if (searchTerm && searchTerm.trim() !== '') {
      // Recherche textuelle
      results = await userService.searchUsers(searchTerm, pagination || {});
    } else if (filters && Object.keys(filters).length > 0) {
      // Recherche avec filtres
      results = await userService.getUsersWithFilters(filters, pagination || {});
    } else {
      // Récupération de tous les utilisateurs
      results = await userService.getAll(pagination || { limit: 50 });
    }

    // Retirer les mots de passe pour la sécurité
    const safeResults = results.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    console.log(`✅ ${safeResults.length} utilisateurs trouvés`);

    return NextResponse.json({
      success: true,
      data: safeResults,
      total: safeResults.length,
      pagination: pagination || {}
    });

  } catch (error) {
    console.error('❌ Erreur API search users:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la recherche des utilisateurs'
    }, { status: 500 });
  }
}
