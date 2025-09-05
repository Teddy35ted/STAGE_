// API pour renvoyer l'email d'approbation
// SYSTÈME DÉSACTIVÉ - RETOUR À L'ANCIEN SYSTÈME DIRECT
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Système de renvoi d\'email d\'approbation désactivé',
    info: 'L\'ancien système direct est maintenant utilisé - les comptes sont créés automatiquement et les emails sont envoyés immédiatement',
    redirect: '/admin/dashboard'
  }, { status: 410 }); // 410 Gone - Cette fonctionnalité n'est plus disponible
}
