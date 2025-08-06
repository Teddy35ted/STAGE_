'use client';

import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiUsers, 
  FiEdit3, 
  FiTarget, 
  FiEye,
  FiBell,
  FiCalendar,
  FiMessageSquare
} from 'react-icons/fi';
import { ContactPopup } from '../../components/dashboard/ContactPopup';
import { NotificationPopup } from '../../components/dashboard/NotificationPopup';
import { useCRUDNotifications } from '../../contexts/NotificationContext';
import { useApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { LaalaDashboard } from '../models/laala';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  color,
  onClick 
}) => {
  const changeColor = changeType === 'positive' ? 'text-green-600' : 
                     changeType === 'negative' ? 'text-red-600' : 'text-gray-600';

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs sm:text-sm mt-1 ${changeColor} truncate`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0 ml-2`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

interface NotificationProps {
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
}

const NotificationItem: React.FC<NotificationProps> = ({ title, message, time, type }) => {
  const typeColors = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="flex items-start space-x-3 p-4 border-b border-gray-100 last:border-b-0">
      <div className={`p-2 rounded-full ${typeColors[type]}`}>
        <FiBell className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { notifyCreate, notifyUpdate, notifyDelete } = useCRUDNotifications();
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false);
  
  // États pour les données dynamiques
  const [laalasCount, setLaalasCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Récupération du nombre de Laalas de l'utilisateur
  const fetchUserLaalas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('👤 Utilisateur non connecté');
        setLaalasCount(0);
        setLoading(false);
        return;
      }
      
      console.log('🔍 Récupération des laalas pour utilisateur:', user.uid);
      const laalasData = await apiFetch('/api/laalas');
      
      if (!Array.isArray(laalasData)) {
        console.warn('⚠️ Réponse API inattendue:', laalasData);
        setLaalasCount(0);
        return;
      }
      
      // Filtrer les laalas actifs (non supprimés et publics ou en cours)
      const activeLaalas = laalasData.filter((laala: LaalaDashboard) => 
        laala.idCreateur === user.uid && 
        (laala.isLaalaPublic || laala.encours) &&
        !laala.isSignaler
      );
      
      setLaalasCount(activeLaalas.length);
      console.log('✅ Nombre de laalas actifs trouvés:', activeLaalas.length);
      
    } catch (err) {
      console.error('❌ Erreur récupération laalas:', err);
      setError('Erreur lors du chargement des données');
      setLaalasCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    if (user) {
      fetchUserLaalas();
    } else {
      setLaalasCount(0);
      setLoading(false);
    }
  }, [user]);

  const notifications = [
    {
      title: 'Nouveau fan',
      message: '5 nouveaux fans ont rejoint votre communauté',
      time: 'Il y a 2 heures',
      type: 'success' as const,
    },
    {
      title: 'Proposition publicitaire',
      message: 'Nouvelle proposition pour votre espace Laala',
      time: 'Il y a 4 heures',
      type: 'info' as const,
    },
    {
      title: 'Retrait en attente',
      message: 'Votre demande de retrait est en cours de traitement',
      time: 'Il y a 1 jour',
      type: 'warning' as const,
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Bienvenue sur votre tableau de bord Animateur Pro
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification Icon in Header */}
          <button
            onClick={() => setIsNotificationPopupOpen(true)}
            className="relative p-2 text-gray-600 hover:text-[#f01919] hover:bg-gray-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <FiBell className="w-5 h-5" />
            {/* Notification Badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </button>
          
          {/* Date */}
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
            <FiCalendar className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            <span className="sm:hidden">{new Date().toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'short' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <FiBell className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Montant gagné ce mois"
          value="2,450 €"
          change="+12% vs mois dernier"
          changeType="positive"
          icon={FiDollarSign}
          color="bg-[#f01919]"
        />
        <MetricCard
          title="Couris disponibles"
          value="850 €"
          change="Prêt à retirer"
          changeType="neutral"
          icon={FiTrendingUp}
          color="bg-green-500"
        />
        <MetricCard
          title="Total Fans/Friends"
          value="12,847"
          change="+156 cette semaine"
          changeType="positive"
          icon={FiUsers}
          color="bg-blue-500"
        />
        <MetricCard
          title="Laalas actifs"
          value={loading ? "..." : laalasCount.toString()}
          change={loading ? "Chargement..." : laalasCount === 0 ? "Aucun laala créé • Cliquez pour actualiser" : `${laalasCount === 1 ? "1 laala" : `${laalasCount} laalas`} en ligne • Cliquez pour actualiser`}
          changeType="neutral"
          icon={FiEdit3}
          color="bg-purple-500"
          onClick={() => {
            if (!loading) {
              fetchUserLaalas();
            }
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button className="flex items-center space-x-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-[#f01919] hover:bg-red-50 transition-colors">
            <FiEdit3 className="w-5 h-5 text-[#f01919] flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 truncate">Créer un Laala</span>
          </button>
          <button className="flex items-center space-x-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-[#f01919] hover:bg-red-50 transition-colors">
            <FiDollarSign className="w-5 h-5 text-[#f01919] flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 truncate">Demander un retrait</span>
          </button>
          <button className="flex items-center space-x-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-[#f01919] hover:bg-red-50 transition-colors">
            <FiTarget className="w-5 h-5 text-[#f01919] flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 truncate">Voir les pubs</span>
          </button>
          <button className="flex items-center space-x-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-[#f01919] hover:bg-red-50 transition-colors">
            <FiUsers className="w-5 h-5 text-[#f01919] flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 truncate">Analyser fans</span>
          </button>
        </div>
        
        {/* Test Notifications Section */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Test des Notifications</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <button 
              onClick={() => notifyCreate('Laala', 'Test Laala', true)}
              className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              ✓ Création
            </button>
            <button 
              onClick={() => notifyUpdate('Boutique', 'Ma Boutique', true)}
              className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              ↻ Mise à jour
            </button>
            <button 
              onClick={() => notifyDelete('Contenu', 'Article test', true)}
              className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              🗑 Suppression
            </button>
            <button 
              onClick={() => notifyCreate('Test', 'Opération', false)}
              className="px-3 py-2 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
            >
              ⚠ Erreur
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Nouveau contenu publié sur "Mon Laala Lifestyle"</p>
                  <p className="text-xs text-gray-500">Il y a 30 minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">15 nouveaux likes sur votre dernier post</p>
                  <p className="text-xs text-gray-500">Il y a 1 heure</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Paiement de 125€ reçu</p>
                  <p className="text-xs text-gray-500">Il y a 3 heures</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div>
            {notifications.map((notification, index) => (
              <NotificationItem key={index} {...notification} />
            ))}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu des performances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiEye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">45.2K</p>
            <p className="text-xs sm:text-sm text-gray-600">Vues ce mois</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiTrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">8.7%</p>
            <p className="text-xs sm:text-sm text-gray-600">Taux d'engagement</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiTarget className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">92%</p>
            <p className="text-xs sm:text-sm text-gray-600">Objectif atteint</p>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        {/* Notification Button */}
        <button
          onClick={() => setIsNotificationPopupOpen(true)}
          className="relative w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title="Notifications"
        >
          <FiBell className="w-6 h-6" />
          {/* Notification Badge */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">3</span>
          </div>
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Notifications
          </div>
        </button>

        {/* Contact Button */}
        <button
          onClick={() => setIsContactPopupOpen(true)}
          className="relative w-14 h-14 bg-[#f01919] hover:bg-[#d01515] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title="Contacter Laala"
        >
          <FiMessageSquare className="w-6 h-6" />
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Contacter Laala
          </div>
        </button>
      </div>

      {/* Popups */}
      <ContactPopup 
        isOpen={isContactPopupOpen} 
        onClose={() => setIsContactPopupOpen(false)} 
      />
      <NotificationPopup 
        isOpen={isNotificationPopupOpen} 
        onClose={() => setIsNotificationPopupOpen(false)} 
      />
    </div>
  );
}