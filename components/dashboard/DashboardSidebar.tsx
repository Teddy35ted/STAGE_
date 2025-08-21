'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCoGestionnaireDisplay } from '../../hooks/useCoGestionnaireDisplay';
import { useFilteredMenu, MenuItem } from '../../hooks/useFilteredMenu';
import { PermissionStatus } from '../permissions/PermissionStatus';
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

export const DashboardSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { getDisplayEmail, getDisplayRole } = useCoGestionnaireDisplay();
  const { filteredMenu, loading } = useFilteredMenu();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#f01919] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">La-a-La</h2>
            <p className="text-sm text-gray-600">Animateur Pro</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                // Skeleton pendant le chargement des permissions
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                filteredMenu.map((item: MenuItem) => (
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
                  {item.submenu && pathname && pathname.startsWith(item.href) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
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
                ))
              )}
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
                {getDisplayEmail(user?.email || 'Utilisateur')}
              </p>
              <p className="text-xs text-gray-500">
                {getDisplayRole('Animateur Pro')}
              </p>
            </div>
          </div>
          
          {/* Statut des permissions */}
          <PermissionStatus />
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-[#f01919] hover:border-[#f01919] mx-4 mb-2"
          >
            <FiLogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};