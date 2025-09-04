# 🔧 CONFIGURATION FINALE - GUIDE COMPLET JWT & EMAIL

## 📋 **Variables d'environnement - État actuel (.env.local)**

### ✅ **JWT_SECRET - CONFIGURÉ :**
```env
# JWT Secret pour l'authentification (généré automatiquement)
JWT_SECRET=a247cb7efc997015f8fb0360144061e09738e88c7141cfc0ac26d20a7587d77a
```

### ✅ **Firebase Configuration (configuré) :**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBms2zGcbwbmJyj-9u8dYK7EaTWQ5kW-HE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=etudenotaire-9e21c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=etudenotaire-9e21c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=etudenotaire-9e21c.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1086718015486
NEXT_PUBLIC_FIREBASE_APP_ID=1:1086718015486:web:c6d96d0ab1a1c4f7e4e20b
```

### ✅ **AppWrite Configuration (configuré) :**
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=676e45200036b4c4b59e
NEXT_PUBLIC_APPWRITE_DATABASE_ID=676e453f002f6c1e4c72
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=676e490a000bc25e9bb7
```

### ⚠️ **Configuration Email (À finaliser) :**
```env
# Email Configuration pour notifications (Gmail)
EMAIL_USER=votre-email@gmail.com          # ⚠️ À remplacer
EMAIL_PASSWORD=votre-mot-de-passe-app      # ⚠️ Mot de passe d'application Gmail
```

---

## 🚀 **JWT_SECRET - Configuration terminée**

### ✅ **Ce qui a été fait :**
1. **Génération sécurisée** : Clé de 64 caractères (hex) avec crypto.randomBytes(32)
2. **Mise à jour .env.local** : JWT_SECRET configuré automatiquement
3. **Sécurité** : Clé unique et robuste pour la signature des tokens JWT

### 🔧 **Utilisation :**
- **Authentification admin** : Tokens JWT signés avec cette clé
- **Sessions sécurisées** : Validation automatique des tokens
- **Middleware** : Protection des routes admin

---

## 📧 **Configuration Email finale**

### **Étape 1 : Activer l'authentification à 2 facteurs Gmail**
1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. **Sécurité** → **Validation en 2 étapes** → **Activer**

### **Étape 2 : Générer un mot de passe d'application**
1. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. **Nom de l'application** : "Stage Notaire Email"
3. **Copiez le mot de passe** (format : xxxx xxxx xxxx xxxx)

### **Étape 3 : Mettre à jour .env.local**
```env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Le mot de passe d'app généré
```

---

## 🧪 **Tests de configuration**

### **Test JWT (déjà fonctionnel) :**
```bash
# Connexion admin
# Email: tedkouevi701@gmail.com
# Mot de passe: feiderus
```

### **Test Email (après config Gmail) :**
```bash
# Démarrer le serveur
npm run dev

# Test configuration
http://localhost:3000/api/admin/test-email
```

---

## ✅ **Checklist finale**

### **Authentification & JWT :**
- [x] JWT_SECRET généré et configuré (64 caractères sécurisés)
- [x] Authentification admin opérationnelle
- [x] Dashboard admin avec auto-refresh
- [x] Middleware de protection des routes

### **Système Email :**
- [x] EmailService avec templates personnalisés
- [x] Preview email avec édition en temps réel
- [x] APIs d'approbation/rejet des comptes
- [x] Gestion d'erreurs robuste
- [ ] Configuration Gmail (EMAIL_USER/EMAIL_PASSWORD)

### **Base de données :**
- [x] Firebase configuré et fonctionnel
- [x] AppWrite configuré et fonctionnel
- [x] Collections et permissions configurées

---

## 🆘 **Dépannage**

### **Problèmes JWT :**
- ✅ **Résolu** : JWT_SECRET configuré automatiquement
- **Si erreur** : Redémarrer le serveur après modification .env.local

### **Problèmes Email :**
- **Diagnostic** : `node diagnostic-email-apis.js`
- **Test API** : `/api/admin/test-email`
- **Logs** : Console du navigateur et terminal

### **Scripts utiles :**
```bash
# Générer nouveau JWT_SECRET
node generate-jwt-secret.js

# Diagnostic email
node diagnostic-email-apis.js

# Vérification complète
npm run dev
```

---

**Configuration JWT terminée ✅**  
**Prochaine étape : Configuration Gmail pour les emails** 📧

### 2. **Configuration dans Appwrite Console**

Si le bucket n'existe pas ou n'est pas bien configuré :

1. **Allez dans Appwrite Console** → Storage → Create Bucket
2. **Paramètres du bucket** :
   - **ID** : `medias`
   - **Nom** : `Médias La-a-La`
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