// ===== MODÈLE LAALA - PRIORITÉ 2 (Contenus/Projets) =====
// Projets et contenus créés par les utilisateurs

export interface LaalaCore {
  // === CHAMPS ESSENTIELS (à saisir) ===
  nom: string;
  description: string;
  type: 'Laala freestyle' | 'Laala planifié' | 'Laala groupe' | 'Laala personnel';
  categorie: string;
  idCreateur: string;
  isLaalaPublic: boolean;
  ismonetise: boolean;
  
  // === PARAMÈTRES DE CONTENU ===
  choosetext: boolean;
  chooseimg: boolean;
  choosevideo: boolean;
  chooselive: boolean;
  
  // === MÉDIAS OPTIONNELS ===
  cover?: string; // URL de l'image de couverture personnalisée
  
  // === DATES (optionnelles pour planification) ===
  date_fin?: string;
  jour_fin?: number;
  mois_fin?: number;
  annee_fin?: number;
}

export interface LaalaDashboard extends LaalaCore {
  // === CHAMPS GÉNÉRÉS AUTOMATIQUEMENT ===
  id: string; // Généré automatiquement
  nom_l: string; // Généré à partir du nom (toLowerCase)
  date: string; // Date de création
  jour: number;
  mois: number;
  annee: number;
  
  // === MÉTRIQUES DASHBOARD (priorité affichage) ===
  likes: number;
  vues: number;
  republication: number;
  nbrEmoji: number;
  soldeEmoji: number;
  
  // === INFORMATIONS CRÉATEUR (récupérées automatiquement) ===
  nomCrea: string;
  avatarCrea: string;
  iscert: boolean; // Statut certification du créateur
  
  // === STATUT ET ÉTAT ===
  encours: boolean;
  alaune: boolean;
  isSignaler: boolean;
  
  // === MÉDIAS (URLs générées) ===
  cover: string;
  miniature: string;
  video480: string;
  
  // === PARAMÈTRES AVANCÉS ===
  isLaalaPerso: boolean;
  isLaalaGroupe: boolean;
  islaalaplani: boolean;
  iscoverVideo: boolean;
  
  // === DONNÉES RELATIONNELLES ===
  contenues: string[]; // IDs des contenus
  commentaires: any[];
  tablikes: string[]; // IDs des utilisateurs qui ont liké
  emojis: any[];
  
  // === MÉTADONNÉES ===
  sujets: string[];
  domaines: string[];
  d_sujets: string[];
  htags: string[];
  
  // === FONCTIONNALITÉS AVANCÉES ===
  idparticipants: string[];
  idForum: string;
  idSondage: string;
  idCagnote: string;
  prevLaala: string[];
  suiteLaala: string[];
  
  // === PLANIFICATION ===
  horaires: any[];
  sortie: string;
  sortie_jour: any[];
  
  // === CONTENU MULTIMÉDIA ===
  textes: any[];
  lives: any[];
  
  // === GESTION ===
  sousCompte: string[];
}

// Fonction pour générer les données automatiques
export function generateLaalaAutoFields(
  laalaCore: LaalaCore, 
  creatorInfo: { nom: string; avatar: string; iscert: boolean }
): Omit<LaalaDashboard, keyof LaalaCore> {
  const now = new Date();
  const laalaId = generateLaalaId();
  
  return {
    id: laalaId,
    nom_l: laalaCore.nom.toLowerCase(),
    date: now.toISOString().split('T')[0],
    jour: now.getDate(),
    mois: now.getMonth() + 1,
    annee: now.getFullYear(),
    
    // Métriques initialisées à zéro
    likes: 0,
    vues: 0,
    republication: 0,
    nbrEmoji: 0,
    soldeEmoji: 0,
    
    // Informations créateur
    nomCrea: creatorInfo.nom,
    avatarCrea: creatorInfo.avatar,
    iscert: creatorInfo.iscert,
    
    // Statut par défaut
    encours: true,
    alaune: false,
    isSignaler: false,
    
    // Médias par défaut (cover sera fourni par laalaCore maintenant)
    miniature: generateDefaultMiniature(),
    video480: "",
    
    // Paramètres
    isLaalaPerso: laalaCore.type === 'Laala personnel',
    isLaalaGroupe: laalaCore.type === 'Laala groupe',
    islaalaplani: laalaCore.type === 'Laala planifié',
    iscoverVideo: false,
    
    // Listes vides
    contenues: [],
    commentaires: [],
    tablikes: [],
    emojis: [],
    sujets: [],
    domaines: [],
    d_sujets: [],
    htags: [],
    idparticipants: [],
    prevLaala: [],
    suiteLaala: [],
    horaires: [],
    sortie_jour: [],
    textes: [],
    lives: [],
    sousCompte: [],
    
    // IDs vides
    idForum: "",
    idSondage: "",
    idCagnote: "",
    sortie: ""
  };
}

