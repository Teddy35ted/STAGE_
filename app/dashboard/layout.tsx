'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import { DashboardSidebar } from '../../components/dashboard/DashboardSidebar';
import { MobileHeader } from '../../components/dashboard/MobileHeader';
import { ForcePasswordChange } from '../../components/auth/ForcePasswordChange';
import { RouteGuard } from '../../components/permissions/RouteGuard';
import { useAuth } from '../../contexts/AuthContext';
import { usePasswordChangeRequired } from '../../hooks/usePasswordChangeRequired';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { requiresPasswordChange, loading: passwordCheckLoading, coGestionnaireId, markPasswordChanged } = usePasswordChangeRequired();
  const router = useRouter();
  const [passwordChangeComplete, setPasswordChangeComplete] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // Redirection immédiate avec replace pour éviter l'historique
      router.replace('/auth');
    }
  }, [user, loading, router]);

  const handlePasswordChangeSuccess = () => {
    markPasswordChanged();
    setPasswordChangeComplete(true);
  };

  // Chargement optimisé
  if (loading || passwordCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#f01919] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Chargement...' : 'Vérification de sécurité...'}
          </p>
        </div>
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
            <RouteGuard>
              {children}
            </RouteGuard>
          </main>
        </SidebarInset>
      </div>
      
      {/* Modal de changement de mot de passe obligatoire */}
      {requiresPasswordChange && coGestionnaireId && !passwordChangeComplete && (
        <ForcePasswordChange
          isOpen={true}
          onClose={() => {}} // Ne peut pas être fermé
          onSuccess={handlePasswordChangeSuccess}
          userId={coGestionnaireId}
        />
      )}
    </SidebarProvider>
  );
}