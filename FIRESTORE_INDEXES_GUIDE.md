# FIRESTORE INDEXES - GUIDE COMPLET

## 📋 Vue d'ensemble

Ce document détaille tous les index Firestore requis pour le bon fonctionnement de l'application. Les index composites sont nécessaires pour les requêtes combinant `where()` et `orderBy()` ou plusieurs `where()`.

---

## 🔍 Index requis identifiés

### 1. **Campagnes FanFriends**

#### `campaigns_by_user`
- **Collection:** `campaigns`
- **Champs:** `createdBy` (ASC) + `createdAt` (DESC)
- **Utilisation:** `CampaignService.getCampaignsByUser()`
- **Requête:** `where('createdBy', '==', userId).orderBy('createdAt', 'desc')`

### 2. **Système de notifications**

#### `notifications_by_user`
- **Collection:** `notifications`
- **Champs:** `userId` (ASC) + `createdAt` (DESC)
- **Utilisation:** `NotificationService.getUserNotifications()`
- **Requête:** `where('userId', '==', userId).orderBy('createdAt', 'desc')`

#### `notifications_unread`
- **Collection:** `notifications`
- **Champs:** `userId` (ASC) + `isRead` (ASC)
- **Utilisation:** `NotificationService.markAsRead()` + `getUnreadCount()`
- **Requête:** `where('userId', '==', userId).where('isRead', '==', false)`

### 3. **Contenus des Laalas**

#### `contenus_by_laala`
- **Collection:** `contenus`
- **Champs:** `idLaala` (ASC) + `position` (ASC)
- **Utilisation:** `ContenuService.getByLaala()`
- **Requête:** `where('idLaala', '==', laalaId).orderBy('position', 'asc')`

### 4. **Laalas par créateur**

#### `laalas_by_creator`
- **Collection:** `laalas`
- **Champs:** `idCreateur` (ASC) + `date` (DESC)
- **Utilisation:** `LaalaService.getByCreator()`
- **Requête:** `where('idCreateur', '==', creatorId).orderBy('date', 'desc')`

#### `laalas_trending`
- **Collection:** `laalas`
- **Champs:** `encours` (ASC) + `vues` (DESC)
- **Utilisation:** `firebase-services.getLaalasPopulaires()`
- **Requête:** `where('encours', '==', true).orderBy('vues', 'desc')`

### 5. **Messages/Communications**

#### `messages_by_sender`
- **Collection:** `messages`
- **Champs:** `idsender` (ASC) + `createdAt` (DESC)
- **Utilisation:** `MessageService.getMessagesByUser()`
- **Requête:** `where('idsender', '==', userId).orderBy('createdAt', 'desc')`

#### `messages_by_expediteur`
- **Collection:** `messages`
- **Champs:** `idExpediteur` (ASC) + `createdAt` (DESC)
- **Utilisation:** `MessageService.getMessagesByUser()` (champ alternatif)
- **Requête:** `where('idExpediteur', '==', userId).orderBy('createdAt', 'desc')`

### 6. **Système de retraits**

#### `retraits_by_user`
- **Collection:** `retraits`
- **Champs:** `userId` (ASC) + `dateCreation` (DESC)
- **Utilisation:** Récupération des retraits par utilisateur
- **Requête:** `where('userId', '==', userId).orderBy('dateCreation', 'desc')`

#### `retraits_by_status`
- **Collection:** `retraits`
- **Champs:** `statut` (ASC) + `dateCreation` (DESC)
- **Utilisation:** Gestion administrative des retraits
- **Requête:** `where('statut', '==', status).orderBy('dateCreation', 'desc')`

### 7. **Filtrage des utilisateurs**

#### `users_by_country`
- **Collection:** `users`
- **Champs:** `pays` (ASC) + `createdAt` (DESC)
- **Utilisation:** `firebase-services.getUsersWithFilters()`
- **Requête:** `where('pays', '==', country).orderBy('createdAt', 'desc')`

#### `users_by_city`
- **Collection:** `users`
- **Champs:** `ville` (ASC) + `createdAt` (DESC)
- **Utilisation:** `firebase-services.getUsersWithFilters()`
- **Requête:** `where('ville', '==', city).orderBy('createdAt', 'desc')`

#### `users_certified`
- **Collection:** `users`
- **Champs:** `iscert` (ASC) + `createdAt` (DESC)
- **Utilisation:** `firebase-services.getUsersWithFilters()`
- **Requête:** `where('iscert', '==', true).orderBy('createdAt', 'desc')`

#### `users_connected`
- **Collection:** `users`
- **Champs:** `isconnect` (ASC) + `createdAt` (DESC)
- **Utilisation:** `firebase-services.getUsersWithFilters()`
- **Requête:** `where('isconnect', '==', true).orderBy('createdAt', 'desc')`

### 8. **Co-gestionnaires**

#### `cogestionnaires_by_laala`
- **Collection:** `co_gestionnaires`
- **Champs:** `laalaId` (ASC) + `createdAt` (DESC)
- **Utilisation:** Gestion des co-gestionnaires par Laala
- **Requête:** `where('laalaId', '==', laalaId).orderBy('createdAt', 'desc')`

#### `cogestionnaires_active`
- **Collection:** `co_gestionnaires`
- **Champs:** `userId` (ASC) + `isActive` (ASC)
- **Utilisation:** Récupération des co-gestionnaires actifs
- **Requête:** `where('userId', '==', userId).where('isActive', '==', true)`

---

## 🚀 Déploiement des index

### Méthode 1: Firebase CLI (Recommandée)

