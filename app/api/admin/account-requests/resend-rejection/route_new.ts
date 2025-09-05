// API pour renvoyer l'email de rejet
// SYSTÈME DÉSACTIVÉ - RETOUR À L'ANCIEN SYSTÈME DIRECT
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Système de renvoi d\'email de rejet désactivé',
    info: 'L\'ancien système direct est maintenant utilisé - plus de rejets nécessaires car les comptes sont créés automatiquement',
    redirect: '/admin/dashboard'
  }, { status: 410 }); // 410 Gone - Cette fonctionnalité n'est plus disponible
}
