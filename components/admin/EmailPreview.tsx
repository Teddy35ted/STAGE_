'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FiMail, FiEye, FiSend, FiX } from 'react-icons/fi';

interface EmailPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: EmailData) => void;
  emailData: EmailData;
  onEmailDataChange: (data: EmailData) => void;
}

export interface EmailData {
  type: 'approve' | 'reject';
  to: string;
  subject: string;
  comment: string;
  temporaryPassword?: string;
  adminEmail: string;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  isOpen,
  onClose,
  onSend,
  emailData,
  onEmailDataChange,
}) => {
  const generateEmailHTML = () => {
    const { type, to, comment, temporaryPassword, adminEmail } = emailData;
    
    if (type === 'approve') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #f01919; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .credentials { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .password { font-family: monospace; font-size: 16px; font-weight: bold; color: #2d5016; }
            .footer { padding: 20px; text-align: center; color: #666; }
            .warning { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>La-a-La</h1>
              <h2>Demande de compte approuvée</h2>
            </div>
            
            <div class="content">
              <p>Bonjour,</p>
              
              <p>Votre demande de création de compte a été <strong>approuvée</strong> par un administrateur.</p>
              
              ${comment ? `
              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h4>Message de l'administrateur :</h4>
                <p style="font-style: italic;">"${comment}"</p>
              </div>
              ` : ''}
              
              <div class="credentials">
                <h3>Vos identifiants de connexion :</h3>
                <p><strong>Email :</strong> ${to}</p>
                <p><strong>Mot de passe temporaire :</strong> <span class="password">${temporaryPassword}</span></p>
              </div>
              
              <div class="warning">
                <p><strong>⚠️ Important :</strong></p>
                <ul>
                  <li>Ce mot de passe est temporaire et doit être changé lors de votre première connexion</li>
                  <li>Gardez ces informations confidentielles</li>
                  <li>Connectez-vous dès que possible pour sécuriser votre compte</li>
                </ul>
              </div>
              
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth" 
                   style="background-color: #f01919; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                  Se connecter maintenant
                </a>
              </p>
              
              <p>Bienvenue dans La-a-La !</p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé par ${adminEmail}</p>
              <p>Si vous n'avez pas demandé de compte, ignorez cet email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; }
            .rejection-reason { background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>La-a-La</h1>
              <h2>Demande de compte refusée</h2>
            </div>
            
            <div class="content">
              <p>Bonjour,</p>
              
              <p>Nous vous informons que votre demande de création de compte a été <strong>refusée</strong> par un administrateur.</p>
              
              ${comment ? `
              <div class="rejection-reason">
                <h4>Raison du refus :</h4>
                <p style="font-style: italic;">"${comment}"</p>
              </div>
              ` : ''}
              
              <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations, vous pouvez :</p>
              <ul>
                <li>Contacter l'administrateur à l'adresse : ${adminEmail}</li>
                <li>Soumettre une nouvelle demande avec des informations supplémentaires</li>
              </ul>
              
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/request-account" 
                   style="background-color: #f01919; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                  Faire une nouvelle demande
                </a>
              </p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé par ${adminEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FiMail className="w-5 h-5" />
            Prévisualisation de l'email - {emailData.type === 'approve' ? 'Approbation' : 'Rejet'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Données de l'email modifiables */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg">Informations de l'email</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Destinataire</label>
                <Input 
                  value={emailData.to} 
                  disabled 
                  className="bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Expéditeur</label>
                <Input 
                  value={emailData.adminEmail}
                  onChange={(e) => onEmailDataChange({...emailData, adminEmail: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Objet</label>
              <Input 
                value={emailData.subject}
                onChange={(e) => onEmailDataChange({...emailData, subject: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {emailData.type === 'approve' ? 'Commentaire (optionnel)' : 'Raison du rejet (requis)'}
              </label>
              <Textarea 
                value={emailData.comment}
                onChange={(e) => onEmailDataChange({...emailData, comment: e.target.value})}
                placeholder={emailData.type === 'approve' 
                  ? "Message personnel à ajouter à l'email..." 
                  : "Expliquez pourquoi cette demande est rejetée..."
                }
                rows={3}
              />
            </div>

            {emailData.type === 'approve' && (
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe temporaire</label>
                <Input 
                  value={emailData.temporaryPassword || ''}
                  onChange={(e) => onEmailDataChange({...emailData, temporaryPassword: e.target.value})}
                  placeholder="Sera généré automatiquement si vide"
                />
              </div>
            )}
          </div>

          {/* Prévisualisation HTML */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FiEye className="w-4 h-4" />
              <h3 className="font-medium text-lg">Aperçu de l'email</h3>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b text-sm font-medium">
                Aperçu HTML
              </div>
              <div 
                className="p-4 max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: generateEmailHTML() }}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Annuler
          </Button>
          
          <Button
            onClick={() => onSend(emailData)}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            disabled={emailData.type === 'reject' && !emailData.comment.trim()}
          >
            <FiSend className="w-4 h-4" />
            Envoyer l'email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
