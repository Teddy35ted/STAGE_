'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ContenuDashboard } from '../../../models/contenu';
import { apiFetch } from '../../../../lib/api';
import { Button } from '../../../../components/ui/button';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';

export const getColumns = (refreshData: () => void): ColumnDef<ContenuDashboard>[] => [
  {
    accessorKey: 'nom',
    header: 'Nom',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'idLaala',
    header: 'Laala',
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const contenu = row.original;

      const handleDelete = async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
          try {
            await apiFetch(`/api/contenus/${contenu.id}`, { method: 'DELETE' });
            refreshData();
          } catch (err) {
            console.error('Failed to delete contenu', err);
          }
        }
      };

      return (
        <div className="space-x-2">
          <Button size="sm" variant="outline">
            <FiEdit3 className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];
