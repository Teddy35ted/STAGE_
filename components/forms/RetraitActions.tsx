'use client';

import React, { useState } from 'react';
import { Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { useSoldeAnimateur } from '../../hooks/useSoldeAnimateur';
import { auth } from '../../app/firebase/config';

interface RetraitActionsProps {
  retrait: {
    id: string;
    montant: number;
    statut: string;
  };
  onDeleteSuccess: () => void;
  onEditClick: () => void;
  onViewClick?: () => void;
}

export function RetraitActions({ retrait, onDeleteSuccess, onEditClick, onViewClick }: RetraitActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { crediterSolde } = useSoldeAnimateur();

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Obtenir le token Firebase
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const token = await user.getIdToken();

      // Supprimer le retrait via API avec authentification
      const response = await fetch(`/api/retraits/${retrait.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Rembourser le montant au solde
        crediterSolde(retrait.montant);
        
        // Appeler la fonction de callback pour recharger les données
        onDeleteSuccess();
        
        setShowDeleteConfirm(false);
        console.log('✅ Retrait supprimé avec succès');
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du retrait:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = retrait.statut === 'en-attente' || retrait.statut === 'En attente';
  const canDelete = retrait.statut === 'en-attente' || retrait.statut === 'En attente';

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Supprimer le retrait</h3>
          <p className="text-gray-600 mb-2">
            Êtes-vous sûr de vouloir supprimer ce retrait de {formatMontant(retrait.montant)} FCFA ?
          </p>
          <p className="text-green-600 font-medium mb-6">
            Le montant sera automatiquement remboursé à votre solde.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {onViewClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewClick}
          className="text-gray-600 hover:text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        >
          <Eye className="w-4 h-4 mr-1" />
          Voir
        </Button>
      )}
      {canEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
          className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
        >
          <Edit className="w-4 h-4 mr-1" />
          Modifier
        </Button>
      )}
      {canDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Supprimer
        </Button>
      )}
    </div>
  );
}
