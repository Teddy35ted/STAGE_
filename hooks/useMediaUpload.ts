// Hook React pour l'upload de médias avec un seul bucket Appwrite
import { useState, useCallback } from 'react';
import { AppwriteMediaService, MediaUploadResult, MediaCategory } from '../lib/appwrite/media-service';

export interface UseMediaUploadOptions {
  category: MediaCategory;
  userId?: string;
  entityId?: string;
  onSuccess?: (result: MediaUploadResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export interface UseMediaUploadReturn {
  upload: (file: File) => Promise<void>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: MediaUploadResult | null;
  reset: () => void;
}

export function useMediaUpload(options: UseMediaUploadOptions): UseMediaUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MediaUploadResult | null>(null);

  const upload = useCallback(async (file: File) => {
    if (!options.userId) {
      setError('ID utilisateur requis');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      let uploadResult: MediaUploadResult;

      const progressCallback = (progressValue: number) => {
        setProgress(progressValue);
        if (options.onProgress) {
          options.onProgress(progressValue);
        }
      };

      // Choisir la méthode d'upload selon la catégorie
      switch (options.category) {
        case 'user-avatar':
          uploadResult = await AppwriteMediaService.uploadUserAvatar(file, options.userId, progressCallback);
          break;
        case 'laala-cover':
          uploadResult = await AppwriteMediaService.uploadLaalaCover(file, options.userId, options.entityId, progressCallback);
          break;
        case 'contenu-media':
          uploadResult = await AppwriteMediaService.uploadContenuMedia(file, options.userId, options.entityId, progressCallback);
          break;
        case 'boutique-image':
          uploadResult = await AppwriteMediaService.uploadBoutiqueImage(file, options.userId, options.entityId, progressCallback);
          break;
        default:
          throw new Error('Catégorie non supportée');
      }

      setResult(uploadResult);
      if (options.onSuccess) {
        options.onSuccess(uploadResult);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      if (options.onError) {
        options.onError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    upload,
    isUploading,
    progress,
    error,
    result,
    reset
  };
}

// Hook spécialisé pour l'upload d'avatar utilisateur
export function useUserAvatarUpload(userId: string, onSuccess?: (avatarUrl: string) => void) {
  return useMediaUpload({
    category: 'user-avatar',
    userId,
    onSuccess: (result) => {
      if (onSuccess) {
        onSuccess(result.url);
      }
    }
  });
}

// Hook spécialisé pour l'upload de couverture Laala
export function useLaalaCoverUpload(userId: string, laalaId?: string, onSuccess?: (coverUrl: string) => void) {
  return useMediaUpload({
    category: 'laala-cover',
    userId,
    entityId: laalaId,
    onSuccess: (result) => {
      if (onSuccess) {
        onSuccess(result.url);
      }
    }
  });
}

// Hook spécialisé pour l'upload de contenu média
export function useContenuMediaUpload(userId: string, contenuId?: string, onSuccess?: (mediaUrl: string) => void) {
  return useMediaUpload({
    category: 'contenu-media',
    userId,
    entityId: contenuId,
    onSuccess: (result) => {
      if (onSuccess) {
        onSuccess(result.url);
      }
    }
  });
}

// Hook spécialisé pour l'upload d'images de boutique
export function useBoutiqueImageUpload(userId: string, boutiqueId?: string, onSuccess?: (imageUrl: string) => void) {
  return useMediaUpload({
    category: 'boutique-image',
    userId,
    entityId: boutiqueId,
    onSuccess: (result) => {
      if (onSuccess) {
        onSuccess(result.url);
      }
    }
  });
}

// Hook pour l'upload multiple d'images
export function useMultipleImageUpload(
  category: MediaCategory,
  userId: string,
  entityId?: string,
  onAllUploaded?: (urls: string[]) => void
) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadMultiple = useCallback(async (files: File[]) => {
    if (!userId) {
      setError('ID utilisateur requis');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setUploadedUrls([]);

    const urls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileProgress = (i / files.length) * 100;
        
        const progressCallback = (fileProgressValue: number) => {
          const totalProgress = fileProgress + (fileProgressValue / files.length);
          setProgress(totalProgress);
        };

        let uploadResult: MediaUploadResult;

        switch (category) {
          case 'user-avatar':
            uploadResult = await AppwriteMediaService.uploadUserAvatar(file, userId, progressCallback);
            break;
          case 'laala-cover':
            uploadResult = await AppwriteMediaService.uploadLaalaCover(file, userId, entityId, progressCallback);
            break;
          case 'contenu-media':
            uploadResult = await AppwriteMediaService.uploadContenuMedia(file, userId, entityId, progressCallback);
            break;
          case 'boutique-image':
            uploadResult = await AppwriteMediaService.uploadBoutiqueImage(file, userId, entityId, progressCallback);
            break;
          default:
            throw new Error('Catégorie non supportée');
        }

        urls.push(uploadResult.url);
        setUploadedUrls([...urls]);
      }

      setProgress(100);
      if (onAllUploaded) {
        onAllUploaded(urls);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [category, userId, entityId, onAllUploaded]);

  const reset = useCallback(() => {
    setUploadedUrls([]);
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadMultiple,
    uploadedUrls,
    isUploading,
    progress,
    error,
    reset
  };
}