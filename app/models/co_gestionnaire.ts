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
    role?: string;
    permissions?: string[];
    description?: string;
    idProprietaire?: string;
    dateCreation?: string;
    statut?: 'actif' | 'inactif' | 'pending';
    dateInvitation?: string;
}