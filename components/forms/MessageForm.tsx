'use client';

import React, { useState } from 'react';
import { ValidationMessageT } from '../../models/message';
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

interface MessageFormProps {
  onSuccess: () => void;
}

export function MessageForm({ onSuccess }: MessageFormProps) {
  const [receiverId, setReceiverId] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId, message: { type: 'text', text } }),
      });
      onSuccess();
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Nouveau Message</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau Message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <label htmlFor="receiverId">ID Destinataire</label>
            <Input id="receiverId" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="text">Message</label>
            <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
