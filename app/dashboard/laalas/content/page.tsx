'use client';

import React, { useEffect, useState } from 'react';
import { ContenuDashboard } from '../../../models/contenu';
import { apiFetch } from '../../../../lib/api';
import { DataTable } from '../../../../components/ui/data-table';
import { getColumns } from './columns';
import { ContenuForm } from '../../../../components/forms/ContenuForm';

export default function ContentPage() {
  const [contents, setContents] = useState<ContenuDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/contenus');
      setContents(data);
    } catch (err) {
      setError('Failed to fetch contenus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Contenus</h1>
        <ContenuForm onSuccess={fetchContents} />
      </div>
      <DataTable columns={getColumns(fetchContents)} data={contents} />
    </div>
  );
}
