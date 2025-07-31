'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Retrait } from '../../../models/retrait';
import { Button } from '../../../../components/ui/button';
import { FiTrash2 } from 'react-icons/fi';

export const getColumns = (
  refreshData: () => void,
  apiFetch: (url: string, options?: RequestInit) => Promise<any>
): ColumnDef<Retrait>[] => [
  {
    accessorKey: 'operation',
    header: 'Opération',
  },
  {
    accessorKey: 'montant',
    header: 'Montant',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'istraite',
    header: 'Traité',
    cell: ({ row }) => (row.original.istraite ? 'Oui' : 'Non'),
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const retrait = row.original;

      const handleDelete = async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce retrait ?')) {
          try {
            await apiFetch(`/api/retraits/${retrait.id}`, { method: 'DELETE' });
            refreshData();
          } catch (err) {
            console.error('Failed to delete retrait', err);
          }
        }
      };

      return (
        <div className="space-x-2">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];
