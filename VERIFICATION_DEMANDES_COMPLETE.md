# VÉRIFICATION COMPLÈTE - SYSTÈME DEMANDES DE COMPTE

## 🎯 Objectif
Vérifier l'enregistrement des demandes dans Firebase, l'affichage et le traitement par l'admin.

## 📋 Points de vérification

### 1. **Structure de la base de données Firebase**

#### Collection `account-requests`
La collection doit avoir cette structure :
```typescript
{
  id: string,                    // Auto-généré par Firestore
  email: string,                 // Email du demandeur
  status: 'pending' | 'approved' | 'rejected',
  requestDate: string,           // ISO date string
  adminId?: string,              // ID de l'admin qui traite
  adminComment?: string,         // Commentaire de l'admin
  processedDate?: string,        // Date de traitement
  temporaryPassword?: string,    // Mot de passe temporaire
  isFirstLogin: boolean,         // Première connexion
  createdAt: Timestamp,          // Timestamp Firestore
  updatedAt: Timestamp           // Timestamp Firestore
}
```

### 2. **Flux de création des demandes**

#### Étapes de vérification :
1. **Frontend → API** : `POST /api/auth/request-account`
2. **API → Service** : `AccountRequestService.createRequest()`
3. **Service → BaseService** : `this.create()`
4. **BaseService → Firestore** : `collection.add()`

#### Points critiques à vérifier :
- ✅ Email validé (format et unicité)
- ✅ Génération des champs automatiques
- ✅ Timestamps Firestore corrects
- ✅ Utilisation de la bonne collection

### 3. **Flux de récupération par l'admin**

#### Étapes de vérification :
1. **Dashboard → API** : `GET /api/admin/account-requests`
2. **API → Authentification** : Vérification token JWT
3. **API → Service** : `AccountRequestService.getAllRequests()`
4. **Service → Firestore** : Query collection

#### Points critiques à vérifier :
- ✅ Token admin valide
- ✅ Permissions `manage-accounts`
- ✅ Récupération TOUTES les demandes (pas seulement pending)
- ✅ Mapping correct ID Firestore
- ✅ Tri par date décroissante

### 4. **Flux de traitement des demandes**

#### Approbation :
1. **Dashboard → API** : `POST /api/admin/account-requests/approve`
2. **API → Service** : `AccountRequestService.approveRequestWithCustomData()`
3. **Service → UserService** : Création utilisateur
4. **Service → EmailService** : Envoi email
5. **Service → Firestore** : Mise à jour statut

#### Rejet :
1. **Dashboard → API** : `POST /api/admin/account-requests/reject`
2. **API → Service** : `AccountRequestService.rejectRequestWithCustomData()`
3. **Service → EmailService** : Envoi email notification
4. **Service → Firestore** : Mise à jour statut

## 🧪 Tests de diagnostic

### Test 1: API de diagnostic Firebase
```bash
curl http://localhost:3000/api/diagnostic/firebase-test
```
**Vérifie :**
- Configuration Firebase Admin
- Création/lecture documents
- Intégrité collection

### Test 2: API de diagnostic Admin Dashboard
```bash
curl http://localhost:3000/api/diagnostic/admin-dashboard
```
**Vérifie :**
- Génération token admin
- Permissions et authentification
- Format données pour dashboard
- Statistiques par statut

### Test 3: Création manuelle d'une demande
```bash
curl -X POST http://localhost:3000/api/auth/request-account \
  -H "Content-Type: application/json" \
  -d '{"email":"test-verification@example.com"}'
```

### Test 4: Récupération par l'admin (avec token valide)
```bash
curl http://localhost:3000/api/admin/account-requests \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔧 Corrections apportées

### 1. **Configuration collection**
- ✅ Ajout `ACCOUNT_REQUESTS` dans `COLLECTIONS`
- ✅ Utilisation de la constante dans `AccountRequestService`

### 2. **Service AccountRequestService**
- ✅ Utilisation correcte de `BaseService.create()`
- ✅ Logs détaillés pour debugging
- ✅ Gestion d'erreurs améliorée

### 3. **API de diagnostic complète**
- ✅ Test chaîne complète création → récupération
- ✅ Validation format données dashboard
- ✅ Simulation authentification admin

### 4. **Dashboard AdminDashboard**
- ✅ Gestion retry automatique
- ✅ Affichage toutes les demandes (pas seulement pending)
- ✅ Interface de traitement (approve/reject)

## ⚠️ Points d'attention

### 1. **Variables d'environnement**
Vérifiez que ces variables sont définies :
```bash
FIREBASE_PROJECT_ID=dashboard-4f9c8
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@dashboard-4f9c8.iam.gserviceaccount.com
COLLECTION_ACCOUNT_REQUESTS=account-requests  # Optionnel
```

### 2. **Règles Firestore**
Assurez-vous que les règles permettent l'accès au service account :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /account-requests/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. **Index Firestore**
Pour les requêtes optimisées, créez ces index :
- Collection: `account-requests`
- Champs: `status` (Ascending), `requestDate` (Descending)

## 🚀 Procédure de test recommandée

1. **Redémarrer le serveur** pour prendre en compte les modifications
2. **Tester la connexion Firebase** via l'API de diagnostic
3. **Créer une demande de test** via l'interface utilisateur
4. **Vérifier dans l'admin dashboard** que la demande apparaît
5. **Tester l'approbation/rejet** d'une demande
6. **Vérifier l'envoi d'emails** (logs serveur)

## 📊 Métriques de succès

- ✅ Demandes créées apparaissent immédiatement dans l'admin
- ✅ Tous les champs sont correctement remplis
- ✅ Le traitement admin fonctionne (approve/reject)
- ✅ Les emails sont envoyés correctement
- ✅ Les statuts sont mis à jour en temps réel

## 🆘 Dépannage

### Problème : Demandes non affichées
1. Vérifier la configuration Firebase Admin
2. Vérifier les permissions collection Firestore
3. Vérifier les logs serveur pour erreurs

### Problème : Erreur lors de la création
1. Vérifier les variables d'environnement
2. Vérifier que Firestore est activé
3. Vérifier les quotas Firebase

### Problème : Traitement admin échoué
1. Vérifier la configuration email
2. Vérifier les services UserService et EmailService
3. Vérifier les permissions admin dans le token
