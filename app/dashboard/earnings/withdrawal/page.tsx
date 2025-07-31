'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { useApi } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Retrait } from '../../../models/retrait';
import { 
  FiDollarSign, 
  FiCreditCard,
  FiClock,
  FiCheck,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiDownload,
  FiAlertCircle,
  FiTrendingDown
} from 'react-icons/fi';

interface RetraitExtended extends Retrait {
  displayAmount?: string;
  displayStatus?: 'pending' | 'processing' | 'completed' | 'rejected';
  displayMethod?: string;
}

const paymentMethods = [
  { id: 'bank', name: 'Virement bancaire', icon: FiCreditCard, color: 'bg-blue-100 text-blue-800' },
  { id: 'paypal', name: 'PayPal', icon: FiDollarSign, color: 'bg-green-100 text-green-800' },
  { id: 'crypto', name: 'Cryptomonnaie', icon: FiTrendingDown, color: 'bg-purple-100 text-purple-800' }
];

const templates = [
  {
    id: '1',
    name: 'Retrait Standard',
    method: 'bank',
    description: 'Virement bancaire classique',
    usage: 78
  },
  {
    id: '2',
    name: 'Retrait Express',
    method: 'paypal',
    description: 'Retrait rapide via PayPal',
    usage: 45
  },
  {
    id: '3',
    name: 'Retrait Crypto',
    method: 'crypto',
    description: 'Retrait en cryptomonnaie',
    usage: 12
  }
];

