'use client';

import React, { useState } from 'react';
import { UniversalMedia } from '../../components/media/UniversalMedia';
import { AppwriteMediaService } from '../../lib/appwrite/media-service';

export default function TestLaalaMedia() {
  // Simuler un laala avec les URLs de test
  const [testLaala] = useState({
    id: 'test-laala',
    nom: 'Test Laala',
    cover: 'https://fra.cloud.appwrite.io/v1/storage/buckets/688fa6db0002434c0735/files/6771caeb001d45f03c43/view?project=688fa4c00025e643934d',
    iscoverVideo: false,
    nomCrea: 'Test Creator',
    avatarCrea: 'https://fra.cloud.appwrite.io/v1/storage/buckets/688fa6db0002434c0735/files/6771caeb001d45f03c43/view?project=688fa4c00025e643934d'
  });

  const [testCoverUrl, setTestCoverUrl] = useState('');

  // Test de génération d'URL via le service
  const testUrlGeneration = () => {
    const testFileId = '6771caeb001d45f03c43';
    const generatedUrl = AppwriteMediaService.getFileUrl(testFileId);
    setTestCoverUrl(String(generatedUrl));
    console.log('🧪 URL générée pour Laala:', {
      fileId: testFileId,
      generatedUrl,
      urlType: typeof generatedUrl,
      urlString: String(generatedUrl)
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Test Médias Laalas</h1>
      
      <div className="space-y-6">
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Test Laala Simulé</h2>
          <div className="text-sm space-y-1">
            <div><strong>Nom:</strong> {testLaala.nom}</div>
            <div><strong>Cover URL:</strong> <code className="bg-gray-200 px-1 rounded break-all">{testLaala.cover}</code></div>
            <div><strong>Avatar Créateur:</strong> <code className="bg-gray-200 px-1 rounded break-all">{testLaala.avatarCrea}</code></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-4">Cover Laala (comme dans modal détail)</h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <UniversalMedia
                src={String(testLaala.cover)}
                alt={testLaala.nom}
                className="w-full h-48 object-cover"
                isVideo={testLaala.iscoverVideo}
              />
            </div>
          </div>

          <div className="border p-4 rounded">
            <h3 className="font-bold mb-4">Avatar Créateur (comme dans modal détail)</h3>
            <div className="flex items-center space-x-3">
              <UniversalMedia
                src={String(testLaala.avatarCrea)}
                alt={testLaala.nomCrea}
                className="w-12 h-12 rounded-full border-2 border-blue-200 object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">{testLaala.nomCrea}</p>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Certifié
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-bold mb-4">Test URL générée par service</h3>
          <div className="space-y-3">
            <button 
              onClick={testUrlGeneration}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Générer URL de test
            </button>
            
            {testCoverUrl && (
              <div>
                <p className="font-medium mb-2">URL générée : <code className="bg-gray-200 px-1 rounded break-all">{testCoverUrl}</code></p>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <UniversalMedia
                    src={testCoverUrl}
                    alt="Test URL générée"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-bold text-blue-800 mb-2">Instructions de Test</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ouvrez la console (F12) pour voir les logs de débogage détaillés</li>
            <li>• Vérifiez que les médias s'affichent correctement</li>
            <li>• Testez la génération d'URL via le bouton</li>
            <li>• Les logs devraient maintenant montrer des strings au lieu d'objets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
