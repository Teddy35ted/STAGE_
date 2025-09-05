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
}
