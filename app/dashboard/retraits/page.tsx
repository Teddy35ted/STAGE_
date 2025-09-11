'use client';

import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Clock, CheckCircle, AlertCircle, Wallet, Calendar, Smartphone } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { RetraitForm } from '../../../components/forms/RetraitForm';
import { RetraitActions } from '../../../components/forms/RetraitActions';
import { RetraitDetails } from '../../../components/forms/RetraitDetails';
import { RetraitEditForm } from '../../../components/forms/RetraitEditForm';
import { SoldeCard } from '../../../components/dashboard/SoldeCard';
import { Retrait } from '../../models/retrait';
import { auth } from '../../firebase/config';
import { useRetraitAutoProcessor } from '../../../hooks/useRetraitAutoProcessor';

// Composant Card simple
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Composant Dialog simple
const Dialog = ({ children, open, onOpenChange }: { 
  children: React.ReactNode; 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6">
    {children}
  </div>
);

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">
    {children}
  </div>
);

const DialogTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h2>
);

export default function RetraitsPage() {
  const [retraits, setRetraits] = useState<Retrait[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRetrait, setSelectedRetrait] = useState<Retrait | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Hook pour le traitement automatique des retraits
  useRetraitAutoProcessor();

  // Mise à jour du temps actuel chaque seconde pour les comptes à rebours
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date invalide';
    
    try {
      // Gère différents formats de date
      let date;
      if (dateString.includes('T')) {
        // Format ISO (2025-01-20T15:30:00.000Z)
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        // Format simple (2025-01-20)
        date = new Date(dateString + 'T00:00:00.000Z');
      } else {
        // Fallback
        date = new Date(dateString);
      }
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  const chargerRetraits = async () => {
    try {
      setLoading(true);
      console.log('Chargement des retraits depuis l\'API...'); // Debug
      
      // Obtenir le token Firebase
      const user = auth.currentUser;
      if (!user) {
        console.log('👤 Utilisateur non connecté');
        setRetraits([]);
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      
      const response = await fetch('/api/retraits', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Retraits reçus de l\'API:', data); // Debug
        
        // S'assurer que data est un tableau
        const retraitsArray = Array.isArray(data) ? data : [];
        setRetraits(retraitsArray);
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur de réponse API:', response.status, errorData);
        setRetraits([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des retraits:', error);
      setRetraits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerRetraits();
  }, []);

  const handleRetraitSuccess = () => {
    chargerRetraits();
    setIsFormOpen(false);
  };

  const handleDeleteSuccess = () => {
    chargerRetraits();
  };

  const handleEditSuccess = () => {
    chargerRetraits();
    setIsEditOpen(false);
    setSelectedRetrait(null);
  };

  const openEditModal = (retrait: Retrait) => {
    setSelectedRetrait(retrait);
    setIsEditOpen(true);
  };

  const openViewModal = (retrait: Retrait) => {
    setSelectedRetrait(retrait);
    setIsViewOpen(true);
  };

  // Calcul des statistiques
  const statsRetraits = {
    total: retraits.length,
    enAttente: retraits.filter(r => r.statut === 'En attente').length,
    approuves: retraits.filter(r => r.statut === 'Approuvé').length,
    refuses: retraits.filter(r => r.statut === 'Refusé').length,
    montantTotal: retraits.reduce((sum, r) => sum + r.montant, 0)
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'En attente': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Approuvé': return 'text-green-600 bg-green-50 border-green-200';
      case 'En cours de traitement': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Refusé': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'En attente': return <Clock className="w-4 h-4" />;
      case 'Approuvé': return <CheckCircle className="w-4 h-4" />;
      case 'En cours de traitement': return <TrendingUp className="w-4 h-4" />;
      case 'Refusé': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTempsRestant = (retrait: Retrait): string => {
    if (retrait.statut !== 'En attente' || !retrait.dateTraitement) {
      return '';
    }

    const maintenant = new Date().getTime();
    const dateTraitement = new Date(retrait.dateTraitement).getTime();
    const tempsRestant = dateTraitement - maintenant;

    if (tempsRestant <= 0) {
      return 'Traitement en cours...';
    }

    const minutes = Math.floor(tempsRestant / (1000 * 60));
    const secondes = Math.floor((tempsRestant % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}min ${secondes}s`;
    } else {
      return `${secondes}s`;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Retraits</h1>
          <p className="text-gray-600 mt-1">Gérez vos demandes de retrait et suivez leur statut</p>
        </div>
        <RetraitForm onSuccess={handleRetraitSuccess} />
      </div>

      {/* Carte Solde */}
      <SoldeCard />

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total retraits</p>
                <p className="text-xl font-bold text-gray-900">{statsRetraits.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-xl font-bold text-yellow-600">{statsRetraits.enAttente}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approuvés</p>
                <p className="text-xl font-bold text-green-600">{statsRetraits.approuves}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Refusés</p>
                <p className="text-xl font-bold text-red-600">{statsRetraits.refuses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Montant total</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatMontant(statsRetraits.montantTotal)} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des retraits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Historique des retraits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {retraits.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun retrait</h3>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore effectué de demande de retrait.</p>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Faire une demande
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {retraits.map((retrait) => (
                <div 
                  key={retrait.id} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {/* En-tête de la card avec montant et statut */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Wallet className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {formatMontant(retrait.montant)} FCFA
                          </h3>
                          <p className="text-sm text-gray-500">Demande de retrait</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatutColor(retrait.statut)}`}>
                        {getStatutIcon(retrait.statut)}
                        {retrait.statut}
                      </span>
                    </div>
                    {/* Temps restant pour les retraits en attente */}
                    {retrait.statut === 'En attente' && retrait.dateTraitement && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Traitement automatique dans: {getTempsRestant(retrait)}
                          </span>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                          Le montant sera débité de votre solde après approbation automatique
                        </p>
                      </div>
                    )}
                    
                    {/* Information pour les retraits approuvés */}
                    {retrait.statut === 'Approuvé' && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {retrait.montantDebite ? 'Montant débité et retrait traité' : 'Retrait approuvé - En cours de traitement'}
                          </span>
                        </div>
                        {retrait.dateApprobation && (
                          <p className="text-xs text-green-600 mt-1">
                            Approuvé le {formatDate(retrait.dateApprobation)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Corps de la card avec détails */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Téléphone</p>
                          <p className="text-sm font-medium text-gray-900">{retrait.tel}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-blue-600 rounded"></div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Opérateur</p>
                          <p className="text-sm font-medium text-gray-900">{retrait.operateur}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Date de demande</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(retrait.dateCreation || retrait.date || new Date().toISOString())}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pied de la card avec boutons d'action */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <RetraitActions
                          retrait={retrait}
                          onDeleteSuccess={handleDeleteSuccess}
                          onEditClick={() => openEditModal(retrait)}
                          onViewClick={() => openViewModal(retrait)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de modification */}
      <RetraitEditForm
        retrait={selectedRetrait}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedRetrait(null);
        }}
        onSuccess={handleEditSuccess}
      />

      {/* Modal de visualisation */}
      <RetraitDetails
        retrait={selectedRetrait}
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedRetrait(null);
        }}
      />
    </div>
  );
}
