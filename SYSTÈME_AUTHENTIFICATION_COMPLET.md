# 🔧 SYSTÈME D'AUTHENTIFICATION ET GESTION DES COMPTES AMÉLIORÉ

## 📋 Vue d'ensemble

Ce document décrit le nouveau système complet de gestion des comptes et d'authentification implémenté dans le projet STAGE_.

## 🏗️ Architecture du Système

### 1. Flux Complet de Création de Compte

```
1. Demande de compte → 2. Validation admin → 3. Mot de passe temporaire → 4. Changement MDP → 5. Complétion profil → 6. Accès dashboard
```

### 2. Composants Principaux

#### A. Services Backend
- **UserService** : Gestion des utilisateurs et authentification
- **AccountRequestService** : Gestion des demandes de compte
- **CoGestionnaireService** : Gestion des co-gestionnaires

#### B. APIs Disponibles
- **Demandes de compte** : `/api/account-requests`
- **Authentification** : `/api/auth/login`
- **Changement mot de passe** : `/api/auth/change-temporary-password`
- **Complétion profil** : `/api/auth/complete-profile`
- **Nettoyage base** : `/api/admin/cleanup-database`

## 🔄 Processus Détaillé

### 1. Nettoyage de la Base de Données

**API:** `POST /api/admin/cleanup-database`

**Objectif:** Supprimer tous les documents de toutes les collections sauf `admins`

**Collections nettoyées:**
- users
- laalas
- contenus
- messages
- boutiques
- co_gestionnaires
- retraits
- campaigns
- audit_logs
- account-requests

**Exemple d'utilisation:**
```javascript
fetch('/api/admin/cleanup-database', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ confirmClean: true })
})
```

### 2. Demande de Création de Compte

**API:** `POST /api/account-requests`

**Champs requis:**
- `email` : Email de l'utilisateur

**Exemple:**
```javascript
fetch('/api/account-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'utilisateur@example.com'
  })
})
```

### 3. Traitement par l'Admin

**API:** `POST /api/account-requests/[id]`

**Actions possibles:**
- `approve` : Approuver la demande
- `reject` : Rejeter la demande

**Paramètres:**
- `action` : 'approve' ou 'reject'
- `adminComment` : Commentaire administrateur (optionnel)
- `customPassword` : Mot de passe personnalisé (optionnel, sinon auto-généré)

**Exemple approbation:**
```javascript
fetch('/api/account-requests/123456', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    action: 'approve',
    adminComment: 'Demande validée'
  })
})
```

### 4. Authentification avec Mot de Passe Temporaire

**API:** `POST /api/auth/login`

**Réponse enrichie:**
```json
{
  "success": true,
  "user": { ... },
  "requiresPasswordChange": true,
  "requiresProfileCompletion": true,
  "nextStep": "change-password"
}
```

**Étapes possibles:**
- `change-password` : Doit changer le mot de passe temporaire
- `complete-profile` : Doit compléter son profil
- `dashboard` : Peut accéder au dashboard

### 5. Changement du Mot de Passe Temporaire

**API:** `POST /api/auth/change-temporary-password`

**Champs requis:**
- `userId` : ID de l'utilisateur
- `newPassword` : Nouveau mot de passe
- `confirmPassword` : Confirmation du mot de passe

**Validations:**
- Minimum 8 caractères
- Correspondance entre mot de passe et confirmation

### 6. Complétion du Profil

**API:** `POST /api/auth/complete-profile`

**Champs requis:**
- `nom` : Nom de famille
- `prenom` : Prénom
- `tel` : Numéro de téléphone
- `pays` : Pays de résidence

**Champs optionnels:**
- `sexe` : 'Masculin', 'Féminin', 'Autre'
- `ville` : Ville de résidence
- `quartier` : Quartier
- `region` : Région
- `date_de_naissance` : Date de naissance

## 🔒 Gestion des Rôles et Sécurité

### Nouveaux Champs UserDashboard

```typescript
// Gestion authentification et profil
requiresPasswordChange?: boolean;  // Mot de passe temporaire à changer
firstLogin?: boolean;              // Premier login
profileCompleted?: boolean;        // Profil complété
profileCompletedAt?: string;       // Date complétion profil
passwordChangedAt?: string;        // Date changement mot de passe
```

### Méthodes UserService Ajoutées

- `markAsRequirePasswordChange()` : Marquer pour changement MDP
- `changeTemporaryPassword()` : Changer le mot de passe temporaire
- `completeProfile()` : Compléter le profil utilisateur
- `isFirstLogin()` : Vérifier si premier login
- `needsProfileCompletion()` : Vérifier si profil à compléter
- `authenticateWithTemporaryPassword()` : Authentification enrichie

## 🎯 Actions CRUD pour Animateurs

### Collections Gérées par les Animateurs
1. **Retraits** : Gestion des demandes de retrait
2. **Laalas** : Gestion du contenu Laala
3. **Contenus** : Gestion des contenus
4. **Co-gestionnaires** : Gestion des co-gestionnaires

### APIs Existantes à Vérifier
- `/api/retraits` : CRUD retraits
- `/api/laalas` : CRUD laalas  
- `/api/contenus` : CRUD contenus
- `/api/co-gestionnaires` : CRUD co-gestionnaires

## 🔧 Interface de Test

**Fichier:** `test-systeme-complet.html`

**Sections de test:**
1. Nettoyage base de données
2. Création demandes de compte
3. Traitement des demandes (admin)
4. Test authentification
5. Changement mot de passe temporaire
6. Complétion de profil

## 📝 TODO - Prochaines Étapes

### 1. Vérification Services Co-gestionnaires
- [ ] Tester l'API `/api/co-gestionnaires/auth/login`
- [ ] Vérifier le service `CoGestionnaireAuthService`
- [ ] S'assurer de la compatibilité

### 2. CRUD Animateurs
- [ ] Vérifier API retraits
- [ ] Vérifier API laalas
- [ ] Vérifier API contenus
- [ ] Tester les permissions

### 3. Interface d'Authentification
- [ ] Clarifier les rôles sur la page d'accueil
- [ ] Éviter les confusions de rôles
- [ ] Interface de changement MDP temporaire
- [ ] Interface de complétion profil

### 4. Sécurité et Validation
- [ ] Middleware d'authentification
- [ ] Validation des permissions par rôle
- [ ] Audit des actions sensibles
- [ ] Limitation des tentatives de connexion

## 🧪 Tests de Validation

### Test 1: Flux Complet Nouveau Utilisateur
```bash
1. Nettoyer la base → 2. Créer demande → 3. Approuver → 4. Login → 5. Changer MDP → 6. Compléter profil → 7. Accès dashboard
```

### Test 2: Gestion des Erreurs
```bash
1. Demande avec email existant → 2. Login avec mauvais MDP → 3. Changement MDP avec erreurs → 4. Profil incomplet
```

### Test 3: Rôles et Permissions
```bash
1. Login animateur → 2. CRUD collections → 3. Login co-gestionnaire → 4. Permissions spécifiques
```

---

**🚀 Statut:** Système de base implémenté, prêt pour tests et ajustements  
**🔄 Dernière mise à jour:** 2025-09-05  
**📋 Version:** 1.0.0
