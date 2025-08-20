'use client';

import React, { useState, useEffect } from 'react';
import { Retrait } from '../../app/models/retrait';
import { X, Wallet, Calendar, Smartphone, CreditCard, AlertCircle, CheckCircle, Clock, User } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

interface RetraitDetailsProps {
  retrait: Retrait | null;
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  nom?: string;
  prenom?: string;
  displayName?: string;
}

export function RetraitDetails({ retrait, isOpen, onClose }: RetraitDetailsProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && retrait && user) {
      // Utiliser directement les informations de l'utilisateur connecté
      const profile: UserProfile = {
        displayName: user.displayName || 'Utilisateur',
        nom: user.displayName?.split(' ').pop() || '',
        prenom: user.displayName?.split(' ')[0] || '',
      };
      
      console.log('👤 Profil utilisateur depuis contexte:', profile);
      setUserProfile(profile);
    }
  }, [isOpen, retrait, user]);

  if (!isOpen || !retrait) return null;

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date invalide';
    
    try {
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        date = new Date(dateString + 'T00:00:00.000Z');
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getStatutInfo = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200'
        };
      case 'Approuvé':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'Refusé':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  const statutInfo = getStatutInfo(retrait.statut);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Détails du Retrait</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>
                  {userProfile?.prenom && userProfile?.nom 
                    ? `${userProfile.prenom} ${userProfile.nom}`
                    : userProfile?.displayName 
                    ? userProfile.displayName
                    : user?.displayName 
                    ? user.displayName
                    : retrait.nom || 'Demandeur'
                  }
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Corps */}
        <div className="px-6 py-6 space-y-6">
          {/* Montant et Statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Montant demandé</p>
              <p className="text-3xl font-bold text-gray-900">{formatMontant(retrait.montant)} FCFA</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Statut</p>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${statutInfo.color} ${statutInfo.bg} ${statutInfo.border}`}>
                {statutInfo.icon}
                {retrait.statut}
              </span>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Numéro de téléphone</p>
                  <p className="text-lg font-medium text-gray-900">{retrait.tel}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Opérateur de paiement</p>
                  <p className="text-lg font-medium text-gray-900">{retrait.operateur}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Date de demande</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(retrait.dateCreation || retrait.date || new Date().toISOString())}
                  </p>
                </div>
              </div>

              {retrait.operation && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Description</p>
                    <p className="text-sm text-gray-700">{retrait.operation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations techniques (si disponibles) */}
          {(retrait.nom || retrait.heure || retrait.ismobilem !== undefined) && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations techniques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {retrait.nom && (
                  <div>
                    <span className="text-gray-500">Nom:</span>
                    <span className="ml-2 text-gray-900">{retrait.nom}</span>
                  </div>
                )}
                {retrait.heure && (
                  <div>
                    <span className="text-gray-500">Heure:</span>
                    <span className="ml-2 text-gray-900">{retrait.heure}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Mobile Money:</span>
                  <span className="ml-2 text-gray-900">{retrait.ismobilem ? 'Oui' : 'Non'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
