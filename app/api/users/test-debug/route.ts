import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';

const userService = new UserService();

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test comparatif UserService...');

    // Test 1: getAll() comme utilisé dans l'API users
    console.log('🔍 Test 1: userService.getAll()');
    const test1 = await userService.getAll({ limit: 10, orderBy: 'createdAt', orderDirection: 'desc' });
    console.log(`✅ Test 1 résultats: ${test1.length} utilisateurs`);
    
    // Test 2: getAll() comme utilisé dans checkDataIntegrity
    console.log('🔍 Test 2: checkDataIntegrity');
    const test2 = await userService.checkDataIntegrity();
    console.log(`✅ Test 2 résultats: ${test2.totalItems} utilisateurs`);
    
    // Test 3: getAll() avec options différentes
    console.log('🔍 Test 3: userService.getAll() sans limite');
    const test3 = await userService.getAll();
    console.log(`✅ Test 3 résultats: ${test3.length} utilisateurs`);
    
    // Test 4: count()
    console.log('🔍 Test 4: userService.count()');
    const test4 = await userService.count();
    console.log(`✅ Test 4 résultats: ${test4} utilisateurs`);

    return NextResponse.json({
      success: true,
      tests: {
        getAllWithOptions: {
          count: test1.length,
          data: test1.map(u => ({ id: u.id, email: u.email, nom: u.nom }))
        },
        integrityCheck: {
          count: test2.totalItems,
          data: test2
        },
        getAllDefault: {
          count: test3.length,
          data: test3.map(u => ({ id: u.id, email: u.email, nom: u.nom }))
        },
        countMethod: {
          count: test4
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur test comparatif:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
