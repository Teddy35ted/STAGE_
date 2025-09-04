// Diagnostic complet du système Firebase et des APIs
import { NextRequest, NextResponse } from 'next/server';
import { AccountRequestService } from '../../../Backend/services/collections/AccountRequestService';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      projectId: process.env.FIREBASE_PROJECT_ID ? '✅ Défini' : '❌ Manquant',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? '✅ Défini' : '❌ Manquant',
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? '✅ Défini' : '❌ Manquant',
      jwtSecret: process.env.JWT_SECRET ? '✅ Défini' : '❌ Manquant'
    },
    tests: {}
  };

  try {
    console.log('🔍 Test de connexion Firebase...');
    
    // Test 1: Initialisation du service
    const accountRequestService = new AccountRequestService();
    results.tests.serviceInit = '✅ Service initialisé';
    
    // Test 2: Test de lecture de la collection
    try {
      const allRequests = await accountRequestService.getAllRequests();
      results.tests.readCollection = {
        status: '✅ Lecture réussie',
        count: allRequests.length,
        requests: allRequests.map(req => ({
          id: req.id,
          email: req.email,
          status: req.status,
          requestDate: req.requestDate
        }))
      };
    } catch (readError: any) {
      results.tests.readCollection = {
        status: '❌ Erreur lecture',
        error: readError.message,
        code: readError.code
      };
    }
    
    // Test 3: Test d'écriture (création d'une demande test)
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const requestId = await accountRequestService.createRequest({ email: testEmail });
      results.tests.writeCollection = {
        status: '✅ Écriture réussie',
        requestId,
        testEmail
      };
      
      // Supprimer la demande test
      // await accountRequestService.delete(requestId);
      
    } catch (writeError: any) {
      results.tests.writeCollection = {
        status: '❌ Erreur écriture',
        error: writeError.message,
        code: writeError.code
      };
    }
    
  } catch (error: any) {
    results.tests.globalError = {
      message: error.message,
      stack: error.stack
    };
  }

  return NextResponse.json({
    success: true,
    diagnostic: results
  });
}
