'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  FiMessageSquare, 
  FiInfo, 
  FiAlertTriangle, 
  FiHelpCircle, 
  FiZap,
  FiPaperclip,
  FiSend,
  FiX
} from 'react-icons/fi';

interface ContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const contactTypes = [
  {
    id: 'information',
    label: 'Information',
    icon: FiInfo,
    color: 'bg-blue-100 text-blue-800',
    description: 'Demande d\'information générale'
  },
  {
    id: 'reclamation',
    label: 'Réclamation',
    icon: FiAlertTriangle,
    color: 'bg-red-100 text-red-800',
    description: 'Signaler un problème ou une réclamation'
  },
  {
    id: 'demande',
    label: 'Demande d\'information',
    icon: FiHelpCircle,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Poser une question spécifique'
  },
  {
    id: 'suggestion',
    label: 'Suggestion',
    icon: FiZap,
    color: 'bg-green-100 text-green-800',
    description: 'Proposer une amélioration ou une idée'
  }
];

export const ContactPopup: React.FC<ContactPopupProps> = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, vous ajouteriez la logique pour envoyer le message
    console.log({
      type: selectedType,
      subject,
      message,
      attachments
    });
    
    // Reset form
    setSelectedType('');
    setSubject('');
    setMessage('');
    setAttachments([]);
    
    alert('Votre message a été envoyé avec succès !');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#f01919] rounded-lg flex items-center justify-center">
              <FiMessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Contacter Laala</h2>
              <p className="text-sm text-gray-600">Nous sommes là pour vous aider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de demande
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contactTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedType === type.id
                        ? 'border-[#f01919] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <type.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{type.label}</h3>
                        <p className="text-xs text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objet
              </label>
              <Input
                type="text"
                placeholder="Résumez votre demande en quelques mots"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                placeholder="Décrivez votre demande en détail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:border-transparent resize-none"
              />
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichiers joints (optionnel)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-popup"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
                <label
                  htmlFor="file-upload-popup"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <FiPaperclip className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Cliquez pour ajouter des fichiers
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG, PDF, DOC (max. 10MB)
                  </span>
                </label>
              </div>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <FiPaperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!selectedType || !subject || !message}
                className="bg-[#f01919] hover:bg-[#d01515] text-white"
              >
                <FiSend className="w-4 h-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Questions fréquentes
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">
                Comment retirer mes gains ?
              </h4>
              <p className="text-xs text-gray-600">
                Rendez-vous dans "Mes Gains" → "Demander Retrait"
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">
                Comment créer un Laala ?
              </h4>
              <p className="text-xs text-gray-600">
                Section "Mes Laalas" → "Créer un Laala"
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">
                Délais de paiement ?
              </h4>
              <p className="text-xs text-gray-600">
                3-5 jours ouvrables après demande de retrait
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};