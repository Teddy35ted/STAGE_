import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test du flux d\'authentification');
    
    // Vérifier les headers
    const authHeader = request.headers.get('authorization');
    const contentType = request.headers.get('content-type');
    
    console.log('📋 Headers reçus:');
    console.log('- Authorization:', authHeader ? 'PRÉSENT' : 'ABSENT');
    console.log('- Content-Type:', contentType);
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Token d\'authentification manquant',
        details: 'Header Authorization absent',
        headers: {
          authorization: 'ABSENT',
          contentType
        }
      }, { status: 401 });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Format de token invalide',
        details: 'Le token doit commencer par "Bearer "',
        receivedHeader: authHeader.substring(0, 20) + '...'
      }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token vide',
        details: 'Aucun token après "Bearer "',
      }, { status: 401 });
    }
    
    console.log('🔑 Token reçu (premiers caractères):', token.substring(0, 20) + '...');
    
    // Tester la vérification du token
    try {
      const { adminAuth } = await import('../../Backend/config/firebase-admin');
      console.log('🔥 Firebase Admin Auth importé');
      
      const decodedToken = await adminAuth.verifyIdToken(token);
      console.log('✅ Token vérifié avec succès');
      console.log('👤 UID:', decodedToken.uid);
      console.log('📧 Email:', decodedToken.email);
      
      return NextResponse.json({
        success: true,
        message: 'Authentification réussie',
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          authTime: decodedToken.auth_time,
          iat: decodedToken.iat,
          exp: decodedToken.exp
        },
        token: {
          length: token.length,
          preview: token.substring(0, 20) + '...'
        }
      });
      
    } catch (authError) {
      console.error('❌ Erreur vérification token:', authError);
      
      return NextResponse.json({
        success: false,
        error: 'Token invalide',
        details: authError instanceof Error ? authError.message : 'Erreur inconnue',
        token: {
          length: token.length,
          preview: token.substring(0, 20) + '...'
        }
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test POST avec authentification');
    
    // Vérifier l'authentification
    const authResult = await testAuth(request);
    
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }
    
    // Lire le body
    const body = await request.json();
    console.log('📝 Body reçu:', body);
    
    // Tester une opération CRUD simple
    try {
      const { adminDb } = await import('../../Backend/config/firebase-admin');
      
      // Créer un document de test
      const testDoc = {
        message: 'Test CRUD avec auth',
        userId: authResult.user.uid,
        timestamp: new Date().toISOString(),
        data: body
      };
      
      const docRef = await adminDb.collection('_test_auth').add(testDoc);
      console.log('✅ Document créé:', docRef.id);
      
      // Lire le document
      const createdDoc = await docRef.get();
      const docData = createdDoc.data();
      
      // Supprimer le document
      await docRef.delete();
      console.log('🗑️ Document supprimé');
      
      return NextResponse.json({
        success: true,
        message: 'Test CRUD avec authentification réussi',
        auth: authResult.user,
        operation: {
          created: docRef.id,
          data: docData,
          deleted: true
        }
      });
      
    } catch (crudError) {
      console.error('❌ Erreur CRUD:', crudError);
      
      return NextResponse.json({
        success: false,
        error: 'Erreur opération CRUD',
        details: crudError instanceof Error ? crudError.message : 'Erreur inconnue',
        auth: authResult.user
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Erreur POST:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur POST',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Fonction utilitaire pour tester l'auth
async function testAuth(request: NextRequest) {
  try {
    const { verifyAuth } = await import('../../Backend/utils/authVerifier');
    const auth = await verifyAuth(request);
    
    if (!auth) {
      return {
        success: false,
        error: 'Authentification échouée',
        details: 'verifyAuth a retourné null'
      };
    }
    
    return {
      success: true,
      user: {
        uid: auth.uid,
        token: 'PRÉSENT'
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: 'Erreur vérification auth',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}