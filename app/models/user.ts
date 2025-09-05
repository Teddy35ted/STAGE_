// ===== MODÈLE USER - PRIORITÉ 1 (Utilisateurs) =====
// Informations de base des utilisateurs pour le dashboard

export interface UserCore {
  // === CHAMPS ESSENTIELS (à saisir) ===
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  password: string;
  date_de_naissance: string;
  sexe: 'Masculin' | 'Féminin' | 'Autre';
  pays: string;
  ville: string;
  quartier?: string;
  region?: string;
  codePays: string;
}

export interface UserDashboard extends UserCore {
  // === CHAMPS GÉNÉRÉS AUTOMATIQUEMENT ===
  id: string; // Généré automatiquement
  nom_l: string; // Généré à partir du nom (toLowerCase)
  registerDate: string; // Date actuelle
  age: number; // Calculé à partir de date_de_naissance
  avatar: string; // URL par défaut
  signature: string; // URL par défaut
  
  // === MÉTRIQUES DASHBOARD (priorité affichage) ===
  balance: number; // Solde principal
  balanceAnim: number; // Solde animation
  balanceShop: number; // Solde boutique
  balanceServ: number; // Solde services
  kouri: number; // Points Kouri
  bonuscouri: number; // Bonus Kouri
  
  // === STATISTIQUES SOCIALES ===
  fan: string[]; // Liste des fans
  friend: string[]; // Liste des amis
  jfan: string[]; // J'aime en tant que fan
  jfriend: string[]; // J'aime en tant qu'ami
  
  // === STATUT ET CERTIFICATIONS ===
  iscert: boolean; // Certifié
  isconnect: boolean; // En ligne
  alaune: boolean; // À la une
  ispaidanim: boolean; // Animation payante
  ispaidbus: boolean; // Business payant
  
  // === DATES ET TEMPS (générés) ===
  annee: number;
  mois: number;
  jour: number;
  a_date: string;
  a_annee: number;
  a_mois: number;
  a_jour: number;
  b_annee: number;
  b_mois: number;
  b_jour: number;
  d_date: string;
  
  // === PARAMÈTRES ET PRÉFÉRENCES ===
  bio: string;
  isprive: boolean;
  isminiprofil: boolean;
  showjfan: boolean;
  showjfriend: boolean;
  showfavoris: boolean;
  
  // === NOTIFICATIONS ===
  allownotiaddpubli: boolean;
  allownotilikepubli: boolean;
  allownoticommentpubli: boolean;
  allownotiaddlaala: boolean;
  allownotiaddpresta: boolean;
  allownotiaddarticle: boolean;
  
  // === DONNÉES COMPLÉMENTAIRES ===
  groupes: string[];
  profils: string[];
  domaines: string[];
  centreinnteret: string[];
  services: string[];
  favoris: string[];
  vitrines: string[];
  consultes: string[];
  d_sujets: string[];
  
  // === STATUT SYSTÈME ===
  isdelete: boolean;
  isdesactive: boolean;
  issignaler: boolean;
  ischangepass: boolean;
  confirmphone: boolean;
  allowretrait: boolean;
  promo_recu: boolean;
  
  // === GESTION AUTHENTIFICATION ET PROFIL ===
  requiresPasswordChange?: boolean; // Mot de passe temporaire à changer
  firstLogin?: boolean; // Premier login avec mot de passe temporaire
  profileCompleted?: boolean; // Profil complété par l'utilisateur
  profileCompletedAt?: string; // Date de complétion du profil
  passwordChangedAt?: string; // Date du dernier changement de mot de passe
  
  // === DURÉES ET FRAIS ===
  duree_bus: number;
  duree_anim: number;
  fraisAb: number;
  
  // === PARRAINAGE ===
  parrainID: string;
}

// Fonction pour générer les données automatiques
export function generateUserAutoFields(userCore: UserCore): Omit<UserDashboard, keyof UserCore> {
  const now = new Date();
  const birthDate = new Date(userCore.date_de_naissance);
  const age = now.getFullYear() - birthDate.getFullYear();
  
  return {
    id: generateUserId(userCore.tel, userCore.pays),
    nom_l: userCore.nom.toLowerCase(),
    registerDate: now.toISOString().split('T')[0],
    age,
    avatar: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/assets%2Fprofil.png?alt=media&token=e286f353-80f6-464b-8595-ee67f1ee43ec",
    signature: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/assets%2Fprofil.png?alt=media&token=e286f353-80f6-464b-8595-ee67f1ee43ec",
    
    // Métriques initialisées à zéro
    balance: 0,
    balanceAnim: 0,
    balanceShop: 0,
    balanceServ: 0,
    kouri: 0,
    bonuscouri: 0,
    
    // Listes vides
    fan: [],
    friend: [],
    jfan: [],
    jfriend: [],
    groupes: [],
    profils: [],
    domaines: [],
    centreinnteret: [],
    services: [],
    favoris: [],
    vitrines: [],
    consultes: [],
    d_sujets: [],
    
    // Statut par défaut
    iscert: false,
    isconnect: false,
    alaune: false,
    ispaidanim: false,
    ispaidbus: false,
    
    // Dates
    annee: now.getFullYear(),
    mois: now.getMonth() + 1,
    jour: now.getDate(),
    a_date: "",
    a_annee: 0,
    a_mois: 0,
    a_jour: 0,
    b_annee: 0,
    b_mois: 0,
    b_jour: 0,
    d_date: "",
    
    // Paramètres par défaut
    bio: "Pas de bio pour le moment",
    isprive: false,
    isminiprofil: false,
    showjfan: true,
    showjfriend: true,
    showfavoris: false,
    
    // Notifications activées par défaut
    allownotiaddpubli: true,
    allownotilikepubli: true,
    allownoticommentpubli: true,
    allownotiaddlaala: true,
    allownotiaddpresta: true,
    allownotiaddarticle: true,
    
    // Statut système
    isdelete: false,
    isdesactive: false,
    issignaler: false,
    ischangepass: false,
    confirmphone: false,
    allowretrait: false,
    promo_recu: false,
    
    // Durées et frais
    duree_bus: 0,
    duree_anim: 0,
    fraisAb: 0,
    
    // Parrainage
    parrainID: ""
  };
}

