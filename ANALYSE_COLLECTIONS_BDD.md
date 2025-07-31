# 📊 ANALYSE DES COLLECTIONS BASE DE DONNÉES - DASHBOARD ANIMATEUR PRO

## 🎯 ANALYSE DU CAHIER DES CHARGES

### Contexte : Dashboard pour Animateurs Professionnels
- Gestion complète du profil et des activités
- Monétisation des contenus et laalas
- Système de fans/friends et communauté
- Publicités et statistiques avancées
- Notifications et communications

---

## 🗄️ COLLECTIONS IDENTIFIÉES

### 1. 👤 **USERS (Utilisateurs/Animateurs)**
```typescript
interface User {
  id: string;
  // Informations de base
  email: string;
  password: string; // hashé
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  
  // Type d'utilisateur
  userType: 'animateur_pro' | 'fan' | 'admin';
  isPro: boolean;
  isVerified: boolean;
  
  // Profil animateur
  specialties: string[];
  location: {
    city: string;
    region: string;
    country: string;
  };
  
  // Statut et dates
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}
```

### 2. 🏪 **BOUTIQUES (Boutiques d'animateurs)**
```typescript
interface Boutique {
  id: string;
  animateurId: string;
  
  // Informations boutique
  nom: string;
  description: string;
  logo?: string;
  banniere?: string;
  
  // Configuration
  isActive: boolean;
  categories: string[];
  
  // Localisation
  adresse?: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. 👥 **COGESTIONNAIRES (Gestionnaires de boutique)**
```typescript
interface Cogestionnaire {
  id: string;
  boutiqueId: string;
  animateurPrincipalId: string;
  
  // Informations cogestionnaire
  email: string;
  password: string; // hashé
  nom: string;
  prenom: string;
  
  // Niveaux d'accès
  permissions: {
    voirProfil: boolean;
    editerProfil: boolean;
    voirLaalas: boolean;
    editerLaalas: boolean;
    voirGains: boolean;
    editerGains: boolean;
    voirPublicites: boolean;
    editerPublicites: boolean;
    voirStatistiques: boolean;
    voirFans: boolean;
    gererCommunications: boolean;
  };
  
  // Statut
  status: 'active' | 'inactive' | 'pending';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4. 🎭 **LAALAS (Événements/Spectacles)**
```typescript
interface Laala {
  id: string;
  animateurId: string;
  boutiqueId?: string;
  
  // Informations de base
  nom: string;
  description: string;
  type: string;
  categorie: string;
  
  // Configuration
  isPublic: boolean;
  isMonetise: boolean;
  isProgramme: boolean;
  isBooste: boolean;
  
  // Paramètres contenu
  allowText: boolean;
  allowImages: boolean;
  allowVideos: boolean;
  allowLive: boolean;
  
  // Programmation
  dateDebut?: Timestamp;
  dateFin?: Timestamp;
  heureDebut?: string;
  heureFin?: string;
  
  // Métriques
  vues: number;
  likes: number;
  participants: number;
  
  // Statut
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5. 📝 **CONTENUS (Contenus des laalas)**
```typescript
interface Contenu {
  id: string;
  laalaId: string;
  animateurId: string; // Créateur du contenu
  
  // Informations contenu
  nom: string;
  type: 'texte' | 'image' | 'video' | 'live';
  contenu: string; // Texte ou URL
  thumbnail?: string;
  
  // Programmation
  isProgramme: boolean;
  datePublication?: Timestamp;
  
  // Métriques
  vues: number;
  likes: number;
  commentaires: number;
  
  // Monétisation
  isMonetise: boolean;
  prix?: number;
  
  // Statut
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 6. 👥 **FANS_FRIENDS (Relations fans/amis)**
```typescript
interface FanFriend {
  id: string;
  animateurId: string;
  userId: string; // Fan/Friend
  
  // Type de relation
  type: 'fan' | 'friend';
  
  // Informations fan/friend
  genre?: 'masculin' | 'feminin' | 'autre';
  age?: number;
  ville?: string;
  
  // Activité
  isActif: boolean;
  isRentable: boolean; // Génère des revenus
  dernièreActivité: Timestamp;
  
  // Métriques
  totalVues: number;
  totalLikes: number;
  totalCommentaires: number;
  totalAchats: number;
  montantDepense: number;
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 7. 💰 **GAINS (Revenus et gains)**
```typescript
interface Gain {
  id: string;
  animateurId: string;
  
