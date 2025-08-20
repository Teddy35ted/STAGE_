'use client';

import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, CheckCircle, Download, Search, RefreshCw, Plus } from 'lucide-react';
import { SoldeCard } from '../../../components/dashboard/SoldeCard';
import { RetraitForm } from '../../../components/forms/RetraitForm';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

interface RetraitItem {
  id: string;
  montant: number;
  statut: 'en-attente' | 'termine' | 'recu';
  date: string;
  heure: string;
  tel: string;
}

export default function RetraitsPage() {
  const [retraits, setRetraits] = useState<RetraitItem[]>([]);
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [recherche, setRecherche] = useState('');
  const [loading, setLoading] = useState(false);

  // Données de démonstration
  const retraitsMock: RetraitItem[] = [
    // Aucun retrait pour le moment
  ];

  useEffect(() => {
    setRetraits(retraitsMock);
  }, []);

  const handleSuccess = () => {
    // Recharger les retraits après ajout
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleActualiser = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'en-attente':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3" />
            En Attente
          </span>
        );
      case 'termine':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Terminé
          </span>
        );
      case 'recu':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Download className="w-3 h-3" />
            Reçu
          </span>
        );
      default:
        return null;
    }
  };

  const calculerTotaux = () => {
    const enAttente = retraits.filter(r => r.statut === 'en-attente').length;
    const termines = retraits.filter(r => r.statut === 'termine').length;
    const montantTotal = retraits.reduce((total, r) => total + r.montant, 0);
    const montantRecu = retraits.filter(r => r.statut === 'recu').reduce((total, r) => total + r.montant, 0);

    return { enAttente, termines, montantTotal, montantRecu };
  };

  const { enAttente, termines, montantTotal, montantRecu } = calculerTotaux();

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Retraits</h1>
          <p className="text-gray-600 mt-1">Gérez vos demandes de retrait et paiements</p>
        </div>
        <RetraitForm onSuccess={handleSuccess} />
      </div>

      {/* Carte du solde */}
      <SoldeCard />

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{enAttente}</p>
              <p className="text-orange-600 text-sm">En Attente</p>
              <p className="text-gray-500 text-xs">Demandes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatMontant(montantTotal)}</p>
              <p className="text-blue-600 text-sm">Montant Total</p>
              <p className="text-gray-500 text-xs">Demandé</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{termines}</p>
              <p className="text-green-600 text-sm">Retraits Terminés</p>
              <p className="text-gray-500 text-xs">Succès</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatMontant(montantRecu)}</p>
              <p className="text-purple-600 text-sm">Montant Reçu</p>
              <p className="text-gray-500 text-xs">Versé</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un retrait..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="en-attente">En attente</option>
              <option value="termine">Terminé</option>
              <option value="recu">Reçu</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleActualiser}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
            <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau
            </Button>
          </div>
        </div>
      </div>

      {/* Liste des retraits */}
      <div className="bg-white rounded-xl border border-gray-200">
        {retraits.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun retrait</h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore effectué de demandes de retrait.
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              + Faire votre première demande
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {retraits.map((retrait) => (
              <div key={retrait.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatMontant(retrait.montant)} FCFA
                      </p>
                      <p className="text-gray-600 text-sm">
                        {retrait.date} à {retrait.heure}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatutBadge(retrait.statut)}
                    <p className="text-gray-500 text-sm mt-1">{retrait.tel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}