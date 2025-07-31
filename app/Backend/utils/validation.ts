// ===== UTILITAIRES DE VALIDATION =====
// Fonctions de validation pour les données avant opérations CRUD

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Validation failed: ${errors.join(', ')}`);
    this.name = 'ValidationError';
  }
}

// Validation générale
export function validateRequired(value: any, fieldName: string): string[] {
  const errors: string[] = [];
  
  if (value === null || value === undefined) {
    errors.push(`${fieldName} est requis`);
  } else if (typeof value === 'string' && value.trim() === '') {
    errors.push(`${fieldName} ne peut pas être vide`);
  }
  
  return errors;
}

export function validateString(value: string, fieldName: string, options: {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
} = {}): string[] {
  const errors: string[] = [];
  
  if (typeof value !== 'string') {
    errors.push(`${fieldName} doit être une chaîne de caractères`);
    return errors;
  }
  
  if (options.minLength && value.length < options.minLength) {
    errors.push(`${fieldName} doit contenir au moins ${options.minLength} caractères`);
  }
  
  if (options.maxLength && value.length > options.maxLength) {
    errors.push(`${fieldName} ne peut pas dépasser ${options.maxLength} caractères`);
  }
  
  if (options.pattern && !options.pattern.test(value)) {
    errors.push(`${fieldName} ne respecte pas le format requis`);
  }
  
  return errors;
}

export function validateEmail(email: string): string[] {
  const errors: string[] = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(email)) {
    errors.push('Format d\'email invalide');
  }
  
  return errors;
}

export function validateArray(value: any[], fieldName: string, options: {
  minLength?: number;
  maxLength?: number;
  itemValidator?: (item: any) => string[];
} = {}): string[] {
  const errors: string[] = [];
  
  if (!Array.isArray(value)) {
    errors.push(`${fieldName} doit être un tableau`);
    return errors;
  }
  
  if (options.minLength && value.length < options.minLength) {
    errors.push(`${fieldName} doit contenir au moins ${options.minLength} éléments`);
  }
  
  if (options.maxLength && value.length > options.maxLength) {
    errors.push(`${fieldName} ne peut pas contenir plus de ${options.maxLength} éléments`);
  }
  
  if (options.itemValidator) {
    value.forEach((item, index) => {
      const itemErrors = options.itemValidator!(item);
      itemErrors.forEach(error => {
        errors.push(`${fieldName}[${index}]: ${error}`);
      });
    });
  }
  
  return errors;
}

// Validations spécifiques aux modèles

export function validateContenuCore(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Champs requis
  errors.push(...validateRequired(data.nom, 'nom'));
  errors.push(...validateRequired(data.idCreateur, 'idCreateur'));
  errors.push(...validateRequired(data.idLaala, 'idLaala'));
  errors.push(...validateRequired(data.type, 'type'));
  
  // Validation du nom
  if (data.nom) {
    errors.push(...validateString(data.nom, 'nom', { minLength: 1, maxLength: 200 }));
  }
  
  // Validation du type
  if (data.type && !['image', 'video', 'texte', 'album'].includes(data.type)) {
    errors.push('Type de contenu invalide (image, video, texte, album)');
  }
  
  // Validation des hashtags
  if (data.htags) {
    errors.push(...validateArray(data.htags, 'htags', { 
      maxLength: 20,
      itemValidator: (tag) => validateString(tag, 'hashtag', { minLength: 1, maxLength: 50 })
    }));
  }
  
  // Validation des personnes
  if (data.personnes) {
    errors.push(...validateArray(data.personnes, 'personnes', { maxLength: 50 }));
  }
  
  // Validation de l'URL source
  if (data.src && data.src.trim() !== '') {
    try {
      new URL(data.src);
    } catch {
      warnings.push('URL source invalide');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateLaalaCore(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Champs requis
  errors.push(...validateRequired(data.nom, 'nom'));
  errors.push(...validateRequired(data.idCreateur, 'idCreateur'));
  errors.push(...validateRequired(data.type, 'type'));
  
  // Validation du nom
  if (data.nom) {
    errors.push(...validateString(data.nom, 'nom', { minLength: 1, maxLength: 200 }));
  }
  
  // Validation du type
  if (data.type && !['public', 'prive', 'groupe'].includes(data.type)) {
    errors.push('Type de laala invalide (public, prive, groupe)');
  }
  
  // Validation de la description
  if (data.description) {
    errors.push(...validateString(data.description, 'description', { maxLength: 1000 }));
  }
  
  // Validation des hashtags
  if (data.htags) {
    errors.push(...validateArray(data.htags, 'htags', { 
      maxLength: 20,
      itemValidator: (tag) => validateString(tag, 'hashtag', { minLength: 1, maxLength: 50 })
    }));
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateUserCore(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Champs requis
  errors.push(...validateRequired(data.nom, 'nom'));
  errors.push(...validateRequired(data.prenom, 'prenom'));
  errors.push(...validateRequired(data.email, 'email'));
  errors.push(...validateRequired(data.tel, 'tel'));
  errors.push(...validateRequired(data.password, 'password'));
  errors.push(...validateRequired(data.date_de_naissance, 'date_de_naissance'));
  errors.push(...validateRequired(data.sexe, 'sexe'));
  errors.push(...validateRequired(data.pays, 'pays'));
  errors.push(...validateRequired(data.ville, 'ville'));
  errors.push(...validateRequired(data.codePays, 'codePays'));
  
  // Validation de l'email
  if (data.email) {
    errors.push(...validateEmail(data.email));
  }
  
  // Validation du sexe
  if (data.sexe && !['Masculin', 'Féminin', 'Autre'].includes(data.sexe)) {
    errors.push('Sexe invalide (Masculin, Féminin, Autre)');
  }
  
  // Validation du téléphone
  if (data.tel) {
    errors.push(...validateString(data.tel, 'tel', { 
      minLength: 8, 
      maxLength: 15,
      pattern: /^[0-9+\-\s()]+$/
    }));
  }
  
  // Validation du mot de passe
  if (data.password) {
    errors.push(...validateString(data.password, 'password', { minLength: 6 }));
  }
  
  // Validation de la date de naissance
  if (data.date_de_naissance) {
    const birthDate = new Date(data.date_de_naissance);
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();
    
    if (isNaN(birthDate.getTime())) {
      errors.push('Date de naissance invalide');
    } else if (age < 13) {
      errors.push('L\'utilisateur doit avoir au moins 13 ans');
    } else if (age > 120) {
      warnings.push('Âge inhabituel détecté');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateMessageCore(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Champs requis
  errors.push(...validateRequired(data.contenu, 'contenu'));
  errors.push(...validateRequired(data.idExpediteur, 'idExpediteur'));
  errors.push(...validateRequired(data.idDestinataire, 'idDestinataire'));
  errors.push(...validateRequired(data.type, 'type'));
  
  // Validation du contenu
  if (data.contenu) {
    errors.push(...validateString(data.contenu, 'contenu', { minLength: 1, maxLength: 2000 }));
  }
  
  // Validation du type
  if (data.type && !['text', 'image', 'video', 'audio', 'file'].includes(data.type)) {
    errors.push('Type de message invalide (text, image, video, audio, file)');
  }
  
  // Vérification que l'expéditeur et le destinataire sont différents
  if (data.idExpediteur === data.idDestinataire) {
    warnings.push('L\'expéditeur et le destinataire sont identiques');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateBoutiqueCore(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Champs requis
  errors.push(...validateRequired(data.nom, 'nom'));
  errors.push(...validateRequired(data.idProprietaire, 'idProprietaire'));
  errors.push(...validateRequired(data.categorie, 'categorie'));
  
  // Validation du nom
  if (data.nom) {
    errors.push(...validateString(data.nom, 'nom', { minLength: 1, maxLength: 200 }));
  }
  
  // Validation de la description
  if (data.description) {
    errors.push(...validateString(data.description, 'description', { maxLength: 1000 }));
  }
  
  // Validation du téléphone
  if (data.telephone) {
    errors.push(...validateString(data.telephone, 'telephone', { 
      minLength: 8, 
      maxLength: 15,
      pattern: /^[0-9+\-\s()]+$/
    }));
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Fonction utilitaire pour valider selon le type
export function validateByType(type: string, data: any): ValidationResult {
  switch (type) {
    case 'contenu':
      return validateContenuCore(data);
    case 'laala':
      return validateLaalaCore(data);
    case 'user':
      return validateUserCore(data);
    case 'message':
      return validateMessageCore(data);
    case 'boutique':
      return validateBoutiqueCore(data);
    default:
      return {
        isValid: false,
        errors: [`Type de validation inconnu: ${type}`],
        warnings: []
      };
  }
}

// Middleware de validation pour les APIs
export function createValidationMiddleware(type: string) {
  return (data: any) => {
    const result = validateByType(type, data);
    
    if (!result.isValid) {
      throw new ValidationError(result.errors);
    }
    
    if (result.warnings.length > 0) {
      console.warn('⚠️ Avertissements de validation:', result.warnings);
    }
    
    return result;
  };
}