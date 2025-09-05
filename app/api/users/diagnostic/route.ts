import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';

const userService = new UserService();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Diagnostic de la base de données utilisateurs...');

    // 1. Vérification de l'intégrité des données
    const integrityCheck = await userService.checkDataIntegrity();
    
    // 2. Compter les utilisateurs
    const totalUsers = await userService.count();
    
    // 3. Tester quelques requêtes
    const sampleUsers = await userService.getAll({ limit: 5, orderBy: 'registerDate', orderDirection: 'desc' });
    
    // 4. Tester la recherche
    let searchTest: any = null;
    try {
      searchTest = await userService.searchUsers('test', { limit: 3 });
    } catch (error) {
      searchTest = { error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
    
    // 5. Tester les filtres
    let filterTest: any = null;
    try {
      filterTest = await userService.getUsersWithFilters({ pays: 'Togo' }, { limit: 3 });
    } catch (error) {
      filterTest = { error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
    
    // 6. Statistiques
    let statsTest: any = null;
    try {
      statsTest = await userService.getUserStatistics();
    } catch (error) {
      statsTest = { error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }

    const diagnostic = {
      timestamp: new Date().toISOString(),
      integrityCheck,
      counts: {
        total: totalUsers,
        sampleRetrieved: sampleUsers.length
      },
      tests: {
        sampleUsers: {
          success: sampleUsers.length > 0,
          count: sampleUsers.length,
          data: sampleUsers.map(u => ({
            id: u.id,
            nom: u.nom,
            email: u.email,
            registerDate: u.registerDate
          }))
        },
        search: {
          success: searchTest && !searchTest.error,
          count: Array.isArray(searchTest) ? searchTest.length : 0,
          error: searchTest?.error || null
        },
        filters: {
          success: filterTest && !filterTest.error,
          count: Array.isArray(filterTest) ? filterTest.length : 0,
          error: filterTest?.error || null
        },
        statistics: {
          success: statsTest && !statsTest.error,
          data: statsTest?.error ? null : statsTest,
          error: statsTest?.error || null
        }
      },
      recommendations: [] as Array<{ type: string; message: string }>
    };

    // Générer des recommandations
    if (integrityCheck.healthStatus !== 'Excellent') {
      diagnostic.recommendations.push({
        type: 'warning',
        message: `Intégrité des données: ${integrityCheck.healthStatus}. ${integrityCheck.itemsWithoutIds} éléments sans ID.`
      });
    }

    if (totalUsers === 0) {
      diagnostic.recommendations.push({
        type: 'info',
        message: 'Aucun utilisateur trouvé. La base de données est vide.'
      });
    }

    if (searchTest?.error) {
      diagnostic.recommendations.push({
        type: 'error',
        message: `Erreur de recherche: ${searchTest.error}`
      });
    }

    if (filterTest?.error) {
      diagnostic.recommendations.push({
        type: 'error',
        message: `Erreur de filtrage: ${filterTest.error}`
      });
    }

    if (statsTest?.error) {
      diagnostic.recommendations.push({
        type: 'error',
        message: `Erreur de statistiques: ${statsTest.error}`
      });
    }

    if (diagnostic.recommendations.length === 0) {
      diagnostic.recommendations.push({
        type: 'success',
        message: 'Tous les tests sont passés avec succès !'
      });
    }

    console.log('✅ Diagnostic terminé');

    return NextResponse.json({
      success: true,
      diagnostic
    });

  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du diagnostic',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
