'use client';

import React from 'react';
import { useSoldeAnimateur } from '../../hooks/useSoldeAnimateur';

export function TestSolde() {
  const { solde, loading, peutDebiter } = useSoldeAnimateur();

  if (loading) {
    return <div>Chargement du solde...</div>;
  }

  return (
    <div className="bg-blue-100 p-4 rounded-lg">
      <h3>Test du solde</h3>
      <p>Solde actuel: {solde} FCFA</p>
      <p>Peut débiter 1000 FCFA: {peutDebiter(1000) ? 'Oui' : 'Non'}</p>
    </div>
  );
}
