'use client';

import { useState } from 'react';

export default function TestPermissionsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDebugPermissions = async () => {
    setLoading(true);
    try {
      // D'abord on récupère un token d'authentification
      const token = localStorage.getItem('authToken');
      if (!token) {
        setResult({ error: 'Pas de token d\'authentification trouvé. Connectez-vous d\'abord.' });
        return;
      }

      const response = await fetch('/api/co-gestionnaires/debug-permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    } finally {
      setLoading(false);
    }
  };

  const testPermissionsAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setResult({ error: 'Pas de token d\'authentification trouvé. Connectez-vous d\'abord.' });
        return;
      }

      const response = await fetch('/api/co-gestionnaires/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setResult({ status: response.status, data, api: 'permissions' });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test des Permissions Co-gestionnaires</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={testDebugPermissions}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Tester Debug Permissions (Tous les co-gestionnaires)'}
        </button>
        
        <button 
          onClick={testPermissionsAPI}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Chargement...' : 'Tester API Permissions (Co-gestionnaire actuel)'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Résultat :</h2>
          <pre className="text-sm overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800">Instructions :</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2">
          <li>Connectez-vous d'abord au dashboard comme animateur ou co-gestionnaire</li>
          <li>Puis revenez sur cette page et cliquez sur les boutons de test</li>
          <li>Regardez les résultats pour comprendre comment les permissions sont stockées</li>
        </ol>
      </div>
    </div>
  );
}
