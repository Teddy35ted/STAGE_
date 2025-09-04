// Service pour générer des mots de passe temporaires sécurisés
import crypto from 'crypto';

export class PasswordGeneratorService {
  /**
   * Générer un mot de passe temporaire sécurisé
   */
  static generateTemporaryPassword(length: number = 12): string {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    // Assurer qu'il y a au moins une majuscule, une minuscule et un chiffre
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpper || !hasLower || !hasNumber) {
      // Régénérer si les critères ne sont pas respectés
      return this.generateTemporaryPassword(length);
    }
    
    return password;
  }

  /**
   * Générer un mot de passe avec format personnalisé
   */
  static generateFormattedPassword(): string {
    const adjectives = ['Secure', 'Quick', 'Smart', 'Fast', 'Safe', 'Easy'];
    const nouns = ['Access', 'Login', 'Pass', 'Key', 'Entry', 'Code'];
    const numbers = crypto.randomInt(100, 999);
    
    const adjective = adjectives[crypto.randomInt(0, adjectives.length)];
    const noun = nouns[crypto.randomInt(0, nouns.length)];
    
    return `${adjective}${noun}${numbers}`;
  }
}
