'use client';

import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CampaignCore, MAX_COMMUNICATIONS } from '@/app/models/campaign';
import { ContenuDashboard } from '@/app/models/contenu';

interface CampaignCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaignData: Partial<CampaignCore>) => Promise<void>;
  availableCommunications: ContenuDashboard[];
}

interface CampaignFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  targetAudience: string;
  communicationIds: string[];
}

const CampaignCreateForm: React.FC<CampaignCreateFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableCommunications
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetAudience: '',
    communicationIds: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Le nom de la campagne est requis');
      return;
    }

    if (!formData.startDate) {
      alert('La date de début est requise');
      return;
    }

    setLoading(true);
    
    try {
      const campaignData: Partial<CampaignCore> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: 'draft',
        startDate: formData.startDate,
        endDate: formData.endDate || '',
        communications: formData.communicationIds.map(id => {
          const comm = availableCommunications.find(c => c.id === id);
          return comm ? {
            messageId: comm.id,
            title: comm.nom,
            content: comm.nom, // Utilisation du nom comme contenu temporaire
            type: comm.type as 'text' | 'image' | 'file',
            status: 'pending' as const,
            recipients: [] // Sera rempli plus tard
          } : null;
        }).filter(Boolean) as any[],
        stats: {
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0
        }
      };

      await onSubmit(campaignData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        targetAudience: '',
        communicationIds: []
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de la campagne');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Nouvelle Campagne</h2>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <FiX className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la campagne *
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Campagne Printemps 2024"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez l'objectif de cette campagne..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
              Audience cible
            </label>
            <Input
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              placeholder="Ex: Fans actifs, Nouvelle audience..."
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="communications" className="block text-sm font-medium text-gray-700 mb-1">
              Communications à inclure (max {MAX_COMMUNICATIONS})
            </label>
            <div className="border border-gray-300 rounded-md max-h-32 overflow-y-auto">
              {availableCommunications.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  Aucune communication disponible
                </div>
              ) : (
                availableCommunications.map((comm) => (
                  <div key={comm.id} className="flex items-center p-3 border-b border-gray-100 last:border-b-0">
                    <input
                      type="checkbox"
                      id={`comm-${comm.id}`}
                      checked={formData.communicationIds.includes(comm.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (formData.communicationIds.length < MAX_COMMUNICATIONS) {
                            setFormData(prev => ({
                              ...prev,
                              communicationIds: [...prev.communicationIds, comm.id]
                            }));
                          }
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            communicationIds: prev.communicationIds.filter(id => id !== comm.id)
                          }));
                        }
                      }}
                      disabled={
                        !formData.communicationIds.includes(comm.id) && 
                        formData.communicationIds.length >= MAX_COMMUNICATIONS
                      }
                      className="mr-3 h-4 w-4 text-[#f01919] focus:ring-[#f01919] border-gray-300 rounded"
                    />
                    <label htmlFor={`comm-${comm.id}`} className="flex-1 text-sm text-gray-700">
                      {comm.nom}
                    </label>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.communicationIds.length} / {MAX_COMMUNICATIONS} communications sélectionnées
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4 flex justify-end space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Créer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignCreateForm;
