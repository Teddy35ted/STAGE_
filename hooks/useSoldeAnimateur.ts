'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SoldeData {
  soldeActuel: number;
  derniereMiseAJour: string;
}

export function useSoldeAnimateur() {
  const { user } = useAuth();
  const [solde, setSolde] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Génère un solde aléatoire basé sur l'UID de l'utilisateur pour qu'il soit constant
  const generateSoldeForUser = (userId: string): number => {
    // Utilise l'UID comme seed pour un nombre pseudo-aléatoire reproductible
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Génère un solde entre 50,000 et 500,000 FCFA
    const min = 50000;
    const max = 500000;
    const randomValue = Math.abs(hash) % (max - min + 1);
    return min + randomValue;
  };

  // Récupère le solde depuis localStorage ou génère un nouveau
  const getSoldeFromStorage = (userId: string): SoldeData => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      // Côté serveur, retourne un solde par défaut
      return {
        soldeActuel: generateSoldeForUser(userId),
        derniereMiseAJour: new Date().toISOString()
      };
    }

    const key = `solde_animateur_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Si erreur de parsing, génère un nouveau solde
      }
    }
    
    // Génère un nouveau solde
    const nouveauSolde = generateSoldeForUser(userId);
    const soldeData: SoldeData = {
      soldeActuel: nouveauSolde,
      derniereMiseAJour: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(soldeData));
    return soldeData;
  };

  // Sauvegarde le solde dans localStorage
  const saveSoldeToStorage = (userId: string, nouveauSolde: number) => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      // Côté serveur, on ne peut pas sauvegarder
      setSolde(nouveauSolde);
      return;
    }

    const key = `solde_animateur_${userId}`;
    const soldeData: SoldeData = {
      soldeActuel: nouveauSolde,
      derniereMiseAJour: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(soldeData));
    setSolde(nouveauSolde);
  };

  // Initialise le solde au chargement
  useEffect(() => {
    if (user?.uid) {
      const soldeData = getSoldeFromStorage(user.uid);
      setSolde(soldeData.soldeActuel);
      setLoading(false);
    }
  }, [user?.uid]);

  // Fonction pour débiter le solde
  const debiterSolde = (montant: number): boolean => {
    if (!user?.uid) return false;
    
    const nouveauSolde = solde - montant;
    if (nouveauSolde < 0) {
      return false; // Solde insuffisant
    }
    
    saveSoldeToStorage(user.uid, nouveauSolde);
    return true;
  };

  // Fonction pour créditer le solde (si besoin)
  const crediterSolde = (montant: number) => {
    if (!user?.uid) return;
    
    const nouveauSolde = solde + montant;
    saveSoldeToStorage(user.uid, nouveauSolde);
  };

  // Fonction pour vérifier si un montant peut être débité
  const peutDebiter = (montant: number): boolean => {
    return montant <= solde && montant > 0;
  };

  return {
    solde,
    loading,
    debiterSolde,
    crediterSolde,
    peutDebiter,
    setSolde: (nouveauSolde: number) => {
      if (user?.uid) {
        saveSoldeToStorage(user.uid, nouveauSolde);
      }
    }
  };
}