export default function WithdrawalPage() {
  const [withdrawals, setWithdrawals] = useState<RetraitExtended[]>([]);
  const [selectedTab, setSelectedTab] = useState<'withdrawals'>('withdrawals');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de création
  const [newWithdrawal, setNewWithdrawal] = useState({
    montant: '',
    methode: 'bank',
    description: '',
    iban: '',
    email: ''
  });

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Récupération des retraits depuis l'API
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des retraits pour utilisateur:', user.uid);
      const withdrawalsData = await apiFetch('/api/retraits');
      
      if (!Array.isArray(withdrawalsData)) {
        console.warn('⚠️ Réponse API inattendue:', withdrawalsData);
        setWithdrawals([]);
        return;
      }
      
      // Transformer les retraits pour l'affichage
      const transformedWithdrawals: RetraitExtended[] = withdrawalsData.map((withdrawal: Retrait) => ({
        ...withdrawal,
        displayAmount: `${withdrawal.montant || 0}€`,
        displayStatus: withdrawal.statut as 'pending' | 'processing' | 'completed' | 'rejected' || 'pending',
        displayMethod: withdrawal.methode || 'bank'
      }));
      
      setWithdrawals(transformedWithdrawals);
      console.log('✅ Retraits récupérés:', transformedWithdrawals.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération retraits:', err);
      setError(`Erreur lors du chargement des retraits: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  // Création d'un nouveau retrait
  const createWithdrawal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newWithdrawal.montant || parseFloat(newWithdrawal.montant) <= 0) {
        setError('Le montant doit être supérieur à 0');
        return;
      }
      
      const withdrawalData = {
        montant: parseFloat(newWithdrawal.montant),
        methode: newWithdrawal.methode,
        description: newWithdrawal.description,
        iban: newWithdrawal.iban,
        email: newWithdrawal.email,
        idUtilisateur: user?.uid || 'anonymous',
        dateCreation: new Date().toISOString(),
        statut: 'pending'
      };
      
      await apiFetch('/api/retraits', {
        method: 'POST',
        body: JSON.stringify(withdrawalData)
      });
      
      console.log('✅ Retrait créé avec succès');
      
      // Réinitialiser le formulaire
      setNewWithdrawal({
        montant: '',
        methode: 'bank',
        description: '',
        iban: '',
        email: ''
      });
      
      setShowCreateModal(false);
      await fetchWithdrawals();
      
    } catch (err) {
      console.error('❌ Erreur création retrait:', err);
      setError('Erreur lors de la création du retrait');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un retrait
  const deleteWithdrawal = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande de retrait ?')) {
      return;
    }
    
    try {
      await apiFetch(`/api/retraits/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Retrait supprimé:', id);
      await fetchWithdrawals();
      
    } catch (err) {
      console.error('❌ Erreur suppression retrait:', err);
      setError('Erreur lors de la suppression');
    }
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchWithdrawals();
    }
  }, [user]);

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.displayAmount?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || withdrawal.displayStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'processing': return 'En cours';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return FiCheck;
      case 'processing': return FiClock;
      case 'pending': return FiAlertCircle;
      case 'rejected': return FiX;
      default: return FiClock;
    }
  };

  const getMethodInfo = (method: string) => {
    return paymentMethods.find(m => m.id === method) || paymentMethods[0];
  };

  // Stats calculations
  const totalPending = withdrawals.filter(w => w.displayStatus === 'pending').length;
  const totalAmount = withdrawals.reduce((sum, w) => sum + (w.montant || 0), 0);
  const totalCompleted = withdrawals.filter(w => w.displayStatus === 'completed').length;
  const completedAmount = withdrawals
    .filter(w => w.displayStatus === 'completed')
    .reduce((sum, w) => sum + (w.montant || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Retraits</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos demandes de retrait et paiements
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouveau Retrait
        </Button>
      </div>

      {/* Actions CRUD */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions disponibles</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Créer
          </Button>
          <Button 
            onClick={fetchWithdrawals}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            <FiDollarSign className="w-4 h-4 mr-2" />
            Lire
          </Button>
          <Button 
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
            disabled={filteredWithdrawals.length === 0}
          >
            <FiEdit3 className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button 
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={filteredWithdrawals.length === 0}
          >
            <FiTrash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalPending}</p>
                  <p className="text-sm text-yellow-600 mt-1">Demandes</p>
                </div>
                <div className="p-3 rounded-lg bg-[#f01919]">
                  <FiClock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Montant Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalAmount.toLocaleString()}€</p>
                  <p className="text-sm text-blue-600 mt-1">Demandé</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <FiDollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Retraits Terminés</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalCompleted}</p>
                  <p className="text-sm text-green-600 mt-1">Succès</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500">
                  <FiCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Montant Reçu</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{completedAmount.toLocaleString()}€</p>
                  <p className="text-sm text-purple-600 mt-1">Versé</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500">
                  <FiDownload className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters et Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Rechercher un retrait..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="processing">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>
              <div>
                <Button 
                  onClick={fetchWithdrawals} 
                  variant="outline" 
                  className="w-full"
                  disabled={loading}
                >
                  <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
              <div>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-[#f01919] hover:bg-[#d01515] text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Nouveau
                </Button>
              </div>
            </div>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiX className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* État de chargement */}
          {loading && (
            <div className="text-center py-8">
              <FiRefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
              <p className="text-gray-600">Chargement des retraits...</p>
            </div>
          )}

          {/* Withdrawals List */}
          {!loading && (
            <div className="space-y-4">
              {filteredWithdrawals.map((withdrawal) => {
                const methodInfo = getMethodInfo(withdrawal.displayMethod || 'bank');
                const StatusIcon = getStatusIcon(withdrawal.displayStatus || 'pending');
                const MethodIcon = methodInfo.icon;
                
                return (
                  <div key={withdrawal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <MethodIcon className="w-5 h-5 text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {withdrawal.displayAmount}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawal.displayStatus || 'pending')}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {getStatusLabel(withdrawal.displayStatus || 'pending')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {withdrawal.description || 'Demande de retrait'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>📅 {withdrawal.dateCreation ? new Date(withdrawal.dateCreation).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                          <span>💳 {methodInfo.name}</span>
                          {withdrawal.iban && <span>🏦 {withdrawal.iban.slice(-4)}</span>}
                          {withdrawal.email && <span>📧 {withdrawal.email}</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <FiEdit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteWithdrawal(withdrawal.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${methodInfo.color}`}>
                        {methodInfo.name}
                      </span>
                      <div className="text-sm text-gray-500">
                        ID: {withdrawal.id?.slice(-8) || 'N/A'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* État vide */}
          {!loading && filteredWithdrawals.length === 0 && (
            <div className="text-center py-12">
              <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Aucun retrait trouvé' 
                  : 'Aucun retrait'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all'
                  ? 'Aucun retrait ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore effectué de demandes de retrait.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#f01919] hover:bg-[#d01515] text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Faire votre première demande
                </Button>
              )}
            </div>
          )}
        </>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Demande de Retrait</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                <FiX className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); createWithdrawal(); }} className="space-y-4">
              <div>
                <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-1">
                  Montant à retirer (€)
                </label>
                <Input
                  id="montant"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newWithdrawal.montant}
                  onChange={(e) => setNewWithdrawal(prev => ({ ...prev, montant: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="methode" className="block text-sm font-medium text-gray-700 mb-1">
                  Méthode de paiement
                </label>
                <select
                  id="methode"
                  value={newWithdrawal.methode}
                  onChange={(e) => setNewWithdrawal(prev => ({ ...prev, methode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>{method.name}</option>
                  ))}
                </select>
              </div>

              {newWithdrawal.methode === 'bank' && (
                <div>
                  <label htmlFor="iban" className="block text-sm font-medium text-gray-700 mb-1">
                    IBAN
                  </label>
                  <Input
                    id="iban"
                    type="text"
                    value={newWithdrawal.iban}
                    onChange={(e) => setNewWithdrawal(prev => ({ ...prev, iban: e.target.value }))}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                  />
                </div>
              )}

              {(newWithdrawal.methode === 'paypal' || newWithdrawal.methode === 'crypto') && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email / Adresse
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={newWithdrawal.email}
                    onChange={(e) => setNewWithdrawal(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="votre@email.com"
                  />
                </div>
              )}

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnel)
                </label>
                <Textarea
                  id="description"
                  value={newWithdrawal.description}
                  onChange={(e) => setNewWithdrawal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Motif du retrait..."
                  rows={2}
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <FiAlertCircle className="w-4 h-4 inline mr-1" />
                  Les retraits sont traités sous 3-5 jours ouvrables. Des frais peuvent s'appliquer selon la méthode choisie.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#f01919] hover:bg-[#d01515] text-white"
                  disabled={loading || !newWithdrawal.montant || parseFloat(newWithdrawal.montant) <= 0}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <FiDownload className="w-4 h-4 mr-2" />
                      Demander le retrait
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
