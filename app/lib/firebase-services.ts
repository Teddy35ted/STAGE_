// ===== SERVICES FIREBASE POUR LES MODÈLES =====
// Services intégrés Firebase pour User, Laala, Contenu

import { adminDb, COLLECTIONS, dbUtils } from '../Backend/config/firebase-admin';
import { 
  UserCore, 
  UserDashboard, 
  LaalaCore, 
  LaalaDashboard, 
  ContenuCore, 
  ContenuDashboard,
  UserService,
  LaalaService,
  ContenuService
} from '../models';

// ===== SERVICE FIREBASE UTILISATEURS =====
export class FirebaseUserService {
  private static collection = adminDb.collection(COLLECTIONS.USERS);

  /**
   * Crée un utilisateur en base de données
   */
  static async createUser(userData: UserCore): Promise<{ id: string; user: UserDashboard }> {
    try {
      // Création du modèle complet
      const completeUser = await UserService.createUser(userData);
      
      // Sauvegarde en Firestore
      const docRef = await this.collection.add({
        ...completeUser,
        createdAt: dbUtils.timestamp(),
        updatedAt: dbUtils.timestamp()
      });

      // Mise à jour avec l'ID Firestore
      const finalUser = { ...completeUser, id: docRef.id };
      await docRef.update({ id: docRef.id });

      console.log(`✅ Utilisateur créé: ${finalUser.nom} ${finalUser.prenom} (${docRef.id})`);
      return { id: docRef.id, user: finalUser };
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupère un utilisateur par ID
   */
  static async getUserById(id: string): Promise<UserDashboard | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      
      return { id: doc.id, ...doc.data() } as UserDashboard;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les utilisateurs avec pagination
   */
  static async getUsers(limit: number = 20, offset: number = 0): Promise<UserDashboard[]> {
    try {
      const snapshot = await this.collection
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserDashboard[];
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Met à jour les métriques d'un utilisateur
   */
  static async updateUserMetrics(
    userId: string, 
    metrics: { balance?: number; kouri?: number; newFan?: string; newFriend?: string }
  ): Promise<void> {
    try {
      const userDoc = await this.collection.doc(userId).get();
      if (!userDoc.exists) throw new Error('Utilisateur non trouvé');

      const currentUser = userDoc.data() as UserDashboard;
      const updatedUser = UserService.updateUserMetrics(currentUser, metrics);

      await this.collection.doc(userId).update({
        ...updatedUser,
        updatedAt: dbUtils.timestamp()
      });

      console.log(`✅ Métriques utilisateur mises à jour: ${userId}`);
    } catch (error) {
      console.error('❌ Erreur mise à jour métriques utilisateur:', error);
      throw error;
    }
  }

  /**
   * Recherche d'utilisateurs
   */
  static async searchUsers(filters: {
    pays?: string;
    ville?: string;
    iscert?: boolean;
    isconnect?: boolean;
  }): Promise<UserDashboard[]> {
    try {
      let query: any = this.collection;

      if (filters.pays) {
        query = query.where('pays', '==', filters.pays);
      }
      if (filters.ville) {
        query = query.where('ville', '==', filters.ville);
      }
      if (filters.iscert !== undefined) {
        query = query.where('iscert', '==', filters.iscert);
      }
      if (filters.isconnect !== undefined) {
        query = query.where('isconnect', '==', filters.isconnect);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as UserDashboard[];
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      throw error;
    }
  }
}

// ===== SERVICE FIREBASE LAALAS =====
export class FirebaseLaalaService {
  private static collection = adminDb.collection(COLLECTIONS.LAALAS);

  /**
   * Crée un Laala en base de données
   */
  static async createLaala(
    laalaData: LaalaCore, 
    creatorInfo: { nom: string; avatar: string; iscert: boolean }
  ): Promise<{ id: string; laala: LaalaDashboard }> {
    try {
      // Création du modèle complet
      const completeLaala = await LaalaService.createLaala(laalaData, creatorInfo);
      
      // Sauvegarde en Firestore
      const docRef = await this.collection.add({
        ...completeLaala,
        createdAt: dbUtils.timestamp(),
        updatedAt: dbUtils.timestamp()
      });

      // Mise à jour avec l'ID Firestore
      const finalLaala = { ...completeLaala, id: docRef.id };
      await docRef.update({ id: docRef.id });

      console.log(`✅ Laala créé: ${finalLaala.nom} (${docRef.id})`);
      return { id: docRef.id, laala: finalLaala };
    } catch (error) {
      console.error('❌ Erreur création Laala:', error);
      throw error;
    }
  }

  /**
   * Récupère un Laala par ID
   */
  static async getLaalaById(id: string): Promise<LaalaDashboard | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      
      return { id: doc.id, ...doc.data() } as LaalaDashboard;
    } catch (error) {
      console.error('❌ Erreur récupération Laala:', error);
      throw error;
    }
  }

  /**
   * Récupère les Laalas d'un créateur
   */
  static async getLaalasByCreator(creatorId: string): Promise<LaalaDashboard[]> {
    try {
      const snapshot = await this.collection
        .where('idCreateur', '==', creatorId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LaalaDashboard[];
    } catch (error) {
      console.error('❌ Erreur récupération Laalas créateur:', error);
      throw error;
    }
  }

  /**
   * Met à jour les métriques d'un Laala
   */
  static async updateLaalaMetrics(
    laalaId: string,
    metrics: { newView?: string; newLike?: string; newContenu?: string; newParticipant?: string }
  ): Promise<void> {
    try {
      const laalaDoc = await this.collection.doc(laalaId).get();
      if (!laalaDoc.exists) throw new Error('Laala non trouvé');

      const currentLaala = laalaDoc.data() as LaalaDashboard;
      const updatedLaala = LaalaService.updateLaalaMetrics(currentLaala, metrics);

      await this.collection.doc(laalaId).update({
        ...updatedLaala,
        updatedAt: dbUtils.timestamp()
      });

      console.log(`✅ Métriques Laala mises à jour: ${laalaId}`);
    } catch (error) {
      console.error('❌ Erreur mise à jour métriques Laala:', error);
      throw error;
    }
  }

  /**
   * Récupère les Laalas populaires
   */
  static async getPopularLaalas(limit: number = 10): Promise<LaalaDashboard[]> {
    try {
      const snapshot = await this.collection
        .where('encours', '==', true)
        .orderBy('vues', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LaalaDashboard[];
    } catch (error) {
      console.error('❌ Erreur récupération Laalas populaires:', error);
      throw error;
    }
  }
}

// ===== SERVICE FIREBASE CONTENUS =====
export class FirebaseContenuService {
  private static collection = adminDb.collection(COLLECTIONS.CONTENUS);

  /**
   * Crée un contenu en base de données
   */
  static async createContenu(
    contenuData: ContenuCore,
    creatorInfo: { nom: string; avatar: string; iscert: boolean },
    position: number = 1
  ): Promise<{ id: string; contenu: ContenuDashboard }> {
    try {
      // Création du modèle complet
      const completeContenu = await ContenuService.createContenu(contenuData, creatorInfo, position);
      
      // Sauvegarde en Firestore
      const docRef = await this.collection.add({
        ...completeContenu,
        createdAt: dbUtils.timestamp(),
        updatedAt: dbUtils.timestamp()
      });

      // Mise à jour avec l'ID Firestore
      const finalContenu = { ...completeContenu, id: docRef.id };
      await docRef.update({ id: docRef.id });

      console.log(`✅ Contenu créé: ${finalContenu.nom} (${docRef.id})`);
      return { id: docRef.id, contenu: finalContenu };
    } catch (error) {
      console.error('❌ Erreur création contenu:', error);
      throw error;
    }
  }

  /**
   * Récupère les contenus d'un Laala
   */
  static async getContenusByLaala(laalaId: string): Promise<ContenuDashboard[]> {
    try {
      const snapshot = await this.collection
        .where('idLaala', '==', laalaId)
        .orderBy('position', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContenuDashboard[];
    } catch (error) {
      console.error('❌ Erreur récupération contenus Laala:', error);
      throw error;
    }
  }

  /**
   * Met à jour les métriques d'un contenu
   */
  static async updateContenuMetrics(
    contenuId: string,
    metrics: { newView?: string; newLike?: string; newComment?: any }
  ): Promise<void> {
    try {
      const contenuDoc = await this.collection.doc(contenuId).get();
      if (!contenuDoc.exists) throw new Error('Contenu non trouvé');

      const currentContenu = contenuDoc.data() as ContenuDashboard;
      const updatedContenu = ContenuService.updateContenuMetrics(currentContenu, metrics);

      await this.collection.doc(contenuId).update({
        ...updatedContenu,
        updatedAt: dbUtils.timestamp()
      });

      console.log(`✅ Métriques contenu mises à jour: ${contenuId}`);
    } catch (error) {
      console.error('❌ Erreur mise à jour métriques contenu:', error);
      throw error;
    }
  }

  /**
   * Récupère les contenus récents
   */
  static async getRecentContenus(limit: number = 20): Promise<ContenuDashboard[]> {
    try {
      const snapshot = await this.collection
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContenuDashboard[];
    } catch (error) {
      console.error('❌ Erreur récupération contenus récents:', error);
      throw error;
    }
  }
}

// ===== SERVICE DASHBOARD FIREBASE =====
export class FirebaseDashboardService {
  /**
   * Calcule les statistiques globales depuis Firebase
   */
  static async getGlobalStats() {
    try {
      const [usersSnapshot, laalasSnapshot, contenusSnapshot] = await Promise.all([
        adminDb.collection(COLLECTIONS.USERS).get(),
        adminDb.collection(COLLECTIONS.LAALAS).get(),
        adminDb.collection(COLLECTIONS.CONTENUS).get()
      ]);

      const users = usersSnapshot.docs.map(doc => doc.data()) as UserDashboard[];
      const laalas = laalasSnapshot.docs.map(doc => doc.data()) as LaalaDashboard[];
      const contenus = contenusSnapshot.docs.map(doc => doc.data()) as ContenuDashboard[];

      return {
        users: {
          total: users.length,
          active: users.filter(u => u.isconnect).length,
          certified: users.filter(u => u.iscert).length,
          newThisMonth: users.filter(u => {
            const registerDate = new Date(u.registerDate);
            const thisMonth = new Date();
            thisMonth.setDate(1);
            return registerDate >= thisMonth;
          }).length
        },
        laalas: {
          total: laalas.length,
          active: laalas.filter(l => l.encours).length,
          completed: laalas.filter(l => !l.encours).length,
          totalViews: laalas.reduce((sum, l) => sum + l.vues, 0),
          totalLikes: laalas.reduce((sum, l) => sum + l.likes, 0)
        },
        contenus: {
          total: contenus.length,
          images: contenus.filter(c => c.type === 'image').length,
          videos: contenus.filter(c => c.type === 'video').length,
          texts: contenus.filter(c => c.type === 'texte').length,
          totalViews: contenus.reduce((sum, c) => sum + c.vues, 0),
          totalLikes: contenus.reduce((sum, c) => sum + c.likes, 0)
        }
      };
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
      throw error;
    }
  }

  /**
   * Initialise des données de test
   */
  static async initializeTestData() {
    try {
      console.log('🚀 Initialisation des données de test...');

      // Créer un utilisateur de test
      const testUser = await FirebaseUserService.createUser({
        nom: "TEST",
        prenom: "Dashboard",
        email: "test@dashboard.com",
        tel: "12345678",
        password: "test123",
        date_de_naissance: "1990-01-01",
        sexe: "Masculin",
        pays: "Togo",
        ville: "Lomé",
        codePays: "+228"
      });

      // Créer un Laala de test
      const testLaala = await FirebaseLaalaService.createLaala({
        nom: "Mon Premier Laala",
        description: "Ceci est un Laala de test pour le dashboard",
        type: "Laala freestyle",
        categorie: "Test",
        idCreateur: testUser.id,
        isLaalaPublic: true,
        ismonetise: false,
        choosetext: true,
        chooseimg: true,
        choosevideo: false,
        chooselive: false
      }, {
        nom: testUser.user.nom,
        avatar: testUser.user.avatar,
        iscert: testUser.user.iscert
      });

      // Créer un contenu de test
      await FirebaseContenuService.createContenu({
        nom: "Premier Contenu",
        idCreateur: testUser.id,
        idLaala: testLaala.id,
        type: "texte",
        allowComment: true,
        htags: ["#test", "#dashboard"],
        personnes: []
      }, {
        nom: testUser.user.nom,
        avatar: testUser.user.avatar,
        iscert: testUser.user.iscert
      });

      console.log('✅ Données de test initialisées avec succès');
      return {
        userId: testUser.id,
        laalaId: testLaala.id,
        message: 'Données de test créées avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur initialisation données de test:', error);
      throw error;
    }
  }
}