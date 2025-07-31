'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function TestCrudPage() {
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState({
    nom: 'Test Contenu',
    idLaala: 'test-laala-123',
    type: 'texte'
  });

  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  // Diagnostic automatique au chargement
  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Lancement du diagnostic...');
      const response = await fetch('/api/debug-crud');
      const data = await response.json();
      
      setDiagnostic(data);
      console.log('📊 Diagnostic reçu:', data);
      
    } catch (err) {
      console.error('❌ Erreur diagnostic:', err);
      setError(`Erreur diagnostic: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCrudOperations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setError('Vous devez être connecté pour tester les opérations CRUD');
        return;
      }
      
      console.log('🧪 Test des opérations CRUD...');
      console.log('👤 Utilisateur connecté:', user.uid);
      
      // Test avec apiFetch (qui inclut l'auth automatiquement)
      const response = await apiFetch('/api/debug-crud', {
        method: 'POST',
        body: JSON.stringify(testData)
      });
      
      setTestResult(response);
      console.log('✅ Test CRUD réussi:', response);
      
    } catch (err) {
      console.error('❌ Erreur test CRUD:', err);
      setError(`Erreur test CRUD: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testContenuAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setError('Vous devez être connecté pour tester l\'API contenus');
        return;
      }
      
      console.log('📄 Test API contenus...');
      
      // Test GET contenus
      const contenus = await apiFetch('/api/contenus');
      console.log('📋 Contenus récupérés:', contenus);
      
      // Test POST contenu
      const newContenu = {
        nom: `Test Contenu ${Date.now()}`,
        idLaala: testData.idLaala,
        type: 'texte',
        src: '',
        allowComment: true,
        htags: ['#test'],
        personnes: []
      };
      
      const createResponse = await apiFetch('/api/contenus', {
        method: 'POST',
        body: JSON.stringify(newContenu)
      });
      
      console.log('✅ Contenu créé:', createResponse);
      
      setTestResult({
        success: true,
        message: 'Test API contenus réussi',
        contenus: contenus.length,
        nouveauContenu: createResponse
      });
      
    } catch (err) {
      console.error('❌ Erreur test API contenus:', err);
      setError(`Erreur API contenus: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="p-8">Chargement de l'authentification...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test des Opérations CRUD</h1>
      
      {/* Statut d'authentification */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Statut d'Authentification</h2>
        {user ? (
          <div className="text-green-600">
            ✅ Connecté: {user.email} (UID: {user.uid})
          </div>
        ) : (
          <div className="text-red-600">
            ❌ Non connecté - <a href="/auth" className="underline">Se connecter</a>
          </div>
        )}
      </div>

      {/* Diagnostic système */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Diagnostic Système</h2>
          <Button onClick={runDiagnostic} disabled={loading}>
            {loading ? 'Diagnostic...' : 'Relancer Diagnostic'}
          </Button>
        </div>
        
        {diagnostic && (
          <div className="space-y-2 text-sm">
            <div>🔥 Firebase: {diagnostic.diagnostic?.firebase?.status}</div>
            <div>💾 Database: {diagnostic.diagnostic?.firebase?.database}</div>
            <div>🔐 Auth: {diagnostic.diagnostic?.firebase?.auth}</div>
            <div>⚙️ Services: {diagnostic.diagnostic?.services?.instanciation || 'Erreur'}</div>
            <div>🔑 Auth Verifier: {diagnostic.diagnostic?.authVerifier}</div>
          </div>
        )}
      </div>

      {/* Données de test */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Données de Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <Input
              value={testData.nom}
              onChange={(e) => setTestData({...testData, nom: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ID Laala</label>
            <Input
              value={testData.idLaala}
              onChange={(e) => setTestData({...testData, idLaala: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={testData.type}
              onChange={(e) => setTestData({...testData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="texte">Texte</option>
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={testCrudOperations} 
          disabled={loading || !user}
          className="h-16"
        >
          {loading ? 'Test en cours...' : 'Tester CRUD Complet'}
        </Button>
        
        <Button 
          onClick={testContenuAPI} 
          disabled={loading || !user}
          className="h-16"
          variant="outline"
        >
          {loading ? 'Test en cours...' : 'Tester API Contenus'}
        </Button>
      </div>

      {/* Erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="text-red-800 font-semibold">Erreur</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Résultats */}
      {testResult && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h3 className="text-green-800 font-semibold mb-2">Résultats du Test</h3>
          <pre className="text-sm text-green-700 overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Diagnostic détaillé */}
      {diagnostic && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <h3 className="text-gray-800 font-semibold mb-2">Diagnostic Détaillé</h3>
          <pre className="text-xs text-gray-600 overflow-auto max-h-96">
            {JSON.stringify(diagnostic, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}