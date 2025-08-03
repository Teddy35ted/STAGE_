# Guide d'Utilisation - Bucket Unique "medias"

Votre code a été modifié pour utiliser un seul bucket Appwrite nommé **"medias"** avec une organisation automatique par dossiers.

## 🎯 Ce qui a été modifié

### 1. **Service Principal** (`lib/appwrite/media-service.ts`)
- ✅ Utilise maintenant le bucket unique `"medias"`
- ✅ Organisation automatique par dossiers virtuels
- ✅ Validation par catégorie de média
- ✅ Noms de fichiers sécurisés automatiquement

### 2. **Composant d'Upload** (`components/ui/media-upload.tsx`)
- ✅ Adapté pour les catégories au lieu des buckets
- ✅ Validation automatique selon la catégorie
- ✅ Affichage du chemin organisé

### 3. **Hooks React** (`hooks/useMediaUpload.ts`)
- ✅ Hooks mis à jour pour les catégories
- ✅ ID utilisateur obligatoire
- ✅ Support des entités (laalaId, contenuId, etc.)

## 📁 Organisation Automatique

Vos fichiers seront automatiquement organisés comme ceci :

```
medias/
├── users/avatars/2024-01-15/userId/avatar.jpg
├── laalas/covers/2024-01-15/userId/laalaId/cover.mp4
├── contenus/media/2024-01-15/userId/contenuId/video.mp4
└── boutiques/images/2024-01-15/userId/boutiqueId/image.jpg
```

## 💻 Exemples d'Utilisation

### 1. **Upload d'Avatar Utilisateur**

```tsx
import { MediaUpload } from '@/components/ui/media-upload';

function ProfilePage() {
  const currentUserId = "98455866TG"; // ID de l'utilisateur connecté

  return (
    <MediaUpload
      category="user-avatar"
      userId={currentUserId}
      onUploadSuccess={(result) => {
        console.log('Avatar uploadé:', result.url);
        console.log('Chemin:', result.path);
        // Mettre à jour l'avatar dans Firebase
        updateUserAvatar(currentUserId, result.url);
      }}
      onUploadError={(error) => console.error(error)}
      label="Changer la photo de profil"
    />
  );
}
```

### 2. **Upload de Couverture Laala**

```tsx
import { MediaUpload } from '@/components/ui/media-upload';

function LaalaForm() {
  const currentUserId = "98455866TG";
  const laalaId = "372025Laala902688"; // ID du Laala en cours de création

  return (
    <MediaUpload
      category="laala-cover"
      userId={currentUserId}
      entityId={laalaId}
      onUploadSuccess={(result) => {
        console.log('Couverture uploadée:', result.url);
        // Sauvegarder l'URL dans Firebase
        updateLaalaCover(laalaId, result.url);
      }}
      onUploadError={(error) => console.error(error)}
      label="Ajouter une couverture"
    />
  );
}
```

### 3. **Upload de Contenu Média**

```tsx
import { MediaUpload } from '@/components/ui/media-upload';

function ContenuForm() {
  const currentUserId = "98455866TG";
  const contenuId = "1412202494410470";

  return (
    <MediaUpload
      category="contenu-media"
      userId={currentUserId}
      entityId={contenuId}
      onUploadSuccess={(result) => {
        console.log('Média uploadé:', result.url);
        console.log('Type:', result.category);
        // Sauvegarder dans Firebase
        updateContenuMedia(contenuId, result.url);
      }}
      onUploadError={(error) => console.error(error)}
      label="Ajouter un média"
    />
  );
}
```

### 4. **Upload d'Images de Boutique**

```tsx
import { MediaUpload } from '@/components/ui/media-upload';

function BoutiqueForm() {
  const currentUserId = "98455866TG";
  const boutiqueId = "9122024Boutique85123176";

  return (
    <MediaUpload
      category="boutique-image"
      userId={currentUserId}
      entityId={boutiqueId}
      onUploadSuccess={(result) => {
        console.log('Image boutique uploadée:', result.url);
        // Ajouter à la galerie de la boutique
        addBoutiqueImage(boutiqueId, result.url);
      }}
      onUploadError={(error) => console.error(error)}
      label="Ajouter une image"
    />
  );
}
```

