import React, { useState, useEffect } from 'react';
import { Client, Storage } from 'appwrite';

export const AppwriteTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Vérification...');
  const [config, setConfig] = useState<any>({});
  const [bucketInfo, setBucketInfo] = useState<any>(null);

  useEffect(() => {
    const testAppwriteConnection = async () => {
      try {
        // Récupérer la configuration
        const appwriteConfig = {
          endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
          projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID
        };
        
        setConfig(appwriteConfig);

        // Tester la connexion
        const client = new Client()
          .setEndpoint(appwriteConfig.endpoint || '')
          .setProject(appwriteConfig.projectId || '');

        const storage = new Storage(client);

        // Tenter de lister les fichiers du bucket pour vérifier la connexion
        try {
          const files = await storage.listFiles(appwriteConfig.bucketId || '', [], '1');
          setBucketInfo({
            accessible: true,
            totalFiles: files.total,
            message: 'Bucket accessible'
          });
          setStatus('✅ Connexion Appwrite OK');
        } catch (bucketError) {
          setBucketInfo({
            accessible: false,
            error: bucketError,
            message: bucketError instanceof Error ? bucketError.message : 'Erreur bucket'
          });
          setStatus('❌ Erreur d\'accès au bucket');
        }

      } catch (error) {
        setStatus('❌ Erreur de configuration Appwrite');
        console.error('Erreur test Appwrite:', error);
      }
    };

    testAppwriteConnection();
  }, []);

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔧 Diagnostic Appwrite</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Status:</h4>
          <p className={`text-sm ${status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        </div>

        <div>
          <h4 className="font-medium">Configuration:</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>

        {bucketInfo && (
          <div>
            <h4 className="font-medium">Bucket Info:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(bucketInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
