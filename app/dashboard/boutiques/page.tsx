'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { Boutique } from '../../models/boutiques';
import { 
  FiShoppingBag, 
  FiDollarSign,
  FiMapPin,
  FiPhone,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiStar,
  FiClock,
  FiTrendingUp,
  FiCheck
} from 'react-icons/fi';

interface BoutiqueExtended extends Boutique {
  displayName?: string;
  displayDescription?: string;
  displayStatus?: 'open' | 'closed' | 'pending';
}

interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface WeekSchedule {
  [key: string]: DaySchedule;
}

const categories = [
  { id: 'restaurant', name: 'Restaurant', color: 'bg-orange-100 text-orange-800' },
  { id: 'mode', name: 'Mode', color: 'bg-pink-100 text-pink-800' },
  { id: 'electronique', name: 'Électronique', color: 'bg-blue-100 text-blue-800' },
  { id: 'beaute', name: 'Beauté', color: 'bg-purple-100 text-purple-800' },
  { id: 'sport', name: 'Sport', color: 'bg-green-100 text-green-800' },
  { id: 'maison', name: 'Maison', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'autre', name: 'Autre', color: 'bg-gray-100 text-gray-800' }
];

const daysOfWeek = [
  { id: 'lundi', name: 'Lundi', short: 'Lun' },
  { id: 'mardi', name: 'Mardi', short: 'Mar' },
  { id: 'mercredi', name: 'Mercredi', short: 'Mer' },
  { id: 'jeudi', name: 'Jeudi', short: 'Jeu' },
  { id: 'vendredi', name: 'Vendredi', short: 'Ven' },
  { id: 'samedi', name: 'Samedi', short: 'Sam' },
  { id: 'dimanche', name: 'Dimanche', short: 'Dim' }
];

const defaultSchedule: WeekSchedule = {
  lundi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  mardi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  mercredi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  jeudi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  vendredi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  samedi: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  dimanche: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
};

