// Modèle de retrait pour l'application

export interface Retrait {
  id: string;
  montant: number;
  tel: string;
  operateur: string; // 'Flooz' | 'Mix by Yas'
  statut: string; // 'En attente' | 'Approuvé' | 'Refusé'
  dateCreation: string;
  // Anciens champs pour compatibilité
  operation?: string;
  nom?: string;
  islivreur?: boolean;
  date?: string;
  idcompte?: string;
  istraite?: boolean;
  heure?: string;
  iskouri?: boolean;
  isbusiness?: boolean;
  isservice?: boolean;
  ismobilem?: boolean;
  issubmit?: boolean;
}

// Exemple d'objet Retrait
export const exempleRetrait: Retrait = {
  id: "1022025Retrait13193324",
  montant: 100000,
  tel: "99253321",
  operateur: "Flooz",
  statut: "En attente",
  dateCreation: "2025-02-10T13:19:33.000Z",
  // Anciens champs pour compatibilité
  operation: "Vous avez retiré 100000.0 couri",
  nom: "Easy",
  islivreur: false,
  date: "2025-02-10",
  idcompte: "user123",
  istraite: true,
  heure: "13:19",
  iskouri: true,
  isbusiness: false,
  isservice: false,
  ismobilem: true,
  issubmit: true,
};
