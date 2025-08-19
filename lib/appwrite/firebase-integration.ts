// Service d'intégration entre Appwrite (médias) et Firebase (données)
import { AppwriteMediaService, MediaUploadResult, MediaCategory } from './media-service';

export interface MediaIntegrationResult {
  success: boolean;
  mediaUrl?: string;
  firestoreData?: any;
  error?: string;
}

export class FirebaseAppwriteIntegration {
  
  /**
   * Upload un avatar utilisateur et met à jour Firestore
   */
  static async updateUserAvatar(
    userId: string, 
    avatarFile: File,
    onProgress?: (progress: number) => void
  ): Promise<MediaIntegrationResult> {
    try {
      console.log(`📤 Upload avatar pour l'utilisateur ${userId}...`);
      
      // 1. Upload vers Appwrite
      const uploadResult = await AppwriteMediaService.uploadUserAvatar(avatarFile, userId, onProgress);
      
      // 2. Préparer les données pour Firestore
      const firestoreUpdate = {
        avatar: uploadResult.url,
        // Optionnel : garder une trace de l'ID Appwrite pour pouvoir supprimer plus tard
        avatarFileId: uploadResult.fileId
      };
      
      console.log(`✅ Avatar uploadé, URL: ${uploadResult.url}`);
      
      return {
        success: true,
        mediaUrl: uploadResult.url,
        firestoreData: firestoreUpdate
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload avatar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Upload une couverture Laala et prépare les données pour Firestore
   */
  static async uploadLaalaCover(
    laalaData: any,
    coverFile: File,
    coverType: 'image' | 'video',
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<MediaIntegrationResult> {
    try {
      console.log(`📤 Upload couverture Laala (${coverType})...`);
      
      // 1. Upload vers Appwrite
      const uploadResult = await AppwriteMediaService.uploadLaalaCover(coverFile, userId, laalaData.id, onProgress);
      
      // 2. Préparer les données pour Firestore
      const firestoreData = {
        ...laalaData,
        cover: uploadResult.url,
        iscoverVideo: coverType === 'video',
        // Générer miniature si c'est une vidéo
        miniature: coverType === 'video' ? uploadResult.url : uploadResult.url,
        // Garder l'ID Appwrite pour référence
        coverFileId: uploadResult.fileId
      };
      
      console.log(`✅ Couverture Laala uploadée, URL: ${uploadResult.url}`);
      
      return {
        success: true,
        mediaUrl: uploadResult.url,
        firestoreData
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload couverture Laala:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Upload un contenu média et prépare les données pour Firestore
   */
  static async uploadContenuMedia(
    contenuData: any,
    mediaFile: File,
    userId: string,
    coverFile?: File,
    onProgress?: (progress: number) => void
  ): Promise<MediaIntegrationResult> {
    try {
      console.log(`📤 Upload contenu média (${contenuData.type})...`);
      
      // 1. Upload du fichier principal vers Appwrite
      const uploadResult = await AppwriteMediaService.uploadContenuMedia(mediaFile, userId, contenuData.id, onProgress);
      
      let coverUrl = '';
      let coverFileId = '';
      
      // 2. Upload de la couverture si fournie (pour les vidéos)
      if (coverFile) {
        console.log('📤 Upload couverture vidéo...');
        const coverResult = await AppwriteMediaService.uploadContenuMedia(coverFile, userId, contenuData.id);
        coverUrl = coverResult.url;
        coverFileId = coverResult.fileId;
      }
      
      // 3. Déterminer le type de média
      const mediaType = AppwriteMediaService.getMediaType(mediaFile);
      
      // 4. Préparer les données pour Firestore
      const firestoreData = {
        ...contenuData,
        src: uploadResult.url,
        cover: coverUrl,
        type: mediaType === 'unknown' ? contenuData.type : mediaType,
        isimage: mediaType === 'image',
        isvideo: mediaType === 'video',
        istexte: mediaType === 'unknown' && contenuData.type === 'texte',
        // Générer miniature
        miniature: mediaType === 'image' ? uploadResult.url : coverUrl || uploadResult.url,
        // Garder les IDs Appwrite pour référence
        mediaFileId: uploadResult.fileId,
        coverFileId: coverFileId || null
      };
      
      console.log(`✅ Contenu média uploadé, URL: ${uploadResult.url}`);
      
      return {
        success: true,
        mediaUrl: uploadResult.url,
        firestoreData
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload contenu média:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Upload des images de boutique et prépare les données pour Firestore
   */
  static async uploadBoutiqueImages(
    boutiqueData: any,
    userId: string,
    coverImage?: File,
    additionalImages: File[] = [],
    onProgress?: (progress: number) => void
  ): Promise<MediaIntegrationResult> {
    try {
      console.log('📤 Upload images boutique...');
      
      let coverUrl = '';
      let coverFileId = '';
      const imageUrls: string[] = [];
      const imageFileIds: string[] = [];
      
      // 1. Upload de l'image de couverture
      if (coverImage) {
        console.log('📤 Upload image de couverture...');
        const coverResult = await AppwriteMediaService.uploadBoutiqueImage(coverImage, userId, boutiqueData.id, onProgress);
        coverUrl = coverResult.url;
        coverFileId = coverResult.fileId;
      }
      
      // 2. Upload des images additionnelles
      if (additionalImages.length > 0) {
        console.log(`📤 Upload ${additionalImages.length} images additionnelles...`);
        
        for (let i = 0; i < additionalImages.length; i++) {
          const imageFile = additionalImages[i];
          const progressCallback = onProgress ? 
            (progress: number) => onProgress((i * 100 + progress) / additionalImages.length) : 
            undefined;
            
          const imageResult = await AppwriteMediaService.uploadBoutiqueImage(imageFile, userId, boutiqueData.id, progressCallback);
          imageUrls.push(imageResult.url);
          imageFileIds.push(imageResult.fileId);
        }
      }
      
      // 3. Préparer les données pour Firestore
      const firestoreData = {
        ...boutiqueData,
        cover: coverUrl,
        isvideo: false, // Les boutiques utilisent des images
        images: imageUrls,
        // Garder les IDs Appwrite pour référence
        coverFileId: coverFileId || null,
        imageFileIds: imageFileIds
      };
      
      console.log(`✅ Images boutique uploadées. Couverture: ${coverUrl}, Images: ${imageUrls.length}`);
      
      return {
        success: true,
        mediaUrl: coverUrl,
        firestoreData
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload images boutique:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Supprimer un média d'Appwrite (utile lors de la suppression d'un élément)
   */
  static async deleteMedia(fileId: string): Promise<boolean> {
    try {
      await AppwriteMediaService.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du média:', error);
      return false;
    }
  }

  /**
   * Nettoyer les anciens médias lors de la mise à jour
   */
  static async cleanupOldMedia(oldFileIds: string[]): Promise<void> {
    console.log(`🧹 Nettoyage de ${oldFileIds.length} anciens fichiers...`);
    
    for (const fileId of oldFileIds) {
      if (fileId) {
        await this.deleteMedia(fileId);
      }
    }
    
    console.log('✅ Nettoyage terminé');
  }

  /**
   * Valider qu'un fichier est approprié pour le type de contenu
   */
  static validateFileForContent(file: File, contentType: string): { valid: boolean; error?: string } {
    const maxSizes = {
      'user-avatar': 5 * 1024 * 1024, // 5MB
      'laala-cover': 50 * 1024 * 1024, // 50MB
      'contenu-media': 100 * 1024 * 1024, // 100MB
      'boutique-image': 10 * 1024 * 1024 // 10MB
    };

    const allowedTypes = {
      'user-avatar': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      'laala-cover': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov'],
      'contenu-media': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov'],
      'boutique-image': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    };

    const maxSize = maxSizes[contentType as keyof typeof maxSizes];
    const allowedMimeTypes = allowedTypes[contentType as keyof typeof allowedTypes];

    if (!allowedMimeTypes) {
      return { valid: false, error: 'Type de contenu non supporté' };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `Fichier trop volumineux. Taille maximale: ${AppwriteMediaService.formatFileSize(maxSize)}` 
      };
    }

    if (!allowedMimeTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Type de fichier non supporté. Types acceptés: ${allowedMimeTypes.join(', ')}` 
      };
    }

    return { valid: true };
  }
}

// Types pour les hooks React
export interface UseMediaUploadOptions {
  category: MediaCategory;
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