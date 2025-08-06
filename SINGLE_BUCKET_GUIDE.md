# Guide : Utilisation d'un Seul Bucket Appwrite

Ce guide explique comment utiliser un seul bucket Appwrite pour tous les médias du projet La-a-La Dashboard, avec une organisation par dossiers virtuels.

## 🎯 Pourquoi un Seul Bucket ?

### ✅ Avantages

1. **Simplicité de gestion**
   - Une seule configuration à maintenir
   - Permissions unifiées
   - Facturation simplifiée

2. **Flexibilité**
   - Quotas partagés entre tous les types de médias
   - Possibilité d'ajuster les limites globalement
   - Organisation logique par dossiers

3. **Performance**
   - Moins de connexions à gérer
   - Cache unifié
   - Optimisations globales

4. **Maintenance**
   - Backup/restore simplifié
   - Monitoring centralisé
   - Nettoyage plus facile

### ⚠️ Inconvénients

1. **Granularité des permissions**
   - Permissions identiques pour tous les types
   - Difficile d'avoir des règles spécifiques par type

2. **Organisation**
   - Dépend de la convention de nommage
   - Pas de séparation physique des données

## 🏗️ Architecture du Bucket Unique

### Configuration du Bucket

```javascript
{
  id: 'la-a-la-media',
  name: 'La-a-La Médias (Tous types)',
  maximumFileSize: 100 * 1024 * 1024, // 100MB
  allowedFileExtensions: [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',  // Images
    'mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv',   // Vidéos
    'mp3', 'wav', 'ogg',                         // Audio
    'pdf', 'doc', 'docx'                         // Documents
  ]
}
```

### Organisation par Dossiers

```
la-a-la-media/
├── users/avatars/
│   └── YYYY-MM-DD/
│       └── userId/
│           └── filename.ext
├── laalas/covers/
│   └── YYYY-MM-DD/
│       └── userId/
│           └── laalaId/
│               └── filename.ext
├── contenus/media/
│   └── YYYY-MM-DD/
│       └── userId/
│           └── contenuId/
│               └── filename.ext
├── boutiques/images/
│   └── YYYY-MM-DD/
│       └── userId/
│           └── boutiqueId/
│               └── filename.ext
├── temp/
│   └── temporary-files/
└── archives/
    └── old-files/
```

## 🚀 Configuration

### 1. Installation

```bash
# Le service est déjà configuré
# Utilisez les nouveaux fichiers :
# - lib/appwrite/media-service-single-bucket.ts
# - components/ui/media-upload-single-bucket.tsx
# - scripts/setup-appwrite-single-bucket.js
```

### 2. Setup du Bucket

```bash
# Configuration automatique
APPWRITE_API_KEY=your_key npm run appwrite:setup-single

# Test du bucket
npm run appwrite:test-single

# Analyse de l'organisation
npm run appwrite:analyze-single
```

### 3. Variables d'Environnement

```env
# Appwrite (inchangé)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=688f85190004fa948692

# Pour les scripts (optionnel)
APPWRITE_API_KEY=your_admin_api_key
```

## 💻 Utilisation

### 1. Service Principal

```typescript
import { AppwriteMediaService } from '@/lib/appwrite/media-service-single-bucket';

// Upload d'avatar
const result = await AppwriteMediaService.uploadUserAvatar(
  file, 
  userId, 
  (progress) => console.log(`${progress}%`)
);

// Upload de couverture Laala
const result = await AppwriteMediaService.uploadLaalaCover(
  file, 
  userId, 
  laalaId, 
  (progress) => console.log(`${progress}%`)
);

// Le fichier sera organisé automatiquement :
// users/avatars/2024-01-15/user123/avatar.jpg
// laalas/covers/2024-01-15/user123/laala456/cover.mp4
```

### 2. Composant d'Upload

```tsx
import { MediaUpload } from '@/components/ui/media-upload-single-bucket';

function MyComponent() {
  return (
    <MediaUpload
      category="user-avatar"
      userId={currentUser.id}
      onUploadSuccess={(result) => {
        console.log('Fichier uploadé:', result.url);
        console.log('Chemin organisé:', result.path);
      }}
      onUploadError={(error) => console.error(error)}
    />
  );
}
```

### 3. Hook Personnalisé

```tsx
import { useMediaUpload } from '@/components/ui/media-upload-single-bucket';

function CustomUpload() {
  const { upload, isUploading, progress, result } = useMediaUpload(
    'contenu-media', 
    userId, 
    contenuId
  );

  const handleFileSelect = (file: File) => {
    upload(file);
  };

  return (
    <div>
      {isUploading && <p>Upload: {progress}%</p>}
      {result && <p>Fichier: {result.path}</p>}
    </div>
  );
}
```

## 🔧 Migration depuis Multiple Buckets

### 1. Script de Migration

```javascript
// scripts/migrate-to-single-bucket.js
async function migrateToSingleBucket() {
  const oldBuckets = ['user-avatars', 'laala-covers', 'contenu-media', 'boutique-images'];
  
  for (const bucketId of oldBuckets) {
    const files = await storage.listFiles(bucketId);
    
    for (const file of files.files) {
      // Télécharger le fichier
      const fileData = await storage.getFileDownload(bucketId, file.$id);
      
      // Déterminer la nouvelle catégorie
      const category = mapBucketToCategory(bucketId);
      
      // Re-uploader dans le bucket unique
      await AppwriteMediaService.uploadFile({
        file: new File([fileData], file.name, { type: file.mimeType }),
        category,
        userId: extractUserIdFromFile(file),
        entityId: extractEntityIdFromFile(file)
      });
      
      // Supprimer l'ancien fichier
      await storage.deleteFile(bucketId, file.$id);
    }
  }
}
```

