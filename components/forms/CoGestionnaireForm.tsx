'use client';

import React, { useState } from 'react';
import { CoGestionnaire } from '../../app/models/co_gestionnaire';
import { useApi } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface CoGestionnaireFormProps {
  coGestionnaire?: CoGestionnaire;
  onSuccess: () => void;
}

export function CoGestionnaireForm({ coGestionnaire, onSuccess }: CoGestionnaireFormProps) {
  const [nom, setNom] = useState(coGestionnaire?.nom || '');
  const [email, setEmail] = useState(coGestionnaire?.email || '');
  const [tel, setTel] = useState(coGestionnaire?.tel || '');
  const [pays, setPays] = useState(coGestionnaire?.pays || '');
  const [ville, setVille] = useState(coGestionnaire?.ville || '');
  const [ACCES, setACCES] = useState(coGestionnaire?.ACCES || 'consulter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { apiFetch } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = coGestionnaire ? 'PUT' : 'POST';
      const url = coGestionnaire ? `/api/co-gestionnaires/${coGestionnaire.id}` : '/api/co-gestionnaires';
      await apiFetch(url, {
        method,
        body: JSON.stringify({ nom, email, tel, pays, ville, ACCES }),
      });
      onSuccess();
    } catch (err) {
      setError('Failed to save co-gestionnaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{coGestionnaire ? 'Modifier' : 'Ajouter un co-gestionnaire'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{coGestionnaire ? 'Modifier le co-gestionnaire' : 'Ajouter un co-gestionnaire'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <label htmlFor="nom">Nom</label>
            <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="tel">Téléphone</label>
            <Input id="tel" value={tel} onChange={(e) => setTel(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="pays">Pays</label>
            <Input id="pays" value={pays} onChange={(e) => setPays(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="ville">Ville</label>
            <Input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="acces">Accès</label>
            <select id="acces" value={ACCES} onChange={(e) => setACCES(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]">
              <option value="consulter">Consulter</option>
              <option value="gerer">Gérer</option>
              <option value="Ajouter">Ajouter</option>
            </select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
