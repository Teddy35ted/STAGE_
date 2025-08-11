'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import CoGestionnaireCreateFormAdvanced, { CoGestionnaireFormData } from '../../../components/forms/CoGestionnaireCreateFormAdvanced';
import { ResourcePermission } from '../../../app/models/co_gestionnaire';

export default function TestCoGestionnaireForm() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (formData: CoGestionnaireFormData) => {
    try {
      setLoading(true);
      setMessage(null);

      console.log('📝 Données co-gestionnaire à créer:', formData);

      // Préparer les données pour l'API - le formulaire inclut déjà tous les champs nécessaires
      const coGestionnaireData = {
        ...formData,
        telephone: formData.tel, // Ajouter l'alias telephone
      };

      // Obtenir le token d'authentification
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Token d\'authentification non disponible');
      }

      // Appel API
      const response = await fetch('/api/co-gestionnaires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(coGestionnaireData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Erreur de création');
      }

      console.log('✅ Co-gestionnaire créé:', data);
      setMessage('Co-gestionnaire créé avec succès ! Il peut maintenant se connecter avec ses identifiants.');
      setShowForm(false);

    } catch (error) {
      console.error('❌ Erreur création co-gestionnaire:', error);
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Co-gestionnaire</h1>
          <p className="text-gray-600 mb-6">
            Cette page permet de tester la création de co-gestionnaires avec permissions granulaires.
          </p>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('Erreur') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer un Co-gestionnaire
          </button>
        </div>

        {/* Informations sur les permissions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Architecture Co-gestionnaire</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🔐 Authentification</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Token JWT personnalisé avec claims</li>
                <li>• Mot de passe hashé avec bcrypt</li>
                <li>• Validation par email unique</li>
                <li>• Statut actif/inactif</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">🛡️ Permissions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• CRUD granulaire par ressource</li>
                <li>• Laalas, Contenus, Communications, Campagnes</li>
                <li>• Accès interdit au profil et gains</li>
                <li>• Logs d'audit automatiques</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">🎯 Ressources autorisées</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Laalas (événements)</li>
                <li>• Contenus (médias)</li>
                <li>• Communications (messages)</li>
                <li>• Campagnes (marketing)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">🚫 Accès interdits</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Profil utilisateur</li>
                <li>• Mes gains</li>
                <li>• Statistiques</li>
                <li>• Paramètres administratifs</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🔄 Processus de connexion</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Co-gestionnaire se connecte sur <code>/auth/co-gestionnaire</code></li>
              <li>2. Validation email + mot de passe</li>
              <li>3. Génération token JWT avec claims de permissions</li>
              <li>4. Accès au dashboard avec restrictions</li>
              <li>5. Toutes les actions sont auditées</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Modal de création */}
      <CoGestionnaireCreateFormAdvanced
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
