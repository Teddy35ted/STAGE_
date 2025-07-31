import { BaseService } from '../base/BaseService';
import { ValidationMessageT } from '../../../models/message';
import { COLLECTIONS } from '../../config/database';

export class MessageService extends BaseService<ValidationMessageT> {
  constructor() {
    super(COLLECTIONS.MESSAGES || 'messages');
  }

  async getConversation(senderId: string, receiverId: string): Promise<ValidationMessageT | null> {
    const results = await this.query([
      { field: 'chateurs', operator: 'array-contains', value: senderId }
    ]);
    return results.find(conv => conv.chateurs?.includes(receiverId)) || null;
  }
}
