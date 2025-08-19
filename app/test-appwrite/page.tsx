'use client';

import React from 'react';
import { AppwriteTest } from '@/components/media/AppwriteTest';
import { AppwriteMedia } from '@/components/media/AppwriteMedia';

export default function TestAppwritePage() {
  // Quelques exemples de fileId pour tester (remplacez par de vrais IDs si vous en avez)
  const testFileIds = [
    '67618dd900119d9e3bc4', // Exemple d'ID - remplacez par un vrai
    '67618dd900119d9e3bc5', // Exemple d'ID - remplacez par un vrai
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">🧪 Test Appwrite Media</h1>
        
        {/* Diagnostic de configuration */}
        <AppwriteTest />
        
        {/* Test d'affichage d'images */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📷 Test d'affichage d'images</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testFileIds.map((fileId, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">Test {index + 1} - FileID: {fileId}</h3>
                <div className="border border-gray-200 rounded p-4">
                  <AppwriteMedia
                    fileId={fileId}
                    alt={`Test image ${index + 1}`}
                    className="w-full h-48 object-cover rounded"
                    width={400}
                    height={300}
                    fallbackSrc="/placeholder-image.jpg"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-medium text-blue-800 mb-2">ℹ️ Instructions:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Remplacez les fileIds par de vrais IDs de votre bucket Appwrite</li>
              <li>• Ouvrez la console du navigateur pour voir les logs détaillés</li>
              <li>• Les erreurs d'affichage seront maintenant plus détaillées</li>
              <li>• Vérifiez que la configuration Appwrite est correcte ci-dessus</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
