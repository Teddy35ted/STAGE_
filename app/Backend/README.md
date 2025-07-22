# Backend Firebase Admin - Dashboard La-à-La

## 🚀 Installation

1. **Installer les dépendances**
```bash
npm install firebase-admin
```

2. **Configuration Firebase Admin**
   - Aller dans la console Firebase
   - Projet Settings > Service Accounts
   - Générer une nouvelle clé privée
   - Télécharger le fichier JSON

3. **Variables d'environnement**
Créer `.env.local` à la racine :
```env
FIREBASE_ADMIN_PROJECT_ID=dashboard-4f9c8
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@dashboard-4f9c8.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 🏗️ Architecture

### Structure des dossiers
```
app/Backend/
├── config/           # Configuration Firebase Admin
├── services/         # Services CRUD
├── types/           # Types TypeScript
├── utils/           # Utilitaires et helpers
└── index.ts         # Point d'entrée
```

### Services disponibles
- `AnimatorsService` - Gestion des animateurs
- `EventsService` - Gestion des événements
- `BaseService` - Service CRUD générique

## 💡 Utilisation

### Import du Backend
```typescript
import { AnimatorsService, EventsService } from '../Backend';
```

### Utilisation dans une API Route
```typescript
// app/api/animators/route.ts
import { AnimatorsService } from '../../Backend';

const service = new AnimatorsService();
const animators = await service.getActiveAnimators();
```

### Utilisation dans un Server Component
```typescript
// app/dashboard/page.tsx
import { AnimatorsService } from '../Backend';

export default async function Dashboard() {
  const service = new AnimatorsService();
  const animators = await service.getActiveAnimators();
  // ...
}
```

## 🔧 Services CRUD

### Méthodes de base (BaseService)
- `create(data)` - Créer un document
- `getById(id)` - Récupérer par ID
- `getAll(options)` - Récupérer tous
- `query(filters, options)` - Requête avec filtres
- `update(id, data)` - Mettre à jour
- `delete(id)` - Supprimer
- `batchCreate(items)` - Création en lot
- `batchDelete(ids)` - Suppression en lot

### Méthodes spécialisées
Chaque service hérite du BaseService et ajoute ses méthodes métier.

## 🛡️ Gestion des erreurs

### Types d'erreurs
- `ServiceError` - Erreur générale
- `ValidationError` - Erreur de validation
- `NotFoundError` - Ressource introuvable
- `AuthenticationError` - Authentification requise
- `AuthorizationError` - Permissions insuffisantes

### Utilisation
```typescript
try {
  await service.create(data);
} catch (error) {
  if (error instanceof ValidationError) {
    // Gérer l'erreur de validation
  }
}
```

## ✅ Validation

### Validateurs disponibles
- `Validator` - Validateur générique
- `AnimatorValidator` - Validation des animateurs
- `EventValidator` - Validation des événements

### Exemple
```typescript
const validator = new AnimatorValidator();
const result = validator.validateAnimatorData(data);
if (!result.isValid) {
  console.log(result.errors);
}
```

## 🎯 Bonnes pratiques

1. **Toujours valider les données** avant les opérations CRUD
2. **Utiliser les types TypeScript** pour la sécurité
3. **Gérer les erreurs** avec try/catch
4. **Logger les erreurs** pour le debugging
5. **Utiliser les transactions** pour les opérations complexes

## 📝 Exemples d'utilisation

### Créer un animateur
```typescript
const animatorsService = new AnimatorsService();

const animatorId = await animatorsService.create({
  userId: 'user123',
  email: 'test@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  status: 'active',
  specialties: ['magie', 'clown'],
  location: {
    city: 'Paris',
    region: 'Île-de-France',
    country: 'France'
  },
  pricing: {
    hourlyRate: 50,
    currency: 'EUR'
  }
});
```

### Rechercher des événements
```typescript
const eventsService = new EventsService();

const events = await eventsService.searchEvents({
  city: 'Paris',
  type: 'birthday',
  dateFrom: new Date('2024-01-01'),
  dateTo: new Date('2024-12-31')
});
```

### Utiliser les filtres avancés
```typescript
const animators = await animatorsService.searchAnimators({
  city: 'Paris',
  specialties: ['magie'],
  minRating: 4.0,
  maxPrice: 100,
  isVerified: true
});