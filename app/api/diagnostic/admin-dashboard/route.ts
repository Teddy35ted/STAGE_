// API de diagnostic spécifique pour l'admin dashboard
import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';
import jwt from 'jsonwebtoken';

const accountRequestService = new AccountRequestService();

export async function GET(request: NextRequest) {
  console.log('🔍 DIAGNOSTIC ADMIN DASHBOARD');
  
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: { success: 0, failed: 0 },
    errors: []
  };

  try {
    // Test 1: Génération d'un token admin valide pour les tests
    console.log('📡 Test 1: Génération token admin...');
    try {
      const adminToken = jwt.sign({
        adminId: 'test-admin-diagnostic',
        email: 'admin@diagnostic.test',
        permissions: ['manage-accounts']
      }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '1h' });
      
      results.tests.tokenGeneration = { 
        status: '✅', 
        message: 'Token admin généré',
        data: { tokenLength: adminToken.length }
      };
      results.summary.success++;
      
      // Test 2: Vérification du token
      console.log('📡 Test 2: Vérification token...');
      try {
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET || 'default-secret');
        results.tests.tokenVerification = { 
          status: '✅', 
          message: 'Token vérifié avec succès',
          data: decoded
        };
        results.summary.success++;
        
        // Test 3: Simulation appel API admin avec token
        console.log('📡 Test 3: Simulation appel API admin...');
        try {
          // Simuler la logique de /api/admin/account-requests
          const authHeader = `Bearer ${adminToken}`;
          const token = authHeader.substring(7);
          const adminPayload = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
          
          if (!adminPayload.adminId || !adminPayload.permissions.includes('manage-accounts')) {
            throw new Error('Permissions insuffisantes');
          }
          
          // Récupérer les demandes comme le fait l'API
          const allRequests = await accountRequestService.getAllRequests();
          
          results.tests.adminApiSimulation = { 
            status: '✅', 
            message: `API admin simulée avec succès`,
            data: { 
              requestsFound: allRequests.length,
              adminId: adminPayload.adminId,
              permissions: adminPayload.permissions
            }
          };
          results.summary.success++;
          
          // Test 4: Vérification données conformes au dashboard
          console.log('📡 Test 4: Vérification format données...');
          try {
            const sampleRequests = allRequests.slice(0, 3); // Prendre quelques échantillons
            
            for (const req of sampleRequests) {
              if (!req.id || !req.email || !req.status || !req.requestDate) {
                throw new Error(`Demande malformée: ${JSON.stringify(req)}`);
              }
              
              if (!['pending', 'approved', 'rejected'].includes(req.status)) {
                throw new Error(`Status invalide: ${req.status}`);
              }
            }
            
            results.tests.dataFormatValidation = { 
              status: '✅', 
              message: 'Format des données valide pour le dashboard',
              data: { 
                totalRequests: allRequests.length,
                pending: allRequests.filter((r: any) => r.status === 'pending').length,
                approved: allRequests.filter((r: any) => r.status === 'approved').length,
                rejected: allRequests.filter((r: any) => r.status === 'rejected').length
              }
            };
            results.summary.success++;
            
          } catch (error: any) {
            results.tests.dataFormatValidation = { status: '❌', error: error.message };
            results.summary.failed++;
            results.errors.push(`DataFormat: ${error.message}`);
          }
          
        } catch (error: any) {
          results.tests.adminApiSimulation = { status: '❌', error: error.message };
          results.summary.failed++;
          results.errors.push(`AdminAPI: ${error.message}`);
        }
        
      } catch (error: any) {
        results.tests.tokenVerification = { status: '❌', error: error.message };
        results.summary.failed++;
        results.errors.push(`TokenVerif: ${error.message}`);
      }
      
    } catch (error: any) {
      results.tests.tokenGeneration = { status: '❌', error: error.message };
      results.summary.failed++;
      results.errors.push(`TokenGen: ${error.message}`);
    }
    
  } catch (globalError: any) {
    results.errors.push(`Global: ${globalError.message}`);
    results.summary.failed++;
  }

  // Test bonus: Créer une demande de test pour l'admin
  console.log('📡 Test Bonus: Création demande de test pour admin...');
  try {
    const testEmail = `admin-test-${Date.now()}@diagnostic.com`;
    const requestId = await accountRequestService.createRequest({ email: testEmail });
    
    results.tests.createTestRequestForAdmin = { 
      status: '✅', 
      message: 'Demande de test créée pour l\'admin',
      data: { requestId, email: testEmail }
    };
    results.summary.success++;
    
  } catch (error: any) {
    results.tests.createTestRequestForAdmin = { status: '❌', error: error.message };
    results.summary.failed++;
    results.errors.push(`CreateTest: ${error.message}`);
  }

  // Résumé final
  const isSuccess = results.summary.failed === 0;
  console.log(`🎯 DIAGNOSTIC ADMIN TERMINÉ: ${results.summary.success} succès, ${results.summary.failed} échecs`);
  
  return NextResponse.json({
    success: isSuccess,
    message: isSuccess ? 
      '✅ Dashboard admin entièrement fonctionnel' : 
      `❌ ${results.summary.failed} problèmes détectés`,
    ...results
  }, { 
    status: isSuccess ? 200 : 500 
  });
}