export default function BoutiquesPage() {
  const [boutiques, setBoutiques] = useState<BoutiqueExtended[]>([]);
  const [selectedTab, setSelectedTab] = useState<'boutiques'>('boutiques');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de création
  const [newBoutique, setNewBoutique] = useState({
    nom: '',
    description: '',
    categorie: 'restaurant',
    adresse: '',
    telephone: '',
    email: '',
    horaires: { ...defaultSchedule } as WeekSchedule
  });

  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Fonction pour formater les horaires en string
  const formatScheduleToString = (schedule: WeekSchedule): string => {
    const openDays = Object.entries(schedule)
      .filter(([_, daySchedule]) => daySchedule.isOpen)
      .map(([day, daySchedule]) => {
        const dayName = daysOfWeek.find(d => d.id === day)?.short || day;
        return `${dayName}: ${daySchedule.openTime}-${daySchedule.closeTime}`;
      });
    
    return openDays.length > 0 ? openDays.join(', ') : 'Fermé';
  };

  // Fonction pour parser les horaires depuis string (pour compatibilité)
  const parseScheduleFromString = (horaireString: string): WeekSchedule => {
    // Si c'est déjà un objet, le retourner tel quel
    if (typeof horaireString === 'object') {
      return horaireString as WeekSchedule;
    }
    
    // Sinon, retourner le planning par défaut
    return { ...defaultSchedule };
  };

  // Gestion des changements d'horaires
  const updateDaySchedule = (dayId: string, field: keyof DaySchedule, value: boolean | string) => {
    setNewBoutique(prev => ({
      ...prev,
      horaires: {
        ...prev.horaires,
        [dayId]: {
          ...prev.horaires[dayId],
          [field]: value
        }
      }
    }));
  };

  // Fonction pour appliquer les mêmes horaires à tous les jours
  const applyToAllDays = () => {
    const mondaySchedule = newBoutique.horaires.lundi;
    const newSchedule: WeekSchedule = {};
    
    daysOfWeek.forEach(day => {
      newSchedule[day.id] = { ...mondaySchedule };
    });
    
    setNewBoutique(prev => ({
      ...prev,
      horaires: newSchedule
    }));
  };

  // Fonction pour appliquer aux jours de semaine seulement
  const applyToWeekdays = () => {
    const mondaySchedule = newBoutique.horaires.lundi;
    const weekdays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
    
    setNewBoutique(prev => ({
      ...prev,
      horaires: {
        ...prev.horaires,
        ...weekdays.reduce((acc, day) => ({
          ...acc,
          [day]: { ...mondaySchedule }
        }), {})
      }
    }));
  };

  // Récupération des boutiques depuis l'API
  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté, arrêt du chargement');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des boutiques pour utilisateur:', user.uid);
      const boutiquesData = await apiFetch('/api/boutiques');
      
      if (!Array.isArray(boutiquesData)) {
        console.warn('⚠️ Réponse API inattendue:', boutiquesData);
        setBoutiques([]);
        return;
      }
      
      // Transformer les boutiques pour l'affichage
      const transformedBoutiques: BoutiqueExtended[] = boutiquesData.map((boutique: Boutique) => ({
        ...boutique,
        displayName: boutique.nom || 'Boutique sans nom',
        displayDescription: boutique.description || 'Aucune description',
        displayStatus: boutique.statut === 'actif' ? 'open' : 'closed'
      }));
      
      setBoutiques(transformedBoutiques);
      console.log('✅ Boutiques récupérées:', transformedBoutiques.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération boutiques:', err);
      setError(`Erreur lors du chargement des boutiques: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setBoutiques([]);
    } finally {
      setLoading(false);
    }
  };

  // Création d'une nouvelle boutique
  const createBoutique = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newBoutique.nom.trim() || !newBoutique.description.trim()) {
        setError('Le nom et la description sont requis');
        return;
      }
      
      const boutiqueData = {
        nom: newBoutique.nom,
        description: newBoutique.description,
        categorie: newBoutique.categorie,
        adresse: newBoutique.adresse,
        telephone: newBoutique.telephone,
        email: newBoutique.email,
        horaires: formatScheduleToString(newBoutique.horaires),
        idProprietaire: user?.uid || 'anonymous',
        dateCreation: new Date().toISOString(),
        statut: 'actif',
        note: 0,
        nombreAvis: 0
      };
      
      await apiFetch('/api/boutiques', {
        method: 'POST',
        body: JSON.stringify(boutiqueData)
      });
      
      console.log('✅ Boutique créée avec succès');
      
      // Réinitialiser le formulaire
      setNewBoutique({
        nom: '',
        description: '',
        categorie: 'restaurant',
        adresse: '',
        telephone: '',
        email: '',
        horaires: { ...defaultSchedule }
      });
      
      setShowCreateModal(false);
      await fetchBoutiques();
      
    } catch (err) {
      console.error('❌ Erreur création boutique:', err);
      setError('Erreur lors de la création de la boutique');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'une boutique
  const deleteBoutique = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      return;
    }
    
    try {
      await apiFetch(`/api/boutiques/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Boutique supprimée:', id);
      await fetchBoutiques();
      
    } catch (err) {
      console.error('❌ Erreur suppression boutique:', err);
      setError('Erreur lors de la suppression');
    }
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      fetchBoutiques();
    }
  }, [user]);

  const filteredBoutiques = boutiques.filter(boutique => {
    const matchesSearch = boutique.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         boutique.displayDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || boutique.categorie === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'closed': return 'Fermé';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800';
  };

  const getCategoryName = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.name : category;
  };

  // Stats calculations
  const totalOpen = boutiques.filter(b => b.displayStatus === 'open').length;
  const totalRevenue = boutiques.reduce((sum, b) => sum + (b.chiffreAffaires || 0), 0);
  const averageRating = boutiques.length > 0 
    ? boutiques.reduce((sum, b) => sum + (b.note || 0), 0) / boutiques.length 
    : 0;
  const totalReviews = boutiques.reduce((sum, b) => sum + (b.nombreAvis || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Boutiques</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos boutiques et points de vente
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nouvelle Boutique
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
            onClick={fetchBoutiques}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            <FiShoppingBag className="w-4 h-4 mr-2" />
            Lire
          </Button>
          <Button 
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
            disabled={filteredBoutiques.length === 0}
          >
            <FiEdit3 className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button 
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={filteredBoutiques.length === 0}
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
                  <p className="text-sm font-medium text-gray-600">Boutiques Ouvertes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalOpen}</p>
                  <p className="text-sm text-green-600 mt-1">Actives</p>
                </div>
                <div className="p-3 rounded-lg bg-[#f01919]">
                  <FiShoppingBag className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalRevenue.toLocaleString()}€</p>
                  <p className="text-sm text-blue-600 mt-1">Total</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <FiDollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{averageRating.toFixed(1)}/5</p>
                  <p className="text-sm text-yellow-600 mt-1">Satisfaction</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500">
                  <FiStar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avis Clients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalReviews}</p>
                  <p className="text-sm text-purple-600 mt-1">Total</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500">
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
                  placeholder="Rechercher une boutique..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Button 
                  onClick={fetchBoutiques} 
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
                  Nouvelle
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
              <p className="text-gray-600">Chargement des boutiques...</p>
            </div>
          )}

          {/* Boutiques List */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBoutiques.map((boutique) => (
                <div key={boutique.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {boutique.displayName}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(boutique.displayStatus || 'closed')}`}>
                          {getStatusLabel(boutique.displayStatus || 'closed')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {boutique.displayDescription}
                      </p>
                      <div className="space-y-2 text-sm text-gray-500 mb-3">
                        {boutique.adresse && (
                          <div className="flex items-center">
                            <FiMapPin className="w-4 h-4 mr-2" />
                            {boutique.adresse}
                          </div>
                        )}
                        {boutique.telephone && (
                          <div className="flex items-center">
                            <FiPhone className="w-4 h-4 mr-2" />
                            {boutique.telephone}
                          </div>
                        )}
                        {boutique.horaires && (
                          <div className="flex items-center">
                            <FiClock className="w-4 h-4 mr-2" />
                            {boutique.horaires}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <FiStar className="w-4 h-4 mr-1 text-yellow-500" />
                          {boutique.note || 0}/5
                        </span>
                        <span>
                          {boutique.nombreAvis || 0} avis
                        </span>
                        {boutique.chiffreAffaires && (
                          <span className="flex items-center">
                            <FiDollarSign className="w-4 h-4 mr-1" />
                            {boutique.chiffreAffaires.toLocaleString()}€
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(boutique.categorie || 'autre')}`}>
                      {getCategoryName(boutique.categorie || 'autre')}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <FiEdit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteBoutique(boutique.id!)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* État vide */}
          {!loading && filteredBoutiques.length === 0 && (
            <div className="text-center py-12">
              <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Aucune boutique trouvée' 
                  : 'Aucune boutique'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory !== 'all'
                  ? 'Aucune boutique ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore créé de boutiques. Créez votre premier point de vente.'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#f01919] hover:bg-[#d01515] text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Créer votre première boutique
                </Button>
              )}
            </div>
          )}
        </>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Boutique</h2>
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

            <form onSubmit={(e) => { e.preventDefault(); createBoutique(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la boutique
                  </label>
                  <Input
                    id="nom"
                    type="text"
                    value={newBoutique.nom}
                    onChange={(e) => setNewBoutique(prev => ({ ...prev, nom: e.target.value }))}
                    placeholder="Ex: Ma Boutique"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    id="categorie"
                    value={newBoutique.categorie}
                    onChange={(e) => setNewBoutique(prev => ({ ...prev, categorie: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newBoutique.description}
                  onChange={(e) => setNewBoutique(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre boutique..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <Input
                  id="adresse"
                  type="text"
                  value={newBoutique.adresse}
                  onChange={(e) => setNewBoutique(prev => ({ ...prev, adresse: e.target.value }))}
                  placeholder="123 Rue de la Paix, Paris"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <Input
                    id="telephone"
                    type="tel"
                    value={newBoutique.telephone}
                    onChange={(e) => setNewBoutique(prev => ({ ...prev, telephone: e.target.value }))}
                    placeholder="01 23 45 67 89"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={newBoutique.email}
                    onChange={(e) => setNewBoutique(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@boutique.com"
                  />
                </div>
              </div>

              {/* Section Horaires Moderne */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    <FiClock className="w-4 h-4 inline mr-2" />
                    Horaires d'ouverture
                  </label>
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={applyToWeekdays}
                      className="text-xs"
                    >
                      Appliquer aux jours ouvrables
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={applyToAllDays}
                      className="text-xs"
                    >
                      Appliquer à tous les jours
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {daysOfWeek.map((day) => {
                    const daySchedule = newBoutique.horaires[day.id];
                    return (
                      <div key={day.id} className="flex items-center space-x-4 bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center space-x-3 min-w-[120px]">
                          <input
                            type="checkbox"
                            id={`${day.id}-open`}
                            checked={daySchedule.isOpen}
                            onChange={(e) => updateDaySchedule(day.id, 'isOpen', e.target.checked)}
                            className="rounded border-gray-300 text-[#f01919] focus:ring-[#f01919]"
                          />
                          <label htmlFor={`${day.id}-open`} className="text-sm font-medium text-gray-700 min-w-[70px]">
                            {day.name}
                          </label>
                        </div>

                        {daySchedule.isOpen ? (
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="flex items-center space-x-2">
                              <label className="text-xs text-gray-500">Ouverture</label>
                              <input
                                type="time"
                                value={daySchedule.openTime}
                                onChange={(e) => updateDaySchedule(day.id, 'openTime', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                              />
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="flex items-center space-x-2">
                              <label className="text-xs text-gray-500">Fermeture</label>
                              <input
                                type="time"
                                value={daySchedule.closeTime}
                                onChange={(e) => updateDaySchedule(day.id, 'closeTime', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 text-sm text-gray-500 italic">
                            Fermé
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Aperçu des horaires */}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">Aperçu des horaires :</p>
                  <p className="text-sm text-blue-700">
                    {formatScheduleToString(newBoutique.horaires)}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <FiShoppingBag className="w-4 h-4 inline mr-1" />
                  Votre boutique sera visible publiquement avec les horaires définis et pourra recevoir des avis clients.
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
                  disabled={loading || !newBoutique.nom.trim() || !newBoutique.description.trim()}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4 mr-2" />
                      Créer
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