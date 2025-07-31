'use client';

import React, { useState } from 'react';
import { Retrait } from '../../app/models/retrait';
import { apiFetch } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface RetraitFormProps {
  onSuccess: () => void;
}

export function RetraitForm({ onSuccess }: RetraitFormProps) {
  const [montant, setMontant] = useState(0);
  const [tel, setTel] = useState('');
  const [rib, setRib] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiFetch('/api/retraits', {
        method: 'POST',
        body: JSON.stringify({ montant, tel, rib }),
      });
      onSuccess();
    } catch (err) {
      setError('Failed to create retrait');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Nouveau Retrait</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau Retrait</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <label htmlFor="montant">Montant</label>
            <Input id="montant" type="number" value={montant} onChange={(e) => setMontant(Number(e.target.value))} required />
          </div>
          <div>
            <label htmlFor="tel">Téléphone</label>
            <Input id="tel" value={tel} onChange={(e) => setTel(e.target.value)} />
          </div>
          <div>
            <label htmlFor="rib">RIB</label>
            <Input id="rib" value={rib} onChange={(e) => setRib(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
