'use client';

import { usePermissions } from '../../hooks/usePermissions';

export function PermissionsDebug() {
  const { permissions, loading, error, check } = usePermissions();

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 p-4 rounded shadow-lg z-50">
        <h3 className="font-bold text-yellow-800">🔍 Permissions Debug</h3>
        <p>Chargement des permissions...</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-100 p-4 rounded shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-blue-800">🔍 Permissions Debug</h3>
      
      {error && (
        <div className="mt-2 text-red-600">
          <strong>Erreur:</strong> {error}
        </div>
      )}
      
      <div className="mt-2 text-sm">
        <div><strong>État:</strong> {permissions ? 'Chargé' : 'Non chargé'}</div>
        <div><strong>Type:</strong> {permissions?.isCoGestionnaire ? 'Co-gestionnaire' : 'Propriétaire'}</div>
        
        {permissions && (
          <>
            <div><strong>Email:</strong> {permissions.email || 'N/A'}</div>
            <div><strong>Laalas:</strong> {check.canAccess('laalas') ? '✅' : '❌'}</div>
            <div><strong>Contenus:</strong> {check.canAccess('contenus') ? '✅' : '❌'}</div>
            <div><strong>Est propriétaire:</strong> {check.isOwner ? '✅' : '❌'}</div>
            
            {permissions.isCoGestionnaire && (
              <div className="mt-2 p-2 bg-white rounded">
                <div><strong>Permissions brutes:</strong></div>
                <pre className="text-xs">
                  {JSON.stringify(permissions.permissions, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
