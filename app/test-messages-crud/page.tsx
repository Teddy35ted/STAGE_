'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../lib/api';
import { Button } from '../components/ui/button';

export default function TestMessagesCrudPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  const runCrudTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🧪 Lancement du test CRUD Messages...');
      
      const result = await apiFetch('/api/messages/test', {
        method: 'POST'
      });
      
      setTestResults(result);
      console.log('📊 Résultats du test CRUD Messages:', result);
      
    } catch (err) {
      console.error('❌ Erreur test CRUD Messages:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tests = [];
      
      // Test 1: GET messages de l'utilisateur
      try {
        console.log('📋 Test GET messages utilisateur...');
        const userMessages = await apiFetch('/api/messages');
        tests.push({
          name: 'GET /api/messages (utilisateur)',
          success: true,
          data: `${Array.isArray(userMessages) ? userMessages.length : 0} messages`
        });
      } catch (err) {
        tests.push({
          name: 'GET /api/messages (utilisateur)',
          success: false,
          error: err instanceof Error ? err.message : 'Erreur inconnue'
        });
      }

      // Test 2: GET tous les messages
      try {
        console.log('📋 Test GET tous les messages...');
        const allMessages = await apiFetch('/api/messages?all=true');
        tests.push({
          name: 'GET /api/messages?all=true',
          success: true,
          data: `${Array.isArray(allMessages) ? allMessages.length : 0} messages totaux`
        });
      } catch (err) {
        tests.push({
          name: 'GET /api/messages?all=true',
          success: false,
          error: err instanceof Error ? err.message : 'Erreur inconnue'
        });
      }

      // Test 3: POST nouveau message
      try {
        console.log('➕ Test POST nouveau message...');
        const newMessage = await apiFetch('/api/messages', {
          method: 'POST',
          body: JSON.stringify({
            receiverId: 'test-receiver',
            message: {
              type: 'text',
              text: `Message de test API créé le ${new Date().toLocaleString()}`,
              createdAt: Date.now(),
              author: {
                id: user?.uid || 'anonymous'
              }
            },
            nomsend: user?.email || 'Testeur',
            nomrec: 'Destinataire Test',
            date: new Date().toISOString().split('T')[0],
            heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          })
        });
        tests.push({
          name: 'POST /api/messages',
          success: true,
          data: `Message créé avec ID: ${newMessage.id}`
        });
      } catch (err) {
        tests.push({
          name: 'POST /api/messages',
          success: false,
          error: err instanceof Error ? err.message : 'Erreur inconnue'
        });
      }

      setTestResults({
        type: 'api-routes',
        tests,
        summary: {
          total: tests.length,
          successful: tests.filter(t => t.success).length,
          failed: tests.filter(t => !t.success).length
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('❌ Erreur test routes API:', err);
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
        <h1 className="text-2xl font-bold mb-4">Test CRUD Messages</h1>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Vous devez être connecté pour tester les opérations CRUD.</p>
          <a href="/auth" className="text-blue-600 underline">Se connecter</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test CRUD Messages</h1>
      
      {/* Statut utilisateur */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Utilisateur Connecté</h2>
        <div>Email: {user.email}</div>
        <div>UID: {user.uid}</div>
      </div>

      {/* Boutons de test */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Tests Disponibles</h2>
        <div className="flex gap-4">
          <Button 
            onClick={runCrudTest}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Test en cours...' : 'Test CRUD Complet'}
          </Button>
          <Button 
            onClick={testApiRoutes}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Test en cours...' : 'Test Routes API'}
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
        <div className={`border p-4 rounded-lg ${testResults.success !== false ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${testResults.success !== false ? 'text-green-800' : 'text-red-800'}`}>
            Résultats des Tests
          </h3>
          
          {/* Résumé */}
          {testResults.summary && (
            <div className="mb-4 p-3 bg-white rounded border">
              <h4 className="font-medium mb-2">Résumé</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>Total: {testResults.summary.totalOperations || testResults.summary.total}</div>
                <div>Réussies: {testResults.summary.successfulOperations || testResults.summary.successful}</div>
                <div>Échouées: {testResults.summary.failed || 0}</div>
                <div>Taux: {testResults.summary.successRate || 'N/A'}</div>
              </div>
            </div>
          )}
          
          {/* Détails des opérations */}
          {testResults.operations && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Opérations CRUD</h4>
              <div className="space-y-2">
                {Object.entries(testResults.operations).map(([operation, result]: [string, any]) => (
                  <div key={operation} className="p-2 bg-white rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{operation}</span>
                      <span className={`px-2 py-1 text-xs rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {result.success ? 'Réussi' : 'Échec'}
                      </span>
                    </div>
                    {result.data && <div className="text-sm text-gray-600 mt-1">{result.data}</div>}
                    {result.error && <div className="text-sm text-red-600 mt-1">{result.error}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tests API Routes */}
          {testResults.tests && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Tests Routes API</h4>
              <div className="space-y-2">
                {testResults.tests.map((test: any, index: number) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{test.name}</span>
                      <span className={`px-2 py-1 text-xs rounded ${test.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {test.success ? 'Réussi' : 'Échec'}
                      </span>
                    </div>
                    {test.data && <div className="text-sm text-gray-600 mt-1">{test.data}</div>}
                    {test.error && <div className="text-sm text-red-600 mt-1">{test.error}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Erreurs */}
          {testResults.errors && testResults.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-red-800">Erreurs</h4>
              <ul className="list-disc list-inside text-sm text-red-600">
                {testResults.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Données complètes */}
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Voir les détails complets</summary>
            <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-96">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}