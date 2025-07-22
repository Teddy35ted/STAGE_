import { BaseService } from '../base/BaseService';
import { Animator } from '../../types/collections';
import { COLLECTIONS } from '../../config/database';
import { handleErrors } from '../../utils/errors';

export class AnimatorsService extends BaseService<Animator> {
  constructor() {
    super(COLLECTIONS.ANIMATORS);
  }

  // Méthodes spécifiques aux animateurs
  async getByUserId(userId: string): Promise<Animator | null> {
    const results = await this.query([
      { field: 'userId', operator: '==', value: userId }
    ]);
    return results.length > 0 ? results[0] : null;
  }

  async getActiveAnimators(): Promise<Animator[]> {
    return this.query([
      { field: 'status', operator: '==', value: 'active' }
    ], { orderBy: 'createdAt', orderDirection: 'desc' });
  }

  async updateProfile(id: string, profile: Partial<Animator>): Promise<void> {
    await this.update(id, profile);
  }

  async getBySpecialty(specialty: string): Promise<Animator[]> {
    return this.query([
      { field: 'specialties', operator: 'array-contains', value: specialty }
    ]);
  }

  async searchByLocation(city: string, radius?: number): Promise<Animator[]> {
    return this.query([
      { field: 'location.city', operator: '==', value: city }
    ]);
  }

  async getVerifiedAnimators(): Promise<Animator[]> {
    return this.query([
      { field: 'verification.isVerified', operator: '==', value: true },
      { field: 'status', operator: '==', value: 'active' }
    ], { orderBy: 'rating.average', orderDirection: 'desc' });
  }

  async updateRating(id: string, newRating: number): Promise<void> {
    const animator = await this.getById(id);
    if (!animator) throw new Error('Animateur introuvable');

    const currentCount = animator.rating.count;
    const currentAverage = animator.rating.average;
    const newCount = currentCount + 1;
    const newAverage = ((currentAverage * currentCount) + newRating) / newCount;

    await this.update(id, {
      rating: {
        average: Math.round(newAverage * 10) / 10,
        count: newCount
      }
    });
  }

  async searchAnimators(filters: {
    city?: string;
    specialties?: string[];
    minRating?: number;
    maxPrice?: number;
    isVerified?: boolean;
  }): Promise<Animator[]> {
    const queryFilters: any[] = [
      { field: 'status', operator: '==', value: 'active' }
    ];

    if (filters.city) {
      queryFilters.push({ field: 'location.city', operator: '==', value: filters.city });
    }

    if (filters.minRating) {
      queryFilters.push({ field: 'rating.average', operator: '>=', value: filters.minRating });
    }

    if (filters.maxPrice) {
      queryFilters.push({ field: 'pricing.hourlyRate', operator: '<=', value: filters.maxPrice });
    }

    if (filters.isVerified) {
      queryFilters.push({ field: 'verification.isVerified', operator: '==', value: true });
    }

    return this.query(queryFilters, { 
      orderBy: 'rating.average', 
      orderDirection: 'desc' 
    });
  }
}