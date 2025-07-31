import { BaseService } from '../base/BaseService';
import { Retrait } from '../../../models/retrait';
import { COLLECTIONS } from '../../config/database';

export class RetraitService extends BaseService<Retrait> {
  constructor() {
    super(COLLECTIONS.RETRAITS || 'retraits');
  }

  async getByCompte(compteId: string): Promise<Retrait[]> {
    return this.query([
      { field: 'idcompte', operator: '==', value: compteId }
    ], { orderBy: 'date', orderDirection: 'desc' });
  }
}
