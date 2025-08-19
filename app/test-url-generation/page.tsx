'use client';

import React, { useEffect, useState } from 'react';
import { AppwriteMediaService } from '../../lib/appwrite/media-service';
import { storage } from '../../lib/appwrite/appwrite';
import { useMediaInfo } from '../../hooks/useMediaInfo';

export default function TestUrlGeneration() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testUrlGeneration = async () => {
      setLoading(true);
      const results = [];

      // Test 1: URL avec getFileView direct
      try {
        const fakeFileId = '6771caeb001d45f03c43';
        const bucketId = '688fa6db0002434c0735';
        
        console.log('🔧 Test génération URL avec storage.getFileView...');
        const urlResult = storage.getFileView(bucketId, fakeFileId);
        
        results.push({
          test: 'storage.getFileView()',
          fileId: fakeFileId,
          urlResult,
          urlType: typeof urlResult,
          urlString: String(urlResult),
          isString: typeof urlResult === 'string',
          toString: urlResult.toString()
        });
        
        console.log('URL Result:', urlResult);
        console.log('Type:', typeof urlResult);
        console.log('String version:', String(urlResult));
        
      } catch (error) {
        results.push({
          test: 'storage.getFileView()',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 2: URL avec AppwriteMediaService
      try {
        const fakeFileId = '6771caeb001d45f03c43';
        console.log('🔧 Test génération URL avec AppwriteMediaService...');
        const serviceUrl = AppwriteMediaService.getFileUrl(fakeFileId);
        
        results.push({
          test: 'AppwriteMediaService.getFileUrl()',
          fileId: fakeFileId,
          urlResult: serviceUrl,
          urlType: typeof serviceUrl,
          urlString: String(serviceUrl),
          isString: typeof serviceUrl === 'string'
        });
        
        console.log('Service URL Result:', serviceUrl);
        console.log('Type:', typeof serviceUrl);
        
      } catch (error) {
        results.push({
          test: 'AppwriteMediaService.getFileUrl()',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      setTestResults(results);
      setLoading(false);
    };

    testUrlGeneration();
  }, []);

  const TestUrlAnalysis = ({ url, label }: { url: string, label: string }) => {
    const mediaInfo = useMediaInfo(url);
    
    return (
      <div className="border p-4 mb-4 bg-gray-50">
        <h4 className="font-bold text-sm mb-2">{label}</h4>
        <div className="text-xs space-y-1">
          <div><strong>URL:</strong> <code className="bg-gray-200 px-1 rounded">{url}</code></div>
          <div><strong>Length:</strong> {url?.length || 0}</div>
          <div><strong>FileID Extracted:</strong> {mediaInfo.fileId || 'null'}</div>
          <div><strong>IsAppwrite:</strong> {mediaInfo.isAppwrite ? '✅ Oui' : '❌ Non'}</div>
          <div><strong>IsLocal:</strong> {mediaInfo.isLocal ? '✅ Oui' : '❌ Non'}</div>
          <div><strong>Regex Match:</strong> {url?.match(/\/files\/([^\/]+)\/(?:view|preview)/) ? '✅ Match' : '❌ No Match'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Test Génération URLs Appwrite</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-bold text-blue-800 mb-2">Configuration</h2>
        <div className="text-sm space-y-1">
          <div><strong>Endpoint:</strong> {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}</div>
          <div><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}</div>
          <div><strong>Bucket ID:</strong> {process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Test en cours...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-4">Résultats Tests URL</h2>
            {testResults.map((result, index) => (
              <div key={index} className="border p-4 mb-4 bg-white rounded">
                <h3 className="font-bold text-md mb-2">{result.test}</h3>
                {result.error ? (
                  <div className="text-red-600">❌ Erreur: {result.error}</div>
                ) : (
                  <div className="text-sm space-y-2">
                    <div><strong>File ID:</strong> {result.fileId}</div>
                    <div><strong>Type retourné:</strong> {result.urlType}</div>
                    <div><strong>Est une string:</strong> {result.isString ? '✅ Oui' : '❌ Non'}</div>
                    <div><strong>URL (toString):</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">{result.toString || result.urlString}</code></div>
                    {result.urlResult && typeof result.urlResult === 'object' && (
                      <div><strong>Objet brut:</strong> <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(result.urlResult, null, 2)}</pre></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Test Recognition Pattern</h2>
            {testResults.map((result, index) => (
              result.toString && !result.error ? (
                <TestUrlAnalysis 
                  key={index}
                  url={result.toString || result.urlString} 
                  label={`${result.test} - Pattern Recognition`}
                />
              ) : null
            ))}
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">URLs d'exemple pour test</h2>
            <TestUrlAnalysis 
              url="https://fra.cloud.appwrite.io/v1/storage/buckets/688fa6db0002434c0735/files/6771caeb001d45f03c43/view?project=688fa4c00025e643934d"
              label="URL Complète Appwrite Typique"
            />
            <TestUrlAnalysis 
              url="https://fra.cloud.appwrite.io/v1/storage/buckets/688fa6db0002434c0735/files/6771caeb001d45f03c43/preview?project=688fa4c00025e643934d"
              label="URL Preview Appwrite"
            />
          </div>
        </div>
      )}
    </div>
  );
}
