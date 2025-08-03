# Configuration Appwrite pour La-à-La Dashboard

Ce document explique comment configurer Appwrite pour gérer les médias du projet La-à-La Dashboard.

## 1. Configuration des Buckets de Storage

Vous devez créer les buckets suivants dans votre console Appwrite :

### Bucket 1: `user-avatars`
- **ID**: `user-avatars`
- **Nom**: Photos de profil utilisateurs
- **Permissions**: 
  - Read: `users`
  - Write: `users`
  - Update: `users`
  - Delete: `users`
- **Taille max**: 5MB
- **Types autorisés**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### Bucket 2: `laala-covers`
- **ID**: `laala-covers`
- **Nom**: Couvertures des Laalas
- **Permissions**: 
  - Read: `users`
  - Write: `users`
  - Update: `users`
  - Delete: `users`
- **Taille max**: 50MB
- **Types autorisés**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `video/mp4`, `video/avi`, `video/mov`

### Bucket 3: `contenu-media`
- **ID**: `contenu-media`
- **Nom**: Médias des contenus
- **Permissions**: 
  - Read: `users`
  - Write: `users`
  - Update: `users`
  - Delete: `users`
- **Taille max**: 100MB
- **Types autorisés**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `video/mp4`, `video/avi`, `video/mov`

### Bucket 4: `boutique-images`
- **ID**: `boutique-images`
- **Nom**: Images des boutiques
- **Permissions**: 
  - Read: `users`
  - Write: `users`
  - Update: `users`
  - Delete: `users`
- **Taille max**: 10MB
- **Types autorisés**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

## 2. Configuration des Variables d'Environnement

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=688f85190004fa948692

# Optionnel: Configuration avancée
NEXT_PUBLIC_APPWRITE_STORAGE_ENDPOINT=https://nyc.cloud.appwrite.io/v1/storage
```

## 3. Commandes CLI Appwrite (Optionnel)

Si vous utilisez l'Appwrite CLI, voici les commandes pour créer les buckets :

```bash
# Installer Appwrite CLI
npm install -g appwrite-cli

# Se connecter à votre projet
appwrite login
appwrite init project

# Créer les buckets
appwrite storage createBucket \
  --bucketId user-avatars \
  --name "Photos de profil utilisateurs" \
  --permissions "users" \
  --fileSecurity true \
  --enabled true

appwrite storage createBucket \
  --bucketId laala-covers \
  --name "Couvertures des Laalas" \
  --permissions "users" \
  --fileSecurity true \
  --enabled true

appwrite storage createBucket \
  --bucketId contenu-media \
  --name "Médias des contenus" \
  --permissions "users" \
  --fileSecurity true \
  --enabled true

appwrite storage createBucket \
  --bucketId boutique-images \
  --name "Images des boutiques" \
  --permissions "users" \
  --fileSecurity true \
  --enabled true
```

## 4. Configuration des Permissions

### Permissions recommandées pour chaque bucket :

#### Pour tous les buckets :
- **Create**: `users` (utilisateurs authentifiés)
- **Read**: `any` (lecture publique pour l'affichage)
- **Update**: `users` (propriétaire du fichier)
- **Delete**: `users` (propriétaire du fichier)

### Configuration via la console :
1. Allez dans Storage > [Nom du bucket] > Settings
2. Dans "Permissions", ajoutez :
   - `role:all` pour Read (lecture publique)
   - `users` pour Create, Update, Delete

## 5. Optimisations et Bonnes Pratiques

### Compression d'images automatique :
Appwrite peut automatiquement optimiser les images. Activez cette option dans les paramètres de chaque bucket.

### Transformation d'images :
Vous pouvez utiliser les transformations Appwrite pour redimensionner automatiquement :
```javascript
// Exemple d'URL avec transformation
const thumbnailUrl = `${fileUrl}?width=300&height=300&gravity=center&quality=80`;
```

### Nettoyage automatique :
Implémentez un système de nettoyage pour supprimer les fichiers orphelins :
```javascript
// Dans votre code de suppression
await AppwriteMediaService.deleteFile(bucketId, fileId);
```

## 6. Sécurité

### Validation côté client :
- Vérifiez toujours la taille et le type de fichier avant l'upload
- Utilisez les fonctions de validation fournies dans `media-service.ts`

### Validation côté serveur :
- Implémentez une validation supplémentaire dans vos API routes
- Vérifiez les permissions utilisateur avant l'upload

### Limitation de débit :
- Configurez des limites de débit dans Appwrite pour éviter les abus
- Implémentez une logique de retry en cas d'échec

## 7. Monitoring et Logs

### Surveillance des uploads :
- Surveillez les métriques d'usage dans la console Appwrite
- Configurez des alertes pour les quotas de stockage

### Logs d'erreur :
- Tous les uploads sont loggés dans la console du navigateur
- Implémentez un système de reporting d'erreurs pour la production

## 8. Migration des Données Existantes

Si vous avez des médias existants dans Firebase Storage, voici un script de migration :

```javascript
// Script de migration (à exécuter une seule fois)
async function migrateFromFirebase() {
  // 1. Récupérer les URLs Firebase existantes
  // 2. Télécharger les fichiers
  // 3. Les uploader vers Appwrite
  // 4. Mettre à jour les URLs dans Firestore
}
```

## 9. Tests

### Test des uploads :
```javascript
// Test unitaire exemple
import { AppwriteMediaService } from './media-service';

test('Upload avatar utilisateur', async () => {
  const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
  const result = await AppwriteMediaService.uploadUserAvatar(file);
  expect(result.url).toBeDefined();
});
```

## 10. Dépannage

### Erreurs communes :

1. **"Bucket not found"** : Vérifiez que les buckets sont créés avec les bons IDs
2. **"Permission denied"** : Vérifiez les permissions des buckets
3. **"File too large"** : Vérifiez les limites de taille configurées
4. **"Invalid file type"** : Vérifiez les types MIME autorisés

### Debug :
Activez les logs détaillés en ajoutant :
```javascript
console.log('Appwrite debug:', { bucketId, fileId, permissions });
```

## Support

Pour toute question sur cette configuration, consultez :
- [Documentation Appwrite Storage](https://appwrite.io/docs/client/storage)
- [Guide des permissions Appwrite](https://appwrite.io/docs/permissions)
- Code source dans `lib/appwrite/`