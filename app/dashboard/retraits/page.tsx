'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useCRUDNotifications } from '../../../contexts/NotificationContext';
import { Retrait } from '../../models/retrait';
import { 
  FiDollarSign, 
  FiCreditCard,
  FiCalendar,
  FiClock,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiTrendingUp,
  FiCheck,
  FiAlertTriangle,
  FiSettings,
  FiUser,
  FiPhone
} from 'react-icons/fi';

interface RetraitExtended extends Retrait {
  displayAmount?: string;
  displayStatus?: 'pending' | 'processing' | 'completed' | 'rejected';
  displayDate?: string;
  displayMethod?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Terminé',
  rejected: 'Rejeté'
};

export default function RetraitsPage() {
  const { notifyCreate, notifyUpdate, notifyDelete } = useCRUDNotifications();
  const [retraits, setRetraits] = useState<RetraitExtended[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRetrait, setSelectedRetrait] = useState<RetraitExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de création adapté au modèle Retrait
  const [newRetrait, setNewRetrait] = useState({
    montant: '',
    operation: '',
    nom: '',
    tel: '',
    rib: '',
    iskouri: true,
    isbusiness: false,
    isservice: false,
    ismobilem: false
  });

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Récupération des retraits depuis l'API
  const fetchRetraits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des retraits pour utilisateur:', user.uid);
      const retraitsData = await apiFetch('/api/retraits');
      
      if (!Array.isArray(retraitsData)) {
        console.warn('⚠️ Réponse API inattendue:', retraitsData);
        setRetraits([]);
        return;
      }
      
      // Transformer les retraits pour l'affichage
      const transformedRetraits: RetraitExtended[] = retraitsData.map((retrait: Retrait) => ({
        ...retrait,
        displayAmount: `${retrait.montant}€`,
        displayStatus: retrait.istraite ? 'completed' : 'pending',
        displayDate: retrait.date ? new Date(retrait.date).toLocaleDateString('fr-FR') : 'Date inconnue',
        displayMethod: retrait.iskouri ? 'Kouri' : retrait.ismobilem ? 'Mobile Money' : 'Virement'
      }));
      
      setRetraits(transformedRetraits);
      console.log('✅ Retraits récupérés:', transformedRetraits.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération retraits:', err);
      setError(`Erreur lors du chargement des retraits: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setRetraits([]);
    } finally {
      setLoading(false);
    }
  };

  // Création d'un nouveau retrait
  const createRetrait = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newRetrait.montant.trim() || parseFloat(newRetrait.montant) <= 0) {
        setError('Le montant doit être supérieur à 0');
        return;
      }
      
      if (!newRetrait.nom.trim()) {
        setError('Le nom est requis');
        return;
      }
      
      if (!newRetrait.tel.trim()) {
        setError('Le téléphone est requis');
        return;
      }
      
      const retraitData = {
        montant: parseFloat(newRetrait.montant),
        operation: newRetrait.operation || `Retrait de ${newRetrait.montant}€`,
        nom: newRetrait.nom,
        tel: newRetrait.tel,
        rib: newRetrait.rib,
        idcompte: user?.uid || 'anonymous',
        date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        istraite: false,
        islivreur: false,
        iskouri: newRetrait.iskouri,
        isbusiness: newRetrait.isbusiness,
        isservice: newRetrait.isservice,
        ismobilem: newRetrait.ismobilem,
        issubmit: true
      };
      
      await apiFetch('/api/retraits', {
        method: 'POST',
        body: JSON.stringify(retraitData)
      });
      
      console.log('✅ Retrait créé avec succès');
      notifyCreate('Retrait', `${newRetrait.montant}€`, true);
      
      // Réinitialiser le formulaire
      setNewRetrait({
        montant: '',
        operation: '',
        nom: '',
        tel: '',
        rib: '',
        iskouri: true,
        isbusiness: false,
        isservice: false,
        ismobilem: false
      });
      
      setShowCreateModal(false);
      await fetchRetraits();
      
    } catch (err) {
      console.error('❌ Erreur création retrait:', err);
      notifyCreate('Retrait', `${newRetrait.montant}€`, false);
      setError('Erreur lors de la création du retrait');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un retrait
  const deleteRetrait = async (id: string) => {
    const retrait = retraits.find(r => r.id === id);
    const retraitName = retrait?.displayAmount || 'Retrait inconnu';
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le retrait de ${retraitName} ?`)) {
      return;
    }
    
    try {
      await apiFetch(`/api/retraits/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Retrait supprimé:', id);
      notifyDelete('Retrait', retraitName, true);
      await fetchRetraits();
      
    } catch (err) {
      console.error('❌ Erreur suppression retrait:', err);
      notifyDelete('Retrait', retraitName, false);
      setError('Erreur lors de la suppression');
    }
  };

  // Fonction pour voir les détails d'un retrait (READ)
  const viewRetraitDetails = (retrait: RetraitExtended) => {
    console.log('📖 Lecture retrait:', retrait.id);
    setSelectedRetrait(retrait);
    setShowDetailModal(true);
  };

  // Fonction pour modifier un retrait (UPDATE)
  const editRetrait = (retrait: RetraitExtended) => {
    console.log('✏️ Modification retrait:', retrait.id);
    setSelectedRetrait(retrait);
    
    // Pré-remplir le formulaire avec les données du retrait
    setNewRetrait({
      montant: retrait.montant.toString(),
      operation: retrait.operation || '',
      nom: retrait.nom || '',
      tel: retrait.tel || '',
      rib: retrait.rib || '',
      iskouri: retrait.iskouri || false,
      isbusiness: retrait.isbusiness || false,
      isservice: retrait.isservice || false,
      ismobilem: retrait.ismobilem || false
    });
    
    setShowEditModal(true);
  };

  // Mise à jour d'un retrait existant
  const updateRetrait = async () => {
    if (!selectedRetrait) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!newRetrait.montant.trim() || parseFloat(newRetrait.montant) <= 0) {
        setError('Le montant doit être supérieur à 0');
        return;
      }
      
      if (!newRetrait.nom.trim()) {
        setError('Le nom est requis');
        return;
      }
      
      if (!newRetrait.tel.trim()) {
        setError('Le téléphone est requis');
        return;
      }
      
      const retraitData = {
        montant: parseFloat(newRetrait.montant),
        operation: newRetrait.operation || `Retrait de ${newRetrait.montant}€`,
        nom: newRetrait.nom,
        tel: newRetrait.tel,
        rib: newRetrait.rib,
        iskouri: newRetrait.iskouri,
        isbusiness: newRetrait.isbusiness,
        isservice: newRetrait.isservice,
        ismobilem: newRetrait.ismobilem
      };
      
      await apiFetch(`/api/retraits/${selectedRetrait.id}`, {
        method: 'PUT',
        body: JSON.stringify(retraitData)
      });
      
      console.log('✅ Retrait mis à jour avec succès');
      notifyUpdate('Retrait', `${newRetrait.montant}€`, true);
      
      // Réinitialiser les états
      setSelectedRetrait(null);
      setShowEditModal(false);
      
      // Réinitialiser le formulaire
      setNewRetrait({
        montant: '',
        operation: '',
        nom: '',
        tel: '',
        rib: '',
        iskouri: true,
        isbusiness: false,
        isservice: false,
        ismobilem: false
      });
      
      await fetchRetraits();
      
    } catch (err) {
      console.error('❌ Erreur mise à jour retrait:', err);
      notifyUpdate('Retrait', `${newRetrait.montant}€`, false);
      setError('Erreur lors de la mise à jour du retrait');
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchRetraits();
    }
  }, [user]);

  const filteredRetraits = retraits.filter(retrait => {
    const matchesSearch = retrait.operation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         retrait.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         retrait.tel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         retrait.displayAmount?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || retrait.displayStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const totalAmount = retraits.reduce((sum, r) => sum + (r.montant || 0), 0);
  const totalPending = retraits.filter(r => r.displayStatus === 'pending').length;
  const totalCompleted = retraits.filter(r => r.displayStatus === 'completed').length;
  const totalProcessing = retraits.filter(r => r.displayStatus === 'processing').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Retraits</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos demandes de retrait et suivez leur statut
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalAmount.toLocaleString()}€</p>
              <p className="text-sm text-blue-600 mt-1">Demandé</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalPending}</p>
              <p className="text-sm text-yellow-600 mt-1">Retraits</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <FiClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCompleted}</p>
              <p className="text-sm text-green-600 mt-1">Retraits</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Cours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalProcessing}</p>
              <p className="text-sm text-blue-600 mt-1">Retraits</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiTrendingUp className="w-6 h-6 text-white" />
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
              onClick={fetchRetraits} 
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

      {/* Retraits List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRetraits.map((retrait) => (
            <div key={retrait.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {retrait.displayAmount}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[retrait.displayStatus || 'pending']}`}>
                      {statusLabels[retrait.displayStatus || 'pending']}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {retrait.operation || 'Aucune description'}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      {retrait.displayDate}
                    </div>
                    <div className="flex items-center">
                      <FiUser className="w-4 h-4 mr-2" />
                      {retrait.nom}
                    </div>
                    <div className="flex items-center">
                      <FiPhone className="w-4 h-4 mr-2" />
                      {retrait.tel}
                    </div>
                    <div className="flex items-center">
                      <FiCreditCard className="w-4 h-4 mr-2" />
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {retrait.displayMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions du retrait */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    ID: {retrait.id?.slice(-8)}
                  </span>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => viewRetraitDetails(retrait)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Voir les détails"
                    >
                      <FiEye className="w-4 h-4" />
                    </Button>
                    
                    {!retrait.istraite && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => editRetrait(retrait)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        title="Modifier le retrait"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteRetrait(retrait.id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer le retrait"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* État vide */}
      {!loading && filteredRetraits.length === 0 && (
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
              Créer votre premier retrait
            </Button>
          )}
        </div>
      )}

      {/* Modal de création moderne */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-50/90 via-blue-50/90 to-purple-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-[#f01919] to-[#d01515] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiDollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Nouveau Retrait</h2>
                    <p className="text-red-100 text-sm">Demandez un retrait de fonds</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Contenu du formulaire */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                  <FiAlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 font-medium">Erreur</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); createRetrait(); }} className="space-y-6">
                {/* Informations de base */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiSettings className="w-5 h-5 mr-2 text-[#f01919]" />
                    Informations du retrait
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-2">
                        Montant *
                      </label>
                      <Input
                        id="montant"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newRetrait.montant}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, montant: e.target.value }))}
                        placeholder="Ex: 100.00"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <Input
                        id="nom"
                        type="text"
                        value={newRetrait.nom}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Votre nom complet"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="tel" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <Input
                        id="tel"
                        type="tel"
                        value={newRetrait.tel}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, tel: e.target.value }))}
                        placeholder="Ex: +33 6 12 34 56 78"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="rib" className="block text-sm font-medium text-gray-700 mb-2">
                        RIB (optionnel)
                      </label>
                      <Input
                        id="rib"
                        type="text"
                        value={newRetrait.rib}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, rib: e.target.value }))}
                        placeholder="Relevé d'identité bancaire"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="operation" className="block text-sm font-medium text-gray-700 mb-2">
                      Description de l'opération (optionnelle)
                    </label>
                    <Textarea
                      id="operation"
                      value={newRetrait.operation}
                      onChange={(e) => setNewRetrait(prev => ({ ...prev, operation: e.target.value }))}
                      placeholder="Description de l'opération de retrait..."
                      rows={3}
                      className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919] resize-none"
                    />
                  </div>
                </div>

                {/* Options de méthode */}
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiCreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Options de retrait
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRetrait.iskouri}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, iskouri: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Kouri</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRetrait.ismobilem}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, ismobilem: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Mobile Money</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRetrait.isbusiness}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, isbusiness: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Business</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRetrait.isservice}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, isservice: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Service</span>
                    </label>
                  </div>
                </div>

                {/* Message informatif */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-800 font-medium">Information importante</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Votre demande de retrait sera traitée dans un délai de 3-5 jours ouvrables. 
                        Assurez-vous que toutes les informations sont correctes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                    disabled={loading}
                    className="px-6 py-2"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-[#f01919] to-[#d01515] hover:from-[#d01515] hover:to-[#b01313] text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || !newRetrait.montant.trim() || !newRetrait.nom.trim() || !newRetrait.tel.trim()}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4 mr-2" />
                        Créer le Retrait
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de retrait (READ) */}
      {showDetailModal && selectedRetrait && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header du modal de détails */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiDollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Détails du Retrait</h2>
                    <p className="text-blue-100 text-sm">{selectedRetrait.displayAmount}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRetrait(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Contenu du modal de détails */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiSettings className="w-5 h-5 mr-2 text-blue-600" />
                    Informations générales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Montant</label>
                      <p className="text-gray-900 font-medium text-lg">{selectedRetrait.displayAmount}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Statut</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedRetrait.displayStatus || 'pending']}`}>
                        {statusLabels[selectedRetrait.displayStatus || 'pending']}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date de demande</label>
                      <p className="text-gray-900">{selectedRetrait.displayDate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Heure</label>
                      <p className="text-gray-900">{selectedRetrait.heure || 'Non renseignée'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Méthode</label>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {selectedRetrait.displayMethod}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nom</label>
                      <p className="text-gray-900">{selectedRetrait.nom || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Téléphone</label>
                      <p className="text-gray-900">{selectedRetrait.tel || 'Non renseigné'}</p>
                    </div>
                    {selectedRetrait.rib && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">RIB</label>
                        <p className="text-gray-900 font-mono">{selectedRetrait.rib}</p>
                      </div>
                    )}
                    {selectedRetrait.operation && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-gray-900">{selectedRetrait.operation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Options activées */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiCreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Options du retrait
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedRetrait.iskouri ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm ${selectedRetrait.iskouri ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                        Kouri
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedRetrait.ismobilem ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm ${selectedRetrait.ismobilem ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                        Mobile Money
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedRetrait.isbusiness ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm ${selectedRetrait.isbusiness ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                        Business
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedRetrait.isservice ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm ${selectedRetrait.isservice ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                        Service
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informations système */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations système</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID du retrait:</span>
                      <span className="text-gray-900 font-mono">{selectedRetrait.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Traité:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedRetrait.istraite ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {selectedRetrait.istraite ? 'Oui' : 'Non'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Livreur:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedRetrait.islivreur ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedRetrait.islivreur ? 'Oui' : 'Non'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Soumis:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedRetrait.issubmit ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedRetrait.issubmit ? 'Oui' : 'Non'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions en bas */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                {!selectedRetrait.istraite && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDetailModal(false);
                      editRetrait(selectedRetrait);
                    }}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <FiEdit3 className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRetrait(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de retrait (UPDATE) */}
      {showEditModal && selectedRetrait && (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-yellow-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiEdit3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Modifier le Retrait</h2>
                    <p className="text-orange-100 text-sm">{selectedRetrait.displayAmount}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRetrait(null);
                    // Réinitialiser le formulaire
                    setNewRetrait({
                      montant: '',
                      operation: '',
                      nom: '',
                      tel: '',
                      rib: '',
                      iskouri: true,
                      isbusiness: false,
                      isservice: false,
                      ismobilem: false
                    });
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Contenu du formulaire de modification */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                  <FiAlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 font-medium">Erreur</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); updateRetrait(); }} className="space-y-6">
                {/* Informations de base */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiSettings className="w-5 h-5 mr-2 text-orange-600" />
                    Informations du retrait
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-montant" className="block text-sm font-medium text-gray-700 mb-2">
                        Montant *
                      </label>
                      <Input
                        id="edit-montant"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newRetrait.montant}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, montant: e.target.value }))}
                        placeholder="Ex: 100.00"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <Input
                        id="edit-nom"
                        type="text"
                        value={newRetrait.nom}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Votre nom complet"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-tel" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <Input
                        id="edit-tel"
                        type="tel"
                        value={newRetrait.tel}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, tel: e.target.value }))}
                        placeholder="Ex: +33 6 12 34 56 78"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-rib" className="block text-sm font-medium text-gray-700 mb-2">
                        RIB (optionnel)
                      </label>
                      <Input
                        id="edit-rib"
                        type="text"
                        value={newRetrait.rib}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, rib: e.target.value }))}
                        placeholder="Relevé d'identité bancaire"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-operation" className="block text-sm font-medium text-gray-700 mb-2">
                      Description de l'opération (optionnelle)
                    </label>
                    <Textarea
                      id="edit-operation"
                      value={newRetrait.operation}
                      onChange={(e) => setNewRetrait(prev => ({ ...prev, operation: e.target.value }))}
                      placeholder="Description de l'opération de retrait..."
                      rows={3}
                      className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    />
                  </div>
                </div>

                {/* Options de méthode */}
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiCreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Options de retrait
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRetrait.iskouri}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, iskouri: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Kouri</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRetrait.ismobilem}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, ismobilem: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Mobile Money</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRetrait.isbusiness}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, isbusiness: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Business</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRetrait.isservice}
                        onChange={(e) => setNewRetrait(prev => ({ ...prev, isservice: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Service</span>
                    </label>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRetrait(null);
                    }}
                    disabled={loading}
                    className="px-6 py-2"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || !newRetrait.montant.trim() || !newRetrait.nom.trim() || !newRetrait.tel.trim()}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4 mr-2" />
                        Mettre à jour
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
