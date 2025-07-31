import { BaseService } from '../base/BaseService';
import { CoGestionnaire } from '../../../models/co_gestionnaire';
import { COLLECTIONS } from '../../config/database';

export class CoGestionnaireService extends BaseService<CoGestionnaire> {
  constructor() {
    super(COLLECTIONS.CO_GESTIONNAIRES || 'co_gestionnaires');
  }

  // Méthodes spécifiques pour les co-gestionnaires si nécessaire
  async getByEmail(email: string): Promise<CoGestionnaire | null> {
    const results = await this.query([
      { field: 'email', operator: '==', value: email }
    ]);
    return results.length > 0 ? results[0] : null;
  }
}
