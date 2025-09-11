'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSoldeAnimateur } from './useSoldeAnimateur';

export function useRetraitAutoProcessor() {
  const { user } = useAuth();
  const { debiterSolde } = useSoldeAnimateur();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const processRetraits = async () => {
    try {
      console.log('🔄 Vérification des retraits à traiter...');
      
      // Déclencher le traitement automatique
      const processResponse = await fetch('/api/retraits/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (processResponse.ok) {
        const processResult = await processResponse.json();
        
        if (processResult.retraitsTraites && processResult.retraitsTraites.length > 0) {
          console.log(`✅ ${processResult.retraitsTraites.length} retraits traités`);
          
          // Débiter le solde pour chaque retrait approuvé
          for (const retrait of processResult.retraitsTraites) {
            if (retrait.statut === 'Approuvé') {
              const debitReussi = debiterSolde(retrait.montant);
              
              if (debitReussi) {
                // Marquer le retrait comme débité
                await fetch('/api/retraits/debit-solde', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    retraitId: retrait.id,
                    userId: user?.uid
                  }),
                });
                
                console.log(`💰 Solde débité pour le retrait ${retrait.id}: ${retrait.montant} FCFA`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement automatique:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Traitement initial
      processRetraits();
      
      // Traitement périodique toutes les 30 secondes
      intervalRef.current = setInterval(processRetraits, 30000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [user]);

  return { processRetraits };
}
