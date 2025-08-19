'use client';

import React from 'react';
import { UniversalMedia } from '../../components/media/UniversalMedia';
import { useMediaInfo } from '../../hooks/useMediaInfo';

export default function DiagnosticMedias() {
  // URLs de test avec différents formats
  const testUrls = [
    // URL Appwrite complète (exemple)
    'https://fra.cloud.appwrite.io/v1/storage/buckets/688fa6db0002434c0735/files/6771caeb001d45f03c43/view?project=688fa4c00025e643934d',
    
    // URL avec file ID simple
    'storage/buckets/688fa6db0002434c0735/files/6771caeb001d45f03c43/view',
    
    // File ID direct
    '6771caeb001d45f03c43',
    
    // URL locale
    '/uploads/image.jpg',
    
    // URL externe
    'https://example.com/image.jpg',
    
    // null/undefined
    null,
    ''
  ];

  const TestMediaInfo = ({ url, index }: { url: string | null, index: number }) => {
    const mediaInfo = useMediaInfo(url);
    
    return (
      <div className="border p-4 mb-4 bg-gray-50">
        <h3 className="font-bold text-sm mb-2">Test {index + 1}</h3>
        <div className="text-xs space-y-1 mb-3">
          <div><strong>URL:</strong> {url || 'null/empty'}</div>
          <div><strong>FileID:</strong> {mediaInfo.fileId || 'null'}</div>
          <div><strong>IsAppwrite:</strong> {mediaInfo.isAppwrite ? 'Oui' : 'Non'}</div>
          <div><strong>IsLocal:</strong> {mediaInfo.isLocal ? 'Oui' : 'Non'}</div>
          <div><strong>OriginalURL:</strong> {mediaInfo.originalUrl || 'null'}</div>
        </div>
        
        <div className="border border-dashed border-gray-300 p-2 min-h-[100px] flex items-center justify-center">
          {url ? (
            <UniversalMedia 
              src={url}
              alt={`Test ${index + 1}`}
              className="max-w-[80px] max-h-[80px] border border-red-500"
            />
          ) : (
            <span className="text-gray-500">Pas d'URL</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Diagnostic Médias</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-bold text-blue-800 mb-2">Informations de Configuration</h2>
        <div className="text-sm space-y-1">
          <div><strong>Endpoint:</strong> {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}</div>
          <div><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}</div>
          <div><strong>Bucket ID:</strong> {process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testUrls.map((url, index) => (
          <TestMediaInfo key={index} url={url} index={index} />
        ))}
      </div>
    </div>
  );
}
