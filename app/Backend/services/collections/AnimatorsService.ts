import { BaseService, QueryFilter, PaginationOptions } from '../base/BaseService';
import { Animator } from '../../types/collections';
import { COLLECTIONS } from '../../config/firebase-admin';
import { ServiceError, ValidationError } from '../../utils/errors';
import { AnimatorValidator } from '../../utils/validators';

export class AnimatorsService extends BaseService<Animator> {
  private validator: AnimatorValidator;

  constructor() {
    super(COLLECTIONS.USERS); // Utilise la collection users pour les animateurs
    this.validator = new AnimatorValidator();
  }

  // Créer un animateur avec validation
  async createAnimator(animatorData: Partial<Animator>): Promise<string> {
    try {
      // Validation des données
      const validationResult = this.validator.validateAnimatorData(animatorData);
      if (!validationResult.isValid) {
        throw new ValidationError(
          `Données animateur invalides: ${validationResult.errors.map(e => e.message).join(', ')}`
        );
      }

      // Vérifier l'unicité de l'email
      const existingAnimator = await this.findByEmail(animatorData.email!);
      if (existingAnimator) {
        throw new ValidationError('Un animateur avec cet email existe déjà');
      }

      // Créer l'animateur avec des valeurs par défaut
      const completeAnimatorData: Partial<Animator> = {
        ...animatorData,
        status: animatorData.status || 'pending',
        rating: {
          average: 0,
          count: 0
        },
        verification: {
          isVerified: false,
          documents: []
        },
        specialties: animatorData.specialties || [],
        availability: animatorData.availability || {
          weekdays: [false, true, true, true, true, true, false],
          timeSlots: [],
          blackoutDates: []
        }
      };

      return await this.create(completeAnimatorData);
    } catch (error) {
      throw new ServiceError('Erreur lors de la création de l\'animateur', error);
    }
  }

  // Rechercher un animateur par email
  async findByEmail(email: string): Promise<Animator | null> {
    try {
      const filters: QueryFilter[] = [
        { field: 'email', operator: '==', value: email }
      ];
      const results = await this.query(filters);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      throw new ServiceError('Erreur lors de la recherche par email', error);
    }
  }

  // Rechercher des animateurs par spécialité
  async findBySpecialty(specialty: string, options: PaginationOptions = {}): Promise<Animator[]> {
    try {
      const filters: QueryFilter[] = [
        { field: 'specialties', operator: 'array-contains', value: specialty },
        { field: 'status', operator: '==', value: 'active' }
      ];
      return await this.query(filters, options);
    } catch (error) {
      throw new ServiceError('Erreur lors de la recherche par spécialité', error);
    }
  }

  // Rechercher des animateurs par localisation
  async findByLocation(city: string, region?: string, options: PaginationOptions = {}): Promise<Animator[]> {
    try {
      const filters: QueryFilter[] = [
        { field: 'location.city', operator: '==', value: city },
        { field: 'status', operator: '==', value: 'active' }
      ];

      if (region) {
        filters.push({ field: 'location.region', operator: '==', value: region });
      }

      return await this.query(filters, options);
    } catch (error) {
      throw new ServiceError('Erreur lors de la recherche par localisation', error);
    }
  }

  // Mettre à jour le statut d'un animateur
  async updateStatus(animatorId: string, status: Animator['status']): Promise<void> {
    try {
      await this.update(animatorId, { status });
    } catch (error) {
      throw new ServiceError('Erreur lors de la mise à jour du statut', error);
    }
  }

  // Mettre à jour la note d'un animateur
  async updateRating(animatorId: string, newRating: number): Promise<void> {
    try {
      const animator = await this.getById(animatorId);
      if (!animator) {
        throw new ServiceError('Animateur non trouvé');
      }

      const currentRating = animator.rating;
      const newCount = currentRating.count + 1;
      const newAverage = ((currentRating.average * currentRating.count) + newRating) / newCount;

      await this.update(animatorId, {
        rating: {
          average: Math.round(newAverage * 10) / 10, // Arrondir à 1 décimale
          count: newCount
        }
      });
    } catch (error) {
      throw new ServiceError('Erreur lors de la mise à jour de la note', error);
    }
  }

  // Obtenir les animateurs les mieux notés
  async getTopRated(limit: number = 10): Promise<Animator[]> {
    try {
      const options: PaginationOptions = {
        orderBy: 'rating.average',
        orderDirection: 'desc',
        limit
      };

      const filters: QueryFilter[] = [
        { field: 'status', operator: '==', value: 'active' },
        { field: 'rating.count', operator: '>', value: 0 }
      ];

      return await this.query(filters, options);
    } catch (error) {
      throw new ServiceError('Erreur lors de la récupération des animateurs les mieux notés', error);
    }
  }

  // Recherche avancée d'animateurs
  async searchAnimators(searchParams: {
    specialty?: string;
    city?: string;
    region?: string;
    minRating?: number;
    maxPrice?: number;
    availability?: Date;
  }, options: PaginationOptions = {}): Promise<Animator[]> {
    try {
      const filters: QueryFilter[] = [
        { field: 'status', operator: '==', value: 'active' }
      ];

      if (searchParams.specialty) {
        filters.push({ field: 'specialties', operator: 'array-contains', value: searchParams.specialty });
      }

      if (searchParams.city) {
        filters.push({ field: 'location.city', operator: '==', value: searchParams.city });
      }

      if (searchParams.region) {
        filters.push({ field: 'location.region', operator: '==', value: searchParams.region });
      }

      if (searchParams.minRating) {
        filters.push({ field: 'rating.average', operator: '>=', value: searchParams.minRating });
      }

      if (searchParams.maxPrice) {
        filters.push({ field: 'pricing.hourlyRate', operator: '<=', value: searchParams.maxPrice });
      }

      return await this.query(filters, options);
    } catch (error) {
      throw new ServiceError('Erreur lors de la recherche avancée', error);
    }
  }
}