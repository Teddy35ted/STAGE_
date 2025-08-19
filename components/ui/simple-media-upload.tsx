// Composant d'upload simplifié compatible avec notre service Appwrite
import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Progress } from './progress';
import { AppwriteMediaService, MediaUploadResult } from '../../lib/appwrite/media-service';
import { FiUpload, FiX, FiImage, FiVideo, FiFile } from 'react-icons/fi';

interface SimpleMediaUploadProps {
  onUploadSuccess: (result: MediaUploadResult) => void;
  onUploadError: (error: string) => void;
  accept?: string;
  label?: string;
  description?: string;
  className?: string;
  maxSize?: number; // en bytes
  mediaType?: 'image' | 'video';
}

export function SimpleMediaUpload({
  onUploadSuccess,
  onUploadError,
  accept = "image/*,video/*",
  label = "Choisir un fichier",
  description,
  className = "",
  maxSize = 50 * 1024 * 1024, // 50MB par défaut
  mediaType = 'image'
}: SimpleMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation de la taille
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      onUploadError(`Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`);
      return;
    }

    // Validation du type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (mediaType === 'image' && !isImage) {
      onUploadError('Veuillez sélectionner une image');
      return;
    }
    
    if (mediaType === 'video' && !isVideo) {
      onUploadError('Veuillez sélectionner une vidéo');
      return;
    }

    setSelectedFile(file);
    
    // Créer une URL de prévisualisation
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
  };

  const handleUploadFile = async (file: File) => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      console.log('📤 Début upload:', selectedFile.name);
      
      const result = await AppwriteMediaService.uploadFile({
        file: selectedFile,
        category: 'laala-cover',
        onProgress: (progress) => setUploadProgress(progress)
      });

      console.log('✅ Upload réussi:', result.url);
      onUploadSuccess(result);
      
      // Reset après succès
      setSelectedFile(null);
      setPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('❌ Erreur upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await handleUploadFile(selectedFile);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de sélection de fichier */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {!selectedFile ? (
          <div className="space-y-2">
            <FiUpload className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-orange-600 hover:text-orange-700"
              >
                {label}
              </Button>
            </div>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
            <p className="text-xs text-gray-400">
              Taille max: {formatFileSize(maxSize)}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Prévisualisation */}
            {previewUrl && (
              <div className="max-w-xs mx-auto">
                {selectedFile.type.startsWith('image/') ? (
                  <img 
                    src={previewUrl} 
                    alt="Prévisualisation" 
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <video 
                    src={previewUrl} 
                    className="w-full h-32 object-cover rounded"
                    controls
                  />
                )}
              </div>
            )}
            
            {/* Informations du fichier */}
            <div className="text-left bg-gray-50 rounded p-3">
              <div className="flex items-center space-x-2">
                {selectedFile.type.startsWith('image/') ? (
                  <FiImage className="w-4 h-4 text-blue-500" />
                ) : (
                  <FiVideo className="w-4 h-4 text-purple-500" />
                )}
                <span className="font-medium text-sm">{selectedFile.name}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            {/* Barre de progression */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600">Upload en cours... {uploadProgress}%</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 justify-center">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isUploading ? 'Upload...' : 'Uploader'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                <FiX className="w-4 h-4 mr-1" />
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
