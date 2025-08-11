// ===== MODÈLE CAMPAGNE - RASSEMBLEMENT DE COMMUNICATIONS =====
// Modèle pour les campagnes marketing qui regroupent plusieurs communications

import { ValidationMessageT } from './message';

// Interface de base pour une campagne
export interface CampaignCore {
  id?: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'scheduled';
  createdAt?: string | number;
  updatedAt?: string | number;
  
  // Période de la campagne
  startDate: string;
  endDate: string;
  
  // Créateur de la campagne
  createdBy: string; // ID de l'utilisateur
  creatorName?: string;
  
  // Communications liées (maximum 5)
  communications: CampaignCommunication[];
  
  // Statistiques de base
  stats?: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
  };
}

// Communication dans une campagne
export interface CampaignCommunication {
  messageId: string; // ID du message de référence
  title: string;
  content: string;
  type: 'text' | 'image' | 'file';
  scheduledDate?: string;
  status: 'pending' | 'sent' | 'failed';
  
  // Destinataires
  recipients: CampaignRecipient[];
  
  // Métadonnées
  metadata?: {
    subject?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
  };
}

// Destinataire d'une communication
export interface CampaignRecipient {
  userId: string;
  name?: string;
  email?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

// Interface étendue pour l'affichage dashboard
export interface CampaignDashboard extends CampaignCore {
  displayTitle: string;
  displayDescription: string;
  displayStatus: {
    label: string;
    color: string;
    icon: string;
  };
  
  // Statistiques étendues
  extendedStats: {
    communicationsCount: number;
    totalRecipients: number;
    successRate: number;
    engagementRate: number;
    completionPercentage: number;
  };
  
  // Dates formatées
  formattedDates: {
    start: string;
    end: string;
    duration: string;
  };
}

// Interface pour la création rapide
export interface CampaignQuickCreate {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  messageIds: string[]; // IDs des messages à inclure (max 5)
}

// Interface pour les filtres
export interface CampaignFilters {
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'scheduled' | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  creator?: string;
  searchTerm?: string;
}

// Interface pour les statistiques de campagne
export interface CampaignStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
  scheduled: number;
  paused: number;
  
  // Performance globale
  performance: {
    totalCommunications: number;
    totalRecipients: number;
    avgSuccessRate: number;
    avgEngagementRate: number;
  };
  
  // Tendances
  trends: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

// Type pour l'export par défaut
export type Campaign = CampaignCore;

// Types utilitaires
export type CampaignStatus = CampaignCore['status'];
export type CommunicationStatus = CampaignCommunication['status'];
export type RecipientStatus = CampaignRecipient['status'];

// Validation et utilitaires
export const CAMPAIGN_CONSTANTS = {
  MAX_COMMUNICATIONS: 5,
  MAX_RECIPIENTS_PER_COMMUNICATION: 1000,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// Export direct pour faciliter l'utilisation
export const MAX_COMMUNICATIONS = CAMPAIGN_CONSTANTS.MAX_COMMUNICATIONS;

// Types d'aide pour les status
export const CAMPAIGN_STATUS_LABELS = {
  draft: 'Brouillon',
  active: 'Active',
  paused: 'En pause',
  completed: 'Terminée',
  scheduled: 'Programmée'
} as const;

export const CAMPAIGN_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800'
} as const;

// Fonctions utilitaires
export const createCampaignFromMessages = (
  name: string,
  description: string,
  startDate: string,
  endDate: string,
  messages: ValidationMessageT[],
  createdBy: string,
  creatorName?: string
): CampaignCore => {
  if (messages.length > CAMPAIGN_CONSTANTS.MAX_COMMUNICATIONS) {
    throw new Error(`Une campagne ne peut contenir que ${CAMPAIGN_CONSTANTS.MAX_COMMUNICATIONS} communications maximum`);
  }

  const communications: CampaignCommunication[] = messages.map(msg => ({
    messageId: msg.id || '',
    title: msg.nomrec || msg.receiverId || 'Communication sans titre',
    content: msg.message?.text || msg.messages?.[0]?.text || 'Contenu vide',
    type: (msg.message?.type || msg.messages?.[0]?.type || 'text') as 'text' | 'image' | 'file',
    status: 'pending',
    recipients: [{
      userId: msg.receiverId || '',
      name: msg.nomrec,
      status: 'pending'
    }],
    metadata: {
      tags: [],
      priority: 'medium'
    }
  }));

  return {
    name,
    description,
    status: 'draft',
    startDate,
    endDate,
    createdBy,
    creatorName,
    communications,
    stats: {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0
    }
  };
};

export const calculateCampaignStats = (campaign: CampaignCore): CampaignDashboard['extendedStats'] => {
  const communicationsCount = campaign.communications.length;
  const totalRecipients = campaign.communications.reduce(
    (total, comm) => total + comm.recipients.length, 0
  );
  
  const sentCommunications = campaign.communications.filter(comm => comm.status === 'sent').length;
  const successRate = communicationsCount > 0 ? (sentCommunications / communicationsCount) * 100 : 0;
  
  // Calcul du taux d'engagement basé sur les ouvertures et clics
  const totalOpened = campaign.stats?.totalOpened || 0;
  const totalClicked = campaign.stats?.totalClicked || 0;
  const totalSent = campaign.stats?.totalSent || 0;
  
  const engagementRate = totalSent > 0 ? ((totalOpened + totalClicked) / totalSent) * 100 : 0;
  
  // Pourcentage de completion basé sur les dates
  const now = new Date();
  const start = new Date(campaign.startDate);
  const end = new Date(campaign.endDate);
  
  let completionPercentage = 0;
  if (now >= start && now <= end) {
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    completionPercentage = Math.min(100, (elapsed / totalDuration) * 100);
  } else if (now > end) {
    completionPercentage = 100;
  }

  return {
    communicationsCount,
    totalRecipients,
    successRate: Math.round(successRate * 100) / 100,
    engagementRate: Math.round(engagementRate * 100) / 100,
    completionPercentage: Math.round(completionPercentage)
  };
};
