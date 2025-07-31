'use client';

import React, { useEffect, useState } from 'react';
import { CoGestionnaire } from '../../../../models/co_gestionnaire';
import { apiFetch } from '../../../../lib/api';
import { DataTable } from '../../../../components/ui/data-table';
import { getColumns } from './columns';
import { CoGestionnaireForm } from '../../../../components/forms/CoGestionnaireForm';

export default function ManagersPage() {
  const [managers, setManagers] = useState<CoGestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/co-gestionnaires');
      setManagers(data);
    } catch (err) {
      setError('Failed to fetch co-gestionnaires');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Co-gestionnaires</h1>
        <CoGestionnaireForm onSuccess={fetchManagers} />
      </div>
      <DataTable columns={getColumns(fetchManagers)} data={managers} />
    </div>
  );
}
