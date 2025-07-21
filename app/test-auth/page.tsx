'use client';

import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function TestAuthPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSignUp = async () => {
    setLoading(true);
    setResult('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setResult(`Inscription réussie: ${userCredential.user.email}`);
    } catch (error: any) {
      setResult(`Erreur inscription: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    setResult('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setResult(`Connexion réussie: ${userCredential.user.email}`);
    } catch (error: any) {
      setResult(`Erreur connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFirebaseConnection = async () => {
    setLoading(true);
    setResult('');
    try {
      // Test simple de connexion à Firebase
      console.log('Firebase Auth:', auth);
      console.log('Firebase App:', auth.app);
      setResult('Firebase est correctement configuré');
    } catch (error: any) {
      setResult(`Erreur Firebase: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Test Firebase Auth</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="space-y-2">
            <button
              onClick={testFirebaseConnection}
              disabled={loading}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Tester la connexion Firebase
            </button>
            
            <button
              onClick={testSignUp}
              disabled={loading}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Tester l'inscription
            </button>
            
            <button
              onClick={testSignIn}
              disabled={loading}
              className="w-full p-2 bg-[#f01919] text-white rounded hover:bg-[#d01515] disabled:opacity-50"
            >
              Tester la connexion
            </button>
          </div>
          
          {result && (
            <div className={`p-3 rounded text-sm ${
              result.includes('réussie') || result.includes('correctement') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {result}
            </div>
          )}
          
          {loading && (
            <div className="text-center">
              <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2">Test en cours...</span>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <a href="/auth" className="text-[#f01919] hover:underline">
            ← Retour à la page d'authentification
          </a>
        </div>
      </div>
    </div>
  );
}