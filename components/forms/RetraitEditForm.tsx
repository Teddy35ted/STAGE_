'use client';

import React, { useState, useEffect } from 'react';
import { Retrait } from '../../app/models/retrait';
import { useSoldeAnimateur } from '../../hooks/useSoldeAnimateur';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AlertCircle, Wallet, CheckCircle } from 'lucide-react';
import { auth } from '../../app/firebase/config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface RetraitEditFormProps {
  retrait: Retrait | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RetraitEditForm({ retrait, isOpen, onClose, onSuccess }: RetraitEditFormProps) {
  const [montant, setMontant] = useState(0);
  const [tel, setTel] = useState('');
  const [operateur, setOperateur] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { solde, debiterSolde, crediterSolde, peutDebiter } = useSoldeAnimateur();

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  // Charger les données du retrait quand le modal s'ouvre
  useEffect(() => {
    if (retrait && isOpen) {
      setMontant(retrait.montant);
      setTel(retrait.tel);
      setOperateur(retrait.operateur);
      setError(null);
    }
  }, [retrait, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retrait) return;

    setLoading(true);
    setError(null);

    // Validation des champs obligatoires
    if (!tel.trim()) {
      setError('Le numéro de téléphone est obligatoire');
      setLoading(false);
      return;
    }

    if (!operateur) {
      setError('Veuillez sélectionner un opérateur');
      setLoading(false);
      return;
    }

    if (montant <= 0) {
      setError('Le montant doit être supérieur à 0');
      setLoading(false);
      return;
    }

    // Calculer la différence de montant
    const differenceMontant = montant - retrait.montant;
    
    // Vérifier si on a assez de solde pour la différence
    if (differenceMontant > 0 && !peutDebiter(differenceMontant)) {
      setError(`Solde insuffisant pour cette modification. Solde disponible: ${formatMontant(solde)} FCFA`);
      setLoading(false);
      return;
    }

    try {
      // Obtenir le token Firebase
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const token = await user.getIdToken();

      // Modifier le retrait avec authentification
      const response = await fetch(`/api/retraits/${retrait.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ montant, tel, operateur }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API modification:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la modification');
      }

      // Ajuster le solde selon la différence
      if (differenceMontant > 0) {
        // Montant augmenté, débiter la différence
        debiterSolde(differenceMontant);
      } else if (differenceMontant < 0) {
        // Montant réduit, créditer la différence
        crediterSolde(Math.abs(differenceMontant));
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de la modification du retrait');
    } finally {
      setLoading(false);
    }
  };

  if (!retrait) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Modifier la Demande de Retrait
          </DialogTitle>
        </DialogHeader>

        {/* Affichage du solde disponible */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Wallet className="w-4 h-4" />
            <span className="font-medium">Solde disponible:</span>
            <span className="font-bold">{formatMontant(solde)} FCFA</span>
          </div>
          <div className="text-sm text-blue-600 mt-1">
            Montant actuel du retrait: {formatMontant(retrait.montant)} FCFA
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-2">
              Montant à retirer (FCFA) *
            </label>
            <Input 
              id="montant" 
              type="number" 
              min="1"
              value={montant || ''} 
              onChange={(e) => setMontant(Number(e.target.value))} 
              placeholder="Entrez le montant"
              className={`${montant > (solde + retrait.montant) && montant > 0 ? 'border-red-300 bg-red-50' : ''}`}
              required 
            />
            {montant > (solde + retrait.montant) && montant > 0 && (
              <p className="text-red-600 text-xs mt-1">
                Montant trop élevé (solde + montant actuel disponible)
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="tel" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone *
            </label>
            <Input 
              id="tel" 
              type="tel"
              value={tel} 
              onChange={(e) => setTel(e.target.value)} 
              placeholder="Ex: +228 99 99 99 99"
              className={`${!tel.trim() && tel !== '' ? 'border-red-300 bg-red-50' : ''}`}
              required
            />
          </div>
          
          <div>
            <label htmlFor="operateur" className="block text-sm font-medium text-gray-700 mb-2">
              Opérateur de paiement mobile *
            </label>
            <select
              id="operateur"
              value={operateur}
              onChange={(e) => setOperateur(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${!operateur ? 'border-red-300 bg-red-50' : ''}`}
              required
            >
              <option value="">Sélectionnez un opérateur</option>
              <option value="Flooz">Flooz</option>
              <option value="Mix by Yas">Mix by Yas</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !tel.trim() || !operateur || montant <= 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Modification...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Modifier le retrait
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