// Fonction utilitaire pour générer l'ID utilisateur
function generateUserId(tel: string, pays: string): string {
  const countryCode = getCountryCode(pays);
  return `${tel}${countryCode}`;
}

function getCountryCode(pays: string): string {
  const countryCodes: { [key: string]: string } = {
    'Togo': 'TG',
    'France': 'FR',
    'Bénin': 'BJ',
    'Côte d\'Ivoire': 'CI',
    'Ghana': 'GH',
    'Nigeria': 'NG'
  };
  return countryCodes[pays] || 'XX';
}

// Interface pour l'affichage dashboard (champs les plus importants)
export interface UserDashboardDisplay {
  id: string;
  nom: string;
  prenom: string;
  avatar: string;
  iscert: boolean;
  isconnect: boolean;
  alaune: boolean;
  balance: number;
  kouri: number;
  fanCount: number; // fan.length
  friendCount: number; // friend.length
  registerDate: string;
  ville: string;
  pays: string;
}

// Exemple d'utilisation
export const userExample: UserDashboard = {
  // Données essentielles
  nom: "APELETE",
  prenom: "Josias",
  email: "",
  tel: "98455866",
  password: "CMMPCW",
  date_de_naissance: "2000-10-06 00:00:00.000",
  sexe: "Masculin",
  pays: "Togo",
  ville: "LOME",
  quartier: "Adakpame",
  region: "Maritime",
  codePays: "+228",
  
  // Données générées automatiquement
  id: "98455866TG",
  nom_l: "apelete",
  registerDate: "2024-12-09",
  age: 24,
  avatar: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/assets%2Fprofil.png?alt=media&token=e286f353-80f6-464b-8595-ee67f1ee43ec",
  signature: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/ProfilSignature%2F2024-12-09%2010%3A24%3A41.562335IMG?alt=media&token=9c3baaee-1130-4154-9255-fb9f609b84ed",
  
  // Métriques
  balance: 0,
  balanceAnim: 0,
  balanceShop: 0,
  balanceServ: 0,
  kouri: 20300,
  bonuscouri: 95902,
  
  // Statistiques sociales
  fan: ["98750848TG", "96129814TG", "70671155TG", "99707291TG", "92493943TG"],
  friend: ["98750848TG", "96129814TG", "97273825TG", "99707291TG", "92493943TG", "99255038TG", "99632083TG", "98734798TG", "98718832TG"],
  jfan: ["98750848TG", "91617029TG", "97965037TG", "91614411TG"],
  jfriend: ["98750848TG", "97965037TG"],
  
  // Statut
  iscert: false,
  isconnect: false,
  alaune: true,
  ispaidanim: false,
  ispaidbus: false,
  
  // Dates
  annee: 2024,
  mois: 12,
  jour: 9,
  a_date: "",
  a_annee: 0,
  a_mois: 0,
  a_jour: 0,
  b_annee: 0,
  b_mois: 0,
  b_jour: 0,
  d_date: "",
  
  // Paramètres
  bio: "Pas de bio pour le moment",
  isprive: false,
  isminiprofil: false,
  showjfan: true,
  showjfriend: true,
  showfavoris: false,
  
  // Notifications
  allownotiaddpubli: true,
  allownotilikepubli: true,
  allownoticommentpubli: true,
  allownotiaddlaala: true,
  allownotiaddpresta: true,
  allownotiaddarticle: true,
  
  // Données complémentaires
  groupes: [],
  profils: [],
  domaines: [],
  centreinnteret: [],
  services: [],
  favoris: [],
  vitrines: [],
  consultes: [],
  d_sujets: [],
  
  // Statut système
  isdelete: false,
  isdesactive: false,
  issignaler: false,
  ischangepass: false,
  confirmphone: true,
  allowretrait: false,
  promo_recu: true,
  
  // Durées et frais
  duree_bus: 0,
  duree_anim: 0,
  fraisAb: 0,
  
  // Parrainage
  parrainID: ""
};