```bash
# 1. Installer Firebase CLI
npm install -g firebase-tools

# 2. Se connecter à Firebase
firebase login

# 3. Sélectionner le projet
firebase use votre-project-id

# 4. Déployer les index
firebase deploy --only firestore:indexes

# 5. Vérifier le statut
firebase firestore:indexes
```

### Méthode 2: Scripts automatiques

#### Windows (PowerShell)
```powershell
# Modifier PROJECT_ID dans le script
.\deploy-firestore-indexes.ps1
```

#### Linux/Mac (Bash)
```bash
# Modifier PROJECT_ID dans le script
chmod +x deploy-firestore-indexes.sh
./deploy-firestore-indexes.sh
```

### Méthode 3: Console Firebase

1. Aller sur https://console.firebase.google.com
2. Sélectionner votre projet
3. Aller dans Firestore Database > Index
4. Créer manuellement chaque index composite

---

## 🔧 Configuration

### Structure du fichier `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "campaigns",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdBy",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
    // ... autres index
  ],
  "fieldOverrides": []
}
```

### Variables d'environnement Firebase

```env
# .env.local
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=votre-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://votre-project-id.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-project-id.appspot.com
```

---

## 📊 Surveillance et maintenance

### Vérification du statut des index

```bash
# Voir tous les index
firebase firestore:indexes

# Filtrer par statut
firebase firestore:indexes | grep "Building"
firebase firestore:indexes | grep "Ready"
firebase firestore:indexes | grep "Error"
```

### États possibles des index

- **🟡 Building:** Index en cours de construction (peut prendre plusieurs minutes)
- **🟢 Ready:** Index prêt et utilisable
- **🔴 Error:** Erreur de construction (vérifier la configuration)

### Console Firebase

Consultez régulièrement la console Firebase pour:
- Surveiller la construction des index
- Identifier les erreurs
- Analyser l'utilisation

**URL:** https://console.firebase.google.com/project/VOTRE-PROJECT-ID/firestore/indexes

---

## ⚠️ Points importants

### 1. **Requêtes temporairement désactivées**

Certaines requêtes avec `orderBy` sont commentées en attendant les index:

```typescript
// CampaignService.ts ligne 165
// TODO: Remettre .orderBy('createdAt', 'desc') une fois l'index créé

// LaalaService.ts ligne 202  
// TODO: Remettre .orderBy('date', 'desc') une fois l'index créé
```

### 2. **Performance et coûts**

- Les index améliorent la performance des requêtes
- Chaque index consomme de l'espace de stockage
- Les écritures sont légèrement plus lentes (mise à jour des index)

### 3. **Limitations Firestore**

- Maximum 200 index composites par base de données
- Maximum 20 champs par index composite
- Certaines requêtes complexes ne sont pas supportées

---

## 🧪 Tests et validation

### Script de test des requêtes

```javascript
// test-firestore-queries.js
async function testQueries() {
  // Test des campagnes par utilisateur
  const campaigns = await db.collection('campaigns')
    .where('createdBy', '==', 'test-user')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();
  
  console.log('✅ Requête campaigns OK:', campaigns.size);
  
  // Test des notifications
  const notifications = await db.collection('notifications')
    .where('userId', '==', 'test-user')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  
  console.log('✅ Requête notifications OK:', notifications.size);
}
```

### Validation des index

1. **Déployer les index**
2. **Attendre la construction** (statut "Ready")
3. **Décommenter les requêtes** dans le code
4. **Tester les fonctionnalités** concernées
5. **Surveiller les erreurs** dans la console

---

## 🔮 Optimisations futures

### Index supplémentaires à considérer

- **Audit logs:** `userId` + `timestamp` + `action`
- **Boutiques actives:** `isActif` + `category` + `createdAt`
- **Analytics:** `date` + `metricType` + `value`

### Requêtes complexes

Pour des requêtes plus complexes, considérer:
- **Cloud Functions** pour la logique métier
- **BigQuery** pour l'analytics avancée
- **Elasticsearch** pour la recherche textuelle

---

## 📋 Checklist de déploiement

- [ ] **Fichier firestore.indexes.json** créé
- [ ] **Project ID** configuré dans les scripts
- [ ] **Firebase CLI** installé et authentifié
- [ ] **Index déployés** avec succès
- [ ] **Statut "Ready"** vérifié pour tous les index
- [ ] **Requêtes décommentées** dans le code
- [ ] **Tests fonctionnels** passés
- [ ] **Performance** vérifiée en production

---

## 🆘 Dépannage

### Erreurs courantes

#### "The query requires an index"
- **Cause:** Index composite manquant
- **Solution:** Déployer l'index correspondant

#### "Index creation failed"
- **Cause:** Configuration invalide
- **Solution:** Vérifier le fichier firestore.indexes.json

#### "Permission denied"
- **Cause:** Droits insuffisants
- **Solution:** Vérifier les rôles Firebase du compte

### Logs utiles

```bash
# Logs Firebase CLI
firebase --debug deploy --only firestore:indexes

# Logs application
console.log('Requête Firestore:', query.toString());
```

### Ressources d'aide

- **Documentation Firebase:** https://firebase.google.com/docs/firestore/query-data/indexing
- **Console Firebase:** https://console.firebase.google.com
- **Support Firebase:** https://firebase.google.com/support

---

## ✅ Conclusion

Une fois tous les index déployés et construits:

1. **18 index composites** configurés
2. **Toutes les requêtes** optimisées
3. **Performance** améliorée significativement
4. **Erreurs de requête** éliminées

Le système sera alors entièrement opérationnel avec des requêtes rapides et fiables.