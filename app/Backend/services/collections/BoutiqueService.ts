import { BaseService } from '../base/BaseService';
import { Boutique } from '../../../models/boutiques';
import { COLLECTIONS } from '../../config/database';

export class BoutiqueService extends BaseService<Boutique> {
  constructor() {
    super(COLLECTIONS.BOUTIQUES || 'boutiques');
  }

  // Méthodes spécifiques pour les boutiques si nécessaire
  async getByProprietaire(proprietaireId: string): Promise<Boutique[]> {
    return this.query([
      { field: 'idCompte', operator: '==', value: proprietaireId }
    ]);
  }
}
