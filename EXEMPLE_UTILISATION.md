# Exemples d'Utilisation - Système de Médias Appwrite

Voici des exemples concrets d'utilisation des formulaires modifiés avec le bucket unique "medias".

## 🎯 **Configuration Terminée**

✅ **Clé API Appwrite** : Configurée dans `.env.local`  
✅ **Bucket "medias"** : À créer manuellement dans Appwrite Console  
✅ **Formulaires** : Tous modifiés pour le bucket unique  
✅ **Services** : Adaptés pour l'organisation automatique  

## 💻 **Exemples d'Utilisation**

### **1. Page de Profil avec Upload d'Avatar**

```tsx
// pages/profile.tsx ou components/ProfilePage.tsx
import React, { useState } from 'react';
import UserAvatarUpload from '@/components/forms/UserAvatarUpload';

export default function ProfilePage() {
  const [user, setUser] = useState({
    id: "98455866TG", // ID utilisateur connecté
    nom: "John Doe",
    avatar: "https://example.com/current-avatar.jpg" // Avatar actuel
  });

  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    try {
      // Mettre à jour dans Firebase
      await updateUserInFirestore(user.id, { avatar: newAvatarUrl });
      
      // Mettre à jour l'état local
      setUser(prev => ({ ...prev, avatar: newAvatarUrl }));
      
      console.log('Avatar mis à jour:', newAvatarUrl);
      alert('Photo de profil mise à jour avec succès !');
    } catch (error) {
      console.error('Erreur mise à jour avatar:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
      
      <UserAvatarUpload
        currentAvatar={user.avatar}
        userName={user.nom}
        userId={user.id}
        onAvatarUpdate={handleAvatarUpdate}
        onError={(error) => {
          console.error('Erreur upload avatar:', error);
          alert(`Erreur : ${error}`);
        }}
      />
      
      {/* Autres informations du profil */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Informations</h2>
        <p>Nom : {user.nom}</p>
        <p>ID : {user.id}</p>
      </div>
    </div>
  );
}
```

### **2. Page de Création de Laala**

```tsx
// pages/laalas/create.tsx ou components/LaalaPage.tsx
import React, { useState } from 'react';
import LaalaCreateForm from '@/components/forms/LaalaCreateForm';
import { Button } from '@/components/ui/button';

export default function LaalaPage() {
  const [showForm, setShowForm] = useState(false);
  const [currentUser] = useState({
    id: "98455866TG", // ID utilisateur connecté
    nom: "John Doe"
  });

  const handleLaalaSubmit = async (laalaData: any) => {
    try {
      console.log('Données Laala:', laalaData);
      console.log('Couverture URL:', laalaData.coverUrl);
      console.log('Type couverture:', laalaData.coverType);
      
      // Sauvegarder dans Firebase
      const response = await fetch('/api/laalas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...laalaData,
          // L'URL de la couverture est déjà dans laalaData.coverUrl
        })
      });

      if (response.ok) {
        alert('Laala créé avec succès !');
        setShowForm(false);
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur création Laala:', error);
      alert('Erreur lors de la création du Laala');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Laalas</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          Créer un Laala
        </Button>
      </div>

      {/* Liste des Laalas existants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Vos Laalas existants */}
      </div>

      {/* Formulaire de création */}
      <LaalaCreateForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        creatorId={currentUser.id}
        onSubmit={handleLaalaSubmit}
      />
    </div>
  );
}
```

### **3. Page de Création de Contenu**

```tsx
// pages/contenus/create.tsx ou components/ContenuPage.tsx
import React, { useState, useEffect } from 'react';
import ContenuCreateForm from '@/components/forms/ContenuCreateForm';
import { Button } from '@/components/ui/button';

export default function ContenuPage() {
  const [showForm, setShowForm] = useState(false);
  const [availableLaalas, setAvailableLaalas] = useState([]);
  const [currentUser] = useState({
    id: "98455866TG", // ID utilisateur connecté
    nom: "John Doe"
  });

  // Charger les Laalas disponibles
  useEffect(() => {
    const loadLaalas = async () => {
      try {
        const response = await fetch(`/api/laalas?creatorId=${currentUser.id}`);
        const laalas = await response.json();
        
        setAvailableLaalas(laalas.map((laala: any) => ({
          id: laala.id,
          name: laala.nom
        })));
      } catch (error) {
        console.error('Erreur chargement Laalas:', error);
      }
    };

    loadLaalas();
  }, [currentUser.id]);

  const handleContenuSubmit = async (contenuData: any) => {
    try {
      console.log('Données Contenu:', contenuData);
      console.log('Média URL:', contenuData.mediaUrl);
      console.log('Type:', contenuData.type);
      
      // Sauvegarder dans Firebase
      const response = await fetch('/api/contenus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contenuData,
          // L'URL du média est déjà dans contenuData.src ou contenuData.mediaUrl
        })
      });

      if (response.ok) {
        alert('Contenu créé avec succès !');
        setShowForm(false);
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur création contenu:', error);
      alert('Erreur lors de la création du contenu');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Contenus</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
          disabled={availableLaalas.length === 0}
        >
          Créer un Contenu
        </Button>
      </div>

      {availableLaalas.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Vous devez d'abord créer un Laala avant de pouvoir ajouter du contenu.
          </p>
        </div>
      )}

      {/* Liste des contenus existants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Vos contenus existants */}
      </div>

      {/* Formulaire de création */}
      <ContenuCreateForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        creatorId={currentUser.id}
        availableLaalas={availableLaalas}
        onSubmit={handleContenuSubmit}
      />
    </div>
  );
}
```

