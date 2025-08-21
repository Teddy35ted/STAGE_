'use client';

import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { FiShield, FiUser, FiSettings } from 'react-icons/fi';

export function PermissionStatus() {
  const { permissions, loading } = usePermissions();

  if (loading) {
    return (
      <div className="px-4 py-2 text-xs text-gray-500">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div className="w-20 h-3 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!permissions) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          permissions.isCoGestionnaire 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-green-100 text-green-600'
        }`}>
          {permissions.isCoGestionnaire ? (
            <FiShield className="w-4 h-4" />
          ) : (
            <FiUser className="w-4 h-4" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {permissions.isCoGestionnaire ? 'Co-gestionnaire' : 'Propriétaire'}
          </p>
          {permissions.isCoGestionnaire && (
            <p className="text-xs text-gray-500 truncate">
              Géré par {permissions.animatorEmail}
            </p>
          )}
        </div>
      </div>

      {permissions.isCoGestionnaire && (
        <div className="mt-3 space-y-1">
          <div className="text-xs text-gray-600 font-medium">Accès autorisés :</div>
          <div className="flex flex-wrap gap-1">
            {permissions.permissions.laalas && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Laalas
              </span>
            )}
            {permissions.permissions.contenus && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Contenus
              </span>
            )}
            {!permissions.permissions.laalas && !permissions.permissions.contenus && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Aucun accès
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
