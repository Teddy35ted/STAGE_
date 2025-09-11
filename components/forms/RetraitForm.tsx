'use client';

import React, { useState } from 'react';
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
  DialogTrigger,
} from '../ui/dialog';

interface RetraitFormProps {
  onSuccess: () => void;
}

export function RetraitForm({ onSuccess }: RetraitFormProps) {
  const [montant, setMontant] = useState(0);
  const [tel, setTel] = useState('');
  const [operateur, setOperateur] = useState('');
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
      console.log('Création de la demande de retrait via API...'); // Debug
      
      // Obtenir le token Firebase
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const token = await user.getIdToken();
      
      // Créer la demande de retrait (sans débiter le solde immédiatement)
      const dateCreation = new Date();
      const dateTraitement = new Date(dateCreation.getTime() + 5 * 60 * 1000); // +5 minutes
      
      const response = await fetch('/api/retraits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          montant, 
          tel, 
          operateur,
          statut: 'En attente',
          dateCreation: dateCreation.toISOString(),
          dateTraitement: dateTraitement.toISOString(),
          montantDebite: false // Important : le montant n'est pas encore débité
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API création:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la création de la demande de retrait');
      }

      const result = await response.json();
      console.log('Demande de retrait créée avec succès:', result); // Debug

      // NE PAS débiter le solde maintenant - le retrait est en attente de traitement
      // Le solde sera débité automatiquement après 5 minutes via un processus en arrière-plan

      // Réinitialiser le formulaire
      setMontant(0);
      setTel('');
      setOperateur('');
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
          <p className="text-sm text-gray-600 mt-2">
            Votre demande sera traitée automatiquement dans 5 minutes. Le montant sera débité de votre solde uniquement après approbation.
          </p>
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
            {!tel.trim() && tel !== '' && (
              <p className="text-red-600 text-xs mt-1">
                Le numéro de téléphone est obligatoire
              </p>
            )}
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
            {!operateur && (
              <p className="text-red-600 text-xs mt-1">
                Veuillez sélectionner un opérateur
              </p>
            )}
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
              disabled={loading || !peutDebiter(montant) || montant <= 0 || !tel.trim() || !operateur}
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
                  Soumettre la demande
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
