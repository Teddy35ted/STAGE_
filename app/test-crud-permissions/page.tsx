'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { Button } from '../../components/ui/button';

export default function TestCrudPermissionsPage() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('all');

  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  const entities = [
    { name: 'contenus', label: 'Contenus', ownerField: 'idCreateur' },
    { name: 'laalas', label: 'Laalas', ownerField: 'idCreateur' },
    { name: 'messages', label: 'Messages', ownerField: 'idExpediteur' },
    { name: 'boutiques', label: 'Boutiques', ownerField: 'idProprietaire' },
    { name: 'retraits', label: 'Retraits', ownerField: 'idUtilisateur' },
    { name: 'co-gestionnaires', label: 'Co-gestionnaires', ownerField: 'idProprietaire' },
    { name: 'users', label: 'Utilisateurs', ownerField: 'id', noDelete: true }
  ];

  const testEntityCrud = async (entityName: string, entityConfig: any) => {
    const results: any = {
      entity: entityName,
      timestamp: new Date().toISOString(),
      operations: {}
    };

    try {
      console.log(`🧪 Test CRUD pour ${entityName}...`);

      // Données de test selon l'entité
      let testData: any = {};
      
      switch (entityName) {
        case 'contenus':
          testData = {
            nom: `Test Contenu ${Date.now()}`,
            idLaala: 'test-laala',
            type: 'texte',
            allowComment: true,
            htags: ['#test'],
            personnes: []
          };
          break;
          
        case 'laalas':
          testData = {
            nom: `Test Laala ${Date.now()}`,
            type: 'public',
            description: 'Test description',
            htags: ['#test'],
            personnes: []
          };
          break;
          
        case 'messages':
          testData = {
            contenu: `Test message ${Date.now()}`,
            idDestinataire: user?.uid || 'test-user',
            type: 'text'
          };
          break;
          
        case 'boutiques':
          testData = {
            nom: `Test Boutique ${Date.now()}`,
            description: 'Test boutique',
            categorie: 'test',
            adresse: 'Test address',
            telephone: '12345678'
          };
          break;
          
        case 'retraits':
          testData = {
            montant: 100,
            methode: 'mobile_money',
            statut: 'en_attente',
            numeroCompte: '12345678'
          };
          break;
          
        case 'co-gestionnaires':
          testData = {
            idGestionnaire: user?.uid || 'test-user',
            role: 'moderateur',
            permissions: ['read', 'write']
          };
          break;
          
        case 'users':
          // Pour les utilisateurs, on teste avec l'utilisateur actuel
          testData = {
            nom: 'Test User Updated',
            bio: 'Bio mise à jour'
          };
          break;
      }

      // Test CREATE (sauf pour users)
      if (entityName !== 'users') {
        try {
          console.log(`➕ Test CREATE ${entityName}...`);
          const createResponse = await apiFetch(`/api/${entityName}`, {
            method: 'POST',
            body: JSON.stringify(testData)
          });
          
          results.operations.create = {
            success: true,
            id: createResponse.id,
            duration: Date.now() - Date.now()
          };
          
          results.createdId = createResponse.id;
          console.log(`✅ CREATE ${entityName} réussi:`, createResponse.id);
          
        } catch (error) {
          results.operations.create = {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          };
          console.error(`❌ CREATE ${entityName} échoué:`, error);
        }
      }

      // Test READ
      try {
        console.log(`📖 Test READ ${entityName}...`);
        
        // Pour users, utiliser l'ID de l'utilisateur actuel
        const testId = entityName === 'users' ? user?.uid : results.createdId;
        
        if (testId) {
          const readResponse = await apiFetch(`/api/${entityName}/${testId}`);
          
          results.operations.read = {
            success: true,
            found: !!readResponse,
            data: readResponse ? { id: readResponse.id, name: readResponse.nom || readResponse.contenu } : null
          };
          
          console.log(`✅ READ ${entityName} réussi`);
        } else {
          results.operations.read = {
            success: false,
            error: 'Aucun ID disponible pour le test READ'
          };
        }
        
      } catch (error) {
        results.operations.read = {
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        };
        console.error(`❌ READ ${entityName} échoué:`, error);
      }

      // Test UPDATE
      try {
        console.log(`✏️ Test UPDATE ${entityName}...`);
        
        const testId = entityName === 'users' ? user?.uid : results.createdId;
        
        if (testId) {
          const updateData = entityName === 'users' 
            ? { bio: `Bio mise à jour ${Date.now()}` }
            : { nom: `${testData.nom} - MODIFIÉ` };
            
          const updateResponse = await apiFetch(`/api/${entityName}/${testId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
          });
          
          results.operations.update = {
            success: true,
            response: updateResponse
          };
          
          console.log(`✅ UPDATE ${entityName} réussi`);
        } else {
          results.operations.update = {
            success: false,
            error: 'Aucun ID disponible pour le test UPDATE'
          };
        }
        
      } catch (error) {
        results.operations.update = {
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        };
        console.error(`❌ UPDATE ${entityName} échoué:`, error);
      }

      // Test DELETE (sauf pour users)
      if (!entityConfig.noDelete && entityName !== 'users') {
        try {
          console.log(`🗑️ Test DELETE ${entityName}...`);
          
          if (results.createdId) {
            const deleteResponse = await apiFetch(`/api/${entityName}/${results.createdId}`, {
              method: 'DELETE'
            });
            
            results.operations.delete = {
              success: true,
              response: deleteResponse
            };
            
            console.log(`✅ DELETE ${entityName} réussi`);
          } else {
            results.operations.delete = {
              success: false,
              error: 'Aucun ID disponible pour le test DELETE'
            };
          }
          
        } catch (error) {
          results.operations.delete = {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          };
          console.error(`❌ DELETE ${entityName} échoué:`, error);
        }
      }

      // Calculer le résumé
      const operations = Object.values(results.operations);
      const successCount = operations.filter((op: any) => op.success).length;
      const totalCount = operations.length;
      
      results.summary = {
        successCount,
        totalCount,
        successRate: Math.round((successCount / totalCount) * 100)
      };

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Erreur générale';
    }

    return results;
  };

  const runAllTests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Lancement de tous les tests CRUD...');
      
      const allResults: any = {};
      
      for (const entity of entities) {
        if (selectedEntity === 'all' || selectedEntity === entity.name) {
          console.log(`\n🧪 Test ${entity.label}...`);
          allResults[entity.name] = await testEntityCrud(entity.name, entity);
        }
      }
      
      setTestResults(allResults);
      console.log('📊 Tous les tests terminés:', allResults);
      
    } catch (err) {
      console.error('❌ Erreur tests globaux:', err);
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
        <h1 className="text-2xl font-bold mb-4">Test CRUD Permissions</h1>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Vous devez être connecté pour tester les permissions CRUD.</p>
          <a href="/auth" className="text-blue-600 underline">Se connecter</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test CRUD Permissions</h1>
      
      {/* Statut utilisateur */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Utilisateur Connecté</h2>
        <div>Email: {user.email}</div>
        <div>UID: {user.uid}</div>
        <div className="mt-2 text-sm text-green-600">
          ✅ Permissions par défaut: Toutes autorisées (mode développement)
        </div>
      </div>

      {/* Sélection d'entité */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Entité à Tester</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="all"
              checked={selectedEntity === 'all'}
              onChange={(e) => setSelectedEntity(e.target.value)}
            />
            <span>Toutes</span>
          </label>
          {entities.map((entity) => (
            <label key={entity.name} className="flex items-center space-x-2">
              <input
                type="radio"
                value={entity.name}
                checked={selectedEntity === entity.name}
                onChange={(e) => setSelectedEntity(e.target.value)}
              />
              <span>{entity.label}</span>
            </label>
          ))}
        </div>
        
        <Button 
          onClick={runAllTests}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Tests en cours...' : `Tester ${selectedEntity === 'all' ? 'Toutes les Entités' : entities.find(e => e.name === selectedEntity)?.label}`}
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
      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Résultats des Tests</h2>
          
          {Object.entries(testResults).map(([entityName, result]: [string, any]) => (
            <div key={entityName} className="bg-white border border-gray-200 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold capitalize">{entityName}</h3>
                {result.summary && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.summary.successRate >= 80 ? 'bg-green-100 text-green-800' :
                    result.summary.successRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.summary.successCount}/{result.summary.totalCount} ({result.summary.successRate}%)
                  </div>
                )}
              </div>
              
              {result.error && (
                <div className="text-red-600 mb-4">{result.error}</div>
              )}
              
              {result.operations && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result.operations).map(([operation, opResult]: [string, any]) => (
                    <div key={operation} className={`p-3 rounded border ${
                      opResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="font-medium capitalize">{operation}</div>
                      <div className={`text-sm ${opResult.success ? 'text-green-600' : 'text-red-600'}`}>
                        {opResult.success ? '✅ Réussi' : '❌ Échoué'}
                      </div>
                      {opResult.error && (
                        <div className="text-xs text-red-500 mt-1">{opResult.error}</div>
                      )}
                      {opResult.id && (
                        <div className="text-xs text-gray-500 mt-1">ID: {opResult.id}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}