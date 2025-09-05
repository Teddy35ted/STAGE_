// API de diagnostic pour tester la chaîne complète des demandes de compte
import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';
import { testFirebaseConnection, validateFirebaseConfig } from '../../../Backend/config/firebase-admin';

export async function GET() {
  console.log('🔍 DIAGNOSTIC COMPLET - Demandes de compte');
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: { success: 0, failed: 0 },
    errors: []
  };

  try {
    // Test 1: Configuration Firebase
    console.log('� Test 1: Configuration Firebase...');
    try {
      validateFirebaseConfig();
      await testFirebaseConnection();
      results.tests.firebaseConfig = { status: '✅', message: 'Configuration Firebase valide' };
      results.summary.success++;
    } catch (error: any) {
      results.tests.firebaseConfig = { status: '❌', error: error.message };
      results.summary.failed++;
      results.errors.push(`Firebase Config: ${error.message}`);
    }

    // Test 2: Instanciation du service
    console.log('📡 Test 2: Instanciation AccountRequestService...');
    try {
      const accountRequestService = new AccountRequestService();
      results.tests.serviceInstantiation = { status: '✅', message: 'Service instancié' };
      results.summary.success++;
      
      // Test 3: Récupération des demandes existantes
      console.log('📡 Test 3: Récupération des demandes existantes...');
      try {
        const existingRequests = await accountRequestService.getAllRequests();
        results.tests.getAllRequests = { 
          status: '✅', 
          message: `${existingRequests.length} demandes trouvées`,
          data: existingRequests.map(r => ({ id: r.id, email: r.email, status: r.status }))
        };
        results.summary.success++;
        
        // Test 4: Création d'une demande de test
        console.log('📡 Test 4: Création d\'une demande de test...');
        try {
          const testEmail = `test-diagnostic-${Date.now()}@firebase.test`;
          const requestId = await accountRequestService.createRequest({ email: testEmail });
          results.tests.createRequest = { 
            status: '✅', 
            message: `Demande créée avec ID: ${requestId}`,
            data: { requestId, email: testEmail }
          };
          results.summary.success++;
          
          // Test 5: Récupération de la demande créée
          console.log('📡 Test 5: Récupération de la demande créée...');
          try {
            const createdRequest = await accountRequestService.getById(requestId);
            if (createdRequest) {
              results.tests.getByIdRequest = { 
                status: '✅', 
                message: 'Demande récupérée par ID',
                data: { 
                  id: createdRequest.id, 
                  email: createdRequest.email,
                  status: createdRequest.status,
                  requestDate: createdRequest.requestDate
                }
              };
              results.summary.success++;
              
              // Test 6: Vérification dans getAllRequests
              console.log('📡 Test 6: Vérification dans la liste complète...');
              try {
                const updatedRequests = await accountRequestService.getAllRequests();
                const foundInList = updatedRequests.find(r => r.id === requestId);
                if (foundInList) {
                  results.tests.verifyInList = { 
                    status: '✅', 
                    message: 'Demande trouvée dans la liste complète',
                    data: { totalRequests: updatedRequests.length }
                  };
                  results.summary.success++;
                } else {
                  results.tests.verifyInList = { 
                    status: '❌', 
                    error: 'Demande créée mais non trouvée dans getAllRequests()' 
                  };
                  results.summary.failed++;
                  results.errors.push('Incohérence: demande créée mais non listée');
                }
              } catch (error: any) {
                results.tests.verifyInList = { status: '❌', error: error.message };
                results.summary.failed++;
                results.errors.push(`VerifyInList: ${error.message}`);
              }
              
            } else {
              results.tests.getByIdRequest = { 
                status: '❌', 
                error: 'Demande créée mais non récupérable par ID' 
              };
              results.summary.failed++;
              results.errors.push('Création réussie mais récupération échouée');
            }
          } catch (error: any) {
            results.tests.getByIdRequest = { status: '❌', error: error.message };
            results.summary.failed++;
            results.errors.push(`GetById: ${error.message}`);
          }
          
        } catch (error: any) {
          results.tests.createRequest = { status: '❌', error: error.message };
          results.summary.failed++;
          results.errors.push(`CreateRequest: ${error.message}`);
        }
        
      } catch (error: any) {
        results.tests.getAllRequests = { status: '❌', error: error.message };
        results.summary.failed++;
        results.errors.push(`GetAllRequests: ${error.message}`);
      }
      
    } catch (error: any) {
      results.tests.serviceInstantiation = { status: '❌', error: error.message };
      results.summary.failed++;
      results.errors.push(`Service: ${error.message}`);
    }
    
  } catch (globalError: any) {
    results.errors.push(`Global: ${globalError.message}`);
    results.summary.failed++;
  }

  // Résumé final
  const isSuccess = results.summary.failed === 0;
  console.log(`🎯 DIAGNOSTIC TERMINÉ: ${results.summary.success} succès, ${results.summary.failed} échecs`);
  
  return NextResponse.json({
    success: isSuccess,
    message: isSuccess ? 
      '✅ Tous les tests sont passés - Système fonctionnel' : 
      `❌ ${results.summary.failed} tests échoués`,
    ...results
  }, { 
    status: isSuccess ? 200 : 500 
  });
}
