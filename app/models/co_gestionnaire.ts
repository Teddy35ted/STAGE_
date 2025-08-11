// Types pour les permissions granulaires
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type PermissionResource = 'laalas' | 'contenus' | 'communications' | 'campaigns';

export interface ResourcePermission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export interface CoGestionnaire {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    telephone?: string; // Alternative pour téléphone
    pays: string;
    ville: string;
    ACCES: 'gerer' | 'consulter' | 'Ajouter';
    role: 'assistant'; // Toujours assistant selon les specs
    permissions: ResourcePermission[]; // Permissions granulaires par ressource
    description?: string;
    idProprietaire: string; // ID du propriétaire principal
    dateCreation: string;
    statut: 'actif' | 'inactif' | 'pending' | 'suspended';
    dateInvitation: string;
    
    // Nouvelles propriétés pour l'authentification
    password?: string; // Mot de passe hashé (optionnel si pas encore défini)
    isPasswordSet: boolean; // Indique si le mot de passe a été défini
    lastLogin?: string; // Dernière connexion
    loginToken?: string; // Token temporaire pour première connexion
    tokenExpiry?: string; // Expiration du token temporaire
}

// Interface pour la création d'un co-gestionnaire (sans les champs générés automatiquement)
export interface CoGestionnaireCore {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    telephone?: string; // Alternative pour téléphone
    pays: string;
    ville: string;
    ACCES: 'gerer' | 'consulter' | 'Ajouter';
    permissions: ResourcePermission[]; // Permissions granulaires par ressource
    description?: string;
    password: string; // Mot de passe requis pour la création
}

// Interface étendue pour l'affichage avec informations du propriétaire
export interface CoGestionnaireExtended extends CoGestionnaire {
    proprietaireNom?: string;
    proprietaireEmail?: string;
    canAccess?: {
        laalas: PermissionAction[];
        contenus: PermissionAction[];
        communications: PermissionAction[];
        campaigns: PermissionAction[];
    };
}