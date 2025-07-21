'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  FiMessageSquare, 
  FiInfo, 
  FiAlertTriangle, 
  FiHelpCircle, 
  FiZap,
  FiPaperclip,
  FiSend
} from 'react-icons/fi';

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

export default function ContactPage() {
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacter Laala</h1>
          <p className="text-gray-600 mt-1">
            Nous sommes là pour vous aider. Contactez notre équipe support.
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Type de demande
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedType === type.id
                      ? 'border-[#f01919] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{type.label}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
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
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919] focus:border-transparent resize-none"
            />
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichiers joints (optionnel)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <FiPaperclip className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Cliquez pour ajouter des fichiers ou glissez-déposez
                </span>
                <span className="text-xs text-gray-500">
                  JPG, PNG, PDF, DOC (max. 10MB par fichier)
                </span>
              </label>
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
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
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!selectedType || !subject || !message}
              className="bg-[#f01919] hover:bg-[#d01515] text-white"
            >
              <FiSend className="w-4 h-4 mr-2" />
              Envoyer le message
            </Button>
          </div>
        </form>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Questions fréquemment posées
        </h2>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-medium text-gray-900 mb-2">
              Comment puis-je retirer mes gains ?
            </h3>
            <p className="text-sm text-gray-600">
              Vous pouvez demander un retrait depuis la section "Mes Gains". 
              Les retraits sont traités sous 3-5 jours ouvrables.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-medium text-gray-900 mb-2">
              Comment créer un nouveau Laala ?
            </h3>
            <p className="text-sm text-gray-600">
              Rendez-vous dans la section "Mes Laalas" et cliquez sur "Créer un Laala". 
              Suivez les étapes pour configurer votre espace.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-medium text-gray-900 mb-2">
              Quels sont les délais de paiement ?
            </h3>
            <p className="text-sm text-gray-600">
              Les revenus sont calculés en temps réel et disponibles pour retrait 
              après une période de sécurité de 7 jours.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Autres moyens de contact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FiMessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Chat en direct</h3>
            <p className="text-sm text-gray-600">Disponible 9h-18h</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FiInfo className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Centre d'aide</h3>
            <p className="text-sm text-gray-600">Documentation complète</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FiHelpCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Support prioritaire</h3>
            <p className="text-sm text-gray-600">Pour les comptes Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
}