'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function TestCrudCompletPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string>('all');

  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  const runCompleteTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🧪 Lancement du test CRUD complet...');
      
      const result = await apiFetch('/api/test-all-crud', {
        method: 'POST',
        body: JSON.stringify({
          testType: selectedTest,
          timestamp: new Date().toISOString()
        })
      });
      
      setTestResults(result);
      console.log('📊 Résultats des tests:', result);
      
    } catch (err) {
      console.error('❌ Erreur test complet:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testSpecificEntity = async (entity: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🧪 Test spécifique pour ${entity}...`);
      
      let testData: any = {};
      let apiEndpoint = '';
      
      switch (entity) {
        case 'contenu':
          testData = {
            nom: `Test Contenu ${Date.now()}`,
            idLaala: 'test-laala-123',
            type: 'texte',
            src: '',
            allowComment: true,
            htags: ['#test'],
            personnes: []
          };
          apiEndpoint = '/api/contenus';
          break;
          
        case 'laala':
          testData = {
            nom: `Test Laala ${Date.now()}`,
            type: 'public',
            description: 'Test description',
            htags: ['#test'],
            personnes: []
          };
          apiEndpoint = '/api/laalas';
          break;
          
        case 'message':
          testData = {
            contenu: `Test message ${Date.now()}`,
            idDestinataire: user?.uid || 'test-user',
            type: 'text'
          };
          apiEndpoint = '/api/messages';
          break;
          
        case 'boutique':
          testData = {
            nom: `Test Boutique ${Date.now()}`,
            description: 'Test boutique',
            categorie: 'test',
            adresse: 'Test address',
            telephone: '12345678'
          };
          apiEndpoint = '/api/boutiques';
          break;
          
        default:
          throw new Error(`Entité inconnue: ${entity}`);
      }
      
      // Test CREATE
      console.log(`➕ Test CREATE ${entity}...`);
      const createResult = await apiFetch(apiEndpoint, {
        method: 'POST',
        body: JSON.stringify(testData)
      });
      
      const createdId = createResult.id;
      console.log(`✅ ${entity} créé avec ID:`, createdId);
      
      // Test READ
      console.log(`📖 Test READ ${entity}...`);
      const readResult = await apiFetch(`${apiEndpoint}/${createdId}`);
      console.log(`✅ ${entity} lu:`, readResult.nom || readResult.contenu);
      
      // Test UPDATE
      console.log(`✏️ Test UPDATE ${entity}...`);
      const updateData = { ...testData, nom: `${testData.nom} - MODIFIÉ` };
      if (entity === 'message') {
        updateData.contenu = `${testData.contenu} - MODIFIÉ`;
        delete updateData.nom;
      }
      
      const updateResult = await apiFetch(`${apiEndpoint}/${createdId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      console.log(`✅ ${entity} mis à jour:`, updateResult);
      
      // Test DELETE
      console.log(`🗑️ Test DELETE ${entity}...`);
      const deleteResult = await apiFetch(`${apiEndpoint}/${createdId}`, {
        method: 'DELETE'
      });
      console.log(`✅ ${entity} supprimé:`, deleteResult);
      
      setTestResults({
        entity,
        success: true,
        operations: {
          create: { success: true, id: createdId },
          read: { success: true, data: readResult },
          update: { success: true, data: updateResult },
          delete: { success: true, data: deleteResult }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error(`❌ Erreur test ${entity}:`, err);
      setError(`Erreur test ${entity}: ${err instanceof Error ? err.message : 'Inconnue'}`);
      
      setTestResults({
        entity,
        success: false,
        error: err instanceof Error ? err.message : 'Inconnue',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const ensureUserExists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('👤 Vérification/Création utilisateur...');
      
      const result = await apiFetch('/api/ensure-user', {
        method: 'POST',
        body: JSON.stringify({
          nom: 'Utilisateur Test',
          prenom: 'CRUD',
          email: user?.email || 'test@crud.com'
        })
      });
      
      console.log('✅ Utilisateur vérifié/créé:', result);
      setTestResults({
        type: 'user-ensure',
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('❌ Erreur ensure user:', err);
      setError(`Erreur utilisateur: ${err instanceof Error ? err.message : 'Inconnue'}`);
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
        <h1 className="text-2xl font-bold mb-4">Test CRUD Complet</h1>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Vous devez être connecté pour tester les opérations CRUD.</p>
          <a href="/auth" className="text-blue-600 underline">Se connecter</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test CRUD Complet</h1>
      
      {/* Statut utilisateur */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Utilisateur Connecté</h2>
        <div>Email: {user.email}</div>
        <div>UID: {user.uid}</div>
        <Button onClick={ensureUserExists} disabled={loading} className="mt-2">
          {loading ? 'Vérification...' : 'Vérifier/Créer Utilisateur'}
        </Button>
      </div>

      {/* Sélection du test */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Type de Test</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="all"
              checked={selectedTest === 'all'}
              onChange={(e) => setSelectedTest(e.target.value)}
            />
            <span>Tous les services</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="contenu"
              checked={selectedTest === 'contenu'}
              onChange={(e) => setSelectedTest(e.target.value)}
            />
            <span>Contenus</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="laala"
              checked={selectedTest === 'laala'}
              onChange={(e) => setSelectedTest(e.target.value)}
            />
            <span>Laalas</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="message"
              checked={selectedTest === 'message'}
              onChange={(e) => setSelectedTest(e.target.value)}
            />
            <span>Messages</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="boutique"
              checked={selectedTest === 'boutique'}
              onChange={(e) => setSelectedTest(e.target.value)}
            />
            <span>Boutiques</span>
          </label>
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={selectedTest === 'all' ? runCompleteTest : () => testSpecificEntity(selectedTest)}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Test en cours...' : `Tester ${selectedTest === 'all' ? 'Tout' : selectedTest}`}
          </Button>
        </div>
      </div>

      {/* Tests individuels rapides */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Tests Rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            onClick={() => testSpecificEntity('contenu')}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Contenu
          </Button>
          <Button 
            onClick={() => testSpecificEntity('laala')}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Laala
          </Button>
          <Button 
            onClick={() => testSpecificEntity('message')}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Message
          </Button>
          <Button 
            onClick={() => testSpecificEntity('boutique')}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Boutique
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
          
          {/* Résumé pour test complet */}
          {testResults.summary && (
            <div className="mb-4 p-3 bg-white rounded border">
              <h4 className="font-medium mb-2">Résumé</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>Services: {testResults.summary.totalServices}</div>
                <div>Opérations: {testResults.summary.totalOperations}</div>
                <div>Réussies: {testResults.summary.successfulOperations}</div>
                <div>Taux: {testResults.summary.successRate}</div>
              </div>
            </div>
          )}
          
          {/* Détails des opérations */}
          {testResults.operations && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Opérations par Service</h4>
              <div className="space-y-2">
                {Object.entries(testResults.operations).map(([service, ops]: [string, any]) => (
                  <div key={service} className="p-2 bg-white rounded border">
                    <div className="font-medium capitalize">{service}</div>
                    {ops.error ? (
                      <div className="text-red-600 text-sm">{ops.error}</div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 text-sm mt-1">
                        <span className={ops.create === 'OK' ? 'text-green-600' : 'text-red-600'}>
                          C: {ops.create}
                        </span>
                        <span className={ops.read === 'OK' ? 'text-green-600' : 'text-red-600'}>
                          R: {ops.read}
                        </span>
                        <span className={ops.update === 'OK' ? 'text-green-600' : 'text-red-600'}>
                          U: {ops.update}
                        </span>
                        <span className={ops.delete === 'OK' ? 'text-green-600' : 'text-red-600'}>
                          D: {ops.delete}
                        </span>
                      </div>
                    )}
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