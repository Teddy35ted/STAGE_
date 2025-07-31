'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { Button } from '../../components/ui/button';

export default function TestPerformanceCrudPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string>('all');

  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  const runPerformanceTest = async (operation: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🚀 Test de performance pour: ${operation}`);
      
      const result = await apiFetch('/api/debug-crud-performance', {
        method: 'POST',
        body: JSON.stringify({
          entity: 'contenu',
          operation
        })
      });
      
      setTestResults(result);
      console.log('📊 Résultats performance:', result);
      
    } catch (err) {
      console.error('❌ Erreur test performance:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testSpecificOperation = async (operation: string) => {
    await runPerformanceTest(operation);
  };

  if (authLoading) {
    return <div className="p-8">Chargement de l'authentification...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Performance CRUD</h1>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Vous devez être connecté pour tester les performances CRUD.</p>
          <a href="/auth" className="text-blue-600 underline">Se connecter</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test Performance CRUD</h1>
      
      {/* Statut utilisateur */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Utilisateur Connecté</h2>
        <div>Email: {user.email}</div>
        <div>UID: {user.uid}</div>
      </div>

      {/* Sélection de l'opération */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Opération à Tester</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {['all', 'create', 'read', 'update', 'delete', 'list'].map((op) => (
            <label key={op} className="flex items-center space-x-2">
              <input
                type="radio"
                value={op}
                checked={selectedOperation === op}
                onChange={(e) => setSelectedOperation(e.target.value)}
              />
              <span className="capitalize">{op === 'all' ? 'Toutes' : op}</span>
            </label>
          ))}
        </div>
        
        <Button 
          onClick={() => runPerformanceTest(selectedOperation)}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Test en cours...' : `Tester ${selectedOperation === 'all' ? 'Toutes les Opérations' : selectedOperation}`}
        </Button>
      </div>

      {/* Tests rapides */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Tests Rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Button 
            onClick={() => testSpecificOperation('create')}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test CREATE
          </Button>
          <Button 
            onClick={() => testSpecificOperation('read')}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test READ
          </Button>
          <Button 
            onClick={() => testSpecificOperation('update')}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test UPDATE
          </Button>
          <Button 
            onClick={() => testSpecificOperation('delete')}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test DELETE
          </Button>
          <Button 
            onClick={() => testSpecificOperation('list')}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test LIST
          </Button>
          <Button 
            onClick={() => testSpecificOperation('all')}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test COMPLET
          </Button>
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
          <h3 className="text-xl font-semibold mb-4">Résultats des Tests de Performance</h3>
          
          {/* Résumé */}
          {testResults.summary && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-3">Résumé Global</h4>
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
                  <div className="text-2xl font-bold text-purple-600">{testResults.summary.averageDuration}ms</div>
                  <div className="text-sm text-gray-600">Temps Moyen</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  testResults.summary.performance === 'Excellent' ? 'bg-green-100 text-green-800' :
                  testResults.summary.performance === 'Bon' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Performance: {testResults.summary.performance}
                </span>
              </div>
            </div>
          )}

          {/* Détails des tests */}
          {testResults.tests && (
            <div className="space-y-4">
              <h4 className="font-semibold">Détails par Opération</h4>
              {Object.entries(testResults.tests).map(([operation, result]: [string, any]) => (
                <div key={operation} className={`p-4 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium capitalize">{operation}</h5>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? '✅ Réussi' : '❌ Échoué'}
                      </span>
                      {result.duration && (
                        <span className="text-sm text-gray-600">{result.duration}ms</span>
                      )}
                    </div>
                  </div>
                  
                  {result.error && (
                    <div className="text-red-600 text-sm mb-2">{result.error}</div>
                  )}
                  
                  {result.id && (
                    <div className="text-sm text-gray-600">ID: {result.id}</div>
                  )}
                  
                  {result.count !== undefined && (
                    <div className="text-sm text-gray-600">Éléments trouvés: {result.count}</div>
                  )}
                  
                  {result.verified !== undefined && (
                    <div className="text-sm">
                      Vérification: {result.verified ? '✅ OK' : '❌ Échec'}
                    </div>
                  )}
                  
                  {operation === 'update' && result.originalName && result.updatedName && (
                    <div className="text-sm text-gray-600 mt-2">
                      <div>Original: {result.originalName}</div>
                      <div>Modifié: {result.updatedName}</div>
                    </div>
                  )}
                  
                  {operation === 'delete' && (
                    <div className="text-sm text-gray-600 mt-2">
                      <div>Existait avant: {result.existedBefore ? '✅' : '❌'}</div>
                      <div>Existe après: {result.existsAfter ? '❌' : '✅'}</div>
                    </div>
                  )}
                </div>
              ))}
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