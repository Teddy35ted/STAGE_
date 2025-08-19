'use client';

import React from 'react';
import { UniversalMedia } from '../../components/media/UniversalMedia';
import { AppwriteMediaService } from '../../lib/appwrite/media-service';

export default function TestMediaFix() {
  // Test avec un fileId exemple
  const testFileId = '6771caeb001d45f03c43';
  const testUrl = AppwriteMediaService.getFileUrl(testFileId);
  
  console.log('🧪 Test Media Fix:', {
    testFileId,
    testUrl,
    urlType: typeof testUrl,
    urlString: String(testUrl)
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Test Media Fix</h1>
      
      <div className="space-y-6">
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Configuration Test</h2>
          <div className="text-sm space-y-1">
            <div><strong>Test File ID:</strong> {testFileId}</div>
            <div><strong>Generated URL:</strong> <code className="bg-gray-200 px-1 rounded break-all">{String(testUrl)}</code></div>
            <div><strong>URL Type:</strong> {typeof testUrl}</div>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-4">Test UniversalMedia avec URL générée</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Avec String(url)</h3>
              <UniversalMedia 
                src={String(testUrl)}
                alt="Test avec String(url)"
                width={200}
                height={200}
                className="border rounded"
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Avec URL directe</h3>
              <UniversalMedia 
                src={testUrl}
                alt="Test avec URL directe"
                width={200}
                height={200}
                className="border rounded"
              />
            </div>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-4">Test avec URL Appwrite complète</h2>
          <UniversalMedia 
            src="https://fra.cloud.appwrite.io/v1/storage/buckets/688fa6db0002434c0735/files/6771caeb001d45f03c43/view?project=688fa4c00025e643934d"
            alt="Test URL complète"
            width={200}
            height={200}
            className="border rounded"
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-bold text-blue-800 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ouvrez la console (F12) pour voir les logs de débogage</li>
            <li>• Vérifiez que les médias s'affichent correctement</li>
            <li>• Les logs devraient montrer les types d'URL et l'extraction du fileId</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
