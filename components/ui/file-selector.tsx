// Composant de sélection de fichier sans upload immédiat
import React, { useState, useRef } from 'react';
import { Button } from './button';
import { FiUpload, FiX, FiImage, FiVideo, FiFile } from 'react-icons/fi';

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  accept?: string;
  label?: string;
  description?: string;
  className?: string;
  maxSize?: number; // en bytes
  mediaType?: 'image' | 'video';
}

export function FileSelector({
  onFileSelect,
  onFileRemove,
  accept = "image/*,video/*",
  label = "Choisir un fichier",
  description,
  className = "",
  maxSize = 50 * 1024 * 1024, // 50MB par défaut
  mediaType = 'image'
}: FileSelectorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation de la taille
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      alert(`Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`);
      return;
    }

    // Validation du type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (mediaType === 'image' && !isImage) {
      alert('Veuillez sélectionner une image');
      return;
    }
    
    if (mediaType === 'video' && !isVideo) {
      alert('Veuillez sélectionner une vidéo');
      return;
    }

    setSelectedFile(file);
    
    // Créer une URL de prévisualisation
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    
    // Notifier le parent
    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove();
  };

  const getFileIcon = () => {
    if (!selectedFile) return <FiFile className="w-6 h-6" />;
    
    if (selectedFile.type.startsWith('image/')) {
      return <FiImage className="w-6 h-6 text-blue-600" />;
    } else if (selectedFile.type.startsWith('video/')) {
      return <FiVideo className="w-6 h-6 text-purple-600" />;
    } else {
      return <FiFile className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id="file-selector"
      />

      {!selectedFile ? (
        // État initial - pas de fichier sélectionné
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              {mediaType === 'image' ? (
                <FiImage className="w-8 h-8 text-gray-400" />
              ) : (
                <FiVideo className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
          
          <label
            htmlFor="file-selector"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiUpload className="w-4 h-4 mr-2" />
            {label}
          </label>
          
          {description && (
            <p className="text-sm text-gray-500 mt-2">{description}</p>
          )}
        </div>
      ) : (
        // État avec fichier sélectionné
        <div className="space-y-4">
          {/* Prévisualisation */}
          {previewUrl && (
            <div className="flex justify-center">
              {selectedFile.type.startsWith('image/') ? (
                <img 
                  src={previewUrl} 
                  alt="Prévisualisation" 
                  className="max-w-full max-h-48 object-contain rounded-lg"
                />
              ) : (
                <video 
                  src={previewUrl} 
                  className="max-w-full max-h-48 object-contain rounded-lg"
                  controls
                />
              )}
            </div>
          )}

          {/* Informations du fichier */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              {getFileIcon()}
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <FiX className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
