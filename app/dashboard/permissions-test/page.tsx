'use client';

import { usePermissions } from '../../../hooks/usePermissions';
import { useAuth } from '../../../contexts/AuthContext';
import { useState } from 'react';

export default function PermissionsTestPage() {
  const { user } = useAuth();
  const { permissions, loading, error, check, refetch } = usePermissions();
  const [testResults, setTestResults] = useState<any>({});

  const runPermissionTests = async () => {
    const results: any = {
      userInfo: {
        uid: user?.uid,
        email: user?.email,
        isAuthenticated: !!user
      },
      permissionsData: permissions,
      checks: {
        canAccessLaalas: check.canAccess('laalas'),
        canAccessContenus: check.canAccess('contenus'),
        canCreateLaalas: check.canCreate('laalas'),
        canCreateContenus: check.canCreate('contenus'),
        canEditLaalas: check.canEdit('laalas'),
        canEditContenus: check.canEdit('contenus'),
        canDeleteLaalas: check.canDelete('laalas'),
        canDeleteContenus: check.canDelete('contenus'),
        isOwner: check.isOwner,
        isCoGestionnaire: check.isCoGestionnaire
      },
      loading,
      error
    };

    // Test de l'API directement
    try {
      const token = await user?.getIdToken();
      const apiResponse = await fetch('/api/co-gestionnaires/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      results.apiTest = {
        status: apiResponse.status,
        data: apiResponse.ok ? await apiResponse.json() : null,
        error: !apiResponse.ok ? await apiResponse.text() : null
      };
    } catch (err) {
      results.apiTest = {
        error: err instanceof Error ? err.message : 'Erreur inconnue'
      };
    }

    setTestResults(results);
  };

  if (loading) {
    return <div className="p-8">Chargement des permissions...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Test de Permissions</h1>
      
      <div className="grid gap-6">
        {/* État actuel */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">État actuel</h2>
          <div className="space-y-2">
            <div>👤 <strong>Utilisateur:</strong> {user?.email || 'Non connecté'}</div>
            <div>🔑 <strong>Type:</strong> {permissions?.isCoGestionnaire ? 'Co-gestionnaire' : 'Propriétaire'}</div>
            <div>⚡ <strong>Chargement:</strong> {loading ? 'En cours' : 'Terminé'}</div>
            {error && <div>❌ <strong>Erreur:</strong> {error}</div>}
          </div>
        </div>

        {/* Permissions brutes */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Données de permissions</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(permissions, null, 2)}
          </pre>
        </div>

        {/* Tests de vérification */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Tests de vérification</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Accès</h3>
              <div>Laalas: {check.canAccess('laalas') ? '✅' : '❌'}</div>
              <div>Contenus: {check.canAccess('contenus') ? '✅' : '❌'}</div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Création</h3>
              <div>Laalas: {check.canCreate('laalas') ? '✅' : '❌'}</div>
              <div>Contenus: {check.canCreate('contenus') ? '✅' : '❌'}</div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Modification</h3>
              <div>Laalas: {check.canEdit('laalas') ? '✅' : '❌'}</div>
              <div>Contenus: {check.canEdit('contenus') ? '✅' : '❌'}</div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Suppression</h3>
              <div>Laalas: {check.canDelete('laalas') ? '✅' : '❌'}</div>
              <div>Contenus: {check.canDelete('contenus') ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>

        {/* Tests approfondis */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Tests approfondis</h2>
          <button
            onClick={runPermissionTests}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Lancer tests
          </button>
          
          {Object.keys(testResults).length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Résultats:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Actions</h2>
          <div className="space-x-2">
            <button
              onClick={refetch}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Recharger permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