// Fonctions utilitaires
function generateLaalaId(): string {
  const now = new Date();
  const timestamp = now.getTime();
  const random = Math.floor(Math.random() * 1000000);
  return `${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}Laala${random}${timestamp.toString().slice(-6)}`;
}

export function generateDefaultCover(): string {
  return "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/assets%2Fdefault-cover.png?alt=media";
}

function generateDefaultMiniature(): string {
  return "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/assets%2Fdefault-miniature.png?alt=media";
}

// Interface pour l'affichage dashboard (champs les plus importants)
export interface LaalaDashboardDisplay {
  id: string;
  nom: string;
  nomCrea: string;
  avatarCrea: string;
  cover: string;
  miniature: string;
  type: string;
  categorie: string;
  likes: number;
  vues: number;
  date: string;
  encours: boolean;
  alaune: boolean;
  iscert: boolean;
  ismonetise: boolean;
  contenusCount: number; // contenues.length
  participantsCount: number; // idparticipants.length
}

// Interface pour la création rapide
export interface LaalaQuickCreate {
  nom: string;
  description: string;
  idCreateur: string;
  type?: 'Laala freestyle' | 'Laala planifié' | 'Laala groupe' | 'Laala personnel';
  isLaalaPublic?: boolean;
  choosetext?: boolean;
  chooseimg?: boolean;
  choosevideo?: boolean;
}

// Exemple d'utilisation
export const laalaExample: LaalaDashboard = {
  // Données essentielles
  nom: "Je veux atteindre 1k d' abonnement",
  description: "Je compte sur vous 🙏😍",
  type: "Laala freestyle",
  categorie: "Laala á participation public",
  idCreateur: "92227616TG",
  isLaalaPublic: true,
  ismonetise: false,
  choosetext: true,
  chooseimg: true,
  choosevideo: true,
  chooselive: true,
  
  // Données générées automatiquement
  id: "372025Laala902688",
  nom_l: "je veux atteindre 1k d' abonnement",
  date: "2025-07-03",
  jour: 3,
  mois: 7,
  annee: 2025,
  
  // Métriques
  likes: 0,
  vues: 0,
  republication: 0,
  nbrEmoji: 0,
  soldeEmoji: 0,
  
  // Informations créateur
  nomCrea: "Djibril",
  avatarCrea: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/assets%2Fprofil.png?alt=media&token=e286f353-80f6-464b-8595-ee67f1ee43ec",
  iscert: false,
  
  // Statut
  encours: true,
  alaune: false,
  isSignaler: false,
  
  // Médias
  cover: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/VideoLaaLaCover%2F2025-07-03%2008%3A57%3A29.0351462025-07-02-105812917.mp4?alt=media&token=2197e9e5-caa0-466f-b6e0-5625aa2fa96a",
  miniature: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/VideoLaaLaCover%2F2025-07-03%2008%3A59%3A52.571865Mini?alt=media&token=6944bb4c-725b-453f-845b-1373d1bfa824",
  video480: "",
  
  // Paramètres
  isLaalaPerso: false,
  isLaalaGroupe: false,
  islaalaplani: false,
  iscoverVideo: true,
  
  // Dates de fin (optionnelles)
  date_fin: "",
  jour_fin: 0,
  mois_fin: 0,
  annee_fin: 0,
  
  // Listes
  contenues: [],
  commentaires: [],
  tablikes: [],
  emojis: [],
  sujets: [],
  domaines: [],
  d_sujets: [],
  htags: [],
  idparticipants: [],
  prevLaala: [],
  suiteLaala: [],
  horaires: [],
  sortie_jour: [],
  textes: [],
  lives: [],
  sousCompte: [],
  
  // IDs
  idForum: "",
  idSondage: "",
  idCagnote: "",
  sortie: ""
};

// Types pour les statistiques dashboard
export interface LaalaStats {
  totalLaalas: number;
  activeLaalas: number;
  completedLaalas: number;
  totalViews: number;
  totalLikes: number;
  topCategories: { categorie: string; count: number }[];
  recentLaalas: LaalaDashboardDisplay[];
}