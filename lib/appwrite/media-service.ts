// Service Appwrite pour la gestion des médias avec un seul bucket
import { storage } from './appwrite';
import { ID } from 'appwrite';

export interface MediaUploadResult {
  fileId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: MediaCategory;
  path: string; // Chemin organisé dans le bucket
}

export interface MediaUploadOptions {
  file: File;
  category: MediaCategory;
  userId?: string;
  entityId?: string; // ID du Laala, Contenu, Boutique, etc.
  onProgress?: (progress: number) => void;
}

// Catégories de médias pour l'organisation
export type MediaCategory = 'user-avatar' | 'laala-cover' | 'contenu-media' | 'boutique-image';

export class AppwriteMediaService {
  // Un seul bucket pour tous les médias (ID unique du bucket existant)
  static readonly BUCKET_ID = '688fa6db0002434c0735';
  
  // Organisation par dossiers dans le bucket
  static readonly FOLDERS = {
    'user-avatar': 'users/avatars',
    'laala-cover': 'laalas/covers', 
    'contenu-media': 'contenus/media',
    'boutique-image': 'boutiques/images'
  };

  // Limites par catégorie
  static readonly LIMITS = {
    'user-avatar': { maxSize: 5 * 1024 * 1024, types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] },
    'laala-cover': { maxSize: 50 * 1024 * 1024, types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/webm'] },
    'contenu-media': { maxSize: 100 * 1024 * 1024, types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/webm'] },
    'boutique-image': { maxSize: 10 * 1024 * 1024, types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] }
  };

  /**
   * Upload un fichier vers le bucket unique avec organisation par dossiers
   */
  static async uploadFile(options: MediaUploadOptions): Promise<MediaUploadResult> {
    try {
      const { file, category, userId, entityId, onProgress } = options;
      
      // Validation du fichier
      this.validateFile(file, category);
      
      // Générer le chemin organisé
      const path = this.generateFilePath(category, file.name, userId, entityId);
      
      // Générer un ID unique pour le fichier
      const fileId = ID.unique();
      
      console.log(`📤 Upload du fichier ${file.name} vers ${this.BUCKET_ID}/${path}...`);
      
      // Upload du fichier
      const uploadedFile = await storage.createFile(
        this.BUCKET_ID,
        fileId,
        file,
        undefined, // permissions par défaut
        onProgress ? (progress) => {
          const percentage = Math.round((progress.chunksUploaded / progress.chunksTotal) * 100);
          onProgress(percentage);
        } : undefined
      );

      // Générer l'URL de visualisation
      const fileUrl = this.getFileUrl(uploadedFile.$id);

      console.log(`✅ Fichier uploadé avec succès: ${uploadedFile.$id} -> ${path}`);

      return {
        fileId: uploadedFile.$id,
        url: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        category,
        path
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error);
      throw new Error(`Erreur lors de l'upload du fichier: ${error}`);
    }
  }

  /**
   * Générer un chemin organisé pour le fichier
   */
  private static generateFilePath(
    category: MediaCategory, 
    fileName: string, 
    userId?: string, 
    entityId?: string
  ): string {
    const folder = this.FOLDERS[category];
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const sanitizedFileName = this.sanitizeFileName(fileName);
    
    let path = `${folder}/${timestamp}`;
    
    // Ajouter l'ID utilisateur si fourni
    if (userId) {
      path += `/${userId}`;
    }
    
    // Ajouter l'ID de l'entité si fourni (Laala, Contenu, etc.)
    if (entityId) {
      path += `/${entityId}`;
    }
    
    path += `/${sanitizedFileName}`;
    
    return path;
  }

