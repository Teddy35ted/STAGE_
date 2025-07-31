'use client';

import React, { useState } from 'react';
import { ContenuCore } from '../../app/models/contenu';
import { useApi } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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
        src: src.trim(),
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button>{contenu ? 'Modifier' : 'Ajouter un contenu'}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contenu ? 'Modifier le contenu' : 'Ajouter un contenu'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <label htmlFor="nom">Nom</label>
            <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="type">Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]">
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
              <option value="texte">Texte</option>
            </select>
          </div>
          <div>
            <label htmlFor="src">Source (URL)</label>
            <Input id="src" value={src} onChange={(e) => setSrc(e.target.value)} />
          </div>
          <div>
            <label htmlFor="idLaala">ID Laala</label>
            <Input id="idLaala" value={idLaala} onChange={(e) => setIdLaala(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="htags">Hashtags (séparés par des virgules)</label>
            <Input 
              id="htags" 
              value={htags} 
              onChange={(e) => setHtags(e.target.value)} 
              placeholder="#exemple, #contenu, #laala"
            />
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
