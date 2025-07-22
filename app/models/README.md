# 📊 MODÈLES DE DONNÉES - DASHBOARD LA-A-LA

## 🎯 Organisation par Priorité

Les modèles ont été réorganisés par ordre d'importance pour l'affichage dashboard :

### 🥇 **PRIORITÉ 1 : UTILISATEURS** ([`user.ts`](./user.ts))
- **Données essentielles** : Nom, prénom, email, téléphone, pays, ville
- **Métriques clés** : Balance, Kouri, fans, amis, certifications
- **Génération auto** : ID, dates, avatar par défaut, paramètres initiaux

### 🥈 **PRIORITÉ 2 : LAALAS** ([`laala.ts`](./laala.ts))
- **Données essentielles** : Nom, description, type, créateur
- **Métriques clés** : Vues, likes, contenus, participants
- **Génération auto** : ID, dates, médias par défaut, statuts

### 🥉 **PRIORITÉ 3 : CONTENUS** ([`contenu.ts`](./contenu.ts))
- **Données essentielles** : Nom, créateur, Laala associé, type de média
- **Métriques clés** : Vues, likes, commentaires, hashtags
- **Génération auto** : ID, miniatures, optimisations, position

## 🏗️ Architecture des Modèles

### Structure Générale
```typescript
// Interface Core = Champs essentiels à saisir
interface EntityCore {
  // Champs obligatoires minimum
}

// Interface Dashboard = Modèle complet avec données générées
interface EntityDashboard extends EntityCore {
  // + Champs générés automatiquement
  // + Métriques et statistiques
  // + Métadonnées système
}

// Interface Display = Vue optimisée pour l'affichage
interface EntityDashboardDisplay {
  // Champs les plus importants pour l'UI
}
```

## 🔧 Services de Gestion

### [`services.ts`](./services.ts) - Logique Métier

#### **UserService**
```typescript
// Création utilisateur complète
const user = await UserService.createUser(userCore);

// Mise à jour métriques
const updatedUser = UserService.updateUserMetrics(user, {
  balance: 1000,
  newFan: "userId123"
});
```

#### **LaalaService**
```typescript
// Création Laala complète
const laala = await LaalaService.createLaala(laalaCore, creatorInfo);

// Mise à jour métriques
const updatedLaala = LaalaService.updateLaalaMetrics(laala, {
  newView: "userId123",
  newLike: "userId456"
});
```

#### **ContenuService**
```typescript
// Création contenu complet
const contenu = await ContenuService.createContenu(contenuCore, creatorInfo);

// Mise à jour métriques
const updatedContenu = ContenuService.updateContenuMetrics(contenu, {
  newView: "userId123",
  newComment: commentObject
});
```

## 📈 Génération Automatique des Données

### Champs Générés Automatiquement

#### **Identifiants**
- `id` : Généré selon le pattern spécifique à chaque entité
- `nom_l` : Version lowercase du nom pour recherche

#### **Dates et Temps**
- `date`, `jour`, `mois`, `annee` : Date de création
- `registerDate` : Date d'inscription (users)
- `heure` : Heure de création (contenus)

#### **Métriques Initiales**
- Tous les compteurs à 0 : `likes`, `vues`, `balance`, etc.
- Listes vides : `fan[]`, `friend[]`, `contenues[]`, etc.

#### **Médias par Défaut**
- `avatar` : Image de profil par défaut
- `cover`, `miniature` : Images par défaut ou générées
- `signature` : Signature par défaut

#### **Statuts par Défaut**
- `isconnect: false`, `iscert: false`, `encours: true`
- Notifications activées par défaut
- Paramètres de confidentialité standards

## 🎨 Utilisation Dashboard

