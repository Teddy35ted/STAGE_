'use client';

import React, { useState } from 'react';
import { Retrait } from '../../app/models/retrait';
import { apiFetch } from '../../lib/api';
import { useSoldeAnimateur } from '../../hooks/useSoldeAnimateur';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AlertCircle, Wallet, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface RetraitFormProps {
  onSuccess: () => void;
}

export function RetraitForm({ onSuccess }: RetraitFormProps) {
  const [montant, setMontant] = useState(0);
  const [tel, setTel] = useState('');
  const [rib, setRib] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { solde, debiterSolde, peutDebiter } = useSoldeAnimateur();

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérification du solde avant la demande
    if (!peutDebiter(montant)) {
      setError(`Solde insuffisant. Votre solde actuel est de ${formatMontant(solde)} FCFA`);
      setLoading(false);
      return;
    }

    if (montant <= 0) {
      setError('Le montant doit être supérieur à 0');
      setLoading(false);
      return;
    }

    try {
      // Créer la demande de retrait
      await apiFetch('/api/retraits', {
        method: 'POST',
        body: JSON.stringify({ montant, tel, rib }),
      });

      // Débiter le solde après succès de la demande
      const debitReussi = debiterSolde(montant);
      
      if (!debitReussi) {
        setError('Erreur lors de la mise à jour du solde');
        setLoading(false);
        return;
      }

      // Réinitialiser le formulaire
      setMontant(0);
      setTel('');
      setRib('');
      setIsOpen(false);
      
      onSuccess();
    } catch (err) {
      setError('Erreur lors de la création de la demande de retrait');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          + Nouveau Retrait
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Nouvelle Demande de Retrait
          </DialogTitle>
        </DialogHeader>

        {/* Affichage du solde disponible */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Wallet className="w-4 h-4" />
            <span className="font-medium">Solde disponible:</span>
            <span className="font-bold">{formatMontant(solde)} FCFA</span>
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
              Montant à retirer (FCFA)
            </label>
            <Input 
              id="montant" 
              type="number" 
              min="1"
              max={solde}
              value={montant || ''} 
              onChange={(e) => setMontant(Number(e.target.value))} 
              placeholder="Entrez le montant"
              className={`${!peutDebiter(montant) && montant > 0 ? 'border-red-300 bg-red-50' : ''}`}
              required 
            />
            {montant > solde && montant > 0 && (
              <p className="text-red-600 text-xs mt-1">
                Montant supérieur au solde disponible
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="tel" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <Input 
              id="tel" 
              type="tel"
              value={tel} 
              onChange={(e) => setTel(e.target.value)} 
              placeholder="Ex: +228 99 99 99 99"
              required
            />
          </div>
          
          <div>
            <label htmlFor="rib" className="block text-sm font-medium text-gray-700 mb-2">
              RIB (Optionnel)
            </label>
            <Input 
              id="rib" 
              value={rib} 
              onChange={(e) => setRib(e.target.value)} 
              placeholder="Relevé d'identité bancaire"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !peutDebiter(montant) || montant <= 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmer le retrait
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
