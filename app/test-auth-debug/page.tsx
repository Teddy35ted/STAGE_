'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../firebase/config';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function TestAuthDebugPage() {
  const [authState, setAuthState] = useState<any>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [apiTest, setApiTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    email: 'test@example.com',
    password: 'testpassword'
  });

  const { user, signIn, loading: authLoading } = useAuth();

  // Surveiller l'état d'authentification
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('🔄 Auth state changed:', user);
      setAuthState({
        user: user ? {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName
        } : null,
        timestamp: new Date().toISOString()
      });
      
      if (user) {
        // Récupérer le token
        user.getIdToken().then(token => {
          console.log('🔑 Token récupéré:', token.substring(0, 20) + '...');
          setTokenInfo({
            hasToken: true,
            tokenLength: token.length,
            tokenPreview: token.substring(0, 50) + '...',
            timestamp: new Date().toISOString()
          });
        }).catch(err => {
          console.error('❌ Erreur récupération token:', err);
          setTokenInfo({
            hasToken: false,
            error: err.message,
            timestamp: new Date().toISOString()
          });
        });
      } else {
        setTokenInfo(null);
      }
    });

    return unsubscribe;
  }, []);

  const testLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Tentative de connexion...');
      const result = await signIn(credentials.email, credentials.password);
      console.log('✅ Connexion réussie:', result);
      
    } catch (err) {
      console.error('❌ Erreur connexion:', err);
      setError(`Erreur connexion: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuthFlow = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth.currentUser) {
        setError('Aucun utilisateur connecté');
        return;
      }
      
      console.log('🧪 Test du flux d\'authentification...');
      
      // Récupérer le token
      const token = await auth.currentUser.getIdToken();
      console.log('🔑 Token récupéré pour test API');
      
      // Tester l'API avec le token
      const response = await fetch('/api/test-auth-flow', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📡 Réponse API:', data);
      
      setApiTest({
        success: response.ok,
        status: response.status,
        data,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('❌ Erreur test auth flow:', err);
      setError(`Erreur test auth: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCrudWithAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth.currentUser) {
        setError('Aucun utilisateur connecté');
        return;
      }
      
      console.log('🧪 Test CRUD avec authentification...');
      
      // Récupérer le token
      const token = await auth.currentUser.getIdToken();
      
      // Tester l'API POST avec le token
      const response = await fetch('/api/test-auth-flow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          test: 'CRUD avec auth',
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      console.log('📡 Réponse CRUD:', data);
      
      setApiTest({
        success: response.ok,
        status: response.status,
        data,
        operation: 'CRUD',
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('❌ Erreur test CRUD:', err);
      setError(`Erreur test CRUD: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🧪 Test avec apiFetch...');
      
      // Importer apiFetch
      const { apiFetch } = await import('../../lib/api');
      
      // Tester avec apiFetch
      const response = await apiFetch('/api/test-auth-flow', {
        method: 'POST',
        body: JSON.stringify({
          test: 'apiFetch test',
          timestamp: new Date().toISOString()
        })
      });
      
      console.log('📡 Réponse apiFetch:', response);
      
      setApiTest({
        success: true,
        method: 'apiFetch',
        data: response,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('❌ Erreur apiFetch:', err);
      setError(`Erreur apiFetch: ${err instanceof Error ? err.message : 'Inconnue'}`);
      
      setApiTest({
        success: false,
        method: 'apiFetch',
        error: err instanceof Error ? err.message : 'Inconnue',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Authentification</h1>
      
      {/* État d'authentification */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">État d'Authentification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">useAuth Hook</h3>
            <div className="text-sm">
              <div>Loading: {authLoading ? 'Oui' : 'Non'}</div>
              <div>User: {user ? `${user.email} (${user.uid})` : 'Aucun'}</div>
            </div>
          </div>
          <div>
            <h3 className="font-medium">Firebase Auth Direct</h3>
            <div className="text-sm">
              <div>Current User: {auth.currentUser ? auth.currentUser.email : 'Aucun'}</div>
              <div>UID: {auth.currentUser?.uid || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connexion */}
      {!user && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Connexion Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
          </div>
          <Button onClick={testLogin} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </div>
      )}

      {/* Informations Token */}
      {tokenInfo && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Informations Token</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Tests API */}
      {user && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Tests API</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={testAuthFlow} disabled={loading}>
              {loading ? 'Test...' : 'Test Auth Flow'}
            </Button>
            <Button onClick={testCrudWithAuth} disabled={loading}>
              {loading ? 'Test...' : 'Test CRUD Auth'}
            </Button>
            <Button onClick={testApiFetch} disabled={loading}>
              {loading ? 'Test...' : 'Test apiFetch'}
            </Button>
          </div>
        </div>
      )}

      {/* Erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="text-red-800 font-semibold">Erreur</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Résultats API */}
      {apiTest && (
        <div className={`border p-4 rounded-lg ${apiTest.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${apiTest.success ? 'text-green-800' : 'text-red-800'}`}>
            Résultats Test API
          </h3>
          <pre className="text-sm overflow-auto max-h-96">
            {JSON.stringify(apiTest, null, 2)}
          </pre>
        </div>
      )}

      {/* État détaillé */}
      {authState && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <h3 className="text-gray-800 font-semibold mb-2">État Détaillé</h3>
          <pre className="text-xs text-gray-600 overflow-auto max-h-96">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}