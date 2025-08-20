'use client';

import React from 'react';
import { Wallet, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useSoldeAnimateur } from '../../hooks/useSoldeAnimateur';
import { useState } from 'react';

interface SoldeCardProps {
  className?: string;
}

export function SoldeCard({ className = '' }: SoldeCardProps) {
  const { solde, loading } = useSoldeAnimateur();
  const [masquerSolde, setMasquerSolde] = useState(false);

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-32"></div>
              </div>
            </div>
          </div>
          <div className="h-8 bg-white/20 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Mon Solde</h3>
            <p className="text-white/80 text-sm">Disponible pour retrait</p>
          </div>
        </div>
        
        <button
          onClick={() => setMasquerSolde(!masquerSolde)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title={masquerSolde ? "Afficher le solde" : "Masquer le solde"}
        >
          {masquerSolde ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">
          {masquerSolde ? "••••••" : formatMontant(solde)}
        </span>
        <span className="text-white/80 font-medium">FCFA</span>
      </div>
      
      <div className="flex items-center gap-2 mt-4 text-white/80">
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm">Mis à jour en temps réel</span>
      </div>
    </div>
  );
}
