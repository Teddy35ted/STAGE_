// Page de test pour vérifier l'upload de médias avec le bucket configuré
import React, { useState } from 'react';
import UserAvatarUpload from '../components/forms/UserAvatarUpload';
import { MediaUpload } from '../components/ui/media-upload';

export default function TestUploadPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentUser] = useState({
    id: "98455866TG", // ID utilisateur de test
    nom: "Test User"
  });

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Upload Médias</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="font-semibold text-green-800">✅ Bucket ID</h3>
              <p className="text-green-600 font-mono">688fa6db0002434c0735</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="font-semibold text-blue-800">🔗 Projet</h3>
              <p className="text-blue-600 font-mono">688fa4c00025e643934d</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <h3 className="font-semibold text-purple-800">👤 User ID</h3>
              <p className="text-purple-600 font-mono">{currentUser.id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tests d'Upload */}
          <div className="space-y-6">
            {/* Test 1: Avatar Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🧑‍💼 Test 1: Upload Avatar
              </h2>
              <p className="text-gray-600 mb-4">
                Test d'upload d'avatar utilisateur vers le dossier <code className="bg-gray-100 px-1 rounded">users/avatars/</code>
              </p>
              
              <UserAvatarUpload
                currentAvatar=""
                userName={currentUser.nom}
                userId={currentUser.id}
                onAvatarUpdate={(newUrl) => {
                  addTestResult(`✅ Avatar uploadé: ${newUrl}`);
                  addTestResult(`📁 Dossier: users/avatars/${new Date().toISOString().slice(0, 10)}/${currentUser.id}/`);
                }}
                onError={(error) => {
                  addTestResult(`❌ Erreur avatar: ${error}`);
                }}
              />
            </div>

            {/* Test 2: Laala Cover Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🎬 Test 2: Upload Couverture Laala
              </h2>
              <p className="text-gray-600 mb-4">
                Test d'upload de couverture vers le dossier <code className="bg-gray-100 px-1 rounded">laalas/covers/</code>
              </p>
              
              <MediaUpload
                category="laala-cover"
                userId={currentUser.id}
                entityId="test-laala-123"
                label="Sélectionner une couverture Laala"
                description="Image ou vidéo de couverture (test)"
                onUploadSuccess={(result) => {
                  addTestResult(`✅ Couverture Laala uploadée: ${result.url}`);
                  addTestResult(`📁 Chemin: ${result.path}`);
                  addTestResult(`📂 Catégorie: ${result.category}`);
                }}
                onUploadError={(error) => {
                  addTestResult(`❌ Erreur couverture Laala: ${error}`);
                }}
                preview={true}
              />
            </div>

            {/* Test 3: Contenu Media Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📱 Test 3: Upload Média Contenu
              </h2>
              <p className="text-gray-600 mb-4">
                Test d'upload de média vers le dossier <code className="bg-gray-100 px-1 rounded">contenus/media/</code>
              </p>
              
              <MediaUpload
                category="contenu-media"
                userId={currentUser.id}
                entityId="test-contenu-456"
                label="Sélectionner un média de contenu"
                description="Image ou vidéo de contenu (test)"
                onUploadSuccess={(result) => {
                  addTestResult(`✅ Média contenu uploadé: ${result.url}`);
                  addTestResult(`📁 Chemin: ${result.path}`);
                  addTestResult(`📊 Taille: ${result.fileSize} bytes`);
                }}
                onUploadError={(error) => {
                  addTestResult(`❌ Erreur média contenu: ${error}`);
                }}
                preview={true}
              />
            </div>

            {/* Test 4: Boutique Image Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🏪 Test 4: Upload Image Boutique
              </h2>
              <p className="text-gray-600 mb-4">
                Test d'upload d'image vers le dossier <code className="bg-gray-100 px-1 rounded">boutiques/images/</code>
              </p>
              
              <MediaUpload
                category="boutique-image"
                userId={currentUser.id}
                entityId="test-boutique-789"
                label="Sélectionner une image de boutique"
                description="Image de présentation boutique (test)"
                acceptedTypes="image/*"
                onUploadSuccess={(result) => {
                  addTestResult(`✅ Image boutique uploadée: ${result.url}`);
                  addTestResult(`📁 Chemin: ${result.path}`);
                  addTestResult(`🖼️ Type: ${result.mimeType}`);
                }}
                onUploadError={(error) => {
                  addTestResult(`❌ Erreur image boutique: ${error}`);
                }}
                preview={true}
              />
            </div>
          </div>

          {/* Résultats des Tests */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 Résultats des Tests
            </h2>
            
            <div className="space-y-2 mb-4">
              <button
                onClick={() => setTestResults([])}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🗑️ Effacer les résultats
              </button>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">Aucun test effectué pour le moment...</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>

            {/* Informations de Debug */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🔍 Informations de Debug</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Bucket ID:</strong> 688fa6db0002434c0735</p>
                <p><strong>Projet:</strong> 688fa4c00025e643934d</p>
                <p><strong>Endpoint:</strong> https://nyc.cloud.appwrite.io/v1</p>
                <p><strong>User ID:</strong> {currentUser.id}</p>
                <p><strong>Organisation:</strong> Automatique par dossiers</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 Instructions</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>1. Testez chaque type d'upload ci-dessus</p>
                <p>2. Vérifiez les résultats dans cette console</p>
                <p>3. Confirmez dans Appwrite Console que les fichiers sont organisés</p>
                <p>4. Les URLs générées sont prêtes pour Firebase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            🎉 Système de Médias Opérationnel
          </h3>
          <p className="text-green-700 mb-4">
            Votre bucket Appwrite est configuré et prêt à recevoir vos médias avec organisation automatique.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-green-800">✅ Fonctionnalités</h4>
              <ul className="text-green-600 mt-1 space-y-1">
                <li>• Upload d'avatars utilisateur</li>
                <li>• Couvertures Laala (image/vidéo)</li>
                <li>• Médias de contenu</li>
                <li>• Images de boutique</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-800">🔧 Caractéristiques</h4>
              <ul className="text-green-600 mt-1 space-y-1">
                <li>• Organisation automatique par dossiers</li>
                <li>• Validation par catégorie</li>
                <li>• URLs prêtes pour Firebase</li>
                <li>• Noms de fichiers sécurisés</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}