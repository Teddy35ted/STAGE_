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

  async createUserFromApprovedRequest(
    email: string, 
    temporaryPassword: string, 
    adminComment?: string
  ): Promise<string> {
    // Générer un ID unique pour l'utilisateur
    const uid = this.collection.doc().id;
    
    // Hasher le mot de passe temporaire
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    
    // Créer un utilisateur minimal avec les champs requis
    const userCore: UserCore = {
      email,
      nom: email.split('@')[0], // Nom temporaire basé sur l'email
      prenom: '', // À compléter lors de la première connexion
      tel: '', // À compléter lors de la première connexion
      password: hashedPassword,
      date_de_naissance: '', // À compléter lors de la première connexion
      sexe: 'Autre', // À compléter lors de la première connexion
      pays: '', // À compléter lors de la première connexion
      ville: '', // À compléter lors de la première connexion
      quartier: '',
      region: '',
      codePays: ''
    };

    const autoFields = generateUserAutoFields(userCore);
    const completeUser: UserDashboard = {
      ...userCore,
      ...autoFields,
      id: uid
    };

    await this.collection.doc(uid).set(completeUser);
    console.log('✅ Utilisateur créé depuis demande approuvée:', email);
    return uid;
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
