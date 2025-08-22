// ===== SERVICES DE GESTION DES MODÈLES =====
// Services pour la création et gestion automatique des données

import { 
  UserCore, 
  UserDashboard, 
  generateUserAutoFields,
  LaalaCore,
  LaalaDashboard,
  generateLaalaAutoFields,
  generateDefaultCover,
  ContenuCore,
  ContenuDashboard,
  generateContenuAutoFields
} from './index';

// ===== SERVICE UTILISATEUR =====
export class UserService {
  /**
   * Crée un utilisateur complet à partir des données essentielles
   */
  static async createUser(userData: UserCore): Promise<UserDashboard> {
    // Validation des données essentielles
    this.validateUserCore(userData);
    
    // Génération des champs automatiques
    const autoFields = generateUserAutoFields(userData);
    
    // Combinaison des données
    const completeUser: UserDashboard = {
      ...userData,
      ...autoFields
    };
    
    return completeUser;
  }
  
  /**
   * Met à jour les métriques d'un utilisateur
   */
  static updateUserMetrics(
    user: UserDashboard, 
    metrics: {
      balance?: number;
      kouri?: number;
      newFan?: string;
      newFriend?: string;
    }
  ): UserDashboard {
    const updatedUser = { ...user };
    
    if (metrics.balance !== undefined) {
      updatedUser.balance = metrics.balance;
    }
    
    if (metrics.kouri !== undefined) {
      updatedUser.kouri = metrics.kouri;
    }
    
    if (metrics.newFan) {
      updatedUser.fan = [...updatedUser.fan, metrics.newFan];
    }
    
    if (metrics.newFriend) {
      updatedUser.friend = [...updatedUser.friend, metrics.newFriend];
    }
    
    return updatedUser;
  }
  
  private static validateUserCore(userData: UserCore): void {
    const required = ['nom', 'prenom', 'email', 'tel', 'password', 'pays', 'ville'];
    
    for (const field of required) {
      if (!userData[field as keyof UserCore]) {
        throw new Error(`Le champ ${field} est requis`);
      }
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userData.email && !emailRegex.test(userData.email)) {
      throw new Error('Format email invalide');
    }
    
    // Validation téléphone
    if (userData.tel.length < 8) {
      throw new Error('Numéro de téléphone invalide');
    }
  }
}

// ===== SERVICE LAALA =====
export class LaalaService {
  /**
   * Crée un Laala complet à partir des données essentielles
   */
  static async createLaala(
    laalaData: LaalaCore, 
    creatorInfo: { nom: string; avatar: string; iscert: boolean }
  ): Promise<LaalaDashboard> {
    // Validation des données essentielles
    this.validateLaalaCore(laalaData);
    
    // S'assurer qu'un cover est défini
    const laalaWithCover = {
      ...laalaData,
      cover: laalaData.cover || generateDefaultCover()
    };
    
    // Génération des champs automatiques
    const autoFields = generateLaalaAutoFields(laalaWithCover, creatorInfo);
    
    // Combinaison des données
    const completeLaala: LaalaDashboard = {
      ...laalaWithCover,
      ...autoFields
    };
    
    return completeLaala;
  }
  
  /**
   * Met à jour les métriques d'un Laala
   */
  static updateLaalaMetrics(
    laala: LaalaDashboard,
    metrics: {
      newView?: string; // ID utilisateur
      newLike?: string; // ID utilisateur
      newContenu?: string; // ID contenu
      newParticipant?: string; // ID participant
    }
  ): LaalaDashboard {
    const updatedLaala = { ...laala };
    
    if (metrics.newView) {
      updatedLaala.vues += 1;
    }
    
    if (metrics.newLike) {
      if (!updatedLaala.tablikes.includes(metrics.newLike)) {
        updatedLaala.tablikes = [...updatedLaala.tablikes, metrics.newLike];
        updatedLaala.likes = updatedLaala.tablikes.length;
      }
    }
    
    if (metrics.newContenu) {
      updatedLaala.contenues = [...updatedLaala.contenues, metrics.newContenu];
    }
    
    if (metrics.newParticipant) {
      if (!updatedLaala.idparticipants.includes(metrics.newParticipant)) {
        updatedLaala.idparticipants = [...updatedLaala.idparticipants, metrics.newParticipant];
      }
    }
    
    return updatedLaala;
  }
  
  /**
   * Change le statut d'un Laala
   */
  static updateLaalaStatus(
    laala: LaalaDashboard,
    status: { encours?: boolean; alaune?: boolean; isSignaler?: boolean }
  ): LaalaDashboard {
    return {
      ...laala,
      ...status
    };
  }
  
  private static validateLaalaCore(laalaData: LaalaCore): void {
    const required = ['nom', 'description', 'idCreateur', 'type', 'categorie'];
    
    for (const field of required) {
      if (!laalaData[field as keyof LaalaCore]) {
        throw new Error(`Le champ ${field} est requis pour le Laala`);
      }
    }
    
    // Validation du type
    const validTypes = ['Laala freestyle', 'Laala planifié', 'Laala groupe', 'Laala personnel'];
    if (!validTypes.includes(laalaData.type)) {
      throw new Error('Type de Laala invalide');
    }
  }
}

// ===== SERVICE CONTENU =====
export class ContenuService {
  /**
   * Crée un contenu complet à partir des données essentielles
   */
  static async createContenu(
    contenuData: ContenuCore,
    creatorInfo: { nom: string; avatar: string; iscert: boolean },
    position: number = 1
  ): Promise<ContenuDashboard> {
    // Validation des données essentielles
    this.validateContenuCore(contenuData);
    
    // Génération des champs automatiques
    const autoFields = generateContenuAutoFields(contenuData, creatorInfo, position);
    
    // Combinaison des données
    const completeContenu: ContenuDashboard = {
      ...contenuData,
      ...autoFields
    };
    
    return completeContenu;
  }
  
