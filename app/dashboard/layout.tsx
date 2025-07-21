'use client';

import React from 'react';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import { DashboardSidebar } from '../../components/dashboard/DashboardSidebar';
import { MobileHeader } from '../../components/dashboard/MobileHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirection immédiate avec replace pour éviter l'historique
      router.replace('/auth');
    }
  }, [user, loading, router]);

  // Chargement optimisé
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#f01919] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si pas d'utilisateur, ne rien afficher (redirection en cours)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-[#f01919] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          <MobileHeader />
          <main className="p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}