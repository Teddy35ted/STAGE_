'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function TestDeletePermissionsPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('contenus');
  const [itemId, setItemId] = useState<string>('');

  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  const entities = ['contenus', 'laalas', 'messages', 'boutiques', 'retraits'];

  const runDeleteTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🧪 Test permissions suppression ${selectedEntity}...`);
      
      const result = await apiFetch('/api/debug-delete-permissions', {
        method: 'POST',
        body: JSON.stringify({
          entity: selectedEntity,
          itemId: itemId || undefined
        })
      });
      
      setTestResults(result);
      console.log('📊 Résultats test suppression:', result);
      
    } catch (err) {
      console.error('❌ Erreur test suppression:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testQuickDelete = async (entity: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`⚡ Test suppression rapide ${entity}...`);
      
      const result = await apiFetch('/api/debug-delete-permissions', {
        method: 'POST',
        body: JSON.stringify({
          entity,
          itemId: undefined // Créer un élément de test
        })
      });
      
      setTestResults(result);
      console.log('📊 Résultats test rapide:', result);
      
    } catch (err) {
      console.error('❌ Erreur test rapide:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="p-8">Chargement de l'authentification...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Permissions Suppression</h1>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Vous devez être connecté pour tester les permissions de suppression.</p>
          <a href="/auth" className="text-blue-600 underline">Se connecter</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test Permissions Suppression</h1>
      
      {/* Statut utilisateur */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Utilisateur Connecté</h2>
        <div>Email: {user.email}</div>
        <div>UID: {user.uid}</div>
        <div className="mt-2 text-sm text-green-600">
          ✅ Permissions de suppression: Accordées par défaut (mode permissif)
        </div>
      </div>

      {/* Configuration du test */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Configuration du Test</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Entité à tester</label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {entities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity.charAt(0).toUpperCase() + entity.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">ID de l'élément (optionnel)</label>
            <Input
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="Laisser vide pour créer un élément de test"
            />
          </div>
        </div>
        
        <Button 
          onClick={runDeleteTest}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Test en cours...' : `Tester Suppression ${selectedEntity}`}
        </Button>
      </div>

      {/* Tests rapides */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Tests Rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {entities.map((entity) => (
            <Button 
              key={entity}
              onClick={() => testQuickDelete(entity)}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Test {entity}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="text-red-800 font-semibold">Erreur</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Résultats des tests */}
      {testResults && (
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Résultats du Test de Suppression</h3>
          
          {/* Informations générales */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Informations du Test</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>Entité: <span className="font-medium">{testResults.entity}</span></div>
              <div>Utilisateur: <span className="font-medium">{testResults.auth?.uid}</span></div>
              <div>Timestamp: <span className="font-medium">{new Date(testResults.timestamp).toLocaleString()}</span></div>
            </div>
          </div>

          {/* Résumé */}
          {testResults.summary && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Résumé</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{testResults.summary.totalTests}</div>
                  <div className="text-sm text-gray-600">Tests Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.summary.successfulTests}</div>
                  <div className="text-sm text-gray-600">Réussis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.summary.failedTests}</div>
                  <div className="text-sm text-gray-600">Échoués</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{testResults.summary.successRate}%</div>
                  <div className="text-sm text-gray-600">Taux Succès</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  testResults.summary.overallSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {testResults.summary.overallSuccess ? '✅ Tous les tests réussis' : '❌ Certains tests ont échoué'}
                </span>
              </div>
            </div>
          )}

          {/* Détails des tests */}
          {testResults.tests && (
            <div className="space-y-4">
              <h4 className="font-semibold">Détails des Tests</h4>
              
              {/* Test existence */}
              {testResults.tests.existence && (
                <div className={`p-4 rounded-lg border ${
                  testResults.tests.existence.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <h5 className="font-medium mb-2">1. Vérification Existence</h5>
                  <div className={`text-sm ${testResults.tests.existence.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.tests.existence.success ? '✅ Élément trouvé/créé' : '❌ Élément non trouvé'}
                  </div>
                  {testResults.tests.existence.item && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div>ID: {testResults.tests.existence.item.id}</div>
                      <div>Nom: {testResults.tests.existence.item.nom}</div>
                      <div>Créateur: {testResults.tests.existence.item.idCreateur}</div>
                    </div>
                  )}
                  {testResults.tests.existence.error && (
                    <div className="mt-2 text-sm text-red-600">{testResults.tests.existence.error}</div>
                  )}
                </div>
              )}

              {/* Test permissions */}
              {testResults.tests.permissions && (
                <div className={`p-4 rounded-lg border ${
                  testResults.tests.permissions.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <h5 className="font-medium mb-2">2. Vérification Permissions</h5>
                  <div className={`text-sm ${testResults.tests.permissions.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.tests.permissions.success ? '✅ Permissions vérifiées' : '❌ Erreur permissions'}
                  </div>
                  {testResults.tests.permissions.ownershipChecks && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div>Est créateur: {testResults.tests.permissions.ownershipChecks.isCreator ? '✅' : '❌'}</div>
                      <div>Est propriétaire: {testResults.tests.permissions.ownershipChecks.isProprietaire ? '✅' : '❌'}</div>
                      <div>A la propriété: {testResults.tests.permissions.hasOwnership ? '✅' : '❌'}</div>
                      <div>Mode développement: {testResults.tests.permissions.developmentMode ? '✅' : '❌'}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Test API DELETE */}
              {testResults.tests.apiDelete && (
                <div className={`p-4 rounded-lg border ${
                  testResults.tests.apiDelete.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <h5 className="font-medium mb-2">3. Test API DELETE</h5>
                  <div className={`text-sm ${testResults.tests.apiDelete.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.tests.apiDelete.success ? '✅ API DELETE réussie' : '❌ API DELETE échouée'}
                  </div>
                  {testResults.tests.apiDelete.status && (
                    <div className="mt-2 text-sm text-gray-600">
                      Status: {testResults.tests.apiDelete.status}
                    </div>
                  )}
                  {testResults.tests.apiDelete.response && (
                    <div className="mt-2 text-sm text-gray-600">
                      Réponse: {JSON.stringify(testResults.tests.apiDelete.response, null, 2)}
                    </div>
                  )}
                  {testResults.tests.apiDelete.error && (
                    <div className="mt-2 text-sm text-red-600">{testResults.tests.apiDelete.error}</div>
                  )}
                </div>
              )}

              {/* Test suppression directe */}
              {testResults.tests.directDelete && (
                <div className={`p-4 rounded-lg border ${
                  testResults.tests.directDelete.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <h5 className="font-medium mb-2">4. Test Suppression Directe</h5>
                  <div className={`text-sm ${testResults.tests.directDelete.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.tests.directDelete.success ? '✅ Suppression directe réussie' : '❌ Suppression directe échouée'}
                  </div>
                  {testResults.tests.directDelete.verified !== undefined && (
                    <div className="mt-2 text-sm text-gray-600">
                      Vérification: {testResults.tests.directDelete.verified ? '✅ Supprimé' : '❌ Encore présent'}
                    </div>
                  )}
                  {testResults.tests.directDelete.skipped && (
                    <div className="mt-2 text-sm text-blue-600">{testResults.tests.directDelete.skipped}</div>
                  )}
                  {testResults.tests.directDelete.error && (
                    <div className="mt-2 text-sm text-red-600">{testResults.tests.directDelete.error}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Données brutes */}
          <details className="mt-6">
            <summary className="cursor-pointer font-medium text-gray-700">Voir les données brutes</summary>
            <pre className="text-xs mt-2 p-3 bg-gray-100 rounded overflow-auto max-h-96">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}