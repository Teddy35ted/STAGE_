'use client';

import React, { useEffect, useState } from 'react';
import { Boutique } from '../../../models/boutiques';
import { apiFetch } from '../../../lib/api';
import { DataTable } from '../../../components/ui/data-table';
import { getColumns } from './columns';
import { BoutiqueForm } from '../../../components/forms/BoutiqueForm';

export default function BoutiquesPage() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/boutiques');
      setBoutiques(data);
    } catch (err) {
      setError('Failed to fetch boutiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoutiques();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Boutiques</h1>
        <BoutiqueForm onSuccess={fetchBoutiques} />
      </div>
      <DataTable columns={getColumns(fetchBoutiques)} data={boutiques} />
    </div>
  );
}
