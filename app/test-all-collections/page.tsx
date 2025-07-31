'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { Button } from '../../components/ui/button';

export default function TestAllCollectionsPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  const runAllCollectionsTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Lancement test de toutes les collections...');
      
      const result = await apiFetch('/api/test-all-collections', {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      setTestResults(result);
      console.log('📊 Résultats test toutes collections:', result);
      
    } catch (err) {
      console.error('❌ Erreur test toutes collections:', err);
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
        <h1 className="text-2xl font-bold mb-4">Test Toutes Collections</h1>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Vous devez être connecté pour tester toutes les collections.</p>
          <a href="/auth" className="text-blue-600 underline">Se connecter</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test Toutes Collections</h1>
      
      {/* Statut utilisateur */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Utilisateur Connecté</h2>
        <div>Email: {user.email}</div>
        <div>UID: {user.uid}</div>
        <div className="mt-2 text-sm text-green-600">
          ✅ Test complet de toutes les collections avec opérations CRUD
        </div>
      </div>

      {/* Lancement du test */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Global</h2>
        <p className="text-gray-600 mb-4">
          Ce test vérifie l'intégrité et les opérations CRUD pour toutes les collections :
          contenus, laalas, messages, boutiques, retraits, users, co-gestionnaires
        </p>
        
        <Button 
          onClick={runAllCollectionsTest}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Test en cours...' : 'Tester Toutes les Collections'}
        </Button>
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
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Résultats des Tests</h2>
          
          {/* Résumé global */}
          {testResults.globalSummary && (
            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Résumé Global</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{testResults.globalSummary.totalCollections}</div>
                  <div className="text-sm text-gray-600">Collections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.globalSummary.healthyCollections}</div>
                  <div className="text-sm text-gray-600">Saines</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.globalSummary.problematicCollections}</div>
                  <div className="text-sm text-gray-600">Problématiques</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    testResults.globalSummary.overallHealth === 'Excellent' ? 'text-green-600' :
                    testResults.globalSummary.overallHealth === 'Bon' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {testResults.globalSummary.overallHealth}
                  </div>
                  <div className="text-sm text-gray-600">Santé Globale</div>
                </div>
              </div>
            </div>
          )}

          {/* Résultats par collection */}
          {testResults.collections && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Résultats par Collection</h3>
              
              {Object.entries(testResults.collections).map(([collectionName, result]: [string, any]) => (
                <div key={collectionName} className="bg-white border border-gray-200 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold capitalize">{collectionName}</h4>
                    {result.summary && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.summary.healthStatus === 'Excellent' ? 'bg-green-100 text-green-800' :
                        result.summary.healthStatus === 'Bon' ? 'bg-yellow-100 text-yellow-800' :
                        result.summary.healthStatus === 'Problématique' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.summary.successfulTests}/{result.summary.totalTests} ({result.summary.successRate}%)
                      </div>
                    )}
                  </div>
                  
                  {result.error && (
                    <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">{result.error}</div>
                  )}
                  
                  {result.tests && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {Object.entries(result.tests).map(([testName, testResult]: [string, any]) => (
                        <div key={testName} className={`p-3 rounded border text-center ${
                          testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="font-medium text-sm capitalize">{testName}</div>
                          <div className={`text-xs mt-1 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                            {testResult.success ? '✅' : '❌'}
                          </div>
                          {testResult.skipped && (
                            <div className="text-xs text-blue-600 mt-1">Ignoré</div>
                          )}
                          {testResult.error && (
                            <div className="text-xs text-red-500 mt-1" title={testResult.error}>
                              Erreur
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Détails intégrité */}
                  {result.tests?.integrity?.data && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <h5 className="font-medium text-sm mb-2">Intégrité des Données</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>Total: {result.tests.integrity.data.totalItems}</div>
                        <div>Avec ID: {result.tests.integrity.data.itemsWithIds}</div>
                        <div>Sans ID: {result.tests.integrity.data.itemsWithoutIds}</div>
                        <div>Statut: {result.tests.integrity.data.healthStatus}</div>
                      </div>
                    </div>
                  )}

                  {/* Détails getAll */}
                  {result.tests?.getAll && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <h5 className="font-medium text-sm mb-2">Récupération Données</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div>Éléments: {result.tests.getAll.totalItems}</div>
                        <div>Avec ID: {result.tests.getAll.itemsWithIds}</div>
                        <div>Tous ont ID: {result.tests.getAll.allHaveIds ? '✅' : '���'}</div>
                      </div>
                      {result.tests.getAll.sampleIds && result.tests.getAll.sampleIds.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          IDs échantillon: {result.tests.getAll.sampleIds.join(', ')}
                        </div>
                      )}
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