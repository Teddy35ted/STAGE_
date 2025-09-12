// ===== MODÈLE COMMUNICATION PUBLIQUE =====
// Modèle pour les communications destinées au large public (pas à une personne spécifique)

export interface PublicCommunication {
  id?: string;
  title: string; // Titre de la communication
  content: string; // Contenu principal
  type: 'announcement' | 'update' | 'promotion' | 'event' | 'newsletter';
  format: 'text' | 'image' | 'video' | 'mixed';
  
  // Auteur/Créateur
  authorId: string;
  authorName?: string;
  
  // Audience cible
  targetAudience: {
    type: 'all' | 'followers' | 'fans' | 'vip' | 'custom';
    description: string; // Ex: "Tous les fans", "Abonnés VIP"
    estimatedReach?: number; // Estimation du nombre de personnes touchées
  };
  
  // Planification
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  publishDate?: string; // Date de publication (pour les publications programmées)
  
  // Métadonnées
  tags?: string[]; // Ex: ["promotion", "été", "nouveauté"]
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string; // Ex: "Annonces", "Promotions", "Événements"
  
  // Médias attachés
  attachments?: CommunicationAttachment[];
  
  // Données de suivi
  stats?: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  
  // Dates système
  createdAt?: string | number;
  updatedAt?: string | number;
}

export interface CommunicationAttachment {
  id: string;
  type: 'image' | 'video' | 'document' | 'link';
  url: string;
  name: string;
  size?: number; // en bytes
  description?: string;
}

// Types d'audience prédéfinis
export const AUDIENCE_TYPES = {
  all: {
    label: 'Tout le monde',
    description: 'Tous les utilisateurs de la plateforme',
    icon: 'users'
  },
  followers: {
    label: 'Mes abonnés',
    description: 'Utilisateurs qui vous suivent',
    icon: 'user-plus'
  },
  fans: {
    label: 'Mes fans',
    description: 'Utilisateurs qui sont fans de votre contenu',
    icon: 'heart'
  },
  vip: {
    label: 'Abonnés VIP',
    description: 'Utilisateurs avec un abonnement premium',
    icon: 'star'
  },
  custom: {
    label: 'Audience personnalisée',
    description: 'Audience définie par critères spécifiques',
    icon: 'filter'
  }
} as const;

// Types de communication
export const COMMUNICATION_TYPES = {
  announcement: {
    label: 'Annonce',
    description: 'Annonce officielle ou importante',
    color: 'blue'
  },
  update: {
    label: 'Mise à jour',
    description: 'Nouvelles informations ou changements',
    color: 'green'
  },
  promotion: {
    label: 'Promotion',
    description: 'Offre spéciale ou promotion',
    color: 'purple'
  },
  event: {
    label: 'Événement',
    description: 'Invitation ou information sur un événement',
    color: 'orange'
  },
  newsletter: {
    label: 'Newsletter',
    description: 'Communication périodique ou informative',
    color: 'teal'
  }
} as const;

// Niveaux de priorité
export const PRIORITY_LEVELS = {
  low: {
    label: 'Faible',
    color: 'gray',
    description: 'Information non urgente'
  },
  medium: {
    label: 'Normale',
    color: 'blue',
    description: 'Information standard'
  },
  high: {
    label: 'Importante',
    color: 'orange',
    description: 'Information importante à lire'
  },
  urgent: {
    label: 'Urgente',
    color: 'red',
    description: 'Information critique nécessitant une attention immédiate'
  }
} as const;

// Interface pour la création rapide
export interface CommunicationQuickCreate {
  title: string;
  content: string;
  type: keyof typeof COMMUNICATION_TYPES;
  audienceType: keyof typeof AUDIENCE_TYPES;
  priority: keyof typeof PRIORITY_LEVELS;
  tags?: string[];
  publishNow?: boolean; // true = publier maintenant, false = sauvegarder en brouillon
}

// Interface pour l'affichage dashboard
export interface CommunicationDashboard extends PublicCommunication {
  displayTitle: string;
  displayContent: string;
  displayStatus: {
    label: string;
    color: string;
    icon: string;
  };
  displayAudience: string;
  displayDate: string;
  
  // Statistiques formatées
  formattedStats: {
    totalEngagement: number;
    engagementRate: string;
    reachPercentage: string;
  };
}