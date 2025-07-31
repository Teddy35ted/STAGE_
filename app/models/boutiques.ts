export interface Horaire {
  end: number;
  jour: string;
  start: number;
}

export interface Boutique {
  id: string;
  a_mois: number;
  annee: number;
  desc: string;
  iscert: boolean;
  nbrConsultes: number;
  long: number;
  jour: number;
  likes: number;
  a_jour: number;
  horaires: Horaire[];
  lePersonnel: any[];
  isPromoted: boolean;
  adresse: string;
  nom: string;
  isboosted: boolean;
  mois: number;
  nbrArticle: number;
  lesClients: any[];
  a_date: string;
  etoile: number;
  idCompte: string;
  gererSAV: boolean;
  a_annee: number;
  balance: number;
  date: string;
  lesCategories: any[];
  isdesactive: boolean;
  nom_l: string;
  alaune: any[];
  isLoyerPaid: boolean;
  idpartner: string;
  likees: any[];
  duree: number;
  proprietaire: string;
  lat: number;
  top: boolean;
  cover: string;
  isvideo: boolean;
  lesConsultes: string[];
  isdelete: boolean;
  lesServices: any[];
  lesArticles: any[];
  type: string;
}

export const boutiqueData: Boutique = {
  id: "9122024Boutique85123176",
  a_mois: 12,
  annee: 2024,
  desc: "la qualité a un bon prix",
  iscert: false,
  nbrConsultes: 7,
  long: 1.1789492,
  jour: 9,
  likes: 0,
  a_jour: 9,
  horaires: [
    {
      end: 0,
      jour: "Lundi",
      start: 0
    },
    {
      jour: "Mardi",
      end: 0,
      start: 0
    },
    {
      start: 0,
      jour: "Mercredi",
      end: 0
    },
    {
      jour: "Jeudi",
      end: 0,
      start: 0
    },
    {
      end: 0,
      start: 0,
      jour: "Vendredi"
    },
    {
      start: 0,
      end: 0,
      jour: "Samedi"
    },
    {
      jour: "Dimamche",
      start: 0,
      end: 0
    }
  ],
  lePersonnel: [],
  isPromoted: false,
  adresse: "",
  nom: "jojo's shop",
  isboosted: false,
  mois: 12,
  nbrArticle: 0,
  lesClients: [],
  a_date: "9-12-2024",
  etoile: 0,
  idCompte: "90559120TG",
  gererSAV: true,
  a_annee: 2024,
  balance: 0,
  date: "9-12-2024",
  lesCategories: [],
  isdesactive: false,
  nom_l: "jojo's shop",
  alaune: [],
  isLoyerPaid: true,
  idpartner: "laalapasca",
  likees: [],
  duree: 30,
  proprietaire: "benedicta",
  lat: 6.2631895,
  top: false,
  cover: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/coverLaaLaBoutique%2F2024-12-09%2008%3A51%3A05.154167JPEG_20241209_085104_1116528274352552015.jpg?alt=media&token=a94db29f-e197-4970-beaa-8e86f90f2fa8",
  isvideo: false,
  lesConsultes: [
    "90559120TG",
    "92493943TG",
    "90000000TG",
    "98840319TG",
    "98929230TG",
    "91166979TG",
    "93343380TG"
  ],
  isdelete: false,
  lesServices: [],
  lesArticles: [],
  type: "Boutique"
};