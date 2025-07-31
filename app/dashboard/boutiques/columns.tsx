'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Boutique } from '../../models/boutiques';
import { apiFetch } from '../../../lib/api';
import { BoutiqueForm } from '../../../components/forms/BoutiqueForm';
import { Button } from '../../../components/ui/button';

export const getColumns = (refreshData: () => void): ColumnDef<Boutique>[] => [
  {
    accessorKey: 'nom',
    header: 'Nom',
  },
  {
    accessorKey: 'proprietaire',
    header: 'Propriétaire',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'isPromoted',
    header: 'Promu',
    cell: ({ row }) => (row.original.isPromoted ? 'Oui' : 'Non'),
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const boutique = row.original;

      const handleDelete = async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
          try {
            await apiFetch(`/api/boutiques/${boutique.id}`, { method: 'DELETE' });
            refreshData();
          } catch (err) {
            console.error('Failed to delete boutique', err);
          }
        }
      };

      return (
        <div className="space-x-2">
          <BoutiqueForm boutique={boutique} onSuccess={refreshData} />
          <Button variant="destructive" size="sm" onClick={handleDelete}>Supprimer</Button>
        </div>
      );
    },
  },
];
