# MODIFICATIONS APPLIQUÉES AU SYSTÈME CO-GESTIONNAIRE

## 🎯 OBJECTIFS
1. **Changement de mot de passe obligatoire** lors de la première connexion
2. **Masquage des sections non autorisées** selon les permissions
3. **Affichage de l'email de l'animateur** au lieu de celui du co-gestionnaire

## ✅ MODIFICATIONS RÉALISÉES

### 1. CHANGEMENT DE MOT DE PASSE OBLIGATOIRE

#### A. ForcePasswordChange Component (`components/auth/ForcePasswordChange.tsx`)
- ❌ **Supprimé** : Possibilité de fermer le modal (onClose désactivé)
- ✅ **Ajouté** : Empêche la fermeture par clic sur l'overlay
- ✅ **Modifié** : Couleur d'arrière-plan rouge pour urgence
- ✅ **Renforcé** : Message d'avertissement plus explicite

#### B. Dashboard Layout (`app/dashboard/layout.tsx`)
- ✅ **Conservé** : Logique existante avec usePasswordChangeRequired
- ✅ **Vérifié** : Modal affiché seulement si requiresPasswordChange = true

#### C. API Auth (`app/api/auth/check-password-change/route.ts`)
- ✅ **Vérifié** : Logique de vérification pour co-gestionnaires
- ✅ **Conservé** : Service CoGestionnaireAuthService.requiresPasswordChange()

### 2. MASQUAGE DES SECTIONS NON AUTORISÉES

#### A. Hook Permissions (`hooks/useCoGestionnairePermissions.ts`)
- ✅ **Créé** : Hook complet pour gérer les permissions co-gestionnaire
- ✅ **Interface** : CoGestionnairePermissions avec laalas/contenus
- ✅ **Fonctions** : hasPermission(), isCoGestionnaire(), getUserDisplayEmail()
- ✅ **API** : Appel à /api/co-gestionnaires/permissions

#### B. API Permissions (`app/api/co-gestionnaires/permissions/route.ts`)
- ✅ **Créé** : Nouvelle API pour récupérer permissions co-gestionnaire
- ✅ **Transformation** : Permissions complexes → format simple {laalas: bool, contenus: bool}
- ✅ **Auth** : Vérification token Firebase avec adminAuth
- ✅ **Sécurité** : Retourne 404 si utilisateur n'est pas co-gestionnaire

#### C. DashboardSidebar (`components/dashboard/DashboardSidebar.tsx`)
- ✅ **Import** : useCoGestionnairePermissions hook
- ✅ **Interface** : MenuItem avec requiredPermission optionnel
- ✅ **Logique** : shouldShowMenuItem() filtre selon permissions
- ✅ **Sous-menus** : getFilteredSubmenu() filtre aussi les sous-éléments
- ✅ **Sections** : Laalas nécessite permission 'laalas', Contenu nécessite 'contenus'

### 3. AFFICHAGE EMAIL ANIMATEUR

#### A. Modèle Co-gestionnaire (`app/models/co_gestionnaire.ts`)
- ✅ **Ajouté** : Champ `createdBy?: string` pour email animateur
- ✅ **Ajouté** : Même champ dans CoGestionnaireCore

#### B. API Création (`app/api/co-gestionnaires/route.ts`)
- ✅ **Modifié** : Capture animatorEmail depuis request body
- ✅ **Stockage** : createdBy = animatorEmail dans les données
- ✅ **Conversion** : ACCES → permissions spécifiques lors création

#### C. Formulaire Création (`components/forms/CoGestionnaireForm.tsx`)
- ✅ **Import** : useAuth context
- ✅ **Données** : animatorEmail = user?.email inclus dans dataToSend
- ✅ **Mode** : Seulement en mode 'create'

#### D. Hook Permissions (`hooks/useCoGestionnairePermissions.ts`)
- ✅ **Fonction** : getUserDisplayEmail() retourne email animateur si co-gestionnaire
- ✅ **Logique** : Email co-gestionnaire → Email animateur, Email animateur → Email animateur

#### E. Sidebar Footer (`components/dashboard/DashboardSidebar.tsx`)
- ✅ **Affichage** : getUserDisplayEmail() au lieu de user?.email
- ✅ **Label** : "Co-gestionnaire" ou "Animateur Pro" selon le type

## 🔧 LOGIQUE DE CONVERSION ACCES → PERMISSIONS

```javascript
const convertAccessToPermissions = (acces) => {
  switch (acces) {
    case 'consulter':  // READ seulement
      return [
        { resource: 'laalas', actions: ['read'] },
        { resource: 'contenus', actions: ['read'] }
      ];
    case 'gerer':      // READ + UPDATE
      return [
        { resource: 'laalas', actions: ['read', 'update'] },
        { resource: 'contenus', actions: ['read', 'update'] }
      ];
    case 'Ajouter':    // CREATE + READ + UPDATE
      return [
        { resource: 'laalas', actions: ['create', 'read', 'update'] },
        { resource: 'contenus', actions: ['create', 'read', 'update'] }
      ];
  }
};
```

## 🚀 FLUX UTILISATEUR

### Création Co-gestionnaire
1. Animateur remplit formulaire avec ACCES
2. API convertit ACCES → permissions spécifiques
3. createdBy = email animateur
4. mustChangePassword = true par défaut

### Première Connexion Co-gestionnaire
1. Layout vérifie usePasswordChangeRequired
2. Si mustChangePassword = true → ForcePasswordChange modal
3. Modal NE PEUT PAS être fermé jusqu'au changement réussi
4. Après changement → accès normal avec permissions filtrées

### Navigation Co-gestionnaire
1. useCoGestionnairePermissions récupère permissions via API
2. DashboardSidebar filtre menus selon permissions
3. Footer affiche email animateur au lieu de email co-gestionnaire

## 🎯 POINTS CLÉS

✅ **Sécurité renforcée** : Changement mot de passe obligatoire non contournable
✅ **UX améliorée** : Sections non autorisées masquées (pas d'erreurs 403)
✅ **Clarté** : Email animateur affiché pour identifier le créateur
✅ **Compatibilité** : Aucun impact sur fonctionnalités existantes animateurs
✅ **Performance** : API optimisée avec transformation permissions simplifiée

## 📋 TESTS RECOMMANDÉS

1. **Créer un co-gestionnaire** → Vérifier email animateur stocké
2. **Première connexion co-gestionnaire** → Vérifier modal obligatoire
3. **Navigation co-gestionnaire** → Vérifier sections masquées selon permissions
4. **Footer sidebar** → Vérifier affichage email animateur
5. **Connexion animateur** → Vérifier aucun impact
