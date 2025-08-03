# Configuration Finale - Bucket "medias" Appwrite

Tous les formulaires ont été modifiés pour utiliser votre bucket unique **"medias"**. Voici ce qui a été fait et ce qu'il vous reste à configurer.

## ✅ **Ce qui a été modifié**

### 1. **Services et Composants**
- ✅ `lib/appwrite/media-service.ts` - Service principal adapté au bucket unique
- ✅ `components/ui/media-upload.tsx` - Composant d'upload mis à jour
- ✅ `hooks/useMediaUpload.ts` - Hooks React adaptés

### 2. **Formulaires Modifiés**
- ✅ `LaalaCreateForm.tsx` - Upload de couverture (image/vidéo)
- ✅ `ContenuCreateForm.tsx` - Upload de médias selon le type
- ✅ `UserAvatarUpload.tsx` - Upload d'avatar utilisateur
- ✅ `BoutiqueCreateForm.tsx` - Upload d'images de boutique

### 3. **Scripts de Configuration**
- ✅ `scripts/setup-medias-bucket.js` - Vérification du bucket
- ✅ Commandes npm ajoutées

## 🔧 **Configuration Requise**

### 1. **Vérifiez votre bucket "medias"**

```bash
# Vérifier la configuration du bucket
npm run medias:check
```

### 2. **Configuration dans Appwrite Console**

Si le bucket n'existe pas ou n'est pas bien configuré :

1. **Allez dans Appwrite Console** → Storage → Create Bucket
2. **Paramètres du bucket** :
   - **ID** : `medias`
   - **Nom** : `Médias La-à-La`
   - **Taille max** : `100MB`
   - **Extensions autorisées** : `jpg, jpeg, png, gif, webp, svg, mp4, avi, mov, wmv, webm, mkv`

3. **Permissions** :
   - **Read** : `any` (lecture publique)
   - **Create** : `users` (création pour utilisateurs connectés)
   - **Update** : `users` (modification par propriétaire)
   - **Delete** : `users` (suppression par propriétaire)

### 3. **Variables d'Environnement** (déjà configurées)

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=688f85190004fa948692
```

## 📁 **Organisation Automatique**

Vos fichiers seront automatiquement organisés :

```
medias/
├── users/avatars/2024-01-15/userId/avatar.jpg
├── laalas/covers/2024-01-15/userId/laalaId/cover.mp4
├── contenus/media/2024-01-15/userId/contenuId/video.mp4
└── boutiques/images/2024-01-15/userId/boutiqueId/image.jpg
```

## 💻 **Utilisation dans vos Pages**

### 1. **Upload d'Avatar Utilisateur**

```tsx
import UserAvatarUpload from '@/components/forms/UserAvatarUpload';

function ProfilePage() {
  const currentUserId = "98455866TG"; // ID utilisateur connecté

  return (
    <UserAvatarUpload
      currentAvatar={user.avatar}
      userName={user.nom}
      userId={currentUserId}
      onAvatarUpdate={(newUrl) => {
        // Mettre à jour dans Firebase
        updateUserAvatar(currentUserId, newUrl);
      }}
    />
  );
}
```

### 2. **Création de Laala avec Couverture**

```tsx
import LaalaCreateForm from '@/components/forms/LaalaCreateForm';

function LaalaPage() {
  const currentUserId = "98455866TG";

  return (
    <LaalaCreateForm
      isOpen={showForm}
      onClose={() => setShowForm(false)}
      creatorId={currentUserId}
      onSubmit={(laalaData) => {
        // laalaData contient coverUrl et coverType
        console.log('Couverture:', laalaData.coverUrl);
        // Sauvegarder dans Firebase
        createLaala(laalaData);
      }}
    />
  );
}
```

### 3. **Création de Contenu avec Médias**

```tsx
import ContenuCreateForm from '@/components/forms/ContenuCreateForm';

