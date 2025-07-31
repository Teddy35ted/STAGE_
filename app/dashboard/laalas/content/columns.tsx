'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ContenuDashboard } from '../../../models/contenu';
import { Button } from '../../../../components/ui/button';
import { FiEdit3, FiTrash2, FiEye } from 'react-icons/fi';
import { useState } from 'react';
import { ContenuForm } from '../../../../components/forms/ContenuForm';

export const getColumns = (
  refreshData: () => void,
  apiFetch: (url: string, options?: RequestInit) => Promise<any>
): ColumnDef<ContenuDashboard>[] => [
  {
    accessorKey: 'nom',
    header: 'Nom',
    cell: ({ row }) => {
      const contenu = row.original;
      return (
        <div className="max-w-[200px] truncate" title={contenu.nom}>
          {contenu.nom}
        </div>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type;
      const typeColors = {
        image: 'bg-blue-100 text-blue-800',
        video: 'bg-green-100 text-green-800',
        texte: 'bg-gray-100 text-gray-800',
        album: 'bg-purple-100 text-purple-800'
      };
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
          {type}
        </span>
      );
    },
  },
  {
    accessorKey: 'idLaala',
    header: 'Laala',
    cell: ({ row }) => {
      const idLaala = row.original.idLaala;
      return (
        <div className="max-w-[150px] truncate text-sm text-gray-600" title={idLaala}>
          {idLaala}
        </div>
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const contenu = row.original;
      return (
        <div className="text-sm text-gray-600">
          {contenu.date} à {contenu.heure}
        </div>
      );
    },
  },
  {
    accessorKey: 'nomCrea',
    header: 'Créateur',
    cell: ({ row }) => {
      const contenu = row.original;
      return (
        <div className="flex items-center space-x-2">
          <img 
            src={contenu.avatarCrea} 
            alt={contenu.nomCrea}
            className="w-6 h-6 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/assets%2Fprofil.png?alt=media';
            }}
          />
          <span className="text-sm">{contenu.nomCrea}</span>
          {contenu.iscert && <span className="text-blue-500">✓</span>}
        </div>
      );
    },
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const contenu = row.original;

      const handleEdit = async () => {
        // Cette fonction sera gérée par le ContenuForm
        console.log('Édition du contenu:', contenu.id);
      };

      const handleDelete = async () => {
        if (!contenu.id) {
          console.error('❌ ID du contenu manquant:', contenu);
          alert('Erreur: ID du contenu manquant');
          return;
        }

        const confirmMessage = `Êtes-vous sûr de vouloir supprimer "${contenu.nom}" ?\n\nCette action est irréversible.`;
        
        if (confirm(confirmMessage)) {
          try {
            console.log('🗑️ Suppression du contenu:', contenu.id);
            
            const response = await apiFetch(`/api/contenus/${contenu.id}`, { 
              method: 'DELETE' 
            });
            
            console.log('✅ Contenu supprimé:', response);
            
            // Afficher un message de succès
            alert(`Contenu "${contenu.nom}" supprimé avec succès`);
            
            // Rafraîchir les données
            refreshData();
            
          } catch (err) {
            console.error('❌ Erreur lors de la suppression:', err);
            
            let errorMessage = 'Erreur lors de la suppression du contenu';
            if (err instanceof Error) {
              if (err.message.includes('Permission denied')) {
                errorMessage = 'Vous n\'avez pas les permissions pour supprimer ce contenu';
              } else if (err.message.includes('not found')) {
                errorMessage = 'Ce contenu n\'existe plus';
              } else {
                errorMessage = `Erreur: ${err.message}`;
              }
            }
            
            alert(errorMessage);
          }
        }
      };

      const handleView = () => {
        if (contenu.src) {
          window.open(contenu.src, '_blank');
        } else {
          alert('Aucun fichier source disponible pour ce contenu');
        }
      };

      return (
        <div className="flex space-x-1">
          {contenu.src && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleView}
              title="Voir le contenu"
            >
              <FiEye className="w-4 h-4" />
            </Button>
          )}
          
          <ContenuForm 
            contenu={contenu} 
            onSuccess={refreshData}
            trigger={
              <Button 
                size="sm" 
                variant="outline"
                title="Modifier le contenu"
              >
                <FiEdit3 className="w-4 h-4" />
              </Button>
            }
          />
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            title="Supprimer le contenu"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];
