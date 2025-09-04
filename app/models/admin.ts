// ===== MODÈLE ADMINISTRATEUR =====
// Gestion des administrateurs du système

export interface AdminUser {
  id: string; // ID auto-généré
  email: string; // Email de l'admin
  nom: string; // Nom de l'admin
  prenom: string; // Prénom de l'admin
  password: string; // Mot de passe hashé
  role: 'super-admin' | 'admin'; // Niveau d'administration
  permissions: AdminPermission[]; // Permissions spécifiques
  isActive: boolean; // Compte actif
  createdDate: string; // Date de création
  lastLoginDate?: string; // Dernière connexion
  createdBy?: string; // ID de l'admin créateur
}

export interface AdminUserCore {
  email: string;
  nom: string;
  prenom: string;
  password: string;
  role: 'super-admin' | 'admin';
  permissions: AdminPermission[];
}

export type AdminPermission = 
  | 'manage-accounts' // Gérer les demandes de comptes
  | 'manage-users' // Gérer les utilisateurs
  | 'manage-admins' // Gérer les administrateurs
  | 'view-analytics' // Voir les analyses
  | 'manage-content' // Gérer le contenu
  | 'manage-payments'; // Gérer les paiements

// Fonction pour générer les champs automatiques
export function generateAdminAutoFields(core: AdminUserCore): Omit<AdminUser, 'id'> {
  return {
    ...core,
    isActive: true,
    createdDate: new Date().toISOString()
  };
}
