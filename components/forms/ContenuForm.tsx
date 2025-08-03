'use client';

import React, { useState } from 'react';
import { ContenuCore } from '../../app/models/contenu';
import { useApi } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { MediaUpload } from '../ui/media-upload';
import { FiHash } from 'react-icons/fi';
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
  const [src, setSrc] = useState(contenu?.src || '');
  const [idLaala, setIdLaala] = useState(contenu?.idLaala || '');
  const [allowComment, setAllowComment] = useState(contenu?.allowComment ?? true);
  const [htags, setHtags] = useState(contenu?.htags?.join(', ') || '');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>(contenu?.cover || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { apiFetch } = useApi();

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

      const method = contenu ? 'PUT' : 'POST';
      const url = contenu ? `/api/contenus/${(contenu as any).id}` : '/api/contenus';
      
      // Préparer les données avec tous les champs requis
      const contenuData = {
        nom: nom.trim(),
        type,
        src: mediaUrl || src.trim(),
        cover: coverUrl,
        idLaala: idLaala.trim(),
        allowComment,
        htags: htags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        personnes: [], // Vide par défaut
        // Données supplémentaires pour aider à la création d'utilisateur si nécessaire
        nomCreateur: 'Utilisateur Dashboard',
        emailCreateur: 'user@dashboard.com'
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
        setSrc('');
        setHtags('');
        setIdLaala('');
        setMediaUrl('');
        setCoverUrl('');
      }
      
      onSuccess();
      
    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde:', err);
      
      // Gestion d'erreurs plus détaillée
      if (err instanceof Error) {
        if (err.message.includes('Unauthorized')) {
          setError('Vous devez être connecté pour effectuer cette action');
        } else if (err.message.includes('Creator not found')) {
          setError('Profil utilisateur non trouvé. Veuillez vous reconnecter.');
        } else {
          setError(`Erreur: ${err.message}`);
        }
      } else {
        setError('Erreur inconnue lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (result: MediaUploadResult) => {
    setMediaUrl(result.url);
    setSrc(result.url);
    console.log('Média uploadé:', result);
  };

  const handleCoverUpload = (result: MediaUploadResult) => {
    setCoverUrl(result.url);
    console.log('Couverture uploadée:', result);
  };

  const renderMediaUpload = () => {
    if (type === 'texte') {
      return (
        <div>
          <label htmlFor="src">Contenu texte</label>
          <textarea
            id="src"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            placeholder="Écrivez votre contenu ici..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
          />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">
          {type === 'image' ? 'Image' : 'Vidéo'} du contenu
        </h4>
        <MediaUpload
          category="contenu-media"
          userId="current-user" // À remplacer par l'ID utilisateur réel
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
                <option value="texte">Texte</option>
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
                userId="current-user" // À remplacer par l'ID utilisateur réel
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

          {/* Source manuelle (fallback) */}
          <div>
            <label htmlFor="src">Source (URL manuelle - optionnel)</label>
            <Input 
              id="src" 
              value={src} 
              onChange={(e) => setSrc(e.target.value)} 
              placeholder="URL directe si pas d'upload"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label htmlFor="htags">Hashtags</label>
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                id="htags" 
                value={htags} 
                onChange={(e) => setHtags(e.target.value)} 
                placeholder="#exemple, #contenu, #laala"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Séparez les hashtags par des virgules
            </p>
          </div>

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
