'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CoGestionnaire } from '../../../models/co_gestionnaire';
import { apiFetch } from '../../../lib/api';
import { CoGestionnaireForm } from '../../../components/forms/CoGestionnaireForm';
import { Button } from '../../../components/ui/button';

export const getColumns = (refreshData: () => void): ColumnDef<CoGestionnaire>[] => [
  {
    accessorKey: 'nom',
    header: 'Nom',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'ACCES',
    header: 'Accès',
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const coGestionnaire = row.original;

      const handleDelete = async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce co-gestionnaire ?')) {
          try {
            await apiFetch(`/api/co-gestionnaires/${coGestionnaire.id}`, { method: 'DELETE' });
            refreshData();
          } catch (err) {
            console.error('Failed to delete co-gestionnaire', err);
          }
        }
      };

      return (
        <div className="space-x-2">
          <CoGestionnaireForm coGestionnaire={coGestionnaire} onSuccess={refreshData} />
          <Button variant="destructive" size="sm" onClick={handleDelete}>Supprimer</Button>
        </div>
      );
    },
  },
];