function ContenuPage() {
  const currentUserId = "98455866TG";
  const availableLaalas = [
    { id: "laala1", name: "Mon Laala 1" },
    { id: "laala2", name: "Mon Laala 2" }
  ];

  return (
    <ContenuCreateForm
      isOpen={showForm}
      onClose={() => setShowForm(false)}
      creatorId={currentUserId}
      availableLaalas={availableLaalas}
      onSubmit={(contenuData) => {
        // contenuData contient mediaUrl
        console.log('Média:', contenuData.mediaUrl);
        // Sauvegarder dans Firebase
        createContenu(contenuData);
      }}
    />
  );
}
```

### 4. **Création de Boutique avec Images**

```tsx
import BoutiqueCreateForm from '@/components/forms/BoutiqueCreateForm';

function BoutiquePage() {
  const currentUserId = "98455866TG";

  return (
    <BoutiqueCreateForm
      isOpen={showForm}
      onClose={() => setShowForm(false)}
      ownerId={currentUserId}
      onSubmit={(boutiqueData) => {
        // boutiqueData contient cover et images[]
        console.log('Couverture:', boutiqueData.cover);
        console.log('Images:', boutiqueData.images);
        // Sauvegarder dans Firebase
        createBoutique(boutiqueData);
      }}
    />
  );
}
```

## 🚀 **Test de Fonctionnement**

### 1. **Vérification du Bucket**
```bash
npm run medias:check
```

### 2. **Test d'Upload**
1. Utilisez un des formulaires dans votre app
2. Sélectionnez un fichier
3. Vérifiez l'upload dans la console
4. Confirmez l'organisation dans Appwrite Console

### 3. **Vérification des URLs**
- Les URLs générées doivent être accessibles
- Elles doivent pointer vers votre bucket "medias"
- Les fichiers doivent être organisés par dossiers

## ⚠️ **Points Importants**

### 1. **ID Utilisateur Obligatoire**
Tous les uploads nécessitent maintenant un `userId` :

```tsx
// ❌ Ne fonctionne plus
<MediaUpload category="user-avatar" ... />

// ✅ Fonctionne
<MediaUpload category="user-avatar" userId={currentUserId} ... />
```

### 2. **Gestion des Erreurs**
```tsx
onUploadError={(error) => {
  console.error('Erreur upload:', error);
  // Afficher un message à l'utilisateur
  setErrorMessage(error);
}}
```

### 3. **Sauvegarde dans Firebase**
```tsx
onUploadSuccess={(result) => {
  // Sauvegarder l'URL dans Firebase
  updateDocument(entityId, { 
    mediaUrl: result.url,
    mediaPath: result.path // Optionnel pour référence
  });
}}
```

## 🔍 **Dépannage**

### Erreur "Bucket not found"
```bash
# Vérifiez que le bucket existe
npm run medias:check
```

### Erreur "Permission denied"
- Vérifiez les permissions du bucket dans Appwrite Console
- Assurez-vous que l'utilisateur est connecté

### Erreur "File too large"
- Vérifiez les limites de taille dans le bucket
- Adaptez `maxSize` dans vos composants

### Erreur "Invalid file type"
- Vérifiez les extensions autorisées dans le bucket
- Adaptez `acceptedTypes` dans vos composants

## 📋 **Checklist Finale**

- [ ] Bucket "medias" créé dans Appwrite Console
- [ ] Permissions configurées (read: any, create/update/delete: users)
- [ ] Taille max : 100MB
- [ ] Extensions autorisées configurées
- [ ] Test d'upload réussi
- [ ] URLs générées fonctionnelles
- [ ] Organisation par dossiers vérifiée
- [ ] Intégration avec Firebase testée

## 🎉 **Résultat Final**

Une fois configuré, vous aurez :

- ✅ **Upload d'avatars** avec organisation automatique
- ✅ **Upload de couvertures Laala** (image/vidéo)
- ✅ **Upload de médias de contenu** selon le type
- ✅ **Upload d'images de boutique** avec galerie
- ✅ **Organisation automatique** par dossiers et dates
- ✅ **URLs prêtes** pour Firebase
- ✅ **Validation automatique** par catégorie
- ✅ **Interface utilisateur** complète avec preview

Le système est maintenant prêt à utiliser avec votre bucket unique "medias" ! 🚀