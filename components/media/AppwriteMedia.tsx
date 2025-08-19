import React, { useState, useEffect } from 'react';
import { Client, Storage } from 'appwrite';

interface AppwriteMediaProps {
  fileId: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  isVideo?: boolean;
  fallbackSrc?: string;
}

// Configuration Appwrite côté client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

const storage = new Storage(client);

export const AppwriteMedia: React.FC<AppwriteMediaProps> = ({
  fileId,
  alt = '',
  className = '',
  width = 800,
  height = 600,
  quality = 80,
  isVideo = false,
  fallbackSrc
}) => {
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Log des props reçues pour debugging
  console.log('🎬 [AppwriteMedia] Initialisation avec props:', {
    fileId,
    alt,
    className,
    width,
    height,
    quality,
    isVideo,
    fallbackSrc,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const loadMedia = async () => {
      console.log('🔄 [AppwriteMedia] Début loadMedia:', { fileId, isVideo });
      
      if (!fileId) {
        console.log('⚠️ [AppwriteMedia] Pas de fileId fourni');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Utiliser le BUCKET_ID configuré dans les variables d'environnement
        const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '688fa6db0002434c0735';
        
        console.log('🔧 [AppwriteMedia] Configuration fileId:', fileId);
        console.log('🔧 [AppwriteMedia] Configuration bucketId:', bucketId);
        console.log('🔧 [AppwriteMedia] Configuration isVideo:', isVideo);
        console.log('🔧 [AppwriteMedia] Configuration endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
        console.log('🔧 [AppwriteMedia] Configuration projectId:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
        console.log('🔧 [AppwriteMedia] Configuration width:', width);
        console.log('🔧 [AppwriteMedia] Configuration height:', height);
        console.log('🔧 [AppwriteMedia] Configuration quality:', quality);

        let mediaUrl: string;
        
        if (isVideo) {
          // Pour les vidéos, utiliser getFileView pour obtenir le fichier complet
          const result = storage.getFileView(bucketId, fileId);
          mediaUrl = result.toString();
          console.log('🎥 [AppwriteMedia] URL vidéo fileId:', fileId);
          console.log('🎥 [AppwriteMedia] URL vidéo bucketId:', bucketId);
          console.log('🎥 [AppwriteMedia] URL vidéo générée:', mediaUrl);
          console.log('🎥 [AppwriteMedia] URL vidéo length:', mediaUrl.length);
          console.log('🎥 [AppwriteMedia] URL vidéo starts with http:', mediaUrl.startsWith('http'));
        } else {
          // Pour les images, utiliser getFilePreview avec optimisation
          const result = storage.getFilePreview(
            bucketId,
            fileId,
            width,
            height,
            'center' as any, // gravity
            quality
          );
          mediaUrl = result.toString();
          console.log('🖼️ [AppwriteMedia] URL image fileId:', fileId);
          console.log('🖼️ [AppwriteMedia] URL image bucketId:', bucketId);
          console.log('🖼️ [AppwriteMedia] URL image générée:', mediaUrl);
          console.log('🖼️ [AppwriteMedia] URL image length:', mediaUrl.length);
          console.log('🖼️ [AppwriteMedia] URL image starts with http:', mediaUrl.startsWith('http'));
          console.log('🖼️ [AppwriteMedia] URL image first 100 chars:', mediaUrl.substring(0, 100));
        }
        
        setMediaUrl(mediaUrl);
        console.log('✅ [AppwriteMedia] Média configuré avec succès:', { fileId, isVideo, bucketId, url: mediaUrl });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
        console.error('❌ [AppwriteMedia] Erreur chargement média:', {
          error: err,
          errorMessage,
          errorType: typeof err,
          errorConstructor: err?.constructor?.name,
          stack: err instanceof Error ? err.stack : 'No stack',
          fileId,
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '688fa6db0002434c0735',
          isVideo,
          appwriteConfig: {
            endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
            projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID
          }
        });
        setError(errorMessage);
        
        // Fallback vers l'URL stockée si disponible
        if (fallbackSrc) {
          console.log('🔄 Fallback vers URL stockée:', fallbackSrc);
          setMediaUrl(fallbackSrc);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [fileId, width, height, quality, isVideo, fallbackSrc]);

  // Gestion du chargement
  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  // Gestion d'erreur avec fallback
  if (error && !mediaUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="flex flex-col items-center space-y-2 text-center p-4">
          <div className="text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm text-gray-500">Erreur de chargement du média</span>
          <span className="text-xs text-gray-400">{error}</span>
        </div>
      </div>
    );
  }

  // Affichage du média
  if (isVideo) {
    return (
      <video
        src={mediaUrl}
        className={className}
        controls
        preload="metadata"
        onError={(e) => {
          console.error('❌ Erreur lecture vidéo:', e);
          setError('Erreur de lecture vidéo');
        }}
      >
        <source src={mediaUrl} />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    );
  }

  return (
    <img
      src={mediaUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        
        // Logs séparés et simplifiés pour éviter les {}
        console.error('❌ ERREUR IMAGE - Event type:', e.type);
        console.error('❌ ERREUR IMAGE - Event timeStamp:', e.timeStamp);
        console.error('❌ ERREUR IMAGE - Event bubbles:', e.bubbles);
        console.error('❌ ERREUR IMAGE - Event cancelable:', e.cancelable);
        
        console.error('❌ ERREUR IMAGE - Target src:', target?.src || 'unknown src');
        console.error('❌ ERREUR IMAGE - Target alt:', target?.alt || 'no alt');
        console.error('❌ ERREUR IMAGE - Target className:', target?.className || 'no className');
        console.error('❌ ERREUR IMAGE - Target naturalWidth:', target?.naturalWidth);
        console.error('❌ ERREUR IMAGE - Target naturalHeight:', target?.naturalHeight);
        console.error('❌ ERREUR IMAGE - Target complete:', target?.complete);
        console.error('❌ ERREUR IMAGE - Target currentSrc:', target?.currentSrc);
        console.error('❌ ERREUR IMAGE - Target loading:', target?.loading);
        
        console.error('❌ ERREUR IMAGE - Context fileId:', fileId);
        console.error('❌ ERREUR IMAGE - Context bucketId:', process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '688fa6db0002434c0735');
        console.error('❌ ERREUR IMAGE - Context endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
        console.error('❌ ERREUR IMAGE - Context projectId:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
        console.error('❌ ERREUR IMAGE - Context expectedUrl:', mediaUrl);
        console.error('❌ ERREUR IMAGE - Context mediaUrlLength:', mediaUrl?.length);
        
        console.error('❌ ERREUR IMAGE - Env ENDPOINT:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
        console.error('❌ ERREUR IMAGE - Env PROJECT_ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
        console.error('❌ ERREUR IMAGE - Env BUCKET_ID:', process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID);
        
        console.error('❌ ERREUR IMAGE - Navigator onLine:', navigator.onLine);
        console.error('❌ ERREUR IMAGE - Navigator language:', navigator.language);
        console.error('❌ ERREUR IMAGE - Timestamp:', new Date().toISOString());
        
        // Test de l'URL directement
        const urlToTest = target?.src || mediaUrl || '';
        if (urlToTest) {
          console.error('❌ ERREUR IMAGE - Testing URL:', urlToTest);
          fetch(urlToTest, { method: 'HEAD' })
            .then(response => {
              console.error('❌ ERREUR IMAGE - Fetch status:', response.status);
              console.error('❌ ERREUR IMAGE - Fetch statusText:', response.statusText);
              console.error('❌ ERREUR IMAGE - Fetch url:', response.url);
              console.error('❌ ERREUR IMAGE - Fetch ok:', response.ok);
              console.error('❌ ERREUR IMAGE - Fetch redirected:', response.redirected);
              console.error('❌ ERREUR IMAGE - Fetch type:', response.type);
              console.error('❌ ERREUR IMAGE - Fetch headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
            })
            .catch(fetchError => {
              console.error('❌ ERREUR IMAGE - Fetch error message:', fetchError.message);
              console.error('❌ ERREUR IMAGE - Fetch error name:', fetchError.name);
              console.error('❌ ERREUR IMAGE - Fetch error stack:', fetchError.stack);
            });
        }
        
        setError('Erreur d\'affichage de l\'image');
      }}
    />
  );
};