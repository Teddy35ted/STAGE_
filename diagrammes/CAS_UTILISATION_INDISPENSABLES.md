# 📋 DESCRIPTIONS DES CAS D'UTILISATION ESSENTIELS

Descriptions textuelles des 14 cas d'utilisation essentiels avec scénarios nominaux et alternatifs.

---

## 🔐 COMPTE

### UC-01 : Se connecter / Créer un compte

**Description :** Permet l'authentification des utilisateurs existants et l'inscription de nouveaux utilisateurs.

**Préconditions :**
- Application accessible
- (Pour connexion) : Compte existant avec email/mot de passe valides

**Scénario nominal :**
1. Utilisateur saisit email/mot de passe → Système vérifie → Accès au dashboard
2. Nouvel utilisateur : saisit informations personnelles → Validation → Compte créé

**Scénarios alternatifs :**
- Mot de passe oublié → Demande de réinitialisation → Email envoyé
- Email déjà existant → Message d'erreur → Redirection vers connexion
- Données incomplètes → Messages de validation → Correction requise

### UC-02 : Modifier son profil

**Description :** Permet la mise à jour des informations personnelles et préférences de l'utilisateur.

**Préconditions :**
- Utilisateur authentifié
- Accès à la section profil

**Scénario nominal :**
1. Accès à "Profil" → Modification des champs → Sauvegarde → Confirmation

**Scénarios alternatifs :**
- Upload d'avatar trop volumineux → Compression automatique ou erreur
- Email modifié → Vérification par email requise
- Données invalides → Messages d'erreur → Correction

---

## 👥 CO-GESTIONNAIRES

### UC-03 : Ajouter un co-gestionnaire avec permissions

**Description :** Permet au propriétaire d'ajouter des co-gestionnaires avec des permissions granulaires pour déléguer certaines tâches.

**Préconditions :**
- Utilisateur propriétaire authentifié
- Limite de co-gestionnaires non atteinte
- Email valide du futur co-gestionnaire

**Scénario nominal :**
1. Accès à "Co-gestionnaires" → "Ajouter" → Saisie infos + permissions → Invitation envoyée

**Scénarios alternatifs :**
- Email déjà co-gestionnaire → Message d'erreur
- Aucune permission sélectionnée → Erreur de validation
- Limite de co-gestionnaires atteinte → Blocage avec message

### UC-04 : Modifier/Supprimer un co-gestionnaire

**Description :** Permet la gestion des co-gestionnaires existants (modification des permissions ou suppression).

**Préconditions :**
- Utilisateur propriétaire authentifié
- Co-gestionnaire existant sélectionné

**Scénario nominal :**
1. Liste des co-gestionnaires → Sélection → Modification permissions OU Suppression → Confirmation

**Scénarios alternatifs :**
- Co-gestionnaire connecté → Déconnexion forcée lors suppression
- Tentative de modifier ses propres permissions → Blocage
- Co-gestionnaire avec actions en cours → Avertissement avant suppression

---

## 🎬 LAALAS

### UC-05 : Créer un laala

**Description :** Permet la création de nouveaux projets/spectacles (laalas) avec configuration des paramètres de base.

**Préconditions :**
- Utilisateur authentifié
- Limit de laalas non atteinte
- Informations de base disponibles (nom, description, catégorie)

**Scénario nominal :**
1. "Nouveau Laala" → Saisie nom, description, type, catégorie → Configuration → Création

**Scénarios alternatifs :**
- Nom déjà utilisé → Suggestion de modification
- Type planifié sans date → Erreur de validation
- Limite de laalas atteinte → Blocage avec upgrade proposé

### UC-06 : Modifier/Supprimer un laala

**Description :** Permet la gestion des laalas existants (modification des paramètres ou suppression complète).

**Préconditions :**
- Utilisateur authentifié
- Laala existant sélectionné
- Permissions appropriées (propriétaire ou co-gestionnaire autorisé)

**Scénario nominal :**
1. Liste laalas → Sélection → Modification OU Suppression → Confirmation

**Scénarios alternatifs :**
- Laala avec contenus → Avertissement avant suppression
- Modification type avec contenus incompatibles → Conversion ou blocage
- Laala en cours → Blocage de suppression avec message

---

## 📁 CONTENUS

### UC-07 : Ajouter un contenu

**Description :** Permet l'ajout de contenus multimédias (images, vidéos, textes) à un laala existant.

**Préconditions :**
- Utilisateur authentifié
- Laala existant sélectionné
- Permissions d'ajout de contenu
- Fichiers respectant les formats/tailles autorisés

**Scénario nominal :**
1. Sélection laala → "Ajouter contenu" → Choix type → Upload/Saisie → Validation → Ajout

