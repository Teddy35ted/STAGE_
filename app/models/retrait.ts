// Exemple de retrait

export interface Retrait {
  id: string;
  tel: string;
  operation: string;
  rib: string;
  nom: string;
  islivreur: boolean;
  date: string;
  idcompte: string;
  istraite: boolean;
  heure: string;
  montant: number;
  iskouri: boolean;
  isbusiness: boolean;
  isservice: boolean;
  ismobilem: boolean;
  issubmit: boolean;
}

// Exemple d'objet Retrait
export const exempleRetrait: Retrait = {
  id: "1022025Retrait13193324",
  tel: "99253321",
  operation: "Vous avez rétiré 100000.0 couri",
  rib: "",
  nom: "Easy",
  islivreur: false,
  date: "2025-02-10",
  idcompte: "99253321TG",
  istraite: true,
  heure: "13:19",
  montant: 100000,
  iskouri: true,
  isbusiness: false,
  isservice: false,
  ismobilem: true,
  issubmit: true
};