### 5. **Utilisation avec Hook**

```tsx
import { useUserAvatarUpload } from '@/hooks/useMediaUpload';

function CustomAvatarUpload() {
  const currentUserId = "98455866TG";
  
  const { upload, isUploading, progress, result, error } = useUserAvatarUpload(
    currentUserId,
    (avatarUrl) => {
      console.log('Avatar mis à jour:', avatarUrl);
      // Mettre à jour dans Firebase
      updateUserInFirestore(currentUserId, { avatar: avatarUrl });
    }
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      upload(file);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      {isUploading && <p>Upload: {progress}%</p>}
      {error && <p>Erreur: {error}</p>}
      {result && <p>Fichier: {result.path}</p>}
    </div>
  );
}
```

## 🔧 Ce dont vous avez besoin maintenant

### 1. **Configuration du Bucket dans Appwrite**

Dans votre console Appwrite, configurez le bucket `"medias"` avec :

```javascript
// Configuration recommandée
{
  id: "medias",
  name: "Médias La-à-La",
  maximumFileSize: 100 * 1024 * 1024, // 100MB
  allowedFileExtensions: [
    "jpg", "jpeg", "png", "gif", "webp", "svg",  // Images
    "mp4", "avi", "mov", "wmv", "webm", "mkv"    // Vidéos
  ],
  permissions: [
    "read(\"any\")",           // Lecture publique
    "create(\"users\")",       // Création pour utilisateurs connectés
    "update(\"users\")",       // Modification par le propriétaire
    "delete(\"users\")"        // Suppression par le propriétaire
  ]
}
```

### 2. **Permissions Appwrite**

Assurez-vous que votre bucket a les bonnes permissions :
- **Read** : `any` (lecture publique pour affichage)
- **Create** : `users` (création pour utilisateurs connectés)
- **Update** : `users` (modification par le propriétaire)
- **Delete** : `users` (suppression par le propriétaire)

### 3. **Variables d'Environnement** (déjà configurées)

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=688f85190004fa948692
```

### 4. **Mise à jour de vos Formulaires Existants**

Remplacez vos anciens composants d'upload par les nouveaux :

```tsx
// Ancien (ne fonctionne plus)
<MediaUpload bucketType="USER_AVATARS" ... />

// Nouveau (fonctionne avec bucket unique)
<MediaUpload category="user-avatar" userId={currentUserId} ... />
```

### 5. **Gestion des IDs Utilisateur**

**Important** : Tous les uploads nécessitent maintenant un `userId`. Assurez-vous de :

```tsx
// Récupérer l'ID utilisateur connecté
const { user } = useAuth(); // ou votre système d'auth
const userId = user?.id || user?.uid;

// L'utiliser dans tous les uploads
<MediaUpload category="user-avatar" userId={userId} ... />
```

## 🚀 Avantages du Nouveau Système

### ✅ **Simplicité**
- Un seul bucket à gérer
- Configuration unique
- Permissions unifiées

### ✅ **Organisation Automatique**
- Dossiers par catégorie et date
- Noms de fichiers sécurisés
- Hiérarchie logique

### ✅ **Flexibilité**
- Quotas partagés entre tous les médias
- Ajout facile de nouvelles catégories
- Gestion centralisée

### ✅ **Performance**
- Une seule connexion Appwrite
- Cache unifié
- Optimisations globales

## 🔍 Vérification

Pour vérifier que tout fonctionne :

1. **Testez un upload** avec le nouveau composant
2. **Vérifiez dans Appwrite** que le fichier est dans le bon dossier
3. **Confirmez l'URL** générée fonctionne
4. **Vérifiez Firebase** que l'URL est bien sauvegardée

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez que le bucket `"medias"` existe dans Appwrite
2. Confirmez les permissions du bucket
3. Assurez-vous que `userId` est fourni dans tous les uploads
4. Vérifiez les logs de la console pour les erreurs détaillées

Le système est maintenant prêt à utiliser avec votre bucket unique `"medias"` ! 🎉