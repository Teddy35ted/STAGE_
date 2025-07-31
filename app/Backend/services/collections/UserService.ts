import { BaseService } from '../base/BaseService';
import { UserDashboard, UserCore, generateUserAutoFields } from '../../../models/user';
import { COLLECTIONS } from '../../config/database';
import * as bcrypt from 'bcryptjs';

export class UserService extends BaseService<UserDashboard> {
  constructor() {
    super(COLLECTIONS.USERS || 'users');
  }

  async createUser(userCore: UserCore, uid: string): Promise<string> {
    const autoFields = generateUserAutoFields(userCore);
    const completeUser: UserDashboard = {
      ...userCore,
      ...autoFields,
      id: uid, // Utiliser l'UID de Firebase comme ID de document
    };
    // Utiliser set avec l'UID pour garantir l'unicité
    await this.collection.doc(uid).set(completeUser);
    return uid;
  }

  async getByEmail(email: string): Promise<UserDashboard | null> {
    const results = await this.query([
      { field: 'email', operator: '==', value: email }
    ]);
    return results.length > 0 ? results[0] : null;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getCreatorInfo(creatorId: string): Promise<{ nom: string; avatar: string; iscert: boolean } | null> {
    const user = await this.getById(creatorId);
    if (!user) return null;
    return {
      nom: user.nom,
      avatar: user.avatar,
      iscert: user.iscert,
    };
  }
}
