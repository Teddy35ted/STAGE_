// Modèle de retrait pour l'application

export interface Retrait {
  id: string;
  montant: number;
  tel: string;
  operateur: string; // 'Flooz' | 'Mix by Yas'
  statut: 'En attente' | 'Approuvé' | 'Refusé' | 'En cours de traitement';
  dateCreation: string;
  dateTraitement?: string; // Date à laquelle le retrait sera traité automatiquement
  dateApprobation?: string; // Date à laquelle le retrait a été approuvé
  montantDebite?: boolean; // Indique si le montant a déjà été débité du solde
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
  dateTraitement: "2025-02-10T13:24:33.000Z", // 5 minutes après création
  montantDebite: false, // Pas encore débité
  // Anciens champs pour compatibilité
  operation: "Demande de retrait de 100000.0 FCFA",
  nom: "Easy",
  islivreur: false,
  date: "2025-02-10",
  idcompte: "user123",
  istraite: false,
  heure: "13:19",
  iskouri: true,
  isbusiness: false,
  isservice: false,
  ismobilem: true,
  issubmit: true,
};
