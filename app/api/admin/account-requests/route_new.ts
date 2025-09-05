// API pour gérer les demandes de compte par les administrateurs
// SYSTÈME DÉSACTIVÉ - RETOUR À L'ANCIEN SYSTÈME DIRECT
import { NextRequest, NextResponse } from 'next/server';

// Récupérer toutes les demandes (conservé pour compatibilité lecture seule)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Système de gestion administrative des demandes désactivé',
    info: 'L\'ancien système direct est maintenant utilisé - les comptes sont créés automatiquement',
    redirect: '/admin/dashboard',
    data: []
  }, { status: 410 }); // 410 Gone
}

// Traitement des demandes (approbation/rejet) - DÉSACTIVÉ
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Système de traitement administratif des demandes désactivé',
    info: 'L\'ancien système direct est maintenant utilisé - les comptes sont créés automatiquement lors de la demande',
    redirect: '/admin/dashboard'
  }, { status: 410 }); // 410 Gone - Cette fonctionnalité n'est plus disponible
}
