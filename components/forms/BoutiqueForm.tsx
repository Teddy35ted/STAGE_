'use client';

import React, { useState } from 'react';
import { Boutique } from '../../app/models/boutiques';
import { useApi } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MediaUpload } from '../ui/media-upload';
import { FiX, FiImage } from 'react-icons/fi';
import { MediaUploadResult } from '../../lib/appwrite/media-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface BoutiqueFormProps {
  boutique?: Boutique;
  onSuccess: () => void;
}

export function BoutiqueForm({ boutique, onSuccess }: BoutiqueFormProps) {
  const [nom, setNom] = useState(boutique?.nom || '');
  const [desc, setDesc] = useState(boutique?.desc || '');
  const [type, setType] = useState(boutique?.type || '');
  const [proprietaire, setProprietaire] = useState(boutique?.proprietaire || '');
  const [adresse, setAdresse] = useState(boutique?.adresse || '');
  const [coverImage, setCoverImage] = useState<string>(boutique?.cover || '');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { apiFetch } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = boutique ? 'PUT' : 'POST';
      const url = boutique ? `/api/boutiques/${boutique.id}` : '/api/boutiques';
      await apiFetch(url, {
        method,
        body: JSON.stringify({ 
          nom, 
          desc, 
          type, 
          proprietaire, 
          adresse,
          cover: coverImage,
          images: uploadedImages
        }),
      });
      onSuccess();
    } catch (err) {
      setError('Failed to save boutique');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (result: MediaUploadResult) => {
    setUploadedImages(prev => [...prev, result.url]);
    console.log('Image ajoutée:', result);
  };

  const handleCoverUpload = (result: MediaUploadResult) => {
    setCoverImage(result.url);
    console.log('Image de couverture définie:', result);
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{boutique ? 'Modifier' : 'Ajouter une boutique'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{boutique ? 'Modifier la boutique' : 'Ajouter une boutique'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="text-red-500">{error}</div>}
          
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom">Nom de la boutique *</label>
              <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="type">Type</label>
              <Input id="type" value={type} onChange={(e) => setType(e.target.value)} required />
            </div>
          </div>

          <div>
            <label htmlFor="desc">Description *</label>
            <textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              rows={3}
              className="w-full border rounded px-3 py-2"
              placeholder="Décrivez votre boutique..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proprietaire">Propriétaire</label>
              <Input 
                id="proprietaire" 
                value={proprietaire} 
                onChange={(e) => setProprietaire(e.target.value)} 
                placeholder="Nom du propriétaire"
              />
            </div>
            <div>
              <label htmlFor="adresse">Adresse</label>
              <Input 
                id="adresse" 
                value={adresse} 
                onChange={(e) => setAdresse(e.target.value)} 
                placeholder="Adresse de la boutique"
              />
            </div>
          </div>

          {/* Image de couverture */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Image de couverture</h4>
            <MediaUpload
              category="boutique-image"
              userId="current-user" // À remplacer par l'ID utilisateur réel
              acceptedTypes="image/*"
              maxSize={10 * 1024 * 1024}
              label="Sélectionner l'image principale"
              description="Image qui représentera votre boutique"
              onUploadSuccess={handleCoverUpload}
              onUploadError={(error: string) => {
                console.error('Erreur upload couverture:', error);
                setError(error);
              }}
              preview={true}
            />
            {coverImage && (
              <div className="mt-2">
                <img 
                  src={coverImage} 
                  alt="Couverture" 
                  className="w-20 h-20 object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* Images supplémentaires */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Images supplémentaires</h4>
            <MediaUpload
              category="boutique-image"
              userId="current-user" // À remplacer par l'ID utilisateur réel
              acceptedTypes="image/*"
              maxSize={10 * 1024 * 1024}
              label="Ajouter une image"
              description="Images de présentation de votre boutique"
              onUploadSuccess={handleImageUpload}
              onUploadError={(error: string) => {
                console.error('Erreur upload image:', error);
              }}
              preview={false}
            />

            {/* Galerie des images uploadées */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-16 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
