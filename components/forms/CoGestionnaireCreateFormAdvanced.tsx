import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Lock, Shield, CheckCircle } from 'lucide-react';
import { ResourcePermission, PermissionAction, PermissionResource, CoGestionnaireCore } from '../../app/models/co_gestionnaire';

interface CoGestionnaireCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CoGestionnaireFormData) => Promise<void>;
  loading?: boolean;
}

export interface CoGestionnaireFormData extends Omit<CoGestionnaireCore, 'telephone'> {
  // Le formulaire utilise 'tel' au lieu de 'telephone'
}

const RESOURCES: { key: PermissionResource; label: string; description: string }[] = [
  { key: 'laalas', label: 'Laalas', description: 'Gestion des événements et activités' },
  { key: 'contenus', label: 'Contenus', description: 'Gestion des contenus multimédias' },
  { key: 'communications', label: 'Communications', description: 'Gestion des messages et notifications' },
  { key: 'campaigns', label: 'Campagnes', description: 'Gestion des campagnes marketing' }
];

const ACTIONS: { key: PermissionAction; label: string; color: string }[] = [
  { key: 'create', label: 'Créer', color: 'bg-green-100 text-green-800' },
  { key: 'read', label: 'Consulter', color: 'bg-blue-100 text-blue-800' },
  { key: 'update', label: 'Modifier', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'delete', label: 'Supprimer', color: 'bg-red-100 text-red-800' }
];

export default function CoGestionnaireCreateForm({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}: CoGestionnaireCreateFormProps) {
  const [formData, setFormData] = useState<CoGestionnaireFormData>({
    nom: '',
    prenom: '',
    email: '',
    tel: '',
    pays: 'Togo',
    ville: 'Lomé',
    ACCES: 'gerer',
    description: '',
    password: '',
    permissions: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.tel.trim()) newErrors.tel = 'Le téléphone est requis';
    if (!formData.password.trim()) newErrors.password = 'Le mot de passe est requis';
    if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Au moins une permission doit être accordée
    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Au moins une permission doit être accordée';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePermissionChange = (resource: PermissionResource, action: PermissionAction, checked: boolean) => {
    setFormData(prev => {
      const newPermissions = [...prev.permissions];
      let resourcePermission = newPermissions.find(p => p.resource === resource);

      if (!resourcePermission) {
        resourcePermission = { resource, actions: [] };
        newPermissions.push(resourcePermission);
      }

      if (checked) {
        if (!resourcePermission.actions.includes(action)) {
          resourcePermission.actions.push(action);
        }
      } else {
        resourcePermission.actions = resourcePermission.actions.filter((a: PermissionAction) => a !== action);
      }

      // Supprimer les ressources sans permissions
      return {
        ...prev,
        permissions: newPermissions.filter(p => p.actions.length > 0)
      };
    });
  };

  const isPermissionGranted = (resource: PermissionResource, action: PermissionAction): boolean => {
    const resourcePermission = formData.permissions.find(p => p.resource === resource);
    return resourcePermission?.actions.includes(action) || false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        tel: '',
        pays: 'Togo',
        ville: 'Lomé',
        ACCES: 'gerer',
        description: '',
        password: '',
        permissions: []
      });
      setErrors({});
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Nouveau Co-gestionnaire</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nom de famille"
                />
                {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.prenom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Prénom"
                />
                {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@exemple.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.tel}
                  onChange={(e) => setFormData(prev => ({ ...prev, tel: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tel ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+228 XX XX XX XX"
                />
                {errors.tel && <p className="text-red-500 text-sm mt-1">{errors.tel}</p>}
              </div>
            </div>

            {/* Localisation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.pays}
                  onChange={(e) => setFormData(prev => ({ ...prev, pays: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.ville}
                  onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Niveau d'accès */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Niveau d'accès *
              </label>
              <select
                value={formData.ACCES}
                onChange={(e) => setFormData(prev => ({ ...prev, ACCES: e.target.value as 'gerer' | 'consulter' | 'Ajouter' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gerer">Gérer - Accès complet selon permissions</option>
                <option value="consulter">Consulter - Lecture seule</option>
                <option value="Ajouter">Ajouter - Création uniquement</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Ce niveau détermine l'étendue des permissions accordées
              </p>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mot de passe (min. 6 caractères)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du rôle
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Décrivez les responsabilités de ce co-gestionnaire..."
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                <Shield className="w-4 h-4 inline mr-2" />
                Permissions d'accès *
              </label>
              
              <div className="space-y-6">
                {RESOURCES.map(resource => (
                  <div key={resource.key} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{resource.label}</h4>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {ACTIONS.map(action => (
                        <label
                          key={action.key}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                            isPermissionGranted(resource.key, action.key)
                              ? action.color
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isPermissionGranted(resource.key, action.key)}
                            onChange={(e) => handlePermissionChange(resource.key, action.key, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{action.label}</span>
                          {isPermissionGranted(resource.key, action.key) && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {errors.permissions && <p className="text-red-500 text-sm mt-2">{errors.permissions}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? 'Création...' : 'Créer le co-gestionnaire'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
