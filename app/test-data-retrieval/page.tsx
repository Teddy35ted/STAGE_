'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { Button } from '../../components/ui/button';

export default function TestDataRetrievalPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('contenus');

  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  const entities = ['contenus', 'laalas', 'messages', 'boutiques', 'users'];

  const runDataStructureTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Test structure données ${selectedEntity}...`);
      
      const result = await apiFetch('/api/debug-data-structure', {
        method: 'POST',
        body: JSON.stringify({
          entity: selectedEntity
        })
      });
      
      setTestResults(result);
      console.log('📊 Résultats test structure:', result);
      
    } catch (err) {
      console.error('❌ Erreur test structure:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectApiCall = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🌐 Test appel API direct ${selectedEntity}...`);
      
      // Test direct de l'API
      const directResult = await apiFetch(`/api/${selectedEntity}`);
      
      setTestResults({
        type: 'direct-api',
        entity: selectedEntity,
        timestamp: new Date().toISOString(),
        directCall: {
          success: true,
          dataCount: Array.isArray(directResult) ? directResult.length : 1,
          sampleData: Array.isArray(directResult) ? directResult.slice(0, 3) : [directResult],
          hasIds: Array.isArray(directResult) 
            ? directResult.every(item => item.id) 
            : !!directResult.id
        }
      });
      
      console.log('📊 Résultats appel direct:', directResult);
      
    } catch (err) {
      console.error('❌ Erreur appel direct:', err);
      setError(`Erreur appel direct: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateAndDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🧪 Test création et suppression ${selectedEntity}...`);
      
      let testData: any = {};
      
      switch (selectedEntity) {
        case 'contenus':
          testData = {
            nom: `Test Récupération ${Date.now()}`,
            idLaala: 'test-retrieval-laala',
            type: 'texte',
            allowComment: true,
            htags: ['#test-retrieval'],
            personnes: []
          };
          break;
          
        case 'laalas':
          testData = {
            nom: `Test Laala Récupération ${Date.now()}`,
            type: 'public',
            description: 'Test récupération',
            htags: ['#test-retrieval'],
            personnes: []
          };
          break;
          
        default:
          testData = {
            nom: `Test ${selectedEntity} ${Date.now()}`
          };
      }

      // 1. Créer un élément
      console.log('➕ Création élément...');
      const createResponse = await apiFetch(`/api/${selectedEntity}`, {
        method: 'POST',
        body: JSON.stringify(testData)
      });
      
      const createdId = createResponse.id;
      console.log('✅ Élément créé avec ID:', createdId);

      // 2. Récupérer l'élément par ID
      console.log('📖 Récupération par ID...');
      const retrievedItem = await apiFetch(`/api/${selectedEntity}/${createdId}`);
      console.log('📋 Élément récupéré:', retrievedItem);

      // 3. Récupérer tous les éléments et vérifier que le nôtre y est
      console.log('📋 Récupération de tous les éléments...');
      const allItems = await apiFetch(`/api/${selectedEntity}`);
      const foundInList = Array.isArray(allItems) 
        ? allItems.find(item => item.id === createdId)
        : null;

      // 4. Tenter la suppression
      console.log('🗑️ Suppression...');
      const deleteResponse = await apiFetch(`/api/${selectedEntity}/${createdId}`, {
        method: 'DELETE'
      });

      // 5. Vérifier que l'élément a été supprimé
      console.log('🔍 Vérification suppression...');
      let deletedCheck = null;
      try {
        deletedCheck = await apiFetch(`/api/${selectedEntity}/${createdId}`);
      } catch (err) {
        // C'est normal si l'élément n'existe plus
        console.log('✅ Élément bien supprimé (404 attendu)');
      }

      setTestResults({
        type: 'create-delete-test',
        entity: selectedEntity,
        timestamp: new Date().toISOString(),
        steps: {
          create: {
            success: !!createdId,
            id: createdId,
            data: testData
          },
          retrieve: {
            success: !!retrievedItem,
            hasCorrectId: retrievedItem?.id === createdId,
            data: retrievedItem
          },
          findInList: {
            success: !!foundInList,
            totalItems: Array.isArray(allItems) ? allItems.length : 0,
            foundItem: foundInList
          },
          delete: {
            success: deleteResponse?.success || false,
            response: deleteResponse
          },
          verifyDeleted: {
            success: !deletedCheck,
            stillExists: !!deletedCheck
          }
        },
        summary: {
          allStepsWorked: !!(createdId && retrievedItem && foundInList && deleteResponse && !deletedCheck),
          issueFound: null
        }
      });

      console.log('✅ Test complet terminé');
      
    } catch (err) {
      console.error('❌ Erreur test complet:', err);
      setError(`Erreur test complet: ${err instanceof Error ? err.message : 'Inconnue'}`);
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
        <h1 className="text-2xl font-bold mb-4">Test Récupération Données</h1>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Vous devez être connecté pour tester la récupération des données.</p>
          <a href="/auth" className="text-blue-600 underline">Se connecter</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test Récupération Données</h1>
      
      {/* Statut utilisateur */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Utilisateur Connecté</h2>
        <div>Email: {user.email}</div>
        <div>UID: {user.uid}</div>
      </div>

      {/* Configuration du test */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Configuration du Test</h2>
        
        <div className="mb-4">
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={runDataStructureTest}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Test...' : 'Test Structure'}
          </Button>
          
          <Button 
            onClick={testDirectApiCall}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Test...' : 'Test API Direct'}
          </Button>
          
          <Button 
            onClick={testCreateAndDelete}
            disabled={loading}
          >
            {loading ? 'Test...' : 'Test Complet'}
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
          <h3 className="text-xl font-semibold mb-4">Résultats du Test</h3>
          
          {/* Test structure */}
          {testResults.analysis && (
            <div className="space-y-4">
              <h4 className="font-semibold">Analyse de Structure</h4>
              
              {/* Résumé */}
              {testResults.summary && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium mb-2">Résumé</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>Structure OK: {testResults.summary.dataStructureOk ? '✅' : '❌'}</div>
                    <div>Récupération OK: {testResults.summary.retrievalWorks ? '✅' : '❌'}</div>
                    <div>Suppression OK: {testResults.summary.deletionWorks ? '✅' : '❌'}</div>
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      testResults.summary.overallHealth === 'Excellent' ? 'bg-green-100 text-green-800' :
                      testResults.summary.overallHealth === 'Bon' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Santé: {testResults.summary.overallHealth}
                    </span>
                  </div>
                </div>
              )}

              {/* Échantillons d'��léments */}
              {testResults.analysis.sampleItems && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">Échantillons d'Éléments</h5>
                  <div className="space-y-2">
                    {testResults.analysis.sampleItems.map((item: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className={item.hasId ? 'text-green-600' : 'text-red-600'}>
                          {item.hasId ? '✅' : '❌'} ID: {item.id || 'MANQUANT'}
                        </span>
                        <span className="ml-4 text-gray-600">
                          ({item.keys?.length || 0} champs)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Test API direct */}
          {testResults.directCall && (
            <div className="space-y-4">
              <h4 className="font-semibold">Test API Direct</h4>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>Succès: {testResults.directCall.success ? '✅' : '❌'}</div>
                  <div>Nombre d'éléments: {testResults.directCall.dataCount}</div>
                  <div>Tous ont des IDs: {testResults.directCall.hasIds ? '✅' : '❌'}</div>
                </div>
                {testResults.directCall.sampleData && (
                  <details className="mt-4">
                    <summary className="cursor-pointer">Voir échantillon de données</summary>
                    <pre className="text-xs mt-2 p-2 bg-white rounded overflow-auto max-h-40">
                      {JSON.stringify(testResults.directCall.sampleData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* Test complet */}
          {testResults.steps && (
            <div className="space-y-4">
              <h4 className="font-semibold">Test Complet (Création → Suppression)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(testResults.steps).map(([step, result]: [string, any]) => (
                  <div key={step} className={`p-3 rounded border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <h6 className="font-medium capitalize">{step.replace(/([A-Z])/g, ' $1')}</h6>
                    <div className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✅ Réussi' : '❌ Échoué'}
                    </div>
                    {result.id && (
                      <div className="text-xs text-gray-600 mt-1">ID: {result.id}</div>
                    )}
                    {result.hasCorrectId !== undefined && (
                      <div className="text-xs text-gray-600 mt-1">
                        ID correct: {result.hasCorrectId ? '✅' : '❌'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {testResults.summary && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium">
                    Résultat global: {testResults.summary.allStepsWorked ? '✅ Tout fonctionne' : '❌ Problème détecté'}
                  </div>
                  {testResults.summary.issueFound && (
                    <div className="text-red-600 text-sm mt-1">{testResults.summary.issueFound}</div>
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