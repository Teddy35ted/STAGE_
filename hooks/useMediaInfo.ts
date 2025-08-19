import { useMemo } from 'react';

/**
 * Hook pour extraire le fileId d'une URL Appwrite ou déterminer si c'est un fichier local
 */
export const useMediaInfo = (url: string | null | undefined) => {
  return useMemo(() => {
    if (!url) {
      return {
        fileId: null,
        isLocal: false,
        isAppwrite: false,
        originalUrl: null
      };
    }

    // Convertir l'URL en string si c'est un objet
    const urlString = String(url);

    // Vérifier si c'est un fichier local
    if (urlString.startsWith('/uploads/')) {
      return {
        fileId: null,
        isLocal: true,
        isAppwrite: false,
        originalUrl: urlString
      };
    }

    // Extraire le fileId d'une URL Appwrite - méthode 1 (regex)
    const appwriteMatch = urlString.match(/\/files\/([^\/]+)\/(?:view|preview)/);
    if (appwriteMatch) {
      return {
        fileId: appwriteMatch[1],
        isLocal: false,
        isAppwrite: true,
        originalUrl: urlString
      };
    }

    // Extraire le fileId d'une URL Appwrite - méthode 2 (logique du service)
    try {
      const urlParts = urlString.split('/');
      const fileIndex = urlParts.findIndex(part => part === 'files');
      if (fileIndex !== -1 && urlParts[fileIndex + 1]) {
        const fileId = urlParts[fileIndex + 1];
        // Vérifier que c'est bien une URL Appwrite
        if (urlString.includes('appwrite.io') || urlString.includes('storage/buckets')) {
          return {
            fileId,
            isLocal: false,
            isAppwrite: true,
            originalUrl: urlString
          };
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'ID:', error);
    }

    // URL inconnue
    return {
      fileId: null,
      isLocal: false,
      isAppwrite: false,
      originalUrl: urlString
    };
  }, [url]);
};
