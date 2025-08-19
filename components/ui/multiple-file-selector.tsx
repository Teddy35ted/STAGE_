// Composant de sélection de plusieurs fichiers pour galeries d'images
import React, { useState, useRef } from 'react';
import { Button } from './button';
import { FiUpload, FiX, FiImage, FiTrash2 } from 'react-icons/fi';

interface MultipleFileSelectorProps {
  onFilesSelect: (files: File[]) => void;
  onFilesRemove: () => void;
  onRemoveFile: (index: number) => void;
  accept?: string;
  label?: string;
  description?: string;
  className?: string;
  maxSize?: number; // en bytes
  maxFiles?: number; // nombre maximum de fichiers
  selectedFiles?: File[];
}

export function MultipleFileSelector({
  onFilesSelect,
  onFilesRemove,
  onRemoveFile,
  accept = "image/*",
  label = "Choisir des images",
  description,
  className = "",
  maxSize = 5 * 1024 * 1024, // 5MB par défaut
  maxFiles = 10, // 10 images max par défaut
  selectedFiles = []
}: MultipleFileSelectorProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Type de fichier non supporté`);
        return;
      }

      // Vérifier la taille
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        errors.push(`${file.name}: Fichier trop volumineux (max ${maxSizeMB}MB)`);
        return;
      }

      validFiles.push(file);
    });

    // Vérifier le nombre total de fichiers
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      errors.push(`Nombre maximum de fichiers dépassé (max ${maxFiles})`);
      return;
    }

    if (errors.length > 0) {
      alert('Erreurs détectées:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      onFilesSelect([...selectedFiles, ...validFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveFile(index);
  };

  const removeAllFiles = () => {
    onFilesRemove();
  };

  return (
    <div className={className}>
      {/* Zone de drop pour ajouter des fichiers */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : selectedFiles.length > 0 
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-900 mb-1">
          {label}
        </p>
        <p className="text-xs text-gray-500">
          {description || `Glissez-déposez des images ici ou cliquez pour sélectionner (max ${maxFiles} fichiers)`}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Formats supportés: JPEG, PNG, WebP • Max {(maxSize / (1024 * 1024)).toFixed(1)}MB par fichier
        </p>
      </div>

      {/* Prévisualisation des fichiers sélectionnés */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Images sélectionnées ({selectedFiles.length}/{maxFiles})
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeAllFiles}
              className="text-red-600 hover:text-red-700"
            >
              <FiTrash2 className="w-4 h-4 mr-1" />
              Tout supprimer
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => removeFile(index, e)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX className="w-3 h-3" />
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate" title={file.name}>
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
