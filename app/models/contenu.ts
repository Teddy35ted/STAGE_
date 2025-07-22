// ===== MODÈLE CONTENU - PRIORITÉ 3 (Contenus multimédias) =====
// Contenus multimédias (images, vidéos, textes) associés aux Laalas

export interface ContenuCore {
  // === CHAMPS ESSENTIELS (à saisir) ===
  nom: string;
  idCreateur: string;
  idLaala: string;
  type: 'image' | 'video' | 'texte' | 'album';
  
  // === CONTENU MULTIMÉDIA ===
  src?: string; // URL du fichier principal
  cover?: string; // URL de la couverture (pour vidéos)
  
  // === PARAMÈTRES DE CONTENU ===
  allowComment: boolean;
  
  // === MÉTADONNÉES ===
  htags: string[];
  personnes: string[]; // IDs des personnes taguées
}

export interface ContenuDashboard extends ContenuCore {
  // === CHAMPS GÉNÉRÉS AUTOMATIQUEMENT ===
  id: string; // Généré automatiquement
  nom_l: string; // Généré à partir du nom (toLowerCase)
  date: string; // Date de création
  jour: number;
  mois: number;
  annee: number;
  heure: string;
  position: number; // Position dans le Laala
  
  // === MÉTRIQUES DASHBOARD (priorité affichage) ===
  likes: number;
  vues: number;
  nbrEmoji: number;
  soldeEmoji: number;
  
  // === INFORMATIONS CRÉATEUR (récupérées automatiquement) ===
  nomCrea: string;
  avatarCrea: string;
  iscert: boolean; // Statut certification du créateur
  
  // === STATUT ET ÉTAT ===
  isSignaler: boolean;
  
  // === TYPES DE CONTENU (générés selon le type) ===
  isimage: boolean;
  isvideo: boolean;
  istexte: boolean;
  
  // === MÉDIAS OPTIMISÉS (générés automatiquement) ===
  miniature: string; // Miniature générée
  video480: string; // Version 480p pour vidéos
  
  // === DONNÉES RELATIONNELLES ===
  commentaires: any[];
  tablikes: string[]; // IDs des utilisateurs qui ont liké
  tabvues: string[]; // IDs des utilisateurs qui ont vu
  emojis: any[];
  
  // === ALBUM (pour type album) ===
  fichierAlbum: any[];
  
  // === LIAISON LAALA ===
  isLaala: boolean | null; // Indique si lié à un Laala
}

// Fonction pour générer les données automatiques
export function generateContenuAutoFields(
  contenuCore: ContenuCore,
  creatorInfo: { nom: string; avatar: string; iscert: boolean },
  position: number = 1
): Omit<ContenuDashboard, keyof ContenuCore> {
  const now = new Date();
  const contenuId = generateContenuId();
  
  return {
    id: contenuId,
    nom_l: contenuCore.nom.toLowerCase(),
    date: now.toISOString().split('T')[0],
    jour: now.getDate(),
    mois: now.getMonth() + 1,
    annee: now.getFullYear(),
    heure: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
    position,
    
    // Métriques initialisées à zéro
    likes: 0,
    vues: 0,
    nbrEmoji: 0,
    soldeEmoji: 0,
    
    // Informations créateur
    nomCrea: creatorInfo.nom,
    avatarCrea: creatorInfo.avatar,
    iscert: creatorInfo.iscert,
    
    // Statut par défaut
    isSignaler: false,
    
    // Types de contenu
    isimage: contenuCore.type === 'image',
    isvideo: contenuCore.type === 'video',
    istexte: contenuCore.type === 'texte',
    
    // Médias optimisés
    miniature: generateMiniature(contenuCore.src, contenuCore.type),
    video480: contenuCore.type === 'video' ? generateVideo480(contenuCore.src) : "",
    
    // Listes vides
    commentaires: [],
    tablikes: [],
    tabvues: [],
    emojis: [],
    fichierAlbum: [],
    
    // Liaison Laala
    isLaala: contenuCore.idLaala ? true : null
  };
}

// Fonctions utilitaires
function generateContenuId(): string {
  const now = new Date();
  const timestamp = now.getTime();
  const random = Math.floor(Math.random() * 1000000);
  return `${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}${random}${timestamp.toString().slice(-6)}`;
}

function generateMiniature(src?: string, type?: string): string {
  if (!src) return "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/assets%2Fdefault-miniature.png?alt=media";
  
  if (type === 'video') {
    // Générer miniature à partir de la vidéo
    return src.replace(/\.(mp4|avi|mov)$/i, 'Mini');
  }
  
  return src; // Pour les images, utiliser l'image elle-même
}

function generateVideo480(src?: string): string {
  if (!src) return "";
  return src.replace(/\.(mp4|avi|mov)$/i, '_480p.$1');
}

// Interface pour l'affichage dashboard (champs les plus importants)
export interface ContenuDashboardDisplay {
  id: string;
  nom: string;
  nomCrea: string;
  avatarCrea: string;
  type: string;
  src: string;
  miniature: string;
  likes: number;
  vues: number;
  date: string;
  heure: string;
  isSignaler: boolean;
  iscert: boolean;
  idLaala: string;
  position: number;
  viewsCount: number; // tabvues.length
  likesCount: number; // tablikes.length
  commentsCount: number; // commentaires.length
}

// Interface pour la création rapide
export interface ContenuQuickCreate {
  nom: string;
  idCreateur: string;
  idLaala: string;
  type: 'image' | 'video' | 'texte' | 'album';
  src?: string;
  allowComment?: boolean;
  htags?: string[];
}

