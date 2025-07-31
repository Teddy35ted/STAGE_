'use client';

import React, { useEffect, useState } from 'react';
import { ValidationMessageT } from '../../models/message';
import { apiFetch } from '../../../lib/api';
import { DataTable } from '../../../components/ui/data-table';
import { getColumns } from './columns';
import { MessageForm } from '../../../components/forms/MessageForm';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ValidationMessageT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Vous devez implémenter une route pour récupérer toutes les conversations
      const data = await apiFetch('/api/messages');
      setMessages(data);
    } catch (err) {
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Messages</h1>
        <MessageForm onSuccess={fetchMessages} />
      </div>
      <DataTable columns={getColumns(fetchMessages)} data={messages} />
    </div>
  );
}
