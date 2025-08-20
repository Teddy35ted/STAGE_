import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // TODO: Implémenter la logique de vérification d'email
    
    return NextResponse.json({
      success: true,
      message: 'Email vérifié'
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}