### Création Rapide
```typescript
import { UserService, LaalaService, ContenuService } from './services';

// Utilisateur avec données minimales
const newUser = await UserService.createUser({
  nom: "Dupont",
  prenom: "Jean",
  email: "jean@example.com",
  tel: "12345678",
  password: "password123",
  date_de_naissance: "1990-01-01",
  sexe: "Masculin",
  pays: "Togo",
  ville: "Lomé",
  codePays: "+228"
});
// → Génère automatiquement : ID, avatar, métriques, dates, etc.
```

### Affichage Dashboard
```typescript
import { UserDashboardDisplay, LaalaDashboardDisplay } from './index';

// Vue optimisée pour l'affichage
const userDisplay: UserDashboardDisplay = {
  id: user.id,
  nom: user.nom,
  prenom: user.prenom,
  avatar: user.avatar,
  iscert: user.iscert,
  balance: user.balance,
  fanCount: user.fan.length,
  // ... autres champs essentiels
};
```

### Statistiques Globales
```typescript
import { DashboardService } from './services';

const stats = DashboardService.calculateGlobalStats({
  users: allUsers,
  laalas: allLaalas,
  contenus: allContenus
});

console.log(stats);
// {
//   users: { total: 1250, active: 89, certified: 45 },
//   laalas: { total: 3420, active: 156, totalViews: 45000 },
//   contenus: { total: 8900, videos: 2100, totalLikes: 12000 }
// }
```

## 🔍 Filtres et Recherche

### Filtres Dashboard
```typescript
import { DashboardFilters } from './index';

const filters: DashboardFilters = {
  dateRange: {
    start: "2024-01-01",
    end: "2024-12-31"
  },
  userFilters: {
    country: "Togo",
    certified: true
  },
  contentFilters: {
    type: "laala",
    minViews: 100
  }
};
```

## 📊 Métriques en Temps Réel

### Interface RealTimeMetrics
```typescript
const metrics: RealTimeMetrics = {
  activeUsers: 156,
  onlineUsers: 89,
  newRegistrations: 12,
  newContent: 45,
  systemLoad: 67.5,
  lastUpdated: "2024-12-09T10:30:00Z"
};
```

## 🚀 Exemples d'Utilisation

### Workflow Complet
```typescript
// 1. Créer un utilisateur
const user = await UserService.createUser(userData);

// 2. Créer un Laala pour cet utilisateur
const laala = await LaalaService.createLaala(laalaData, {
  nom: user.nom,
  avatar: user.avatar,
  iscert: user.iscert
});

// 3. Ajouter du contenu au Laala
const contenu = await ContenuService.createContenu(contenuData, {
  nom: user.nom,
  avatar: user.avatar,
  iscert: user.iscert
});

// 4. Mettre à jour les métriques
const updatedLaala = LaalaService.updateLaalaMetrics(laala, {
  newContenu: contenu.id
});
```

## 📝 Notes Importantes

### Validation
- Tous les services incluent une validation des données essentielles
- Erreurs explicites pour les champs manquants ou invalides
- Validation des formats (email, téléphone, etc.)

### Performance
- Interfaces Display optimisées pour l'affichage
- Calculs de métriques en temps réel
- Cache recommandé pour les statistiques (TTL: 5min)

### Extensibilité
- Structure modulaire pour ajouter de nouveaux types
- Services séparés pour chaque entité
- Interfaces génériques réutilisables

### Sécurité
- Mots de passe non exposés dans les interfaces Display
- Validation des permissions avant mise à jour
- Sanitisation des données utilisateur

---

## 🔗 Fichiers Associés

- [`index.ts`](./index.ts) - Exports centralisés et interfaces globales
- [`services.ts`](./services.ts) - Services de gestion et logique métier
- [`user.ts`](./user.ts) - Modèle utilisateur complet
- [`laala.ts`](./laala.ts) - Modèle Laala (projets/contenus)
- [`contenu.ts`](./contenu.ts) - Modèle contenus multimédias
- [`message.ts`](./message.ts) - Modèle messages (en attente)

Cette architecture permet une gestion efficace des données avec un minimum de saisie manuelle et une génération automatique intelligente des informations complémentaires.