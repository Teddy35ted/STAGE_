'use client';

import React, { useState } from 'react';
import { Boutique } from '../../models/boutiques';
import { apiFetch } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
// import { Textarea } from '../ui/textarea';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = boutique ? 'PUT' : 'POST';
      const url = boutique ? `/api/boutiques/${boutique.id}` : '/api/boutiques';
      await apiFetch(url, {
        method,
        body: JSON.stringify({ nom, desc, type }),
      });
      onSuccess();
    } catch (err) {
      setError('Failed to save boutique');
    } finally {
      setLoading(false);
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <label htmlFor="nom">Nom</label>
            <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="type">Type</label>
            <Input id="type" value={type} onChange={(e) => setType(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
