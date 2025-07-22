import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Configuration des collections
export const COLLECTIONS = {
  USERS: 'users',
  ANIMATORS: 'animators',
  EVENTS: 'events',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
  EARNINGS: 'earnings',
} as const;

// Utilitaires Firestore
export const dbUtils = {
  timestamp: () => FieldValue.serverTimestamp(),
  increment: (value: number) => FieldValue.increment(value),
  arrayUnion: (...elements: any[]) => FieldValue.arrayUnion(...elements),
  arrayRemove: (...elements: any[]) => FieldValue.arrayRemove(...elements),
  delete: () => FieldValue.delete(),
};

export { adminDb };