/**
 * Exemple d'utilisation du Backend Firebase Admin
 * 
 * Ce fichier montre comment utiliser les services Backend
 * dans votre application Next.js
 */

import { 
  AnimatorsService, 
  EventsService,
  DataFormatter,
  ValidationError,
  NotFoundError
} from './index';

// Exemple 1: Utilisation dans une API Route Next.js
export async function handleGetAnimators() {
  try {
    const animatorsService = new AnimatorsService();
    
    // Récupérer tous les animateurs actifs
    const animators = await animatorsService.getActiveAnimators();
    
    // Formater les données pour l'API
    const formattedAnimators = animators.map(animator => 
      DataFormatter.formatForApi(animator)
    );

    return {
      success: true,
      data: formattedAnimators,
      meta: {
        total: formattedAnimators.length
      }
    };

  } catch (error) {
    console.error('Erreur lors de la récupération des animateurs:', error);
    
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue'
      }
    };
  }
}

// Exemple 2: Création d'un animateur
export async function createAnimatorExample() {
  try {
    const animatorsService = new AnimatorsService();
    
    const animatorData = {
      userId: 'user_123',
      email: 'jean.dupont@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0123456789',
      status: 'active' as const,
      specialties: ['magie', 'clown'],
      location: {
        city: 'Paris',
        region: 'Île-de-France',
        country: 'France'
      },
      pricing: {
        hourlyRate: 75,
        currency: 'EUR'
      },
      availability: {
        weekdays: [true, true, true, true, true, false, false],
        timeSlots: [],
        blackoutDates: []
      },
      rating: {
        average: 0,
        count: 0
      },
      verification: {
        isVerified: false,
        documents: []
      }
    };

    const animatorId = await animatorsService.create(animatorData);
    console.log(`Animateur créé avec l'ID: ${animatorId}`);
    
    return animatorId;

  } catch (error) {
    console.error('Erreur lors de la création de l\'animateur:', error);
    throw error;
  }
}

// Exemple 3: Recherche d'événements
export async function searchEventsExample() {
  try {
    const eventsService = new EventsService();
    
    // Rechercher des événements à Paris pour des anniversaires
    const events = await eventsService.searchEvents({
      city: 'Paris',
      type: 'birthday',
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-12-31'),
      status: 'published'
    });

    console.log(`${events.length} événements trouvés`);
    
    return events.map(event => ({
      id: event.id,
      title: event.title,
      date: DataFormatter.formatDate(event.dateTime.start.toDate()),
      budget: DataFormatter.formatPrice(event.budget.max, event.budget.currency),
      location: event.location.address?.city
    }));

  } catch (error) {
    console.error('Erreur lors de la recherche d\'événements:', error);
    throw error;
  }
}

// Exemple 4: Utilisation dans un Server Component Next.js
export async function getAnimatorsForDashboard() {
  try {
    const animatorsService = new AnimatorsService();
    
    // Récupérer les animateurs vérifiés avec une bonne note
    const topAnimators = await animatorsService.searchAnimators({
      minRating: 4.0,
      isVerified: true
    });

    // Formater pour l'affichage
    return topAnimators.map(animator => ({
      id: animator.id,
      name: `${animator.firstName} ${animator.lastName}`,
      specialties: animator.specialties.join(', '),
      rating: animator.rating.average,
      price: DataFormatter.formatPrice(animator.pricing.hourlyRate),
      city: animator.location.city,
      isVerified: animator.verification.isVerified
    }));

  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error);
    return [];
  }
}

// Exemple 5: Gestion des erreurs avancée
export async function handleAnimatorUpdate(id: string, updateData: any) {
  try {
    const animatorsService = new AnimatorsService();
    
    // Vérifier que l'animateur existe
    const existingAnimator = await animatorsService.getById(id);
    if (!existingAnimator) {
      throw new NotFoundError('Animateur', id);
    }

    // Mettre à jour
    await animatorsService.update(id, updateData);
    
    // Récupérer les données mises à jour
    const updatedAnimator = await animatorsService.getById(id);
    
    return {
      success: true,
      data: DataFormatter.formatForApi(updatedAnimator),
      message: 'Animateur mis à jour avec succès'
    };

  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      };
    }

    // Erreur générique
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue'
      }
    };
  }
}

// Exemple 6: Utilisation avec pagination
export async function getPaginatedAnimators(page: number = 1, limit: number = 10) {
  try {
    const animatorsService = new AnimatorsService();
    
    const animators = await animatorsService.getAll({
      limit,
      offset: (page - 1) * limit,
      orderBy: 'rating.average',
      orderDirection: 'desc'
    });

    // Compter le total pour la pagination
    const total = await animatorsService.count([
      { field: 'status', operator: '==', value: 'active' }
    ]);

    return {
      success: true,
      data: animators.map(animator => DataFormatter.formatForApi(animator)),
      meta: {
        page,
        limit,
        total,
        hasNext: (page * limit) < total,
        hasPrevious: page > 1
      }
    };

  } catch (error) {
    console.error('Erreur lors de la pagination:', error);
    throw error;
  }
}