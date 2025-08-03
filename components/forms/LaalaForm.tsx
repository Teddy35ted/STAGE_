'use client';

import React, { useState } from 'react';
import { LaalaCore } from '../../app/models/laala';
import { apiFetch } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { MediaUpload } from '../ui/media-upload';
import { FiImage, FiVideo } from 'react-icons/fi';
import { MediaUploadResult } from '../../lib/appwrite/media-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface LaalaFormProps {
  laala?: LaalaCore;
  onSuccess: () => void;
}

export function LaalaForm({ laala, onSuccess }: LaalaFormProps) {
  const [nom, setNom] = useState(laala?.nom || '');
  const [description, setDescription] = useState(laala?.description || '');
  const [type, setType] = useState(laala?.type || 'Laala freestyle');
  const [categorie, setCategorie] = useState(laala?.categorie || '');
  const [isLaalaPublic, setIsLaalaPublic] = useState<boolean>(laala?.isLaalaPublic || true);
  const [ismonetise, setIsMonetise] = useState<boolean>(laala?.ismonetise || false);
  const [coverMediaType, setCoverMediaType] = useState<'image' | 'video'>('image');
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Lifestyle', 'Technologie', 'Cuisine', 'Sport', 'Éducation',
    'Divertissement', 'Art & Culture', 'Business', 'Santé & Bien-être',
    'Voyage', 'Mode & Beauté', 'Musique', 'Gaming', 'Science', 'Autre'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = laala ? 'PUT' : 'POST';
      const url = laala ? `/api/laalas/${(laala as any).id}` : '/api/laalas';
      await apiFetch(url, {
        method,
        body: JSON.stringify({ 
          nom, 
          description, 
          type, 
          categorie, 
          isLaalaPublic, 
          ismonetise,
          coverUrl,
          coverType: coverMediaType
        }),
      });
      onSuccess();
    } catch (err) {
      setError('Failed to save laala');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = (result: MediaUploadResult) => {
    setCoverUrl(result.url);
    console.log('Couverture Laala uploadée:', result);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{laala ? 'Modifier' : 'Ajouter un laala'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{laala ? 'Modifier le laala' : 'Ajouter un laala'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <label htmlFor="nom">Nom</label>
            <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="type">Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]">
              <option value="Laala freestyle">Freestyle</option>
              <option value="Laala planifié">Planifié</option>
              <option value="Laala groupe">Groupe</option>
              <option value="Laala personnel">Personnel</option>
            </select>
          </div>
          <div>
            <label htmlFor="categorie">Catégorie</label>
            <select 
              id="categorie" 
              value={categorie} 
              onChange={(e) => setCategorie(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Couverture du Laala */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Couverture du Laala</h4>
            
            {/* Choix du type de couverture */}
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="coverType"
                  value="image"
                  checked={coverMediaType === 'image'}
                  onChange={(e) => setCoverMediaType('image')}
                  className="text-[#f01919] focus:ring-[#f01919]"
                />
                <FiImage className="w-4 h-4" />
                <span className="text-sm text-gray-700">Image</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="coverType"
                  value="video"
                  checked={coverMediaType === 'video'}
                  onChange={(e) => setCoverMediaType('video')}
                  className="text-[#f01919] focus:ring-[#f01919]"
                />
                <FiVideo className="w-4 h-4" />
                <span className="text-sm text-gray-700">Vidéo</span>
              </label>
            </div>

            {/* Upload de la couverture */}
            <MediaUpload
              category="laala-cover"
              userId="current-user" // À remplacer par l'ID utilisateur réel
              acceptedTypes={coverMediaType === 'image' ? 'image/*' : 'video/*'}
              maxSize={coverMediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024}
              label={`Sélectionner une ${coverMediaType === 'image' ? 'image' : 'vidéo'} de couverture`}
              description={`${coverMediaType === 'image' ? 'Image' : 'Vidéo'} qui représentera votre Laala (optionnel)`}
              onUploadSuccess={handleCoverUpload}
              onUploadError={(error: string) => {
                console.error('Erreur upload couverture:', error);
                setError(error);
              }}
              preview={true}
            />
            {coverUrl && (
              <div className="mt-2">
                {coverMediaType === 'image' ? (
                  <img 
                    src={coverUrl} 
                    alt="Couverture" 
                    className="w-20 h-20 object-cover rounded border"
                  />
                ) : (
                  <video 
                    src={coverUrl} 
                    className="w-20 h-20 object-cover rounded border"
                    controls
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isLaalaPublic" checked={isLaalaPublic} onChange={(e) => setIsLaalaPublic(e.target.checked)} />
            <label htmlFor="isLaalaPublic">Public</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="ismonetise" checked={ismonetise} onChange={(e) => setIsMonetise(e.target.checked)} />
            <label htmlFor="ismonetise">Monétisé</label>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
