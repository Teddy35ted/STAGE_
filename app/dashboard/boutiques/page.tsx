'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { MediaUpload } from '../../../components/ui/media-upload';
import { useApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useCRUDNotifications } from '../../../contexts/NotificationContext';
import { Boutique } from '../../models/boutiques';
import { MediaUploadResult } from '../../../lib/appwrite/media-service';
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
  FiCheck,
  FiImage,
  FiAlertTriangle,
  FiSettings,
  FiMail
} from 'react-icons/fi';

interface BoutiqueExtended extends Boutique {
  displayName?: string;
  displayDescription?: string;
  displayStatus?: 'open' | 'closed' | 'pending';
  telephone?: string;
  categorie?: string;
  note?: number;
  nombreAvis?: number;
  chiffreAffaires?: number;
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
  { id: 'restaurant', name: 'Restaurant', color: 'bg-orange-100 text-orange-800', emoji: '🍽️' },
  { id: 'mode', name: 'Mode', color: 'bg-pink-100 text-pink-800', emoji: '👗' },
  { id: 'electronique', name: 'Électronique', color: 'bg-blue-100 text-blue-800', emoji: '📱' },
  { id: 'beaute', name: 'Beauté', color: 'bg-purple-100 text-purple-800', emoji: '💄' },
  { id: 'sport', name: 'Sport', color: 'bg-green-100 text-green-800', emoji: '⚽' },
  { id: 'maison', name: 'Maison', color: 'bg-yellow-100 text-yellow-800', emoji: '🏠' },
  { id: 'autre', name: 'Autre', color: 'bg-gray-100 text-gray-800', emoji: '🏪' }
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
  const { notifyCreate, notifyUpdate, notifyDelete } = useCRUDNotifications();
  const [boutiques, setBoutiques] = useState<BoutiqueExtended[]>([]);
  const [selectedTab, setSelectedTab] = useState<'boutiques'>('boutiques');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBoutique, setSelectedBoutique] = useState<BoutiqueExtended | null>(null);
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

  // États pour les médias
  const [coverImage, setCoverImage] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

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
        displayDescription: boutique.desc || 'Aucune description', // utiliser desc au lieu de description
        displayStatus: boutique.isdesactive ? 'closed' : 'open', // utiliser isdesactive au lieu de statut
        telephone: boutique.adresse || '', // placeholder pour telephone
        categorie: 'commerce', // valeur par défaut
        note: boutique.etoile || 0, // utiliser etoile comme note
        nombreAvis: boutique.lesClients?.length || 0, // utiliser lesClients comme avis
        chiffreAffaires: boutique.balance || 0 // utiliser balance comme CA
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

  // Gestion des uploads de médias
  const handleImageUpload = (result: MediaUploadResult) => {
    setUploadedImages(prev => [...prev, result.url]);
    console.log('Image ajoutée:', result);
  };

  const handleCoverUpload = (result: MediaUploadResult) => {
    setCoverImage(result.url);
    console.log('Image de couverture définie:', result);
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
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
        cover: coverImage,
        images: uploadedImages,
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
      notifyCreate('Boutique', newBoutique.nom, true);
      
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
      setCoverImage('');
      setUploadedImages([]);
      
      setShowCreateModal(false);
      await fetchBoutiques();
      
    } catch (err) {
      console.error('❌ Erreur création boutique:', err);
      notifyCreate('Boutique', newBoutique.nom, false);
      setError('Erreur lors de la création de la boutique');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'une boutique
  const deleteBoutique = async (id: string) => {
    // Trouver la boutique pour récupérer son nom
    const boutique = boutiques.find(b => b.id === id);
    const boutiqueName = boutique?.displayName || boutique?.nom || 'Boutique inconnue';
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la boutique "${boutiqueName}" ?`)) {
      return;
    }
    
    try {
      await apiFetch(`/api/boutiques/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Boutique supprimée:', id);
      notifyDelete('Boutique', boutiqueName, true);
      await fetchBoutiques();
      
    } catch (err) {
      console.error('❌ Erreur suppression boutique:', err);
      notifyDelete('Boutique', boutiqueName, false);
      setError('Erreur lors de la suppression');
    }
  };

  // Fonction pour voir les détails d'une boutique (READ)
  const viewBoutiqueDetails = (boutique: BoutiqueExtended) => {
    console.log('📖 Lecture boutique:', boutique.nom);
    setSelectedBoutique(boutique);
    setShowDetailModal(true);
  };

  // Fonction pour modifier une boutique (UPDATE)
  const editBoutique = (boutique: BoutiqueExtended) => {
    console.log('✏️ Modification boutique:', boutique.nom);
    setSelectedBoutique(boutique);
    
    // Pré-remplir le formulaire avec les données de la boutique
    setNewBoutique({
      nom: boutique.nom || '',
      description: boutique.desc || '',
      categorie: boutique.categorie || 'restaurant',
      adresse: boutique.adresse || '',
      telephone: boutique.telephone || '',
      email: '', // Email n'existe pas dans le modèle Boutique
      horaires: Array.isArray(boutique.horaires) && boutique.horaires.length > 0 
        ? convertHorairesToSchedule(boutique.horaires) 
        : { ...defaultSchedule }
    });
    
    // Définir les médias existants
    setCoverImage(boutique.cover || '');
    setUploadedImages([]); // Images en array n'existe pas dans le modèle de base
    
    setShowEditModal(true);
  };

  // Fonction pour convertir les horaires du modèle en format WeekSchedule
  const convertHorairesToSchedule = (horaires: any[]): WeekSchedule => {
    const schedule: WeekSchedule = { ...defaultSchedule };
    
    // Convertir chaque horaire du modèle vers notre format
    horaires.forEach(horaire => {
      if (horaire.jour && typeof horaire.start === 'number' && typeof horaire.end === 'number') {
        const dayName = horaire.jour.toLowerCase();
        if (schedule[dayName]) {
          schedule[dayName] = {
            isOpen: true,
            openTime: `${Math.floor(horaire.start / 100).toString().padStart(2, '0')}:${(horaire.start % 100).toString().padStart(2, '0')}`,
            closeTime: `${Math.floor(horaire.end / 100).toString().padStart(2, '0')}:${(horaire.end % 100).toString().padStart(2, '0')}`
          };
        }
      }
    });
    
    return schedule;
  };

  // Mise à jour d'une boutique existante
  const updateBoutique = async () => {
    if (!selectedBoutique) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!newBoutique.nom.trim() || !newBoutique.description.trim()) {
        setError('Le nom et la description sont requis');
        return;
      }
      
      const boutiqueData = {
        nom: newBoutique.nom,
        desc: newBoutique.description, // Utiliser 'desc' au lieu de 'description'
        categorie: newBoutique.categorie,
        adresse: newBoutique.adresse,
        telephone: newBoutique.telephone,
        email: newBoutique.email,
        horaires: formatScheduleToString(newBoutique.horaires),
        cover: coverImage,
        images: uploadedImages,
        dateModification: new Date().toISOString()
      };
      
      await apiFetch(`/api/boutiques/${selectedBoutique.id}`, {
        method: 'PUT',
        body: JSON.stringify(boutiqueData)
      });
      
      console.log('✅ Boutique mise à jour avec succès');
      notifyUpdate('Boutique', newBoutique.nom, true);
      
      // Réinitialiser les états
      setSelectedBoutique(null);
      setShowEditModal(false);
      
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
      setCoverImage('');
      setUploadedImages([]);
      
      await fetchBoutiques();
      
    } catch (err) {
      console.error('❌ Erreur mise à jour boutique:', err);
      notifyUpdate('Boutique', newBoutique.nom, false);
      setError('Erreur lors de la mise à jour de la boutique');
    } finally {
      setLoading(false);
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
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
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
                        {boutique.horaires && Array.isArray(boutique.horaires) && boutique.horaires.length > 0 && (
                          <div className="flex items-center">
                            <FiClock className="w-4 h-4 mr-2" />
                            {boutique.horaires.length} horaire(s) défini(s)
                          </div>
                        )}
                        {boutique.horaires && !Array.isArray(boutique.horaires) && (
                          <div className="flex items-center">
                            <FiClock className="w-4 h-4 mr-2" />
                            Horaires disponibles
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
                  
                  {/* Actions de la boutique */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(boutique.categorie || 'autre')}`}>
                        {getCategoryName(boutique.categorie || 'autre')}
                      </span>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => viewBoutiqueDetails(boutique)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Voir les détails"
                        >
                          <FiShoppingBag className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => editBoutique(boutique)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          title="Modifier la boutique"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteBoutique(boutique.id!)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Supprimer la boutique"
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

      {/* Modal de création moderne */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-yellow-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-[#f01919] to-[#d01515] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Nouvelle Boutique</h2>
                    <p className="text-red-100 text-sm">Créez votre point de vente</p>
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

              <form onSubmit={(e) => { e.preventDefault(); createBoutique(); }} className="space-y-6">
                {/* Informations de base */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiSettings className="w-5 h-5 mr-2 text-[#f01919]" />
                    Informations de base
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la boutique *
                      </label>
                      <Input
                        id="nom"
                        type="text"
                        value={newBoutique.nom}
                        onChange={(e) => setNewBoutique(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Ma Boutique"
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie
                      </label>
                      <select
                        id="categorie"
                        value={newBoutique.categorie}
                        onChange={(e) => setNewBoutique(prev => ({ ...prev, categorie: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919] transition-all duration-200"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <Textarea
                      id="description"
                      value={newBoutique.description}
                      onChange={(e) => setNewBoutique(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez votre boutique, vos produits, votre expertise..."
                      rows={4}
                      className="transition-all duration-200 focus:ring-2 focus:ring-[#f01919] focus:border-[#f01919] resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiMapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Coordonnées
                  </h3>
                  
                  <div>
                    <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <Input
                      id="adresse"
                      type="text"
                      value={newBoutique.adresse}
                      onChange={(e) => setNewBoutique(prev => ({ ...prev, adresse: e.target.value }))}
                      placeholder="123 Rue de la Paix, 75001 Paris"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                        <FiPhone className="w-4 h-4 inline mr-1" />
                        Téléphone
                      </label>
                      <Input
                        id="telephone"
                        type="tel"
                        value={newBoutique.telephone}
                        onChange={(e) => setNewBoutique(prev => ({ ...prev, telephone: e.target.value }))}
                        placeholder="01 23 45 67 89"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        <FiMail className="w-4 h-4 inline mr-1" />
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={newBoutique.email}
                        onChange={(e) => setNewBoutique(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@boutique.com"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="bg-purple-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiImage className="w-5 h-5 mr-2 text-purple-600" />
                    Images de la boutique
                  </h3>
                  
                  {/* Image de couverture */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h4 className="font-medium text-gray-900 mb-3">Image de couverture</h4>
                    <MediaUpload
                      category="boutique-image"
                      userId={user?.uid || 'anonymous'}
                      acceptedTypes="image/*"
                      maxSize={10 * 1024 * 1024}
                      label="Sélectionner l'image principale"
                      description="Image qui représentera votre boutique (recommandé)"
                      onUploadSuccess={handleCoverUpload}
                      onUploadError={(error: string) => {
                        console.error('Erreur upload couverture:', error);
                        setError(error);
                      }}
                      preview={true}
                    />
                    {coverImage && (
                      <div className="mt-4 flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={coverImage} 
                            alt="Couverture" 
                            className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200"
                          />
                          <div className="absolute -top-2 -right-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <FiCheck className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Image de couverture ajoutée</p>
                          <p className="text-xs text-gray-500">Prête à être utilisée</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Images supplémentaires */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h4 className="font-medium text-gray-900 mb-3">Images de présentation</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Ajoutez des images pour présenter vos produits, votre espace, votre équipe...
                    </p>
                    
                    <MediaUpload
                      category="boutique-image"
                      userId={user?.uid || 'anonymous'}
                      acceptedTypes="image/*"
                      maxSize={10 * 1024 * 1024}
                      label="Ajouter une image"
                      description="Images JPG, PNG ou GIF de moins de 10MB"
                      onUploadSuccess={handleImageUpload}
                      onUploadError={(error: string) => {
                        console.error('Erreur upload image:', error);
                      }}
                      preview={false}
                    />

                    {/* Galerie des images uploadées */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                        {uploadedImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Horaires */}
                <div className="bg-green-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiClock className="w-5 h-5 mr-2 text-green-600" />
                      Horaires d'ouverture
                    </h3>
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={applyToWeekdays}
                        className="text-xs border-green-300 text-green-600 hover:bg-green-50"
                      >
                        Jours ouvrables
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={applyToAllDays}
                        className="text-xs border-green-300 text-green-600 hover:bg-green-50"
                      >
                        Tous les jours
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3 border border-green-200">
                    {daysOfWeek.map((day) => {
                      const daySchedule = newBoutique.horaires[day.id];
                      return (
                        <div key={day.id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3 min-w-[120px]">
                            <input
                              type="checkbox"
                              id={`${day.id}-open`}
                              checked={daySchedule.isOpen}
                              onChange={(e) => updateDaySchedule(day.id, 'isOpen', e.target.checked)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
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
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <span className="text-gray-400">-</span>
                              <div className="flex items-center space-x-2">
                                <label className="text-xs text-gray-500">Fermeture</label>
                                <input
                                  type="time"
                                  value={daySchedule.closeTime}
                                  onChange={(e) => updateDaySchedule(day.id, 'closeTime', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-medium mb-1">Aperçu des horaires :</p>
                    <p className="text-sm text-green-700">
                      {formatScheduleToString(newBoutique.horaires)}
                    </p>
                  </div>
                </div>

                {/* Message informatif */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FiShoppingBag className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-800 font-medium">À propos de votre boutique</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Votre boutique sera visible publiquement avec les horaires d��finis et pourra recevoir des avis clients.
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
                    disabled={loading || !newBoutique.nom.trim() || !newBoutique.description.trim()}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4 mr-2" />
                        Créer la Boutique
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de boutique (READ) */}
      {showDetailModal && selectedBoutique && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header du modal de détails */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Détails de la boutique</h2>
                    <p className="text-blue-100 text-sm">{selectedBoutique.displayName}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedBoutique(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Contenu du modal de détails */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne principale - Informations */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Informations générales */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiSettings className="w-5 h-5 mr-2 text-blue-600" />
                      Informations générales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nom</label>
                        <p className="text-gray-900 font-medium">{selectedBoutique.nom}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Catégorie</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedBoutique.categorie || 'autre')}`}>
                          {getCategoryName(selectedBoutique.categorie || 'autre')}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-gray-900">{selectedBoutique.desc || 'Aucune description'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiMapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Localisation
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FiMapPin className="w-4 h-4 mr-3 text-gray-500" />
                        <span className="text-gray-900">{selectedBoutique.adresse || 'Adresse non renseignée'}</span>
                      </div>
                      {selectedBoutique.telephone && (
                        <div className="flex items-center">
                          <FiPhone className="w-4 h-4 mr-3 text-gray-500" />
                          <span className="text-gray-900">{selectedBoutique.telephone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Horaires */}
                  {selectedBoutique.horaires && Array.isArray(selectedBoutique.horaires) && selectedBoutique.horaires.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiClock className="w-5 h-5 mr-2 text-green-600" />
                        Horaires d'ouverture
                      </h3>
                      <div className="space-y-2">
                        {selectedBoutique.horaires.map((horaire: any, index: number) => (
                          <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                            <span className="font-medium text-gray-700 capitalize">{horaire.jour}</span>
                            <span className="text-gray-600">
                              {Math.floor(horaire.start / 100).toString().padStart(2, '0')}:
                              {(horaire.start % 100).toString().padStart(2, '0')} - 
                              {Math.floor(horaire.end / 100).toString().padStart(2, '0')}:
                              {(horaire.end % 100).toString().padStart(2, '0')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Affichage alternatif si horaires n'est pas un tableau */}
                  {selectedBoutique.horaires && !Array.isArray(selectedBoutique.horaires) && (
                    <div className="bg-green-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiClock className="w-5 h-5 mr-2 text-green-600" />
                        Horaires d'ouverture
                      </h3>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-700">
                          {typeof selectedBoutique.horaires === 'string' 
                            ? selectedBoutique.horaires 
                            : 'Horaires disponibles (format non standard)'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colonne latérale - Statistiques et image */}
                <div className="space-y-6">
                  {/* Image de couverture */}
                  {selectedBoutique.cover && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <img 
                        src={selectedBoutique.cover} 
                        alt={selectedBoutique.nom}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Statistiques */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiTrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                      Statistiques
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Note</span>
                        <div className="flex items-center space-x-1">
                          <FiStar className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{selectedBoutique.etoile || 0}/5</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Clients</span>
                        <span className="font-medium">{selectedBoutique.lesClients?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Likes</span>
                        <span className="font-medium">{selectedBoutique.likes || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Consultations</span>
                        <span className="font-medium">{selectedBoutique.nbrConsultes || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Balance</span>
                        <div className="flex items-center space-x-1">
                          <FiDollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{selectedBoutique.balance || 0}€</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">État</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedBoutique.displayStatus || 'closed')}`}>
                          {getStatusLabel(selectedBoutique.displayStatus || 'closed')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Certifiée</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedBoutique.iscert ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedBoutique.iscert ? 'Oui' : 'Non'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Boostée</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedBoutique.isboosted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedBoutique.isboosted ? 'Oui' : 'Non'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions en bas */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDetailModal(false);
                    editBoutique(selectedBoutique);
                  }}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <FiEdit3 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedBoutique(null);
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

      {/* Modal de modification de boutique (UPDATE) */}
      {showEditModal && selectedBoutique && (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-yellow-50/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiEdit3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Modifier la boutique</h2>
                    <p className="text-orange-100 text-sm">{selectedBoutique.displayName}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBoutique(null);
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
                    setCoverImage('');
                    setUploadedImages([]);
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

              <form onSubmit={(e) => { e.preventDefault(); updateBoutique(); }} className="space-y-6">
                {/* Informations de base */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiSettings className="w-5 h-5 mr-2 text-orange-600" />
                    Informations de base
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la boutique *
                      </label>
                      <Input
                        id="edit-nom"
                        type="text"
                        value={newBoutique.nom}
                        onChange={(e) => setNewBoutique(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Ma Boutique"
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-categorie" className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie
                      </label>
                      <select
                        id="edit-categorie"
                        value={newBoutique.categorie}
                        onChange={(e) => setNewBoutique(prev => ({ ...prev, categorie: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <Textarea
                      id="edit-description"
                      value={newBoutique.description}
                      onChange={(e) => setNewBoutique(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez votre boutique, vos produits, votre expertise..."
                      rows={4}
                      className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiMapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Coordonnées
                  </h3>
                  
                  <div>
                    <label htmlFor="edit-adresse" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <Input
                      id="edit-adresse"
                      type="text"
                      value={newBoutique.adresse}
                      onChange={(e) => setNewBoutique(prev => ({ ...prev, adresse: e.target.value }))}
                      placeholder="123 Rue de la Paix, 75001 Paris"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-telephone" className="block text-sm font-medium text-gray-700 mb-2">
                        <FiPhone className="w-4 h-4 inline mr-1" />
                        Téléphone
                      </label>
                      <Input
                        id="edit-telephone"
                        type="tel"
                        value={newBoutique.telephone}
                        onChange={(e) => setNewBoutique(prev => ({ ...prev, telephone: e.target.value }))}
                        placeholder="01 23 45 67 89"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">
                        <FiMail className="w-4 h-4 inline mr-1" />
                        Email
                      </label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={newBoutique.email}
                        onChange={(e) => setNewBoutique(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@boutique.com"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="bg-purple-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiImage className="w-5 h-5 mr-2 text-purple-600" />
                    Images de la boutique
                  </h3>
                  
                  {/* Image de couverture */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h4 className="font-medium text-gray-900 mb-3">Image de couverture</h4>
                    <MediaUpload
                      category="boutique-image"
                      userId={user?.uid || 'anonymous'}
                      acceptedTypes="image/*"
                      maxSize={10 * 1024 * 1024}
                      label="Changer l'image principale"
                      description="Nouvelle image qui représentera votre boutique"
                      onUploadSuccess={handleCoverUpload}
                      onUploadError={(error: string) => {
                        console.error('Erreur upload couverture:', error);
                        setError(error);
                      }}
                      preview={true}
                    />
                    {coverImage && (
                      <div className="mt-4 flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={coverImage} 
                            alt="Couverture" 
                            className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200"
                          />
                          <div className="absolute -top-2 -right-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <FiCheck className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Image de couverture</p>
                          <p className="text-xs text-gray-500">Prête à être utilisée</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Horaires */}
                <div className="bg-green-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiClock className="w-5 h-5 mr-2 text-green-600" />
                      Horaires d'ouverture
                    </h3>
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={applyToWeekdays}
                        className="text-xs border-green-300 text-green-600 hover:bg-green-50"
                      >
                        Jours ouvrables
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={applyToAllDays}
                        className="text-xs border-green-300 text-green-600 hover:bg-green-50"
                      >
                        Tous les jours
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3 border border-green-200">
                    {daysOfWeek.map((day) => {
                      const daySchedule = newBoutique.horaires[day.id];
                      return (
                        <div key={day.id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3 min-w-[120px]">
                            <input
                              type="checkbox"
                              id={`edit-${day.id}-open`}
                              checked={daySchedule.isOpen}
                              onChange={(e) => updateDaySchedule(day.id, 'isOpen', e.target.checked)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <label htmlFor={`edit-${day.id}-open`} className="text-sm font-medium text-gray-700 min-w-[70px]">
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
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <span className="text-gray-400">-</span>
                              <div className="flex items-center space-x-2">
                                <label className="text-xs text-gray-500">Fermeture</label>
                                <input
                                  type="time"
                                  value={daySchedule.closeTime}
                                  onChange={(e) => updateDaySchedule(day.id, 'closeTime', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-medium mb-1">Aperçu des horaires :</p>
                    <p className="text-sm text-green-700">
                      {formatScheduleToString(newBoutique.horaires)}
                    </p>
                  </div>
                </div>

                {/* Message informatif */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FiEdit3 className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-orange-800 font-medium">Modification de votre boutique</h4>
                      <p className="text-orange-700 text-sm mt-1">
                        Les modifications seront visibles immédiatement après sauvegarde.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedBoutique(null);
                    }}
                    disabled={loading}
                    className="px-6 py-2"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || !newBoutique.nom.trim() || !newBoutique.description.trim()}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4 mr-2" />
                        Sauvegarder les modifications
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