  // Type de revenu
  type: 'direct' | 'indirect' | 'couri' | 'publicite' | 'boost';
  source: string; // ID du laala/contenu source
  
  // Montants
  montantBrut: number;
  commission: number;
  montantNet: number;
  devise: string;
  
  // Détails
  description: string;
  periode: {
    debut: Timestamp;
    fin: Timestamp;
  };
  
  // Statut
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 8. 💸 **RETRAITS (Demandes de retrait)**
```typescript
interface Retrait {
  id: string;
  animateurId: string;
  
  // Informations retrait
  montant: number;
  devise: string;
  methodePaiement: 'virement' | 'mobile_money' | 'paypal' | 'crypto';
  
  // Détails paiement
  detailsPaiement: {
    numeroCompte?: string;
    nomBanque?: string;
    numeroMobile?: string;
    emailPaypal?: string;
    adresseCrypto?: string;
  };
  
  // Statut et traitement
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  dateTraitement?: Timestamp;
  referenceTransaction?: string;
  commentaireAdmin?: string;
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 9. 📢 **PUBLICITES (Gestion des publicités)**
```typescript
interface Publicite {
  id: string;
  animateurId: string;
  
  // Type de publicité
  type: 'profil' | 'espace_laala' | 'contenu';
  
  // Informations pub
  titre: string;
  description: string;
  visuel?: string;
  lienDestination?: string;
  
  // Ciblage
  ciblage: {
    ageMin?: number;
    ageMax?: number;
    genres?: string[];
    villes?: string[];
    interets?: string[];
  };
  
  // Budget et durée
  budget: number;
  coutParVue: number;
  dateDebut: Timestamp;
  dateFin: Timestamp;
  
  // Métriques
  impressions: number;
  clics: number;
  conversions: number;
  montantDepense: number;
  
  // Statut
  status: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 10. 📊 **STATISTIQUES (Données analytiques)**
```typescript
interface Statistique {
  id: string;
  animateurId: string;
  
  // Période
  periode: 'jour' | 'semaine' | 'mois' | 'annee';
  dateDebut: Timestamp;
  dateFin: Timestamp;
  
  // Métriques laalas
  laalas: {
    total: number;
    actifs: number;
    vues: number;
    likes: number;
    participants: number;
  };
  
  // Métriques contenus
  contenus: {
    total: number;
    publies: number;
    vues: number;
    likes: number;
    commentaires: number;
  };
  
  // Métriques revenus
  revenus: {
    direct: number;
    indirect: number;
    couri: number;
    publicite: number;
    total: number;
  };
  
  // Métriques profil
  profil: {
    vuesProfile: number;
    nouveauxFans: number;
    nouveauxFriends: number;
  };
  
  // Métriques publicités
  publicites: {
    impressions: number;
    clics: number;
    montantDepense: number;
    roi: number; // Return on Investment
  };
  
  createdAt: Timestamp;
}
```

### 11. 💬 **COMMUNICATIONS (Messages et campagnes)**
```typescript
interface Communication {
  id: string;
  animateurId: string;
  
  // Type de communication
  type: 'message_individuel' | 'campagne_masse' | 'notification';
  
  // Destinataires
  destinataires: string[]; // IDs des fans/friends
  ciblage?: {
    genres?: string[];
    ageMin?: number;
    ageMax?: number;
    villes?: string[];
    typeRelation?: 'fan' | 'friend';
  };
  
  // Contenu
  sujet: string;
  message: string;
  fichierAttache?: string;
  
  // Programmation
  isProgramme: boolean;
  dateEnvoi?: Timestamp;
  
  // Métriques
  envoyes: number;
  ouverts: number;
  clics: number;
  reponses: number;
  
  // Statut
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 12. 📞 **CONTACTS_LAALA (Support et réclamations)**
```typescript
interface ContactLaala {
  id: string;
  animateurId: string;
  
