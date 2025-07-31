'use client';

import React, { useEffect, useState } from 'react';
import { LaalaDashboard } from '../../models/laala';
import { useApi } from '../../../lib/api';
import { DataTable } from '../../../components/ui/data-table';
import { getColumns } from './columns';
import { LaalaForm } from '../../../components/forms/LaalaForm';

export default function LaalasPage() {
  const [laalas, setLaalas] = useState<LaalaDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { apiFetch } = useApi();

  const fetchLaalas = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/laalas');
      setLaalas(data);
    } catch (err) {
      setError('Failed to fetch laalas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaalas();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Laalas</h1>
        <LaalaForm onSuccess={fetchLaalas} />
      </div>
      <DataTable columns={getColumns(fetchLaalas, apiFetch)} data={laalas} />
    </div>
  );
}
