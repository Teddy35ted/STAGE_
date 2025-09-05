import { BaseService } from '../base/BaseService';
import { UserDashboard, UserCore, generateUserAutoFields } from '../../../models/user';
import { COLLECTIONS } from '../../config/database';
import { QueryFilter, PaginationOptions } from '../base/BaseService';
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

  // Override de la méthode create pour hasher automatiquement les mots de passe
  async create(data: Partial<UserDashboard>): Promise<string> {
    try {
      console.log('🔐 UserService.create() - Hashage du mot de passe...');
      
      // Si un mot de passe est fourni, le hasher
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data = { ...data, password: hashedPassword };
        console.log('✅ Mot de passe hashé avec succès');
      }
      
      // Appeler la méthode create du parent
      return await super.create(data);
    } catch (error) {
      console.error('❌ Erreur UserService.create():', error);
      throw error;
    }
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

  /**
   * Créer un utilisateur avec mot de passe temporaire (ancien système direct)
   */
  async createUserWithTemporaryPassword(
    email: string, 
    temporaryPassword: string
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
      id: uid,
      requiresPasswordChange: true // Marquer que l'utilisateur doit changer son mot de passe
    };

    await this.collection.doc(uid).set(completeUser);
    console.log('✅ Utilisateur créé avec mot de passe temporaire (ancien système):', email);
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

  async searchUsers(searchTerm: string, options: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}): Promise<UserDashboard[]> {
    try {
      console.log(`🔍 Recherche utilisateurs avec terme: "${searchTerm}"`);
      
      // Nettoyer le terme de recherche
      const cleanTerm = searchTerm.toLowerCase().trim();
      
      if (!cleanTerm) {
        console.log('⚠️ Terme de recherche vide, récupération de tous les utilisateurs');
        return this.getAll(options);
      }

      // Récupérer tous les utilisateurs (limitation Firestore pour recherche textuelle)
      const allUsers = await this.getAll({ ...options, limit: 1000 }); // Limite haute pour récupération
      
      // Filtrer côté client (à cause des limitations Firestore)
      const filteredUsers = allUsers.filter(user => {
        const searchableFields = [
          user.nom?.toLowerCase() || '',
          user.prenom?.toLowerCase() || '',
          user.email?.toLowerCase() || '',
          user.tel?.toLowerCase() || '',
          user.ville?.toLowerCase() || '',
          user.pays?.toLowerCase() || '',
          user.region?.toLowerCase() || '',
          user.quartier?.toLowerCase() || ''
        ];
        
        // Vérifier si le terme de recherche correspond à l'un des champs
        return searchableFields.some(field => 
          field.includes(cleanTerm) || 
          cleanTerm.includes(field)
        );
      });

      // Appliquer la pagination sur les résultats filtrés
      const startIndex = options.offset || 0;
      const endIndex = startIndex + (options.limit || 50);
      const paginatedResults = filteredUsers.slice(startIndex, endIndex);

      console.log(`✅ Recherche terminée: ${filteredUsers.length} résultats trouvés, ${paginatedResults.length} retournés`);
      
      return paginatedResults;
      
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      throw error;
    }
  }

  async getUsersWithFilters(filters: {
    pays?: string;
    ville?: string;
    region?: string;
    sexe?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  }, options: PaginationOptions = {}): Promise<UserDashboard[]> {
    try {
      console.log('🔍 Recherche utilisateurs avec filtres:', filters);
      
      const queryFilters: QueryFilter[] = [];
      
      // Construire les filtres Firestore
      if (filters.pays) {
        queryFilters.push({ field: 'pays', operator: '==', value: filters.pays });
      }
      if (filters.ville) {
        queryFilters.push({ field: 'ville', operator: '==', value: filters.ville });
      }
      if (filters.region) {
        queryFilters.push({ field: 'region', operator: '==', value: filters.region });
      }
      if (filters.sexe) {
        queryFilters.push({ field: 'sexe', operator: '==', value: filters.sexe });
      }
      if (filters.isActive !== undefined) {
        queryFilters.push({ field: 'isdesactive', operator: '==', value: !filters.isActive });
      }
      
      // Filtres par date (si fournis)
      if (filters.startDate) {
        queryFilters.push({ field: 'registerDate', operator: '>=', value: filters.startDate });
      }
      if (filters.endDate) {
        queryFilters.push({ field: 'registerDate', operator: '<=', value: filters.endDate });
      }

      const results = await this.query(queryFilters, options);
      
      console.log(`✅ ${results.length} utilisateurs trouvés avec filtres`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Erreur recherche avec filtres:', error);
      throw error;
    }
  }

  async getUserStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCountry: Record<string, number>;
    byGender: Record<string, number>;
    recentUsers: number; // Utilisateurs créés dans les 30 derniers jours
  }> {
    try {
      console.log('📊 Calcul des statistiques utilisateurs...');
      
      const allUsers = await this.getAll({ limit: 10000 }); // Limite haute pour stats
      
      const total = allUsers.length;
      const active = allUsers.filter(user => !user.isdesactive).length;
      const inactive = total - active;
      
      // Statistiques par pays
      const byCountry: Record<string, number> = {};
      allUsers.forEach(user => {
        const country = user.pays || 'Non spécifié';
        byCountry[country] = (byCountry[country] || 0) + 1;
      });
      
      // Statistiques par genre
      const byGender: Record<string, number> = {};
      allUsers.forEach(user => {
        const gender = user.sexe || 'Non spécifié';
        byGender[gender] = (byGender[gender] || 0) + 1;
      });
      
      // Utilisateurs récents (30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      const recentUsers = allUsers.filter(user => {
        if (!user.registerDate) return false;
        return user.registerDate >= thirtyDaysAgoString;
      }).length;
      
      const stats = {
        total,
        active,
        inactive,
        byCountry,
        byGender,
        recentUsers
      };
      
      console.log('✅ Statistiques calculées:', stats);
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
      throw error;
    }
  }

  // ========== GESTION MOTS DE PASSE TEMPORAIRES ET COMPLÉTION PROFIL ==========

  async markAsRequirePasswordChange(userId: string): Promise<void> {
    try {
      await this.update(userId, {
        requiresPasswordChange: true,
        firstLogin: true
      });
      console.log('✅ Utilisateur marqué pour changement de mot de passe:', userId);
    } catch (error) {
      console.error('❌ Erreur marquage changement mot de passe:', error);
      throw error;
    }
  }

  async changeTemporaryPassword(
    userId: string, 
    newPassword: string
  ): Promise<void> {
    try {
      console.log('🔑 Changement du mot de passe temporaire pour:', userId);
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await this.update(userId, {
        password: hashedPassword,
        requiresPasswordChange: false,
        passwordChangedAt: new Date().toISOString()
      });
      
      console.log('✅ Mot de passe temporaire changé avec succès');
    } catch (error) {
      console.error('❌ Erreur changement mot de passe temporaire:', error);
      throw error;
    }
  }

  async completeProfile(
    userId: string, 
    profileData: {
      nom?: string;
      prenom?: string;
      tel?: string;
      date_de_naissance?: string;
      sexe?: 'Masculin' | 'Féminin' | 'Autre';
      pays?: string;
      ville?: string;
      quartier?: string;
      region?: string;
      codePays?: string;
    }
  ): Promise<void> {
    try {
      console.log('👤 Complétion du profil pour:', userId);
      
      const updateData = {
        ...profileData,
        firstLogin: false,
        profileCompleted: true,
        profileCompletedAt: new Date().toISOString(),
        updatedAt: new Date()
      };
      
      await this.update(userId, updateData);
      
      console.log('✅ Profil complété avec succès');
    } catch (error) {
      console.error('❌ Erreur complétion profil:', error);
      throw error;
    }
  }

  async isFirstLogin(userId: string): Promise<boolean> {
    try {
      const user = await this.getById(userId);
      return user?.firstLogin === true || user?.requiresPasswordChange === true;
    } catch (error) {
      console.error('❌ Erreur vérification premier login:', error);
      return false;
    }
  }

  async needsProfileCompletion(userId: string): Promise<boolean> {
    try {
      const user = await this.getById(userId);
      if (!user) return false;
      
      // Vérifier si les champs essentiels sont remplis
      const requiredFields = ['nom', 'prenom', 'tel', 'pays'];
      const missingFields = requiredFields.filter(field => 
        !user[field as keyof UserDashboard] || 
        (user[field as keyof UserDashboard] as string)?.trim() === ''
      );
      
      return missingFields.length > 0 || !user.profileCompleted;
    } catch (error) {
      console.error('❌ Erreur vérification complétion profil:', error);
      return true; // En cas d'erreur, considérer qu'il faut compléter
    }
  }

  async authenticateWithTemporaryPassword(
    email: string, 
    password: string
  ): Promise<{ user: UserDashboard; requiresPasswordChange: boolean; requiresProfileCompletion: boolean } | null> {
    try {
      console.log('🔐 Authentification avec potentiel mot de passe temporaire:', email);
      
      const user = await this.getByEmail(email);
      if (!user) {
        console.log('❌ Utilisateur non trouvé');
        return null;
      }
      
      const isValidPassword = await this.verifyPassword(password, user.password);
      if (!isValidPassword) {
        console.log('❌ Mot de passe incorrect');
        return null;
      }
      
      const requiresPasswordChange = user.requiresPasswordChange === true;
      const requiresProfileCompletion = await this.needsProfileCompletion(user.id!);
      
      console.log('✅ Authentification réussie:', {
        requiresPasswordChange,
        requiresProfileCompletion
      });
      
      return {
        user,
        requiresPasswordChange,
        requiresProfileCompletion
      };
      
    } catch (error) {
      console.error('❌ Erreur authentification mot de passe temporaire:', error);
      throw error;
    }
  }
}
