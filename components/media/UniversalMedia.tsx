import React from 'react';
import { AppwriteMedia } from './AppwriteMedia';
import { useMediaInfo } from '../../hooks/useMediaInfo';

interface UniversalMediaProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  isVideo?: boolean;
}

/**
 * Composant universel pour afficher des médias
 * - Médias Appwrite : affichés directement via l'API
 * - Médias locaux : affichés via URL classique
 * - URLs inconnues : affichées via URL classique avec fallback
 */
export const UniversalMedia: React.FC<UniversalMediaProps> = ({
  src,
  alt = '',
  className = '',
  width = 800,
  height = 600,
  quality = 80,
  isVideo = false
}) => {
  const mediaInfo = useMediaInfo(src);

  // Logs de débogage détaillés
  console.log('🎯 UniversalMedia DEBUG:', {
    originalSrc: src,
    srcType: typeof src,
    srcString: String(src),
    mediaInfoExtracted: mediaInfo
  });

  // Si c'est un média Appwrite, utiliser le composant AppwriteMedia
  if (mediaInfo.isAppwrite && mediaInfo.fileId) {
    return (
      <AppwriteMedia
        fileId={mediaInfo.fileId}
        alt={alt}
        className={className}
        width={width}
        height={height}
        quality={quality}
        isVideo={isVideo}
        fallbackSrc={mediaInfo.originalUrl || undefined}
      />
    );
  }

  // Pour les médias locaux ou URLs inconnues, utiliser l'affichage classique
  if (mediaInfo.originalUrl) {
    if (isVideo) {
      return (
        <video
          src={mediaInfo.originalUrl}
          className={className}
          controls
          preload="metadata"
        >
          <source src={mediaInfo.originalUrl} />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      );
    }

    return (
      <img
        src={mediaInfo.originalUrl}
        alt={alt}
        className={className}
        loading="lazy"
      />
    );
  }

  // Aucun média à afficher
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <div className="flex flex-col items-center space-y-2 text-center p-4">
        <div className="text-gray-400">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-sm text-gray-500">Aucun média disponible</span>
      </div>
    </div>
  );
};
