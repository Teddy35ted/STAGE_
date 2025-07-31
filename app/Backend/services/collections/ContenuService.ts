import { BaseService } from '../base/BaseService';
import { ContenuDashboard, ContenuCore, generateContenuAutoFields } from '../../../models/contenu';
import { COLLECTIONS } from '../../config/database';

export class ContenuService extends BaseService<ContenuDashboard> {
  constructor() {
    super(COLLECTIONS.CONTENUS || 'contenus');
  }

  async createContenu(
    contenuCore: ContenuCore,
    creatorInfo: { nom: string; avatar: string; iscert: boolean },
    position: number = 1
  ): Promise<string> {
    const autoFields = generateContenuAutoFields(contenuCore, creatorInfo, position);
    const completeContenu: ContenuDashboard = {
      ...contenuCore,
      ...autoFields,
    };
    return this.create(completeContenu);
  }

  async getByLaala(laalaId: string): Promise<ContenuDashboard[]> {
    return this.query([
      { field: 'idLaala', operator: '==', value: laalaId }
    ], { orderBy: 'position', orderDirection: 'asc' });
  }
}