### **4. Page de Création de Boutique**

```tsx
// pages/boutiques/create.tsx ou components/BoutiquePage.tsx
import React, { useState } from 'react';
import BoutiqueCreateForm from '@/components/forms/BoutiqueCreateForm';
import { Button } from '@/components/ui/button';

export default function BoutiquePage() {
  const [showForm, setShowForm] = useState(false);
  const [currentUser] = useState({
    id: "98455866TG", // ID utilisateur connecté
    nom: "John Doe"
  });

  const handleBoutiqueSubmit = async (boutiqueData: any) => {
    try {
      console.log('Données Boutique:', boutiqueData);
      console.log('Image de couverture:', boutiqueData.cover);
      console.log('Images galerie:', boutiqueData.images);
      
      // Sauvegarder dans Firebase
      const response = await fetch('/api/boutiques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...boutiqueData,
          // Les URLs des images sont déjà dans boutiqueData
        })
      });

      if (response.ok) {
        alert('Boutique créée avec succès !');
        setShowForm(false);
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur création boutique:', error);
      alert('Erreur lors de la création de la boutique');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Boutiques</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          Créer une Boutique
        </Button>
      </div>

      {/* Liste des boutiques existantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Vos boutiques existantes */}
      </div>

      {/* Formulaire de création */}
      <BoutiqueCreateForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        ownerId={currentUser.id}
        onSubmit={handleBoutiqueSubmit}
      />
    </div>
  );
}
```

## 🔧 **Fonctions Utilitaires**

### **Mise à jour Firebase**

```tsx
// utils/firebase-helpers.ts
export async function updateUserInFirestore(userId: string, data: any) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Erreur mise à jour utilisateur');
  }
  
  return response.json();
}

export async function createLaalaInFirestore(laalaData: any) {
  const response = await fetch('/api/laalas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(laalaData)
  });
  
  if (!response.ok) {
    throw new Error('Erreur création Laala');
  }
  
  return response.json();
}

export async function createContenuInFirestore(contenuData: any) {
  const response = await fetch('/api/contenus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contenuData)
  });
  
  if (!response.ok) {
    throw new Error('Erreur création contenu');
  }
  
  return response.json();
}

export async function createBoutiqueInFirestore(boutiqueData: any) {
  const response = await fetch('/api/boutiques', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(boutiqueData)
  });
  
  if (!response.ok) {
    throw new Error('Erreur création boutique');
  }
  
  return response.json();
}
```

## 🎯 **Points Clés**

### **1. ID Utilisateur Obligatoire**
```tsx
// Toujours fournir l'ID utilisateur
const currentUserId = "98455866TG"; // Récupéré depuis votre système d'auth

<MediaUpload 
  category="user-avatar" 
  userId={currentUserId} // OBLIGATOIRE
  onUploadSuccess={...}
/>
```

### **2. Gestion des URLs**
```tsx
// Les URLs sont automatiquement générées par Appwrite
onUploadSuccess={(result) => {
  console.log('URL du fichier:', result.url);
  console.log('Chemin organisé:', result.path);
  console.log('Catégorie:', result.category);
  
  // Sauvegarder result.url dans Firebase
  saveToFirebase({ mediaUrl: result.url });
}}
```

### **3. Organisation Automatique**
```
medias/
├── users/avatars/2024-01-15/98455866TG/avatar_abc123.jpg
├── laalas/covers/2024-01-15/98455866TG/laala456/cover_def789.mp4
├── contenus/media/2024-01-15/98455866TG/contenu789/video_ghi012.mp4
└── boutiques/images/2024-01-15/98455866TG/boutique123/image_jkl345.jpg
```

## 🚀 **Démarrage Rapide**

1. **Configurez le bucket "medias"** dans Appwrite Console
2. **Copiez un des exemples** ci-dessus
3. **Adaptez l'ID utilisateur** à votre système
4. **Testez l'upload** d'un fichier
5. **Vérifiez dans Appwrite Console** que le fichier est organisé

Le système est maintenant prêt à utiliser ! 🎉