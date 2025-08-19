// COMPOSANT LEGACY - Utilisez SimpleMediaUpload à la place
// Ce composant est conservé pour la compatibilité mais n'est plus fonctionnel
import React from 'react';
import { MediaUploadResult } from '../../lib/appwrite/media-service';

interface MediaUploadComponentProps {
  onUploadSuccess: (result: MediaUploadResult) => void;
  onUploadError: (error: string) => void;
  label?: string;
  description?: string;
  multiple?: boolean;
  preview?: boolean;
  className?: string;
  acceptedTypes?: string[];
  maxSize?: number;
  category?: string;
  userId?: string;
  entityId?: string;
}

/**
 * @deprecated Utilisez SimpleMediaUpload à la place
 * Ce composant est conservé pour la compatibilité mais n'est plus maintenu
 */
export function MediaUpload(props: MediaUploadComponentProps) {
  console.warn('MediaUpload est déprécié. Utilisez SimpleMediaUpload à la place.');
  
  return (
    <div className="p-4 border border-yellow-400 bg-yellow-50 rounded">
      <p className="text-yellow-800 text-sm">
        ⚠️ Ce composant est déprécié. Utilisez <code>SimpleMediaUpload</code> à la place.
      </p>
      <button 
        onClick={() => props.onUploadError('Composant déprécié')}
        className="mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
      >
        Voir SimpleMediaUpload
      </button>
    </div>
  );
}

export default MediaUpload;
