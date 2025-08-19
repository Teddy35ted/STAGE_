'use client';

import React from 'react';
import { AppwriteMedia } from '../../components/media/AppwriteMedia';

export default function TestImageLogs() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Logs Images Simplifiés</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Test avec FileID invalide (pour déclencher erreur)</h2>
        <AppwriteMedia 
          fileId="invalid-file-id-for-testing"
          alt="Test erreur"
          className="w-32 h-32 border-2 border-red-500"
        />
      </div>
    </div>
  );
}
