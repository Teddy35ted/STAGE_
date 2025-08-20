'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { FiDollarSign, FiTrendingUp, FiDownload, FiCalendar, FiArrowUp, FiArrowDown, FiPlus } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useSoldeAnimateur } from '../../../hooks/useSoldeAnimateur';
import { RetraitForm } from '../../../components/forms/RetraitForm';
import { RetraitActions } from '../../../components/forms/RetraitActions';
import { RetraitDetails } from '../../../components/forms/RetraitDetails';
import { Retrait } from '../../models/retrait';

interface EarningItem {
  id: string;
  type: 'direct' | 'indirect' | 'couris' | 'ads';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'processing';
}

const earningsData: EarningItem[] = [
  {
    id: '1',
    type: 'direct',
    amount: 125.50,
    description: 'Contenu publié sur "Mon Laala Lifestyle"',
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: '2',
    type: 'indirect',
    amount: 45.20,
    description: 'Contenu publié sur le Laala de @marie_style',
    date: '2024-01-14',
    status: 'completed'
  },
  {
    id: '3',
    type: 'ads',
    amount: 78.30,
    description: 'Revenus publicitaires',
    date: '2024-01-13',
    status: 'processing'
  },
  {
    id: '4',
    type: 'couris',
    amount: 32.15,
    description: 'Course livrée à Douala',
    date: '2024-01-12',
    status: 'completed'
  }
];

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [retraits, setRetraits] = useState<Retrait[]>([]);
  const [isRetraitFormOpen, setIsRetraitFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRetrait, setSelectedRetrait] = useState<Retrait | null>(null);
  const { solde, loading: soldeLoading } = useSoldeAnimateur();

  // Chargement des retraits
  useEffect(() => {
    const loadRetraits = async () => {
      try {
        const response = await fetch('/api/retraits');
        if (response.ok) {
          const data = await response.json();
          console.log('Retraits chargés:', data);
          setRetraits(data || []);
        } else {
          console.error('Erreur lors du chargement des retraits');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des retraits:', error);
      }
    };

    loadRetraits();
  }, []);

  const totalEarnings = earningsData.reduce((sum, item) => sum + item.amount, 0);

  const openRetraitForm = () => setIsRetraitFormOpen(true);
  const closeRetraitForm = () => setIsRetraitFormOpen(false);

  const openViewModal = (retrait: Retrait) => {
    setSelectedRetrait(retrait);
    setIsViewOpen(true);
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
    setSelectedRetrait(null);
  };

  const onRetraitCreated = (newRetrait: Retrait) => {
    setRetraits(prev => [newRetrait, ...prev]);
    closeRetraitForm();
  };

  const handleEditRetrait = (retrait: Retrait) => {
    console.log('Éditer retrait:', retrait);
    // Logique d'édition à implémenter
  };

  const handleDeleteRetrait = async (retraitId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce retrait ?')) {
      try {
        const response = await fetch(`/api/retraits/${retraitId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setRetraits(prev => prev.filter(r => r.id !== retraitId));
        } else {
          console.error('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date invalide';
    
    try {
      let date;
      // Gestion des différents formats de date
      if (dateString.includes('T')) {
        // Format ISO complet
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        // Format YYYY-MM-DD
        date = new Date(dateString + 'T00:00:00.000Z');
      } else {
        // Autres formats
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'bg-green-100 text-green-800';
      case 'indirect': return 'bg-blue-100 text-blue-800';
      case 'ads': return 'bg-purple-100 text-purple-800';
      case 'couris': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'direct': return 'Direct';
      case 'indirect': return 'Indirect';
      case 'ads': return 'Publicité';
      case 'couris': return 'Couris';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenus</h1>
          <p className="text-gray-600">Gérez vos gains et retraits</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <FiDownload className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Solde disponible */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Solde disponible</CardTitle>
            <FiDollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {soldeLoading ? '...' : `${formatMontant(solde)} FCFA`}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Montant disponible pour retrait
            </p>
          </CardContent>
        </Card>

        {/* Total revenus */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total revenus</CardTitle>
            <FiTrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatMontant(totalEarnings)} FCFA</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <FiArrowUp className="w-3 h-3 mr-1" />
              +12.5% vs mois dernier
            </p>
          </CardContent>
        </Card>

        {/* Retraits en cours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Retraits en cours</CardTitle>
            <FiCalendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {retraits.filter(r => r.statut === 'En attente').length}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Demandes en attente
            </p>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Performance</CardTitle>
            <FiArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">94%</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <FiArrowUp className="w-3 h-3 mr-1" />
              +2.1% vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Retraits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des retraits */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historique des retraits</CardTitle>
                <Button onClick={openRetraitForm} className="bg-green-600 hover:bg-green-700">
                  <FiPlus className="w-4 h-4 mr-2" />
                  Nouveau retrait
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {retraits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun retrait pour le moment</p>
                  <Button 
                    onClick={openRetraitForm}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    Faire votre premier retrait
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {retraits.map((retrait) => (
                    <div key={retrait.id} className="border border-gray-200 rounded-lg p-4">
                      {/* En-tête de la carte */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={retrait.statut === 'Approuvé' ? 'default' : 
                                   retrait.statut === 'En attente' ? 'secondary' : 'destructive'}
                          >
                            {retrait.statut}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {retrait.operateur}
                          </span>
                        </div>
                        <RetraitActions
                          retrait={retrait}
                          onViewClick={() => openViewModal(retrait)}
                          onEditClick={() => handleEditRetrait(retrait)}
                          onDeleteSuccess={() => handleDeleteRetrait(retrait.id)}
                        />
                      </div>

                      {/* Corps de la carte */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Montant</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatMontant(retrait.montant)} FCFA
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="text-sm text-gray-900">{retrait.tel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="text-sm text-gray-900">
                            {formatDate(retrait.dateCreation || retrait.date || new Date().toISOString())}
                          </p>
                        </div>
                      </div>

                      {/* Pied de la carte */}
                      {retrait.operation && (
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">{retrait.operation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec informations */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Solde actuel:</span>
                <span className="font-medium">{formatMontant(solde)} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Retraits ce mois:</span>
                <span className="font-medium">{retraits.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">En attente:</span>
                <span className="font-medium text-yellow-600">
                  {retraits.filter(r => r.statut === 'En attente').length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>• Les retraits sont traités sous 24-48h</p>
              <p>• Montant minimum: 1 000 FCFA</p>
              <p>• Frais de traitement: 2% du montant</p>
              <p>• Horaires: 8h-17h (jours ouvrables)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Revenus récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earningsData.map((earning) => (
              <div key={earning.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge className={getTypeColor(earning.type)}>
                    {getTypeLabel(earning.type)}
                  </Badge>
                  <div>
                    <p className="font-medium text-gray-900">{earning.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(earning.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{formatMontant(earning.amount)} FCFA</p>
                  <p className={`text-sm ${getStatusColor(earning.status)}`}>
                    {getStatusLabel(earning.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {isRetraitFormOpen && (
        <RetraitForm
          onSuccess={() => {
            closeRetraitForm();
            // Recharger les retraits
            const loadRetraits = async () => {
              try {
                const response = await fetch('/api/retraits');
                if (response.ok) {
                  const data = await response.json();
                  setRetraits(data || []);
                }
              } catch (error) {
                console.error('Erreur lors du rechargement:', error);
              }
            };
            loadRetraits();
          }}
        />
      )}

      <RetraitDetails
        retrait={selectedRetrait}
        isOpen={isViewOpen}
        onClose={closeViewModal}
      />
    </div>
  );
}
