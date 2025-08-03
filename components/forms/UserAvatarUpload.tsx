'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { MediaUpload } from '../ui/media-upload';
import { FiCamera, FiUser, FiX } from 'react-icons/fi';
import { MediaUploadResult } from '../../lib/appwrite/media-service';

interface UserAvatarUploadProps {
  currentAvatar?: string;
  userName?: string;
  userId: string; // Obligatoire pour le bucket unique
  onAvatarUpdate: (newAvatarUrl: string) => void;
  onError?: (error: string) => void;
}

export default function UserAvatarUpload({ 
  currentAvatar, 
  userName = "Utilisateur",
  userId,
  onAvatarUpdate,
  onError 
}: UserAvatarUploadProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || '');

  const handleUploadSuccess = (result: MediaUploadResult) => {
    setPreviewUrl(result.url);
    onAvatarUpdate(result.url);
    setIsEditing(false);
    setIsUploading(false);
    console.log('Avatar mis à jour:', result);
  };

  const handleUploadError = (error: string) => {
    setIsUploading(false);
    if (onError) {
      onError(error);
    }
    console.error('Erreur upload avatar:', error);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar actuel */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Avatar de ${userName}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <FiUser className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Bouton de modification */}
        <button
          onClick={() => setIsEditing(true)}
          className="absolute bottom-2 right-2 bg-[#f01919] text-white p-2 rounded-full shadow-lg hover:bg-[#d01515] transition-colors"
          title="Modifier la photo de profil"
        >
          <FiCamera className="w-4 h-4" />
        </button>
      </div>

      {/* Nom d'utilisateur */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
        <p className="text-sm text-gray-500">Cliquez sur l'icône pour modifier votre photo</p>
      </div>

      {/* Modal d'édition */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Modifier la photo de profil</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Preview actuel */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FiUser className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload */}
              <MediaUpload
                category="user-avatar"
                userId={userId}
                acceptedTypes="image/*"
                maxSize={5 * 1024 * 1024}
                label="Sélectionner une nouvelle photo"
                description="Image JPG, PNG ou GIF de moins de 5MB"
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                preview={false} // On gère la preview nous-mêmes
              />

              {/* Conseils */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Conseils pour une bonne photo :</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Utilisez une image carrée pour un meilleur rendu</li>
                  <li>• Assurez-vous que votre visage est bien visible</li>
                  <li>• Évitez les images floues ou trop sombres</li>
                  <li>• Format recommandé : 400x400 pixels minimum</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isUploading}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant simplifié pour l'affichage seul de l'avatar
interface AvatarDisplayProps {
  avatarUrl?: string;
  userName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarDisplay({ 
  avatarUrl, 
  userName = "Utilisateur", 
  size = 'md',
  className = "" 
}: AvatarDisplayProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`Avatar de ${userName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <FiUser className={`${iconSizes[size]} text-gray-400`} />
        </div>
      )}
    </div>
  );
}