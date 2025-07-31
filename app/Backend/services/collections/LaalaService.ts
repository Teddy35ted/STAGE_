import { BaseService } from '../base/BaseService';
import { LaalaDashboard, LaalaCore, generateLaalaAutoFields } from '../../../models/laala';
import { COLLECTIONS } from '../../config/database';

export class LaalaService extends BaseService<LaalaDashboard> {
  constructor() {
    super(COLLECTIONS.LAALAS || 'laalas');
  }

  async createLaala(
    laalaCore: LaalaCore,
    creatorInfo: { nom: string; avatar: string; iscert: boolean }
  ): Promise<string> {
    const autoFields = generateLaalaAutoFields(laalaCore, creatorInfo);
    const completeLaala: LaalaDashboard = {
      ...laalaCore,
      ...autoFields,
    };
    return this.create(completeLaala);
  }

  async getByCreator(creatorId: string): Promise<LaalaDashboard[]> {
    return this.query([
      { field: 'idCreateur', operator: '==', value: creatorId }
    ], { orderBy: 'date', orderDirection: 'desc' });
  }
}