  /**
   * Met à jour les métriques d'un contenu
   */
  static updateContenuMetrics(
    contenu: ContenuDashboard,
    metrics: {
      newView?: string; // ID utilisateur
      newLike?: string; // ID utilisateur
      newComment?: any; // Objet commentaire
    }
  ): ContenuDashboard {
    const updatedContenu = { ...contenu };
    
    if (metrics.newView) {
      if (!updatedContenu.tabvues.includes(metrics.newView)) {
        updatedContenu.tabvues = [...updatedContenu.tabvues, metrics.newView];
        updatedContenu.vues = updatedContenu.tabvues.length;
      }
    }
    
    if (metrics.newLike) {
      if (!updatedContenu.tablikes.includes(metrics.newLike)) {
        updatedContenu.tablikes = [...updatedContenu.tablikes, metrics.newLike];
        updatedContenu.likes = updatedContenu.tablikes.length;
      }
    }
    
    if (metrics.newComment) {
      updatedContenu.commentaires = [...updatedContenu.commentaires, metrics.newComment];
    }
    
    return updatedContenu;
  }
  
  private static validateContenuCore(contenuData: ContenuCore): void {
    const required = ['nom', 'idCreateur', 'idLaala', 'type'];
    
    for (const field of required) {
      if (!contenuData[field as keyof ContenuCore]) {
        throw new Error(`Le champ ${field} est requis pour le contenu`);
      }
    }
    
    // Validation du type
    const validTypes = ['image', 'video', 'texte', 'album'];
    if (!validTypes.includes(contenuData.type)) {
      throw new Error('Type de contenu invalide');
    }
    
    // Validation src pour certains types
    if (['image', 'video'].includes(contenuData.type) && !contenuData.src) {
      throw new Error(`Le champ src est requis pour le type ${contenuData.type}`);
    }
  }
}

// ===== SERVICE DASHBOARD =====
export class DashboardService {
  /**
   * Calcule les statistiques globales du dashboard
   */
  static calculateGlobalStats(data: {
    users: UserDashboard[];
    laalas: LaalaDashboard[];
    contenus: ContenuDashboard[];
  }) {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return {
      users: {
        total: data.users.length,
        active: data.users.filter(u => u.isconnect).length,
        certified: data.users.filter(u => u.iscert).length,
        newThisMonth: data.users.filter(u => 
          new Date(u.registerDate) >= thisMonth
        ).length
      },
      laalas: {
        total: data.laalas.length,
        active: data.laalas.filter(l => l.encours).length,
        completed: data.laalas.filter(l => !l.encours).length,
        totalViews: data.laalas.reduce((sum, l) => sum + l.vues, 0),
        totalLikes: data.laalas.reduce((sum, l) => sum + l.likes, 0)
      },
      contenus: {
        total: data.contenus.length,
        images: data.contenus.filter(c => c.type === 'image').length,
        videos: data.contenus.filter(c => c.type === 'video').length,
        texts: data.contenus.filter(c => c.type === 'texte').length,
        totalViews: data.contenus.reduce((sum, c) => sum + c.vues, 0),
        totalLikes: data.contenus.reduce((sum, c) => sum + c.likes, 0)
      },
      engagement: {
        dailyActiveUsers: data.users.filter(u => u.isconnect).length,
        avgSessionTime: 0, // À calculer selon la logique métier
        contentCreationRate: data.contenus.filter(c => 
          new Date(c.date) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
        ).length,
        interactionRate: this.calculateInteractionRate(data.contenus)
      }
    };
  }
  
  /**
   * Calcule le taux d'interaction
   */
  private static calculateInteractionRate(contenus: ContenuDashboard[]): number {
    if (contenus.length === 0) return 0;
    
    const totalInteractions = contenus.reduce((sum, c) => 
      sum + c.likes + c.commentaires.length, 0
    );
    const totalViews = contenus.reduce((sum, c) => sum + c.vues, 0);
    
    return totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;
  }
  
  /**
   * Génère des données de test pour le dashboard
   */
  static generateTestData() {
    // Données de test pour développement
    const testUser: UserCore = {
      nom: "TEST",
      prenom: "Utilisateur",
      email: "test@example.com",
      tel: "12345678",
      password: "test123",
      date_de_naissance: "1990-01-01",
      sexe: "Masculin",
      pays: "Togo",
      ville: "Lomé",
      codePays: "+228"
    };
    
    const testLaala: LaalaCore = {
      nom: "Test Laala",
      description: "Description de test",
      type: "Laala freestyle",
      categorie: "Test",
      idCreateur: "test123",
      isLaalaPublic: true,
      ismonetise: false,
      choosetext: true,
      chooseimg: true,
      choosevideo: false,
      chooselive: false
    };
    
    const testContenu: ContenuCore = {
      nom: "Test Contenu",
      idCreateur: "test123",
      idLaala: "testlaala123",
      type: "texte",
      allowComment: true,
      htags: ["#test"],
      personnes: []
    };
    
    return { testUser, testLaala, testContenu };
  }
}

// ===== UTILITAIRES =====
export class ModelUtils {
  /**
   * Génère un ID unique
   */
  static generateId(prefix: string = ""): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${prefix}${timestamp}${random}`;
  }
  
  /**
   * Formate une date pour l'affichage
   */
  static formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }
  
  /**
   * Calcule l'âge à partir d'une date de naissance
   */
  static calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
  
  /**
   * Valide un format d'email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Nettoie et formate un nom d'utilisateur
   */
  static formatUsername(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, '');
  }
}