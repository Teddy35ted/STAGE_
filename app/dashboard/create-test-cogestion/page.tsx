'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export default function CreateTestCoGestionnairePage() {
  const [email, setEmail] = useState('test-cogestion@laala.app');
  const [permissions, setPermissions] = useState({
    laalas: true,
    contenus: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user, getAuthToken } = useAuth();

  const createTestCoGestionnaire = async () => {
    setLoading(true);
    setResult(null);

    try {
      const token = await getAuthToken();
      
      const coGestionnaireData = {
        nom: 'Test',
        prenom: 'CoGestionnaire',
        email: email,
        tel: '1234567890',
        pays: 'Cameroun',
        ville: 'Yaoundé',
        ACCES: 'gerer',
        permissions: [
          ...(permissions.laalas ? [{ resource: 'laalas', actions: ['create', 'read', 'update', 'delete'] }] : []),
          ...(permissions.contenus ? [{ resource: 'contenus', actions: ['create', 'read', 'update', 'delete'] }] : [])
        ],
        description: 'Co-gestionnaire de test pour validation des permissions',
        password: 'Test123456!',
        animatorEmail: user?.email || 'teddy@laala.app'
      };

      const response = await fetch('/api/co-gestionnaires', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(coGestionnaireData)
      });

      const data = await response.json();
      
      setResult({
        success: response.ok,
        status: response.status,
        data: data,
        message: response.ok ? 'Co-gestionnaire créé avec succès' : data.error || 'Erreur lors de la création'
      });

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAllTestCoGestionnaires = async () => {
    setLoading(true);
    
    try {
      const token = await getAuthToken();
      
      // D'abord, récupérer tous les co-gestionnaires
      const listResponse = await fetch('/api/co-gestionnaires/list-all');
      const listData = await listResponse.json();
      
      // Filtrer ceux avec "test" dans l'email
      const testCoGestionnaires = listData.coGestionnaires?.filter((cg: any) => 
        cg.email.toLowerCase().includes('test')
      ) || [];

      const deleteResults = [];
      
      for (const cg of testCoGestionnaires) {
        const deleteResponse = await fetch(`/api/co-gestionnaires/${cg.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        deleteResults.push({
          id: cg.id,
          email: cg.email,
          success: deleteResponse.ok,
          status: deleteResponse.status
        });
      }

      setResult({
        success: true,
        message: `${deleteResults.length} co-gestionnaires de test supprimés`,
        deleteResults
      });

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Créer Co-gestionnaire de Test</h1>
      
      <div className="space-y-6">
        {/* Configuration */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email du co-gestionnaire</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="test-cogestion@laala.app"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.laalas}
                    onChange={(e) => setPermissions({...permissions, laalas: e.target.checked})}
                    className="mr-2"
                  />
                  Accès aux Laalas
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.contenus}
                    onChange={(e) => setPermissions({...permissions, contenus: e.target.checked})}
                    className="mr-2"
                  />
                  Accès aux Contenus
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={createTestCoGestionnaire}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Création en cours...' : 'Créer Co-gestionnaire de Test'}
          </button>
          
          <button
            onClick={deleteAllTestCoGestionnaires}
            disabled={loading}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Suppression en cours...' : 'Supprimer tous les Co-gestionnaires de Test'}
          </button>
        </div>

        {/* Résultat */}
        {result && (
          <div className={`border rounded-lg p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h3 className="font-medium mb-2">
              {result.success ? '✅ Succès' : '❌ Erreur'}
            </h3>
            
            {result.message && (
              <p className="mb-2">{result.message}</p>
            )}
            
            {result.data && (
              <div>
                <p><strong>Email:</strong> {result.data.email}</p>
                <p><strong>Mot de passe:</strong> Test123456!</p>
                <p><strong>ID:</strong> {result.data.id}</p>
              </div>
            )}
            
            {result.error && (
              <p className="text-red-600">{result.error}</p>
            )}
            
            <details className="mt-2">
              <summary className="cursor-pointer">Détails techniques</summary>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
