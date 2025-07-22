import { Timestamp } from 'firebase-admin/firestore';

export class DataFormatter {
  // Formatage des timestamps Firestore
  static formatTimestamp(timestamp: Timestamp | null | undefined): string | null {
    if (!timestamp) return null;
    return timestamp.toDate().toISOString();
  }

  // Formatage des données pour l'API
  static formatForApi<T>(data: T): T {
    if (!data || typeof data !== 'object') return data;

    const formatted = { ...data } as any;

    // Convertir les timestamps
    Object.keys(formatted).forEach(key => {
      const value = formatted[key];
      if (value && typeof value === 'object' && value.toDate) {
        formatted[key] = this.formatTimestamp(value);
      } else if (value && typeof value === 'object') {
        formatted[key] = this.formatForApi(value);
      } else if (Array.isArray(value)) {
        formatted[key] = value.map(item => this.formatForApi(item));
      }
    });

    return formatted;
  }

  // Formatage des prix
  static formatPrice(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Formatage des dates en français
  static formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }).format(dateObj);
  }

  // Formatage des numéros de téléphone
  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('33')) {
      return `+33 ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
    }
    if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
    }
    return phone;
  }

  // Nettoyage des données d'entrée
  static sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return data.trim();
    }
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      Object.keys(data).forEach(key => {
        sanitized[key] = this.sanitizeInput(data[key]);
      });
      return sanitized;
    }
    return data;
  }

  // Génération d'IDs uniques
  static generateId(prefix?: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
  }

  // Slug generation
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Supprimer les tirets multiples
      .trim();
  }
}

// Utilitaires pour les calculs métier
export class BusinessCalculator {
  // Calcul des frais de plateforme
  static calculatePlatformFee(amount: number, feePercentage: number = 0.15): number {
    return Math.round(amount * feePercentage * 100) / 100;
  }

  // Calcul du montant net pour l'animateur
  static calculateNetAmount(grossAmount: number, platformFee?: number): number {
    const fee = platformFee || this.calculatePlatformFee(grossAmount);
    return Math.round((grossAmount - fee) * 100) / 100;
  }

  // Calcul de la note moyenne
  static calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }

  // Calcul de la distance entre deux points
  static calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}