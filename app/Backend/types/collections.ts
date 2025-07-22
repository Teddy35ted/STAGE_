import { Timestamp } from 'firebase-admin/firestore';

// Types de base
export interface BaseDocument {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Types pour les animateurs
export interface Animator extends BaseDocument {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  specialties: string[];
  location: {
    city: string;
    region: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  pricing: {
    hourlyRate: number;
    currency: string;
    packages?: PricingPackage[];
  };
  availability: {
    weekdays: boolean[];
    timeSlots: TimeSlot[];
    blackoutDates: string[];
  };
  rating: {
    average: number;
    count: number;
  };
  verification: {
    isVerified: boolean;
    documents: VerificationDocument[];
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}

export interface PricingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // en heures
  includes: string[];
}

export interface TimeSlot {
  day: number; // 0-6 (dimanche-samedi)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface VerificationDocument {
  type: 'identity' | 'insurance' | 'certification';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Timestamp;
}

// Types pour les événements
export interface Event extends BaseDocument {
  title: string;
  description: string;
  type: 'birthday' | 'wedding' | 'corporate' | 'festival' | 'other';
  clientId: string;
  animatorId?: string;
  status: 'draft' | 'published' | 'booked' | 'completed' | 'cancelled';
  dateTime: {
    start: Timestamp;
    end: Timestamp;
    timezone: string;
  };
  location: EventLocation;
  requirements: {
    guestCount: number;
    ageGroup: 'children' | 'adults' | 'mixed';
    specialRequests?: string[];
  };
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  proposals: string[]; // IDs des propositions
}

export interface EventLocation {
  type: 'home' | 'venue' | 'outdoor' | 'online';
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  venueDetails?: {
    name: string;
    capacity: number;
    facilities: string[];
  };
}

// Types pour les réservations
export interface Booking extends BaseDocument {
  eventId: string;
  clientId: string;
  animatorId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  pricing: {
    basePrice: number;
    extras: BookingExtra[];
    totalPrice: number;
    currency: string;
  };
  payment: {
    status: 'pending' | 'partial' | 'completed' | 'refunded';
    method: string;
    transactions: PaymentTransaction[];
  };
  contract?: {
    terms: string;
    signedAt?: Timestamp;
    clientSignature?: string;
    animatorSignature?: string;
  };
}

export interface BookingExtra {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  type: 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  processedAt?: Timestamp;
  paymentMethod: string;
}

// Types pour les avis
export interface Review extends BaseDocument {
  bookingId: string;
  clientId: string;
  animatorId: string;
  rating: number; // 1-5
  comment?: string;
  photos?: string[];
  response?: {
    comment: string;
    respondedAt: Timestamp;
  };
  isPublic: boolean;
  isVerified: boolean;
}

// Types pour les gains
export interface Earning extends BaseDocument {
  animatorId: string;
  bookingId: string;
  type: 'direct' | 'indirect' | 'bonus' | 'commission';
  amount: number;
  currency: string;
  status: 'pending' | 'available' | 'withdrawn';
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  fees: {
    platform: number;
    payment: number;
    tax?: number;
  };
  withdrawal?: {
    requestedAt: Timestamp;
    processedAt?: Timestamp;
    method: string;
    reference?: string;
  };
}