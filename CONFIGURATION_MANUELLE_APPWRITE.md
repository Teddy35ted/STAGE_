# Configuration Manuelle du Bucket "medias" Appwrite

Votre clé API est configurée, mais il y a un problème de compatibilité avec le script. Voici comment configurer manuellement votre bucket "medias".

## 🔑 **Votre Clé API**
✅ **Configurée** : `standard_133518e05013f870174cdbb3e319f693386a50511204cd0c080b6e6f13f6701300dd7cdd994c82d334979f1cf4402f6dd450a17e5dd05b51f6a4f52de7e20ce84674d491b6a42f74230f7c2eefc2b9f6703a1fb7a37aaadfbcd827052834842c88a42a1dad59a8cd8d18097a5550af7c17f0a326e0418542176faa86e69875ef`

## 📋 **Configuration Manuelle dans Appwrite Console**

### **Étape 1 : Accéder à la Console**
1. Allez sur [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet : **`688f85190004fa948692`**

### **Étape 2 : Créer le Bucket**
1. Dans le menu de gauche, cliquez sur **"Storage"**
2. Cliquez sur **"Create Bucket"**
3. Configurez avec ces paramètres **EXACTS** :

#### **Paramètres de Base**
- **Bucket ID** : `medias` (exactement, sans majuscules)
- **Name** : `Médias La-a-La`

#### **Paramètres de Fichiers**
- **Maximum file size** : `100 MB` (104857600 bytes)
- **Allowed file extensions** : 
  ```
  jpg, jpeg, png, gif, webp, svg, mp4, avi, mov, wmv, webm, mkv
  ```

#### **Paramètres de Sécurité**
- **File Security** : ✅ **Activé**
- **Enabled** : ✅ **Activé**
- **Compression** : `gzip`
- **Encryption** : ✅ **Activé**
- **Antivirus** : ✅ **Activé**

#### **Permissions**
Ajoutez ces permissions **EXACTEMENT** :

1. **Read Permission** :
   - Type : `any`
   - Valeur : `any`

2. **Create Permission** :
   - Type : `users`
   - Valeur : `users`

3. **Update Permission** :
   - Type : `users`
   - Valeur : `users`

4. **Delete Permission** :
   - Type : `users`
   - Valeur : `users`

### **Étape 3 : Vérifier la Configuration**

Une fois créé, vérifiez que :
- ✅ Le bucket ID est exactement `medias`
- ✅ La taille max est 100MB
- ✅ Les extensions incluent images et vidéos
- ✅ Les permissions sont configurées
- ✅ Le bucket est activé

## 🧪 **Test de Fonctionnement**

### **Test 1 : Vérification Manuelle**
1. Dans Appwrite Console → Storage → medias
2. Essayez d'uploader un fichier test
3. Vérifiez qu'il apparaît dans le bucket

### **Test 2 : Test depuis l'Application**
1. Utilisez un des formulaires modifiés
2. Tentez un upload d'image
3. Vérifiez dans Appwrite Console que le fichier apparaît

## 📁 **Organisation Attendue**

Une fois configuré, vos fichiers seront organisés automatiquement :

```
medias/
├── users/avatars/2024-01-15/userId/avatar.jpg
├── laalas/covers/2024-01-15/userId/laalaId/cover.mp4
├── contenus/media/2024-01-15/userId/contenuId/video.mp4
└── boutiques/images/2024-01-15/userId/boutiqueId/image.jpg
```

## 🔧 **Utilisation dans vos Formulaires**

### **1. Upload d'Avatar**
```tsx
import UserAvatarUpload from '@/components/forms/UserAvatarUpload';

<UserAvatarUpload
  currentAvatar={user.avatar}
  userName={user.nom}
  userId="98455866TG" // ID utilisateur obligatoire
  onAvatarUpdate={(newUrl) => {
    // Sauvegarder newUrl dans Firebase
    updateUserAvatar(userId, newUrl);
  }}
/>
```

### **2. Création de Laala**
```tsx
import LaalaCreateForm from '@/components/forms/LaalaCreateForm';

<LaalaCreateForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  creatorId="98455866TG" // ID utilisateur obligatoire
  onSubmit={(laalaData) => {
    // laalaData.coverUrl contient l'URL du média
    console.log('Couverture:', laalaData.coverUrl);
    saveLaalaToFirebase(laalaData);
  }}
/>
```

### **3. Création de Contenu**
```tsx
import ContenuCreateForm from '@/components/forms/ContenuCreateForm';

<ContenuCreateForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  creatorId="98455866TG" // ID utilisateur obligatoire
  availableLaalas={[
    { id: "laala1", name: "Mon Laala 1" }
  ]}
  onSubmit={(contenuData) => {
    // contenuData.mediaUrl contient l'URL du média
    console.log('Média:', contenuData.mediaUrl);
    saveContenuToFirebase(contenuData);
  }}
/>
```

### **4. Création de Boutique**
```tsx
import BoutiqueCreateForm from '@/components/forms/BoutiqueCreateForm';

<BoutiqueCreateForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  ownerId="98455866TG" // ID utilisateur obligatoire
  onSubmit={(boutiqueData) => {
    // boutiqueData.cover et boutiqueData.images contiennent les URLs
    console.log('Couverture:', boutiqueData.cover);
    console.log('Images:', boutiqueData.images);
    saveBoutiqueToFirebase(boutiqueData);
  }}
/>
```

## ⚠️ **Points Importants**

### **1. ID Utilisateur Obligatoire**
Tous les uploads nécessitent un `userId` :
```tsx
// ❌ Ne fonctionne pas
<MediaUpload category="user-avatar" />

// ✅ Fonctionne
<MediaUpload category="user-avatar" userId="98455866TG" />
```

### **2. Gestion des Erreurs**
```tsx
onUploadError={(error) => {
  console.error('Erreur upload:', error);
  // Afficher un message à l'utilisateur
  alert(`Erreur : ${error}`);
}}
```

### **3. Sauvegarde dans Firebase**
```tsx
onUploadSuccess={(result) => {
  // Sauvegarder l'URL dans Firebase
  updateFirestoreDocument(entityId, { 
    mediaUrl: result.url,
    mediaPath: result.path // Optionnel pour référence
  });
}}
```

## 🎯 **Résultat Final**

Une fois configuré, vous aurez :

- ✅ **Bucket "medias"** configuré dans Appwrite
- ✅ **Upload d'avatars** avec organisation automatique
- ✅ **Upload de couvertures Laala** (image/vidéo)
- ✅ **Upload de médias de contenu** selon le type
- ✅ **Upload d'images de boutique** avec galerie
- ✅ **Organisation automatique** par dossiers et dates
- ✅ **URLs prêtes** pour Firebase
- ✅ **Validation automatique** par catégorie

## 🚨 **En cas de Problème**

### **Bucket non trouvé**
- Vérifiez que l'ID est exactement `medias`
- Assurez-vous que le bucket est activé

### **Permission denied**
- Vérifiez les permissions dans Appwrite Console
- Assurez-vous que l'utilisateur est connecté

### **File too large**
- Vérifiez la limite de 100MB dans le bucket
- Adaptez la taille des fichiers

### **Invalid file type**
- Vérifiez les extensions autorisées
- Assurez-vous que le type MIME est correct

## 📞 **Support**

Si vous rencontrez des problèmes :
1. Vérifiez la configuration du bucket dans Appwrite Console
2. Testez avec un fichier simple (image JPG < 5MB)
3. Vérifiez les logs de la console du navigateur
4. Confirmez que l'ID utilisateur est fourni

Le système est maintenant prêt à utiliser ! 🚀