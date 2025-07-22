import { BaseService, QueryFilter } from '../base/BaseService';
import { Event } from '../../types/collections';
import { COLLECTIONS } from '../../config/database';
import { EventValidator } from '../../utils/validators';
import { ValidationError } from '../../utils/errors';
import { WhereFilterOp } from 'firebase-admin/firestore';

export class EventsService extends BaseService<Event> {
  private validator = new EventValidator();

  constructor() {
    super(COLLECTIONS.EVENTS);
  }

  async createEvent(eventData: Partial<Event>): Promise<string> {
    // Validation des données
    const validation = this.validator.validateEventData(eventData);
    if (!validation.isValid) {
      throw new ValidationError(
        validation.errors.map(e => e.message).join(', ')
      );
    }

    // Création de l'événement
    return await this.create({
      ...eventData,
      status: 'draft',
      proposals: [],
    });
  }

  async getEventsByClient(clientId: string): Promise<Event[]> {
    return await this.query([
      { field: 'clientId', operator: '==' as WhereFilterOp, value: clientId }
    ], { orderBy: 'createdAt', orderDirection: 'desc' });
  }

  async getAvailableEvents(location?: string): Promise<Event[]> {
    const filters: QueryFilter[] = [
      { field: 'status', operator: '==' as WhereFilterOp, value: 'published' },
      { field: 'animatorId', operator: '==' as WhereFilterOp, value: null }
    ];

    if (location) {
      filters.push({ field: 'location.city', operator: '==' as WhereFilterOp, value: location });
    }

    return await this.query(filters, {
      orderBy: 'dateTime.start',
      orderDirection: 'asc'
    });
  }

  async assignAnimator(eventId: string, animatorId: string): Promise<void> {
    await this.update(eventId, {
      animatorId,
      status: 'booked',
    });
  }

  async getEventsByAnimator(animatorId: string): Promise<Event[]> {
    return await this.query([
      { field: 'animatorId', operator: '==' as WhereFilterOp, value: animatorId }
    ], { orderBy: 'dateTime.start', orderDirection: 'asc' });
  }

  async getUpcomingEvents(animatorId?: string): Promise<Event[]> {
    const now = new Date();
    const filters: QueryFilter[] = [
      { field: 'dateTime.start', operator: '>' as WhereFilterOp, value: now },
      { field: 'status', operator: 'in' as WhereFilterOp, value: ['booked', 'confirmed'] }
    ];

    if (animatorId) {
      filters.push({ field: 'animatorId', operator: '==' as WhereFilterOp, value: animatorId });
    }

    return await this.query(filters, {
      orderBy: 'dateTime.start',
      orderDirection: 'asc'
    });
  }

  async searchEvents(filters: {
    city?: string;
    type?: string;
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
    minBudget?: number;
    maxBudget?: number;
  }): Promise<Event[]> {
    const queryFilters: QueryFilter[] = [];

    if (filters.city) {
      queryFilters.push({ field: 'location.city', operator: '==' as WhereFilterOp, value: filters.city });
    }

    if (filters.type) {
      queryFilters.push({ field: 'type', operator: '==' as WhereFilterOp, value: filters.type });
    }

    if (filters.status) {
      queryFilters.push({ field: 'status', operator: '==' as WhereFilterOp, value: filters.status });
    }

    if (filters.dateFrom) {
      queryFilters.push({ field: 'dateTime.start', operator: '>=' as WhereFilterOp, value: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryFilters.push({ field: 'dateTime.start', operator: '<=' as WhereFilterOp, value: filters.dateTo });
    }

    if (filters.minBudget) {
      queryFilters.push({ field: 'budget.min', operator: '>=' as WhereFilterOp, value: filters.minBudget });
    }

    if (filters.maxBudget) {
      queryFilters.push({ field: 'budget.max', operator: '<=' as WhereFilterOp, value: filters.maxBudget });
    }

    return await this.query(queryFilters, {
      orderBy: 'dateTime.start',
      orderDirection: 'asc'
    });
  }

  async completeEvent(eventId: string): Promise<void> {
    await this.update(eventId, {
      status: 'completed'
    });
  }

  async cancelEvent(eventId: string, reason?: string): Promise<void> {
    const updateData: any = {
      status: 'cancelled'
    };

    if (reason) {
      updateData.cancellationReason = reason;
    }

    await this.update(eventId, updateData);
  }
}