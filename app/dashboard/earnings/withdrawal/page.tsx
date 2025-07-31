'use client';

import React, { useEffect, useState } from 'react';
import { Retrait } from '../../../../models/retrait';
import { apiFetch } from '../../../../lib/api';
import { DataTable } from '../../../../components/ui/data-table';
import { getColumns } from './columns';
import { RetraitForm } from '../../../../components/forms/RetraitForm';

export default function WithdrawalPage() {
  const [withdrawals, setWithdrawals] = useState<Retrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/retraits');
      setWithdrawals(data);
    } catch (err) {
      setError('Failed to fetch retraits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Retraits</h1>
        <RetraitForm onSuccess={fetchWithdrawals} />
      </div>
      <DataTable columns={getColumns(fetchWithdrawals)} data={withdrawals} />
    </div>
  );
}
