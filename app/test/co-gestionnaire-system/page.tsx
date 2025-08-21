'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useApi } from '../../../lib/api';

export default function TestCoGestionnairePage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [formData, setFormData] = useState({
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    nom: 'Test',
    prenom: 'CoGestionnaire',
    tel: '+228 12 34 56 78',
    pays: 'Togo',
    ville: 'Lomé'
  });

  const { apiFetch } = useApi();

  const addResult = (test: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testCreateCoGestionnaire = async () => {
    try {
      addResult('CREATE', 'info', 'Création du co-gestionnaire...');
      
      const coGestionnaireData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        tel: formData.tel,
        pays: formData.pays,
        ville: formData.ville,
        ACCES: 'gerer',
        permissions: [
          {
            resource: 'laalas',
            actions: ['create', 'read', 'update']
          },
          {
            resource: 'contenus',
            actions: ['read', 'update']
          }
        ],
        password: formData.password,
        description: 'Co-gestionnaire de test'
      };

      const result = await apiFetch('/api/co-gestionnaires', {
        method: 'POST',
        body: JSON.stringify(coGestionnaireData)
      });

      if (result.success) {
        addResult('CREATE', 'success', `Co-gestionnaire créé avec ID: ${result.id}`, result);
        return result.id;
      } else {
        addResult('CREATE', 'error', 'Échec de création', result);
        return null;
      }
    } catch (error: any) {
      addResult('CREATE', 'error', `Erreur: ${error.message}`, error);
      return null;
    }
  };

  const testCoGestionnaireLogin = async () => {
    try {
      addResult('LOGIN', 'info', 'Test de connexion co-gestionnaire...');
      
      const loginData = {
        email: formData.email,
        password: formData.password
      };

      const result = await apiFetch('/api/auth/co-gestionnaire', {
        method: 'POST',
        body: JSON.stringify(loginData)
      });

      if (result.success) {
        addResult('LOGIN', 'success', 'Connexion réussie', result.data);
        
        // Stocker le token pour les tests suivants
        localStorage.setItem('testCoGestionnaireToken', result.data.token);
        localStorage.setItem('testCoGestionnaireId', result.data.user.id);
        
        return result.data;
      } else {
        addResult('LOGIN', 'error', 'Échec de connexion', result);
        return null;
      }
    } catch (error: any) {
      addResult('LOGIN', 'error', `Erreur: ${error.message}`, error);
      return null;
    }
  };

  const testPasswordChangeRequired = async () => {
    try {
      addResult('PWD_CHECK', 'info', 'Vérification changement de mot de passe requis...');
      
      const token = localStorage.getItem('testCoGestionnaireToken');
      if (!token) {
        addResult('PWD_CHECK', 'error', 'Token manquant - connectez-vous d\'abord');
        return;
      }

      const result = await apiFetch('/api/auth/check-password-change', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (result.requiresPasswordChange) {
        addResult('PWD_CHECK', 'info', 'Changement de mot de passe requis (normal)', result);
      } else {
        addResult('PWD_CHECK', 'success', 'Aucun changement de mot de passe requis', result);
      }
    } catch (error: any) {
      addResult('PWD_CHECK', 'error', `Erreur: ${error.message}`, error);
    }
  };

  const testPasswordChange = async () => {
    try {
      addResult('PWD_CHANGE', 'info', 'Test changement de mot de passe...');
      
      const token = localStorage.getItem('testCoGestionnaireToken');
      const userId = localStorage.getItem('testCoGestionnaireId');
      
      if (!token || !userId) {
        addResult('PWD_CHANGE', 'error', 'Token ou ID manquant');
        return;
      }

      const passwordData = {
        userId,
        currentPassword: formData.password,
        newPassword: 'NewTestPassword456!'
      };

      const result = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      if (result.success) {
        addResult('PWD_CHANGE', 'success', 'Changement de mot de passe réussi', result);
        // Mettre à jour le mot de passe pour les tests suivants
        setFormData(prev => ({ ...prev, password: 'NewTestPassword456!' }));
      } else {
        addResult('PWD_CHANGE', 'error', 'Échec changement mot de passe', result);
      }
    } catch (error: any) {
      addResult('PWD_CHANGE', 'error', `Erreur: ${error.message}`, error);
    }
  };

  const testGetCoGestionnaires = async () => {
    try {
      addResult('GET_LIST', 'info', 'Test récupération liste co-gestionnaires...');
      
      const result = await apiFetch('/api/co-gestionnaires');
      
      if (Array.isArray(result)) {
        addResult('GET_LIST', 'success', `${result.length} co-gestionnaires trouvés`, result);
      } else {
        addResult('GET_LIST', 'success', 'Liste récupérée', result);
      }
    } catch (error: any) {
      addResult('GET_LIST', 'error', `Erreur: ${error.message}`, error);
    }
  };

  const testDeleteCoGestionnaire = async () => {
    try {
      addResult('DELETE', 'info', 'Test suppression co-gestionnaire...');
      
      const userId = localStorage.getItem('testCoGestionnaireId');
      if (!userId) {
        addResult('DELETE', 'error', 'ID co-gestionnaire manquant');
        return;
      }

      const result = await apiFetch(`/api/co-gestionnaires/${userId}`, {
        method: 'DELETE'
      });

      if (result.success) {
        addResult('DELETE', 'success', 'Suppression réussie', result);
        // Nettoyer le localStorage
        localStorage.removeItem('testCoGestionnaireToken');
        localStorage.removeItem('testCoGestionnaireId');
      } else {
        addResult('DELETE', 'error', 'Échec suppression', result);
      }
    } catch (error: any) {
      addResult('DELETE', 'error', `Erreur: ${error.message}`, error);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    try {
      addResult('INIT', 'info', 'Démarrage des tests système co-gestionnaires');
      
      // Test 1: Création
      const coGestionnaireId = await testCreateCoGestionnaire();
      if (!coGestionnaireId) {
        addResult('ABORT', 'error', 'Tests interrompus - impossible de créer le co-gestionnaire');
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s
      
      // Test 2: Connexion
      const loginResult = await testCoGestionnaireLogin();
      if (!loginResult) {
        addResult('ABORT', 'error', 'Tests interrompus - impossible de se connecter');
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s
      
      // Test 3: Vérification mot de passe
      await testPasswordChangeRequired();
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s
      
      // Test 4: Changement de mot de passe
      await testPasswordChange();
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s
      
      // Test 5: Liste des co-gestionnaires
      await testGetCoGestionnaires();
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s
      
      // Test 6: Suppression
      await testDeleteCoGestionnaire();
      
      addResult('COMPLETE', 'success', '✅ Tous les tests terminés');
      
    } catch (error: any) {
      addResult('ERROR', 'error', `Erreur globale: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">🧪 Test Système Co-gestionnaires</h1>
      
      {/* Formulaire de configuration des tests */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration du Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          <Input
            placeholder="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
          <Input
            placeholder="Nom"
            value={formData.nom}
            onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
          />
          <Input
            placeholder="Prénom"
            value={formData.prenom}
            onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
          />
        </div>
      </div>

      {/* Boutons de test */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Tests Disponibles</h2>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? '🔄 Tests en cours...' : '🚀 Tous les Tests'}
          </Button>
          <Button 
            onClick={testCreateCoGestionnaire} 
            disabled={isRunning}
            variant="outline"
          >
            Créer Co-gestionnaire
          </Button>
          <Button 
            onClick={testCoGestionnaireLogin} 
            disabled={isRunning}
            variant="outline"
          >
            Test Connexion
          </Button>
          <Button 
            onClick={testPasswordChange} 
            disabled={isRunning}
            variant="outline"
          >
            Changer Mot de Passe
          </Button>
          <Button 
            onClick={testGetCoGestionnaires} 
            disabled={isRunning}
            variant="outline"
          >
            Liste Co-gestionnaires
          </Button>
          <Button 
            onClick={testDeleteCoGestionnaire} 
            disabled={isRunning}
            variant="outline"
          >
            Supprimer
          </Button>
          <Button 
            onClick={clearResults} 
            variant="outline"
            className="ml-auto"
          >
            Effacer Résultats
          </Button>
        </div>
      </div>

      {/* Résultats des tests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Résultats des Tests</h2>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500 italic">Aucun test exécuté</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">
                      [{result.test}] {result.message}
                    </div>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm opacity-75">
                          Voir les détails
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <span className="text-xs opacity-75 ml-4">
                    {result.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
