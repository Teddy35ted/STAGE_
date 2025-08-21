'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCoGestionnairePermissions } from '../../hooks/useCoGestionnairePermissions';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '../ui/sidebar';
import { Button } from '../ui/button';
import {
  FiHome,
  FiUser,
  FiUsers,
  FiDollarSign,
  FiTarget,
  FiBarChart,
  FiMessageSquare,
  FiLogOut,
  FiSettings,
  FiEdit3,
  FiHeart,
  FiTrendingUp,
} from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  href: string;
  requiredPermission?: 'laalas' | 'contenus'; // Permission requise pour voir cette section
  submenu?: Array<{
    title: string;
    href: string;
    requiredPermission?: 'laalas' | 'contenus';
  }>;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: FiHome,
    href: '/dashboard',
  },
  {
    title: 'Profil',
    icon: FiUser,
    href: '/dashboard/profile',
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
    requiredPermission: 'laalas', // Section nécessite permission laalas
    submenu: [
      { title: 'Gérer Laalas', href: '/dashboard/laalas', requiredPermission: 'laalas' },
      { title: 'Contenu', href: '/dashboard/laalas/content', requiredPermission: 'contenus' },
      { title: 'Programmation', href: '/dashboard/laalas/schedule', requiredPermission: 'laalas' },
      { title: 'Booster', href: '/dashboard/laalas/boost', requiredPermission: 'laalas' },
      { title: 'Espaces Laala', href: '/dashboard/laalas/spaces', requiredPermission: 'laalas' },
    ],
  },
  {
    title: 'Fans/Friends',
    icon: FiUsers,
    href: '/dashboard/fans',
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
      { title: 'Revenus', href: '/dashboard/stats/revenue' },
      { title: 'Profil', href: '/dashboard/stats/profile' },
      { title: 'Publicité', href: '/dashboard/stats/ads' },
    ],
  },
];

export const DashboardSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { hasPermission, isCoGestionnaire, getUserDisplayEmail, loading } = useCoGestionnairePermissions();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction pour vérifier si un menu item doit être affiché
  const shouldShowMenuItem = (item: MenuItem): boolean => {
    // Si pas de permission requise, toujours afficher
    if (!item.requiredPermission) return true;
    
    // Si l'utilisateur n'est pas un co-gestionnaire (donc animateur principal), toujours afficher
    if (!isCoGestionnaire()) return true;
    
    // Si l'utilisateur est un co-gestionnaire, vérifier ses permissions
    return hasPermission(item.requiredPermission);
  };

  // Fonction pour filtrer les sous-menus
  const getFilteredSubmenu = (submenu?: MenuItem['submenu']) => {
    if (!submenu) return undefined;
    
    return submenu.filter(subItem => {
      if (!subItem.requiredPermission) return true;
      if (!isCoGestionnaire()) return true;
      return hasPermission(subItem.requiredPermission);
    });
  };

  // Filtrer les menu items selon les permissions
  const filteredMenuItems = menuItems.filter(shouldShowMenuItem);

  if (loading) {
    return (
      <Sidebar className="bg-white border-r border-gray-200">
        <SidebarHeader className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#f01919] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">La-a-La</h2>
              <p className="text-sm text-gray-600">Chargement...</p>
            </div>
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#f01919] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">La-a-La</h2>
            <p className="text-sm text-gray-600">
              {isCoGestionnaire() ? 'Co-gestionnaire' : 'Animateur Pro'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const filteredSubmenu = getFilteredSubmenu(item.submenu);
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      className="w-full justify-start"
                    >
                      <Link href={item.href} className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {filteredSubmenu && pathname && pathname.startsWith(item.href) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {filteredSubmenu.map((subItem) => (
                          <SidebarMenuButton
                            key={subItem.href}
                            asChild
                            isActive={pathname === subItem.href}
                            size="sm"
                            className="w-full justify-start text-gray-600"
                          >
                            <Link href={subItem.href}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        ))}
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-[#f01919] rounded-full flex items-center justify-center">
              <FiUser className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getUserDisplayEmail()}
              </p>
              <p className="text-xs text-gray-500">
                {isCoGestionnaire() ? 'Co-gestionnaire' : 'Animateur Pro'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-[#f01919] hover:border-[#f01919]"
          >
            <FiLogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};