'use client';

import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import {
  FiHome,
  FiUser,
  FiUsers,
  FiEdit3,
  FiDollarSign,
  FiTarget,
  FiBarChart,
  FiSettings,
  FiHeart,
  FiTrendingUp,
} from 'react-icons/fi';

export interface MenuItem {
  title: string;
  icon: any;
  href: string;
  submenu?: SubMenuItem[];
  requiredPermission?: 'laalas' | 'contenus' | 'owner-only';
}

export interface SubMenuItem {
  title: string;
  href: string;
  requiredPermission?: 'laalas' | 'contenus' | 'owner-only';
}

// Menu complet avec permissions requises
const ALL_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: FiHome,
    href: '/dashboard',
    // Dashboard accessible à tous (informations générales)
  },
  {
    title: 'Profil',
    icon: FiUser,
    href: '/dashboard/profile',
    requiredPermission: 'owner-only', // Profil réservé au propriétaire
    submenu: [
      { title: 'Mon Profil', href: '/dashboard/profile' },
      { title: 'Mes Boutiques', href: '/dashboard/boutiques' },
      { title: 'Contribution', href: '/dashboard/profile/contribution' },
      { title: 'Cogestionnaires', href: '/dashboard/profile/managers' },
    ],
  },
  {
    title: 'Mes Laalas',
    icon: FiEdit3,
    href: '/dashboard/laalas',
    requiredPermission: 'laalas',
    submenu: [
      { title: 'Gérer Laalas', href: '/dashboard/laalas', requiredPermission: 'laalas' },
      { title: 'Contenu', href: '/dashboard/laalas/content', requiredPermission: 'contenus' },
      { title: 'Programmation', href: '/dashboard/laalas/schedule', requiredPermission: 'laalas' },
      { title: 'Booster', href: '/dashboard/laalas/boost', requiredPermission: 'owner-only' },
      { title: 'Espaces Laala', href: '/dashboard/laalas/spaces', requiredPermission: 'laalas' },
    ],
  },
  {
    title: 'Fans/Friends',
    icon: FiUsers,
    href: '/dashboard/fans',
    requiredPermission: 'owner-only', // Gestion des fans réservée au propriétaire
    submenu: [
      { title: 'Voir Fans/Friends', href: '/dashboard/fans' },
      { title: 'Activité Rentable', href: '/dashboard/fans/profitable' },
      { title: 'Activité Active', href: '/dashboard/fans/active' },
      { title: 'Nouveaux Fans', href: '/dashboard/fans/new' },
      { title: 'Communications', href: '/dashboard/fans/communications' },
      { title: 'Campagnes', href: '/dashboard/fans/campaigns' },
      { title: 'Démographie', href: '/dashboard/fans/demographics' },
    ],
  },
  {
    title: 'Mes Gains',
    icon: FiDollarSign,
    href: '/dashboard/earnings',
    requiredPermission: 'owner-only', // Finances réservées au propriétaire
    submenu: [
      { title: 'Demander Retrait', href: '/dashboard/retraits' },
      { title: 'Revenus Directs', href: '/dashboard/earnings/direct' },
      { title: 'Revenus Indirects', href: '/dashboard/earnings/indirect' },
      { title: 'Couris', href: '/dashboard/earnings/couris' },
      { title: 'Publicité', href: '/dashboard/earnings/ads' },
      { title: 'Historique', href: '/dashboard/earnings/history' },
    ],
  },
  {
    title: 'Publicités',
    icon: FiTarget,
    href: '/dashboard/ads',
    requiredPermission: 'owner-only', // Publicités réservées au propriétaire
    submenu: [
      { title: 'Nouvelles Propositions', href: '/dashboard/ads/proposals' },
      { title: 'Activités', href: '/dashboard/ads/activities' },
      { title: 'Gérer Pubs', href: '/dashboard/ads/manage' },
      { title: 'Anciennes Pubs', href: '/dashboard/ads/history' },
    ],
  },
  {
    title: 'Statistiques',
    icon: FiBarChart,
    href: '/dashboard/stats',
    submenu: [
      { title: 'Laalas', href: '/dashboard/stats/laalas', requiredPermission: 'laalas' },
      { title: 'Contenu', href: '/dashboard/stats/content', requiredPermission: 'contenus' },
      { title: 'Revenus', href: '/dashboard/stats/revenue', requiredPermission: 'owner-only' },
      { title: 'Profil', href: '/dashboard/stats/profile', requiredPermission: 'owner-only' },
      { title: 'Publicité', href: '/dashboard/stats/ads', requiredPermission: 'owner-only' },
    ],
  },
];

export function useFilteredMenu() {
  const { check, loading } = usePermissions();

  const filteredMenu = useMemo(() => {
    if (loading) return [];

    return ALL_MENU_ITEMS.filter(item => {
      // Vérifier si l'utilisateur a accès à l'élément principal
      if (!hasPermissionForItem(item, check)) {
        return false;
      }

      // Filtrer les sous-menus selon les permissions
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(subItem => 
          hasPermissionForItem(subItem, check)
        );
        
        // Si aucun sous-menu n'est accessible, cacher l'élément principal
        if (filteredSubmenu.length === 0 && item.requiredPermission) {
          return false;
        }

        // Mettre à jour le sous-menu filtré
        item.submenu = filteredSubmenu;
      }

      return true;
    });
  }, [check, loading]);

  return { filteredMenu, loading };
}

function hasPermissionForItem(
  item: MenuItem | SubMenuItem, 
  check: any
): boolean {
  if (!item.requiredPermission) {
    return true; // Pas de permission requise = accessible à tous
  }

  if (item.requiredPermission === 'owner-only') {
    return check.isOwner; // Réservé au propriétaire
  }

  if (item.requiredPermission === 'laalas') {
    return check.canAccess('laalas');
  }

  if (item.requiredPermission === 'contenus') {
    return check.canAccess('contenus');
  }

  return false;
}