  // Type de contact
  objet: 'information' | 'reclamation' | 'demande_information' | 'suggestion';
  
  // Contenu
  sujet: string;
  contenu: string;
  fichierAttache?: string[];
  
  // Traitement
  status: 'nouveau' | 'en_cours' | 'resolu' | 'ferme';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  
  // Réponses admin
  reponses: {
    adminId: string;
    message: string;
    dateReponse: Timestamp;
  }[];
  
  // Dates
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dateResolution?: Timestamp;
}
```

### 13. 🔔 **NOTIFICATIONS (Système de notifications)**
```typescript
interface Notification {
  id: string;
  userId: string; // Destinataire
  
  // Type et contenu
  type: 'gain' | 'fan' | 'laala' | 'publicite' | 'system' | 'communication';
  titre: string;
  message: string;
  icone?: string;
  
  // Action
  actionUrl?: string;
  actionType?: 'redirect' | 'modal' | 'none';
  
  // Données contextuelles
  metadata?: {
    laalaId?: string;
    gainId?: string;
    publiciteId?: string;
    montant?: number;
  };
  
  // Statut
  isLu: boolean;
  isArchive: boolean;
  
  // Dates
  createdAt: Timestamp;
  luAt?: Timestamp;
}
```

### 14. 🏆 **CONTRIBUTIONS (Paiements mensuels)**
```typescript
interface Contribution {
  id: string;
  animateurId: string;
  
  // Période
  mois: number;
  annee: number;
  
  // Montant
  montant: number;
  devise: string;
  
  // Paiement
  methodePaiement: string;
  referenceTransaction: string;
  datePaiement: Timestamp;
  
  // Statut
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  
  // Dates
  dateEcheance: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 📈 COLLECTIONS DASHBOARD SPÉCIFIQUES

### 15. 📊 **DASHBOARD_METRICS (Métriques temps réel)**
```typescript
interface DashboardMetric {
  id: string;
  animateurId: string;
  
  // Période
  date: Timestamp;
  
  // Gains du mois
  gainsMoisActuel: {
    direct: number;
    indirect: number;
    couri: number;
    publicite: number;
    total: number;
  };
  
  // Couri disponible
  couriDisponible: number;
  
  // Activité récente
  activiteRecente: {
    nouveauxFans24h: number;
    nouveauxFansSemaine: number;
    nouveauxFansMois: number;
    vuesAujourdhui: number;
    likesAujourdhui: number;
  };
  
  // Dernière mise à jour
  lastUpdated: Timestamp;
}
```

---

## 🔗 RELATIONS ENTRE COLLECTIONS

### Relations principales :
- **Users** ↔ **Boutiques** (1:N)
- **Boutiques** ↔ **Cogestionnaires** (1:N)
- **Users** ↔ **Laalas** (1:N)
- **Laalas** ↔ **Contenus** (1:N)
- **Users** ↔ **FansFreinds** (1:N)
- **Users** ↔ **Gains** (1:N)
- **Users** ↔ **Publicites** (1:N)
- **Users** ↔ **Notifications** (1:N)

### Index recommandés :
- `animateurId` sur toutes les collections
- `status` sur les collections avec statut
- `createdAt` pour les tris chronologiques
- `type` sur les collections typées
- Indexes composés pour les requêtes complexes

---

## 🎯 RÉSUMÉ

**Total : 15 collections principales**

1. **Users** - Utilisateurs/Animateurs
2. **Boutiques** - Boutiques d'animateurs
3. **Cogestionnaires** - Gestionnaires de boutique
4. **Laalas** - Événements/Spectacles
5. **Contenus** - Contenus des laalas
6. **FansFreinds** - Relations fans/amis
7. **Gains** - Revenus et gains
8. **Retraits** - Demandes de retrait
9. **Publicites** - Gestion des publicités
10. **Statistiques** - Données analytiques
11. **Communications** - Messages et campagnes
12. **ContactsLaala** - Support et réclamations
13. **Notifications** - Système de notifications
14. **Contributions** - Paiements mensuels
15. **DashboardMetrics** - Métriques temps réel

Cette architecture couvre tous les aspects du cahier des charges et permet une gestion complète du dashboard animateur pro.