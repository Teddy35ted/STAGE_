// Composant réutilisable pour l'upload de médias avec un seul bucket Appwrite
import React, { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Progress } from './progress';
import { AppwriteMediaService, MediaUploadResult, MediaUploadProps, MediaCategory } from '../../lib/appwrite/media-service';
import { FiUpload, FiX, FiImage, FiVideo, FiFile } from 'react-icons/fi';

interface MediaUploadComponentProps extends Omit<MediaUploadProps, 'onUploadSuccess' | 'onUploadError'> {
  onUploadSuccess: (result: MediaUploadResult) => void;
  onUploadError: (error: string) => void;
  label?: string;
  description?: string;
  multiple?: boolean;
  preview?: boolean;
  className?: string;
}

export function MediaUpload({
  onUploadSuccess,
  onUploadError,
  acceptedTypes,
  maxSize,
  category,
  userId,
  entityId,
  label = "Sélectionner un fichier",
  description,
  multiple = false,
  preview = true,
  className = ""
}: MediaUploadComponentProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedResult, setUploadedResult] = useState<MediaUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Déterminer les types acceptés selon la catégorie
  const getAcceptedTypes = () => {
    if (acceptedTypes) return acceptedTypes;
    
    const limits = AppwriteMediaService.LIMITS[category];
    if (!limits) return "*/*";
    
    // Convertir les types MIME en extensions pour l'input file
    const extensions = limits.types.map(type => {
      if (type.startsWith('image/')) return 'image/*';
      if (type.startsWith('video/')) return 'video/*';
      return type;
    });
    
    return [...new Set(extensions)].join(',');
  };

  // Déterminer la taille max selon la catégorie
  const getMaxSize = () => {
    if (maxSize) return maxSize;
    return AppwriteMediaService.LIMITS[category]?.maxSize || 50 * 1024 * 1024;
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxFileSize = getMaxSize();

    // Validation de la taille
    if (file.size > maxFileSize) {
      onUploadError(`Le fichier est trop volumineux. Taille maximale: ${AppwriteMediaService.formatFileSize(maxFileSize)}`);
      return;
    }

    setSelectedFile(file);
    
    // Créer une preview locale
    if (preview && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, [onUploadError, preview]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !userId) {
      onUploadError('Fichier ou utilisateur manquant');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let result: MediaUploadResult;

      // Upload selon la catégorie
      switch (category) {
        case 'user-avatar':
          result = await AppwriteMediaService.uploadUserAvatar(selectedFile, userId, setUploadProgress);
          break;
        case 'laala-cover':
          result = await AppwriteMediaService.uploadLaalaCover(selectedFile, userId, entityId, setUploadProgress);
          break;
        case 'contenu-media':
          result = await AppwriteMediaService.uploadContenuMedia(selectedFile, userId, entityId, setUploadProgress);
          break;
        case 'boutique-image':
          result = await AppwriteMediaService.uploadBoutiqueImage(selectedFile, userId, entityId, setUploadProgress);
          break;
        default:
          throw new Error('Catégorie de média non supportée');
      }

      setUploadedResult(result);
      onUploadSuccess(result);
      
      // Nettoyer la preview locale et utiliser l'URL Appwrite
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(result.url);

    } catch (error) {
      console.error('Erreur upload:', error);
      onUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, userId, entityId, category, onUploadSuccess, onUploadError, previewUrl]);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setUploadedResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FiImage className="w-5 h-5" />;
    if (file.type.startsWith('video/')) return <FiVideo className="w-5 h-5" />;
    return <FiFile className="w-5 h-5" />;
  };

  const getCategoryLabel = () => {
    const labels = {
      'user-avatar': 'Avatar utilisateur',
      'laala-cover': 'Couverture Laala',
      'contenu-media': 'Média de contenu',
      'boutique-image': 'Image de boutique'
    };
    return labels[category] || 'Média';
  };

  const renderPreview = () => {
    if (!previewUrl || !selectedFile) return null;

    const mediaType = AppwriteMediaService.getMediaType(selectedFile);

    return (
      <div className="mt-4 relative">
        <div className="relative inline-block">
          {mediaType === 'image' ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-48 rounded-lg object-cover"
            />
          ) : mediaType === 'video' ? (
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-48 rounded-lg"
            />
          ) : (
            <div className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              {getFileIcon(selectedFile)}
              <span className="ml-2 text-sm text-gray-600">{selectedFile.name}</span>
            </div>
          )}
          
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            type="button"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <p>{selectedFile.name}</p>
          <p>{AppwriteMediaService.formatFileSize(selectedFile.size)}</p>
          <p className="text-xs text-blue-600">Catégorie: {getCategoryLabel()}</p>
          {uploadedResult && (
            <p className="text-xs text-green-600">Chemin: {uploadedResult.path}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de sélection de fichier */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-2"
          >
            <FiUpload className="w-4 h-4" />
            <span>{label}</span>
          </Button>
          
          {selectedFile && !uploadedResult && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !userId}
              className="flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Upload...</span>
                </>
              ) : (
                <>
                  <FiUpload className="w-4 h-4" />
                  <span>Uploader</span>
                </>
              )}
            </Button>
          )}
        </div>

        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}

        <div className="text-xs text-gray-400">
          <p>Catégorie: {getCategoryLabel()}</p>
          <p>Taille max: {AppwriteMediaService.formatFileSize(getMaxSize())}</p>
          <p>Bucket: {AppwriteMediaService.BUCKET_ID}</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedTypes()}
          onChange={handleFileSelect}
          multiple={multiple}
          className="hidden"
        />
      </div>

      {/* Barre de progression */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-600 text-center">
            Upload en cours... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Preview du fichier */}
      {preview && renderPreview()}

      {/* Résultat de l'upload */}
      {uploadedResult && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Fichier uploadé avec succès</span>
          </div>
          <div className="text-xs text-green-600 mt-1 space-y-1">
            <p>ID: {uploadedResult.fileId}</p>
            <p>Chemin: {uploadedResult.path}</p>
            <p>Catégorie: {uploadedResult.category}</p>
            <p>Bucket: {AppwriteMediaService.BUCKET_ID}</p>
          </div>
        </div>
      )}

      {/* Avertissement si userId manquant */}
      {!userId && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ ID utilisateur requis pour l'upload
          </p>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher un média uploadé
interface MediaDisplayProps {
  url: string;
  type: 'image' | 'video';
  alt?: string;
  className?: string;
  controls?: boolean;
}

export function MediaDisplay({ 
  url, 
  type, 
  alt = "Media", 
  className = "",
  controls = true 
}: MediaDisplayProps) {
  if (type === 'image') {
    return (
      <img
        src={url}
        alt={alt}
        className={`rounded-lg object-cover ${className}`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-image.png';
        }}
      />
    );
  }

  if (type === 'video') {
    return (
      <video
        src={url}
        controls={controls}
        className={`rounded-lg ${className}`}
        onError={(e) => {
          console.error('Erreur de chargement vidéo:', e);
        }}
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    );
  }

  return null;
}