### 2. Mise à jour des URLs

```javascript
// Mettre à jour les URLs dans Firestore
async function updateFirestoreUrls() {
  // Mettre à jour les avatars utilisateurs
  const users = await db.collection('users').get();
  users.forEach(async (doc) => {
    const user = doc.data();
    if (user.avatar && user.avatar.includes('user-avatars')) {
      const newUrl = convertToSingleBucketUrl(user.avatar);
      await doc.ref.update({ avatar: newUrl });
    }
  });
  
  // Répéter pour laalas, contenus, boutiques...
}
```

## 📊 Monitoring et Analytics

### 1. Analyse de l'Organisation

```bash
# Analyser la répartition des fichiers
npm run appwrite:analyze-single
```

### 2. Statistiques par Catégorie

```typescript
// Obtenir les stats d'usage
const stats = await AppwriteMediaService.getUsageStats();
console.log('Avatars:', stats['user-avatar']);
console.log('Couvertures:', stats['laala-cover']);
```

### 3. Nettoyage Automatique

```typescript
// Nettoyer les fichiers temporaires
async function cleanupTempFiles() {
  const files = await AppwriteMediaService.listFiles('temp');
  const oldFiles = files.filter(file => 
    Date.now() - new Date(file.$createdAt).getTime() > 24 * 60 * 60 * 1000
  );
  
  for (const file of oldFiles) {
    await AppwriteMediaService.deleteFile(file.$id);
  }
}
```

## 🛡️ Sécurité et Bonnes Pratiques

### 1. Validation Renforcée

```typescript
// Validation par catégorie
const limits = AppwriteMediaService.LIMITS[category];
if (file.size > limits.maxSize) {
  throw new Error(`Fichier trop volumineux pour ${category}`);
}
```

### 2. Nommage Sécurisé

```typescript
// Nettoyage automatique des noms de fichiers
const safeName = AppwriteMediaService.sanitizeFileName(originalName);
// "Mon Fichier (1).jpg" → "mon_fichier_1.jpg"
```

### 3. Organisation Temporelle

```typescript
// Organisation par date pour faciliter l'archivage
const path = `${category}/${YYYY-MM-DD}/${userId}/${entityId}/${filename}`;
```

## 🔄 Comparaison : Multiple vs Single Bucket

| Aspect | Multiple Buckets | Single Bucket |
|--------|------------------|---------------|
| **Configuration** | 4 buckets à gérer | 1 seul bucket |
| **Permissions** | Granulaires par type | Globales |
| **Quotas** | Séparés par type | Partagés |
| **Organisation** | Physique | Logique (dossiers) |
| **Maintenance** | Plus complexe | Simplifiée |
| **Flexibilité** | Limitée | Élevée |
| **Performance** | 4 connexions | 1 connexion |
| **Backup** | 4 opérations | 1 opération |

## 📋 Scripts NPM

Ajoutez à votre `package.json` :

```json
{
  "scripts": {
    "appwrite:setup-single": "node scripts/setup-appwrite-single-bucket.js setup",
    "appwrite:test-single": "node scripts/setup-appwrite-single-bucket.js test",
    "appwrite:analyze-single": "node scripts/setup-appwrite-single-bucket.js analyze",
    "appwrite:cleanup-single": "node scripts/setup-appwrite-single-bucket.js cleanup"
  }
}
```

## 🚨 Points d'Attention

### 1. Limites Partagées

- La limite de 100MB s'applique à tous les fichiers
- Surveillez l'usage global du bucket
- Ajustez les limites selon vos besoins

### 2. Organisation Stricte

- Respectez la convention de nommage
- Utilisez toujours les services fournis
- Ne créez pas de fichiers manuellement

### 3. Permissions Globales

- Tous les utilisateurs ont les mêmes droits
- Implémentez la sécurité côté application
- Validez les uploads côté serveur

## 🔮 Évolutions Futures

### 1. Métadonnées Enrichies

```typescript
// Ajouter des tags pour une meilleure organisation
await storage.createFile(bucketId, fileId, file, permissions, {
  tags: ['user-avatar', userId, 'profile-picture'],
  category: 'user-avatar',
  owner: userId
});
```

### 2. Archivage Automatique

```typescript
// Déplacer les anciens fichiers vers un dossier d'archives
async function archiveOldFiles() {
  // Logique d'archivage basée sur l'âge des fichiers
}
```

### 3. CDN et Cache

```typescript
// Intégration avec un CDN pour de meilleures performances
const cdnUrl = `https://cdn.example.com/${bucketId}/${fileId}`;
```

---

## 🎯 Recommandation

**Utilisez le bucket unique si :**
- Vous voulez simplifier la gestion
- Vous avez des besoins de quotas flexibles
- Vous préférez une configuration centralisée
- Vous n'avez pas besoin de permissions granulaires

**Gardez les buckets multiples si :**
- Vous avez besoin de permissions spécifiques par type
- Vous voulez une séparation physique stricte
- Vous avez des exigences de compliance particulières
- Vous préférez la granularité maximale

Le choix dépend de vos besoins spécifiques, mais le bucket unique est généralement plus simple à gérer pour la plupart des cas d'usage.