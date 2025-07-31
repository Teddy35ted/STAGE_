'use client';

import React, { useState } from 'react';
import { LaalaCore } from '../../models/laala';
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

interface LaalaFormProps {
  laala?: LaalaCore;
  onSuccess: () => void;
}

export function LaalaForm({ laala, onSuccess }: LaalaFormProps) {
  const [nom, setNom] = useState(laala?.nom || '');
  const [description, setDescription] = useState(laala?.description || '');
  const [type, setType] = useState(laala?.type || 'Laala freestyle');
  const [categorie, setCategorie] = useState(laala?.categorie || '');
  const [isLaalaPublic, setIsLaalaPublic] = useState(laala?.isLaalaPublic || true);
  const [ismonetise, setIsMonetise] = useState(laala?.ismonetise || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = laala ? 'PUT' : 'POST';
      const url = laala ? `/api/laalas/${(laala as any).id}` : '/api/laalas';
      await apiFetch(url, {
        method,
        body: JSON.stringify({ nom, description, type, categorie, isLaalaPublic, ismonetise }),
      });
      onSuccess();
    } catch (err) {
      setError('Failed to save laala');
    } finally {
      setLoading(false);
    }
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
            <Input id="categorie" value={categorie} onChange={(e) => setCategorie(e.target.value)} required />
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
