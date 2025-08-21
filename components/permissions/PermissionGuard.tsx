'use client';

import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { FiLock, FiAlertCircle, FiShield } from 'react-icons/fi';

interface PermissionGuardProps {
  resource: 'laalas' | 'contenus';
  action?: 'view' | 'create' | 'edit' | 'delete';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({ 
  resource, 
  action = 'view', 
  fallback, 
  children 
}: PermissionGuardProps) {
  const { permissions, loading, check } = usePermissions();

  // Pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Vérification des permissions...</span>
      </div>
    );
  }

  // Vérifier les permissions selon l'action
  let hasPermission = false;
  switch (action) {
    case 'view':
      hasPermission = check.canView(resource);
      break;
    case 'create':
      hasPermission = check.canCreate(resource);
      break;
    case 'edit':
      hasPermission = check.canEdit(resource);
      break;
    case 'delete':
      hasPermission = check.canDelete(resource);
      break;
  }

  // Si autorisé, afficher le contenu
  if (hasPermission) {
    return <>{children}</>;
  }

  // Si non autorisé, afficher le fallback ou un message par défaut
  if (fallback) {
    return <>{fallback}</>;
  }

  return <AccessDenied resource={resource} action={action} permissions={permissions} />;
}

interface AccessDeniedProps {
  resource: 'laalas' | 'contenus';
  action: string;
  permissions: any;
}

function AccessDenied({ resource, action, permissions }: AccessDeniedProps) {
  const resourceNames = {
    laalas: 'Laalas',
    contenus: 'Contenus'
  };

  const actionNames = {
    view: 'consulter',
    create: 'créer',
    edit: 'modifier',
    delete: 'supprimer'
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <FiLock className="w-8 h-8 text-red-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Accès restreint
      </h3>
      
      <p className="text-gray-600 text-center mb-4 max-w-md">
        Vous n'avez pas l'autorisation de {actionNames[action as keyof typeof actionNames] || action} 
        les {resourceNames[resource].toLowerCase()}.
      </p>

      {permissions?.isCoGestionnaire && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
          <div className="flex items-start space-x-3">
            <FiShield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium mb-1">
                Compte co-gestionnaire
              </p>
              <p className="text-blue-700">
                Contactez <span className="font-medium">{permissions.animatorEmail}</span> 
                pour modifier vos permissions d'accès.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 flex items-center space-x-1">
        <FiAlertCircle className="w-4 h-4" />
        <span>
          Permissions actuelles : {permissions?.permissions[resource] ? '✅' : '❌'} {resourceNames[resource]}
        </span>
      </div>
    </div>
  );
}

// Composant pour bloquer complètement une page
export function PageGuard({ 
  resource, 
  children 
}: { 
  resource: 'laalas' | 'contenus'; 
  children: React.ReactNode; 
}) {
  return (
    <PermissionGuard resource={resource} action="view">
      {children}
    </PermissionGuard>
  );
}

// Composant pour bloquer uniquement les actions (boutons, formulaires)
export function ActionGuard({ 
  resource, 
  action, 
  children,
  fallback
}: { 
  resource: 'laalas' | 'contenus'; 
  action: 'create' | 'edit' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <PermissionGuard resource={resource} action={action} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}