  /**
   * Nettoyer le nom de fichier pour éviter les problèmes
   */
  private static sanitizeFileName(fileName: string): string {
    // Remplacer les caractères spéciaux et espaces
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Obtenir l'URL d'un fichier
   */
  static getFileUrl(fileId: string): string {
    try {
      const result = storage.getFileView(this.BUCKET_ID, fileId);
      // Convertir explicitement en string car getFileView peut retourner un objet URL
      return String(result);
    } catch (error) {
      console.error('❌ Erreur lors de la génération de l\'URL:', error);
      throw new Error(`Erreur lors de la génération de l'URL: ${error}`);
    }
  }

  /**
   * Supprimer un fichier
   */
  static async deleteFile(fileId: string): Promise<void> {
    try {
      await storage.deleteFile(this.BUCKET_ID, fileId);
      console.log(`🗑️ Fichier supprimé: ${fileId}`);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      throw new Error(`Erreur lors de la suppression du fichier: ${error}`);
    }
  }

  /**
   * Upload d'avatar utilisateur
   */
  static async uploadUserAvatar(
    file: File, 
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResult> {
    return this.uploadFile({
      file,
      category: 'user-avatar',
      userId,
      onProgress
    });
  }

  /**
   * Upload de couverture Laala
   */
  static async uploadLaalaCover(
    file: File, 
    userId: string,
    laalaId?: string,
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResult> {
    return this.uploadFile({
      file,
      category: 'laala-cover',
      userId,
      entityId: laalaId,
      onProgress
    });
  }

  /**
   * Upload de contenu média
   */
  static async uploadContenuMedia(
    file: File, 
    userId: string,
    contenuId?: string,
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResult> {
    return this.uploadFile({
      file,
      category: 'contenu-media',
      userId,
      entityId: contenuId,
      onProgress
    });
  }

  /**
   * Upload d'image de boutique
   */
  static async uploadBoutiqueImage(
    file: File, 
    userId: string,
    boutiqueId?: string,
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResult> {
    return this.uploadFile({
      file,
      category: 'boutique-image',
      userId,
      entityId: boutiqueId,
      onProgress
    });
  }

  /**
   * Validation des fichiers selon la catégorie
   */
  private static validateFile(file: File, category: MediaCategory): void {
    const limits = this.LIMITS[category];
    
    if (!limits) {
      throw new Error(`Catégorie de média non supportée: ${category}`);
    }
    
    // Vérifier la taille
    if (file.size > limits.maxSize) {
      throw new Error(`Fichier trop volumineux. Taille maximale: ${this.formatFileSize(limits.maxSize)}`);
    }
    
    // Vérifier le type
    if (!limits.types.includes(file.type)) {
      throw new Error(`Type de fichier non supporté. Types acceptés: ${limits.types.join(', ')}`);
    }
  }

  /**
   * Déterminer le type de média
   */
  static getMediaType(file: File): 'image' | 'video' | 'unknown' {
    if (file.type.startsWith('image/')) {
      return 'image';
    }
    if (file.type.startsWith('video/')) {
      return 'video';
    }
    return 'unknown';
  }

  /**
   * Formater la taille du fichier
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Extraire l'ID du fichier depuis une URL Appwrite
   */
  static extractFileIdFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const fileIndex = urlParts.findIndex(part => part === 'files');
      if (fileIndex !== -1 && urlParts[fileIndex + 2]) {
        return urlParts[fileIndex + 2];
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'ID:', error);
      return null;
    }
  }

  /**
   * Lister les fichiers d'une catégorie
   */
  static async listFiles(category?: MediaCategory, limit: number = 100): Promise<any[]> {
    try {
      const files = await storage.listFiles(this.BUCKET_ID, [], limit.toString());
      
      // Filtrer par catégorie si spécifiée
      if (category) {
        const folderPrefix = this.FOLDERS[category];
        return files.files.filter(file => 
          file.name.startsWith(folderPrefix)
        );
      }
      
      return files.files;
    } catch (error) {
      console.error('❌ Erreur lors de la liste des fichiers:', error);
      return [];
    }
  }

  /**
   * Obtenir les statistiques d'usage par catégorie
   */
  static async getUsageStats(): Promise<Record<MediaCategory, { count: number; totalSize: number }>> {
    try {
      const files = await storage.listFiles(this.BUCKET_ID, [], '1000');
      
      const stats: Record<MediaCategory, { count: number; totalSize: number }> = {
        'user-avatar': { count: 0, totalSize: 0 },
        'laala-cover': { count: 0, totalSize: 0 },
        'contenu-media': { count: 0, totalSize: 0 },
        'boutique-image': { count: 0, totalSize: 0 }
      };

      files.files.forEach(file => {
        // Déterminer la catégorie basée sur le nom du fichier
        for (const [category, folder] of Object.entries(this.FOLDERS)) {
          if (file.name.startsWith(folder)) {
            const cat = category as MediaCategory;
            stats[cat].count++;
            stats[cat].totalSize += file.sizeOriginal || 0;
            break;
          }
        }
      });
      
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return {
        'user-avatar': { count: 0, totalSize: 0 },
        'laala-cover': { count: 0, totalSize: 0 },
        'contenu-media': { count: 0, totalSize: 0 },
        'boutique-image': { count: 0, totalSize: 0 }
      };
    }
  }
}

// Types pour les composants (compatibilité)
export interface MediaUploadProps {
  onUploadSuccess: (result: MediaUploadResult) => void;
  onUploadError: (error: string) => void;
  acceptedTypes?: string;
  maxSize?: number;
  category: MediaCategory;
  userId?: string;
  entityId?: string;
}

export interface MediaPreviewProps {
  url: string;
  type: 'image' | 'video';
  alt?: string;
  className?: string;
}

// Instance unique du service
export const appwriteMediaService = new AppwriteMediaService();