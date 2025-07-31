'use client';

import React, { useState } from 'react';
import { ContenuCore } from '../../app/models/contenu';
import { apiFetch } from '../../lib/api';
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
}

export function ContenuForm({ contenu, onSuccess }: ContenuFormProps) {
  const [nom, setNom] = useState(contenu?.nom || '');
  const [type, setType] = useState(contenu?.type || 'image');
  const [src, setSrc] = useState(contenu?.src || '');
  const [idLaala, setIdLaala] = useState(contenu?.idLaala || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = contenu ? 'PUT' : 'POST';
      const url = contenu ? `/api/contenus/${(contenu as any).id}` : '/api/contenus';
      await apiFetch(url, {
        method,
        body: JSON.stringify({ nom, type, src, idLaala }),
      });
      onSuccess();
    } catch (err) {
      setError('Failed to save contenu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{contenu ? 'Modifier' : 'Ajouter un contenu'}</Button>
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
