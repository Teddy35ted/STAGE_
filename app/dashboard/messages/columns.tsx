'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ValidationMessageT } from '../../models/message';
import { Button } from '../../../components/ui/button';
import { FiTrash2 } from 'react-icons/fi';

export const getColumns = (
  refreshData: () => void,
  apiFetch: (url: string, options?: RequestInit) => Promise<any>
): ColumnDef<ValidationMessageT>[] => [
  {
    accessorKey: 'nomsend',
    header: 'Envoyeur',
  },
  {
    accessorKey: 'nomrec',
    header: 'Destinataire',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const message = row.original;

      const handleDelete = async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
          try {
            await apiFetch(`/api/messages/${message.id}`, { method: 'DELETE' });
            refreshData();
          } catch (err) {
            console.error('Failed to delete message', err);
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
