// ===== MODÈLE DEMANDE DE COMPTE =====
// Gestion des demandes de création de compte en attente de validation

export interface AccountRequest {
  id: string; // ID auto-généré
  email: string; // Email du demandeur
  status: 'pending' | 'approved' | 'rejected'; // Statut de la demande
  requestDate: string; // Date de la demande
  adminId?: string; // ID de l'admin qui traite la demande
  adminComment?: string; // Commentaire de l'admin
  processedDate?: string; // Date de traitement
  temporaryPassword?: string; // Mot de passe temporaire généré
  isFirstLogin: boolean; // Première connexion avec mot de passe temporaire
}

export interface AccountRequestCore {
  email: string;
}

// Fonction pour générer les champs automatiques
export function generateAccountRequestAutoFields(core: AccountRequestCore): Omit<AccountRequest, 'id'> {
  return {
    ...core,
    status: 'pending',
    requestDate: new Date().toISOString(),
    isFirstLogin: true
  };
}
