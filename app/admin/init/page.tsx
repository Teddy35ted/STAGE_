'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { FiShield, FiUser, FiKey, FiCheck, FiX } from 'react-icons/fi';

export default function InitAdminPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; admin?: any } | null>(null);

  const handleInitAdmin = async () => {
    setIsInitializing(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur de connexion au serveur'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 mx-auto">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Initialisation Administrateur</CardTitle>
          <p className="text-gray-600">Créer le premier compte administrateur</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {!result && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Informations importantes :</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Email : tedkouevi701@gmail.com</li>
                  <li>• Mot de passe : feiderus</li>
                  <li>• Rôle : Super Administrateur</li>
                </ul>
              </div>

              <Button
                onClick={handleInitAdmin}
                disabled={isInitializing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isInitializing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Initialisation...
                  </>
                ) : (
                  <>
                    <FiShield className="w-4 h-4 mr-2" />
                    Créer l'administrateur
                  </>
                )}
              </Button>
            </>
          )}

          {result && (
            <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center mb-3">
                {result.success ? (
                  <FiCheck className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <FiX className="w-5 h-5 text-red-600 mr-2" />
                )}
                <h4 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.success ? 'Succès !' : 'Erreur'}
                </h4>
              </div>
              
              <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message}
              </p>

              {result.success && result.admin && (
                <div className="mt-4 bg-white rounded border p-3">
                  <h5 className="font-medium text-gray-900 mb-2">Identifiants administrateur :</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Email :</span>
                      <span className="ml-1 font-mono">{result.admin.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FiKey className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Mot de passe :</span>
                      <span className="ml-1 font-mono">{result.admin.temporaryPassword}</span>
                    </div>
                  </div>
                </div>
              )}

              {result.success && (
                <div className="mt-4">
                  <Button 
                    asChild 
                    className="w-full"
                  >
                    <a href="/auth">
                      Aller à la connexion
                    </a>
                  </Button>
                </div>
              )}

              {!result.success && (
                <div className="mt-4">
                  <Button 
                    onClick={() => setResult(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Réessayer
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <a 
              href="/auth"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Retour à la connexion
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
