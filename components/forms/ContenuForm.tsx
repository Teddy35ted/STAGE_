'use client';

import React, { useState } from 'react';
import { ContenuCore } from '../../app/models/contenu';
import { useApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { MediaUpload } from '../ui/media-upload';
import { MediaUploadResult } from '../../lib/appwrite/media-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface ContenuFormProps {
  contenu?: ContenuCore;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function ContenuForm({ contenu, onSuccess, trigger }: ContenuFormProps) {
  const [nom, setNom] = useState(contenu?.nom || '');
  const [type, setType] = useState(contenu?.type || 'image');
  const [idLaala, setIdLaala] = useState(contenu?.idLaala || '');
  const [allowComment, setAllowComment] = useState(contenu?.allowComment ?? true);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>(contenu?.cover || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { apiFetch } = useApi();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation côté client
      if (!nom.trim()) {
        setError('Le nom est requis');
        return;
      }
      
      if (!idLaala.trim()) {
        setError('L\'ID Laala est requis');
        return;
      }

      if (!user?.uid) {
        setError('Vous devez être connecté pour créer du contenu');
        return;
      }

      const method = contenu ? 'PUT' : 'POST';
      const url = contenu ? `/api/contenus/${(contenu as any).id}` : '/api/contenus';
      
      // Préparer les données avec l'utilisateur connecté
      const contenuData = {
        nom: nom.trim(),
        type,
        src: mediaUrl,
        cover: coverUrl,
        idLaala: idLaala.trim(),
        allowComment,
        personnes: [],
        idCreateur: user.uid
      };
      
      console.log('📝 Envoi des données contenu:', contenuData);
      
      const result = await apiFetch(url, {
        method,
        body: JSON.stringify(contenuData),
      });
      
      console.log('✅ Contenu sauvegardé:', result);
      
      // Réinitialiser le formulaire après création
      if (!contenu) {
        setNom('');
        setIdLaala('');
        setMediaUrl('');
        setCoverUrl('');
      }
      
      onSuccess();
      
    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde:', err);
      
      // Gestion d'erreurs simplifiée
      if (err instanceof Error) {
        setError(`Erreur: ${err.message}`);
      } else {
        setError('Erreur lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (result: MediaUploadResult) => {
    setMediaUrl(result.url);
    console.log('Média uploadé:', result);
  };

  const handleCoverUpload = (result: MediaUploadResult) => {
    setCoverUrl(result.url);
    console.log('Couverture uploadée:', result);
  };

  const renderMediaUpload = () => {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">
          {type === 'image' ? 'Image' : 'Vidéo'} du contenu
        </h4>
        <MediaUpload
          category="contenu-media"
          userId={user?.uid || 'anonymous'}
          entityId={idLaala}
          acceptedTypes={type === 'image' ? 'image/*' : 'video/*'}
          maxSize={type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024}
          label={`Sélectionner ${type === 'image' ? 'une image' : 'une vidéo'}`}
          description={`Fichier ${type} pour votre contenu`}
          onUploadSuccess={handleMediaUpload}
          onUploadError={(error: string) => {
            console.error('Erreur upload média:', error);
            setError(error);
          }}
          preview={true}
        />
        {mediaUrl && (
          <div className="mt-2">
            {type === 'image' ? (
              <img 
                src={mediaUrl} 
                alt="Contenu" 
                className="w-20 h-20 object-cover rounded border"
              />
            ) : (
              <video 
                src={mediaUrl} 
                className="w-20 h-20 object-cover rounded border"
                controls
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button>{contenu ? 'Modifier' : 'Ajouter un contenu'}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contenu ? 'Modifier le contenu' : 'Ajouter un contenu'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="text-red-500">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom">Titre du contenu *</label>
              <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="type">Type de contenu *</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]">
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="idLaala">ID Laala *</label>
            <Input id="idLaala" value={idLaala} onChange={(e) => setIdLaala(e.target.value)} required />
          </div>

          {/* Upload de média ou saisie de texte */}
          {renderMediaUpload()}

          {/* Couverture pour vidéos */}
          {type === 'video' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Image de couverture (optionnel)</h4>
              <MediaUpload
                category="contenu-media"
                userId={user?.uid || 'anonymous'}
                entityId={idLaala}
                acceptedTypes="image/*"
                maxSize={5 * 1024 * 1024}
                label="Sélectionner une image de couverture"
                description="Image qui s'affichera avant la lecture de la vidéo"
                onUploadSuccess={handleCoverUpload}
                onUploadError={(error: string) => {
                  console.error('Erreur upload couverture:', error);
                }}
                preview={true}
              />
              {coverUrl && (
                <div className="mt-2">
                  <img 
                    src={coverUrl} 
                    alt="Couverture" 
                    className="w-20 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="allowComment" 
              checked={allowComment} 
              onChange={(e) => setAllowComment(e.target.checked)} 
            />
            <label htmlFor="allowComment">Autoriser les commentaires</label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
