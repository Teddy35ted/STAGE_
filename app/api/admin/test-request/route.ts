import { NextRequest, NextResponse } from 'next/server';

/**
 * Route de test pour créer une demande de compte rapidement
 * GET /api/admin/test-request - Crée une demande test
 */
export async function GET(request: NextRequest) {
  try {
    // Créer une demande test simple
    const response = await fetch(`${request.nextUrl.origin}/api/auth/request-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test.user@example.com',
        role: 'animateur'
      })
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Demande test créée avec succès',
        requestId: result.requestId
      });
    } else {
      const error = await response.json();
      return NextResponse.json({
        success: false,
        error: error.error || 'Erreur lors de la création de la demande test'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Erreur création demande test:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la création de la demande test'
    }, { status: 500 });
  }
}
