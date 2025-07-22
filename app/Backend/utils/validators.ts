import { ValidationError } from './errors';
import { ValidationResult, ValidationError as ValidationErrorType } from '../types';

export class Validator {
  private errors: ValidationErrorType[] = [];

  // Validation des champs requis
  required(value: any, fieldName: string): this {
    if (value === null || value === undefined || value === '') {
      this.addError(fieldName, `${fieldName} est requis`, 'REQUIRED');
    }
    return this;
  }

  // Validation des emails
  email(value: string, fieldName: string = 'email'): this {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.addError(fieldName, 'Format d\'email invalide', 'INVALID_EMAIL');
    }
    return this;
  }

  // Validation des numéros de téléphone
  phone(value: string, fieldName: string = 'phone'): this {
    if (value && !/^(\+33|0)[1-9](\d{8})$/.test(value.replace(/\s/g, ''))) {
      this.addError(fieldName, 'Format de téléphone invalide', 'INVALID_PHONE');
    }
    return this;
  }

  // Validation de longueur
  length(value: string, min: number, max: number, fieldName: string): this {
    if (value && (value.length < min || value.length > max)) {
      this.addError(fieldName, `${fieldName} doit contenir entre ${min} et ${max} caractères`, 'INVALID_LENGTH');
    }
    return this;
  }

  // Validation des nombres
  number(value: any, fieldName: string, min?: number, max?: number): this {
    if (value !== undefined && value !== null) {
      const num = Number(value);
      if (isNaN(num)) {
        this.addError(fieldName, `${fieldName} doit être un nombre`, 'INVALID_NUMBER');
      } else {
        if (min !== undefined && num < min) {
          this.addError(fieldName, `${fieldName} doit être supérieur ou égal à ${min}`, 'MIN_VALUE');
        }
        if (max !== undefined && num > max) {
          this.addError(fieldName, `${fieldName} doit être inférieur ou égal à ${max}`, 'MAX_VALUE');
        }
      }
    }
    return this;
  }

  // Validation des dates
  date(value: any, fieldName: string, futureOnly: boolean = false): this {
    if (value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        this.addError(fieldName, `${fieldName} doit être une date valide`, 'INVALID_DATE');
      } else if (futureOnly && date <= new Date()) {
        this.addError(fieldName, `${fieldName} doit être une date future`, 'PAST_DATE');
      }
    }
    return this;
  }

  // Validation des tableaux
  array(value: any, fieldName: string, minLength?: number, maxLength?: number): this {
    if (value !== undefined && value !== null) {
      if (!Array.isArray(value)) {
        this.addError(fieldName, `${fieldName} doit être un tableau`, 'INVALID_ARRAY');
      } else {
        if (minLength !== undefined && value.length < minLength) {
          this.addError(fieldName, `${fieldName} doit contenir au moins ${minLength} éléments`, 'MIN_ARRAY_LENGTH');
        }
        if (maxLength !== undefined && value.length > maxLength) {
          this.addError(fieldName, `${fieldName} doit contenir au maximum ${maxLength} éléments`, 'MAX_ARRAY_LENGTH');
        }
      }
    }
    return this;
  }

  // Validation personnalisée
  custom(value: any, fieldName: string, validator: (value: any) => boolean, message: string): this {
    if (value !== undefined && value !== null && !validator(value)) {
      this.addError(fieldName, message, 'CUSTOM_VALIDATION');
    }
    return this;
  }

  // Ajouter une erreur
  private addError(field: string, message: string, code: string): void {
    this.errors.push({ field, message, code });
  }

  // Obtenir le résultat de validation
  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
    };
  }

  // Lancer une exception si invalide
  throwIfInvalid(): void {
    if (this.errors.length > 0) {
      const message = this.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new ValidationError(message);
    }
  }

  // Réinitialiser le validateur
  reset(): this {
    this.errors = [];
    return this;
  }
}

// Validateurs spécifiques pour le domaine métier
export class AnimatorValidator extends Validator {
  validateAnimatorData(data: any): ValidationResult {
    this.reset()
      .required(data.firstName, 'firstName')
      .required(data.lastName, 'lastName')
      .email(data.email, 'email')
      .phone(data.phone, 'phone')
      .array(data.specialties, 'specialties', 1)
      .number(data.pricing?.hourlyRate, 'hourlyRate', 0)
      .custom(data.status, 'status', 
        (value) => ['active', 'inactive', 'pending', 'suspended'].includes(value),
        'Status invalide'
      );

    return this.getResult();
  }
}

export class EventValidator extends Validator {
  validateEventData(data: any): ValidationResult {
    this.reset()
      .required(data.title, 'title')
      .required(data.description, 'description')
      .required(data.clientId, 'clientId')
      .date(data.dateTime?.start, 'startDate', true)
      .date(data.dateTime?.end, 'endDate', true)
      .number(data.requirements?.guestCount, 'guestCount', 1)
      .number(data.budget?.min, 'minBudget', 0)
      .number(data.budget?.max, 'maxBudget', 0)
      .custom(data.budget, 'budget',
        (budget) => !budget || budget.max >= budget.min,
        'Le budget maximum doit être supérieur au minimum'
      );

    return this.getResult();
  }
}