**Scénarios alternatifs :**
- Fichier trop volumineux → Compression ou erreur
- Format non supporté → Message d'erreur avec formats acceptés
- Laala plein → Blocage avec limite indiquée

### UC-08 : Modifier/Supprimer un contenu

**Description :** Permet la gestion des contenus existants (modification des propriétés ou suppression).

**Préconditions :**
- Utilisateur authentifié
- Contenu existant sélectionné
- Permissions de modification/suppression

**Scénario nominal :**
1. Liste contenus → Sélection → Modification OU Suppression → Confirmation

**Scénarios alternatifs :**
- Contenu avec interactions → Avertissement avant suppression
- Modification type → Validation compatibilité
- Dernier contenu d'un laala → Confirmation suppression

---

## 🏪 BOUTIQUES

### UC-09 : Créer une boutique

**Description :** Permet la création de boutiques commerciales avec informations de localisation et horaires d'ouverture.

**Préconditions :**
- Utilisateur authentifié
- Informations commerciales de base disponibles
- Limite de boutiques non atteinte

**Scénario nominal :**
1. "Nouvelle Boutique" → Infos de base → Localisation → Horaires → Création

**Scénarios alternatifs :**
- Adresse introuvable → Saisie manuelle coordonnées
- Nom déjà pris → Suggestion alternatives
- Limite boutiques atteinte → Upgrade requis

### UC-10 : Modifier/Supprimer une boutique

**Description :** Permet la gestion des boutiques existantes (modification des informations ou suppression).

**Préconditions :**
- Utilisateur authentifié
- Boutique existante sélectionnée
- Permissions de gestion appropriées

**Scénario nominal :**
1. Liste boutiques → Sélection → Modification OU Suppression → Confirmation

**Scénarios alternatifs :**
- Boutique avec commandes → Blocage suppression
- Modification adresse → Validation géolocalisation
- Boutique liée à des articles → Avertissement transfert

---

## 💰 FINANCES

### UC-11 : Consulter ses gains

**Description :** Permet la consultation détaillée des différents types de revenus et soldes de l'utilisateur.

**Préconditions :**
- Utilisateur authentifié
- Accès à la section finances
- Données financières initialisées dans le système

**Scénario nominal :**
1. Accès "Finances" → Affichage soldes → Détail par type → Historique disponible

**Scénarios alternatifs :**
- Aucun gain → Message informatif avec conseils
- Erreur de calcul → Recalcul automatique
- Solde négatif → Alerte avec explication

### UC-12 : Demander un retrait

**Description :** Permet de demander le retrait des fonds disponibles vers un compte bancaire ou mobile money.

**Préconditions :**
- Utilisateur authentifié
- Solde disponible supérieur au minimum requis
- Aucune demande de retrait en cours
- Informations bancaires (RIB) configurées

**Scénario nominal :**
1. "Retrait" → Vérification solde → Saisie montant + RIB → Validation → Demande créée

**Scénarios alternatifs :**
- Solde insuffisant → Blocage avec solde affiché
- Montant minimum non atteint → Message avec seuil
- RIB invalide → Validation avec correction
- Demande en cours → Blocage avec statut

---

## 👥 CO-GESTIONNAIRE

### UC-13 : Se connecter au compte partagé

**Description :** Permet aux co-gestionnaires de s'authentifier et d'accéder au compte du propriétaire avec leurs permissions spécifiques.

**Préconditions :**
- Co-gestionnaire avec compte actif
- Identifiants de connexion valides
- Permissions non révoquées par le propriétaire
- Compte propriétaire accessible

**Scénario nominal :**
1. Saisie identifiants co-gestionnaire → Vérification → Accès compte propriétaire avec permissions

**Scénarios alternatifs :**
- Compte désactivé → Message d'erreur
- Permissions révoquées → Blocage d'accès
- Premier login → Définition mot de passe obligatoire

### UC-14 : Gérer selon permissions

**Description :** Permet aux co-gestionnaires d'effectuer des actions limitées selon leurs permissions accordées par le propriétaire.

**Préconditions :**
- Co-gestionnaire authentifié sur compte partagé
- Permissions spécifiques accordées pour les ressources demandées
- Audit des actions activé

**Scénario nominal :**
1. Navigation limitée selon permissions → Actions autorisées uniquement → Audit des actions

**Scénarios alternatifs :**
- Action non autorisée → Blocage avec message permissions
- Permission révoquée pendant session → Déconnexion forcée
- Conflit avec propriétaire → Notification et blocage temporaire

---

*Descriptions complètes des 14 cas d'utilisation essentiels avec gestion des exceptions.*