// Interface pour les statistiques de contenu
export interface ContenuStats {
  totalContenus: number;
  totalImages: number;
  totalVideos: number;
  totalTextes: number;
  totalViews: number;
  totalLikes: number;
  topHashtags: { tag: string; count: number }[];
  recentContenus: ContenuDashboardDisplay[];
  topCreators: { creatorId: string; nom: string; count: number }[];
}

// Types pour les filtres de contenu
export interface ContenuFilters {
  type?: 'image' | 'video' | 'texte' | 'album';
  creatorId?: string;
  laalaId?: string;
  dateFrom?: string;
  dateTo?: string;
  minLikes?: number;
  minViews?: number;
  hashtags?: string[];
  isSignaler?: boolean;
}

// Exemple d'utilisation
export const contenuExample: ContenuDashboard = {
  // Données essentielles
  nom: "Gazo- Toki (vidéo Lyrics ) #mondedrill",
  idCreateur: "96364979TG",
  idLaala: "4122024Laala71735264",
  type: "video",
  src: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/contenueVideo%2F2024-12-04%2009%3A40%3A58.261924VIDEO?alt=media&token=327a812b-4ae3-4556-a8fb-f200b97ac504",
  cover: "",
  allowComment: false,
  htags: ["#mondedrill", "#Gazo", "#Rap francais", "#Gazo Apocalypse", "#video lyrics"],
  personnes: [],
  
  // Données générées automatiquement
  id: "1412202494410470",
  nom_l: "gazo- toki (vidéo lyrics ) #mondedrill",
  date: "2024-12-04",
  jour: 4,
  mois: 12,
  annee: 2024,
  heure: "9:44",
  position: 1,
  
  // Métriques
  likes: 3,
  vues: 9,
  nbrEmoji: 0,
  soldeEmoji: 0,
  
  // Informations créateur
  nomCrea: "Monde Drill",
  avatarCrea: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/AvatarImage%2F2024-12-04%2006%3A59%3A07.765957JPEG_20241204_065907_4739785943605022302.jpg?alt=media&token=379f8fa1-2222-4a26-b4e4-43e45da7637c",
  iscert: false,
  
  // Statut
  isSignaler: false,
  
  // Types de contenu
  isimage: false,
  isvideo: true,
  istexte: false,
  
  // Médias optimisés
  miniature: "https://firebasestorage.googleapis.com/v0/b/la-a-la.appspot.com/o/contenueVideo%2F2024-12-04%2009%3A41%3A26.684832Mini?alt=media&token=8508b7f0-4aea-48b1-ae68-f15f9e2a022a",
  video480: "",
  
  // Listes
  commentaires: [],
  tablikes: ["92493943TG", "90373175TG", "96364979TG"],
  tabvues: ["96364979TG", "92493943TG", "90000000TG", "99253321TG", "98840319TG", "70426625TG", "92917272TG", "97667691TG", "70232405TG"],
  emojis: [],
  fichierAlbum: [],
  
  // Liaison Laala
  isLaala: true
};

// Fonctions utilitaires pour les statistiques
export function calculateContenuStats(contenus: ContenuDashboard[]): ContenuStats {
  return {
    totalContenus: contenus.length,
    totalImages: contenus.filter(c => c.type === 'image').length,
    totalVideos: contenus.filter(c => c.type === 'video').length,
    totalTextes: contenus.filter(c => c.type === 'texte').length,
    totalViews: contenus.reduce((sum, c) => sum + c.vues, 0),
    totalLikes: contenus.reduce((sum, c) => sum + c.likes, 0),
    topHashtags: extractTopHashtags(contenus),
    recentContenus: contenus
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(mapToDisplayFormat),
    topCreators: extractTopCreators(contenus)
  };
}

function extractTopHashtags(contenus: ContenuDashboard[]): { tag: string; count: number }[] {
  const hashtagCount: { [key: string]: number } = {};
  
  contenus.forEach(contenu => {
    contenu.htags.forEach(tag => {
      hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
    });
  });
  
  return Object.entries(hashtagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function extractTopCreators(contenus: ContenuDashboard[]): { creatorId: string; nom: string; count: number }[] {
  const creatorCount: { [key: string]: { nom: string; count: number } } = {};
  
  contenus.forEach(contenu => {
    if (!creatorCount[contenu.idCreateur]) {
      creatorCount[contenu.idCreateur] = { nom: contenu.nomCrea, count: 0 };
    }
    creatorCount[contenu.idCreateur].count++;
  });
  
  return Object.entries(creatorCount)
    .map(([creatorId, data]) => ({ creatorId, nom: data.nom, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function mapToDisplayFormat(contenu: ContenuDashboard): ContenuDashboardDisplay {
  return {
    id: contenu.id,
    nom: contenu.nom,
    nomCrea: contenu.nomCrea,
    avatarCrea: contenu.avatarCrea,
    type: contenu.type,
    src: contenu.src || "",
    miniature: contenu.miniature,
    likes: contenu.likes,
    vues: contenu.vues,
    date: contenu.date,
    heure: contenu.heure,
    isSignaler: contenu.isSignaler,
    iscert: contenu.iscert,
    idLaala: contenu.idLaala,
    position: contenu.position,
    viewsCount: contenu.tabvues.length,
    likesCount: contenu.tablikes.length,
    commentsCount: contenu.commentaires.length
  };
}