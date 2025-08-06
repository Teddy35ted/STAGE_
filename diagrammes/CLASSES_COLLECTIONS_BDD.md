# CLASSES OPTIMISÉES DES COLLECTIONS BASE DE DONNÉES

## Vue d'ensemble
Ce document présente les classes optimisées représentant les collections implémentées dans la base de données Firebase Firestore du projet La-a-La Dashboard. **Seuls les attributs fournis avant insertion en base sont inclus** pour éviter les surcharges.

---

## 1. CLASSE USER (Utilisateurs)

### Description
Gère les informations essentielles des utilisateurs fournies lors de l'inscription et de la configuration du profil.

### Attributs Essentiels (Input)

#### **Informations Personnelles Obligatoires**
- `nom: string` - Nom de famille
- `prenom: string` - Prénom  
- `email: string` - Adresse email
- `tel: string` - Numéro de téléphone
- `password: string` - Mot de passe
- `date_de_naissance: string` - Date de naissance
- `sexe: 'Masculin' | 'Féminin' | 'Autre'` - Genre

#### **Localisation Obligatoire**
- `pays: string` - Pays de résidence
- `ville: string` - Ville de résidence
- `codePays: string` - Code pays téléphonique

#### **Informations Optionnelles**
- `quartier?: string` - Quartier (optionnel)
- `region?: string` - Région (optionnel)

### Méthodes
- `+validateUserData()` - Validation des données d'entrée
- `+generateUserId()` - Génération de l'ID unique
- `+hashPassword()` - Chiffrement du mot de passe

---

## 2. CLASSE LAALA (Projets/Contenus)

### Description
Représente les informations essentielles fournies lors de la création d'un projet Laala.

### Attributs Essentiels (Input)

#### **Informations de Base Obligatoires**
- `nom: string` - Nom du Laala
- `description: string` - Description du projet
- `type: 'Laala freestyle' | 'Laala planifié' | 'Laala groupe' | 'Laala personnel'` - Type de Laala
- `categorie: string` - Catégorie du Laala
- `idCreateur: string` - ID du créateur (FK vers User)

#### **Paramètres de Visibilité**
- `isLaalaPublic: boolean` - Laala public ou privé
- `ismonetise: boolean` - Laala monétisé

#### **Paramètres de Contenu Autorisé**
- `choosetext: boolean` - Autoriser le texte
- `chooseimg: boolean` - Autoriser les images
- `choosevideo: boolean` - Autoriser les vidéos
- `chooselive: boolean` - Autoriser le live

#### **Dates de Planification (Optionnelles)**
- `date_fin?: string` - Date de fin (pour Laala planifié)
- `jour_fin?: number` - Jour de fin
- `mois_fin?: number` - Mois de fin
- `annee_fin?: number` - Année de fin

### Méthodes
- `+validateLaalaData()` - Validation des données d'entrée
- `+generateLaalaId()` - Génération de l'ID unique
- `+setDefaultPermissions()` - Configuration des permissions par défaut

---

## 3. CLASSE CONTENU (Contenus Multimédias)

### Description
Représente les informations essentielles fournies lors de l'ajout d'un contenu multimédia à un Laala.

### Attributs Essentiels (Input)

#### **Informations de Base Obligatoires**
- `nom: string` - Nom du contenu
- `idCreateur: string` - ID du créateur (FK vers User)
- `idLaala: string` - ID du Laala parent (FK vers Laala)
- `type: 'image' | 'video' | 'texte' | 'album'` - Type de contenu

#### **Contenu Multimédia**
- `src?: string` - URL du fichier principal (pour image/video)
- `cover?: string` - URL de la couverture (pour vidéos)

#### **Paramètres**
- `allowComment: boolean` - Autoriser les commentaires

#### **Métadonnées**
- `htags: string[]` - Hashtags associés
- `personnes: string[]` - IDs des personnes taguées

### Méthodes
- `+validateContenuData()` - Validation des données d'entrée
- `+generateContenuId()` - Génération de l'ID unique
- `+processMediaFile()` - Traitement du fichier multimédia

---

## 4. CLASSE MESSAGE (Messagerie)

### Description
Représente les informations essentielles fournies lors de l'envoi d'un message entre utilisateurs.

### Attributs Essentiels (Input)

#### **Participants Obligatoires**
- `receiverId: string` - ID du destinataire (FK vers User)

#### **Contenu du Message**
- `message: MessageItem` - Contenu du message à envoyer

### Sous-classe MessageItem (Input)

#### **Contenu Obligatoire**
- `type: 'text' | 'image' | 'file'` - Type de message
- `author: { id: string }` - ID de l'auteur

#### **Contenu Conditionnel**
- `text?: string` - Texte du message (si type = text)
- `uri?: string` - URI du fichier (si type = image/file)
- `name?: string` - Nom du fichier (si type = file)

#### **Métadonnées Fichier (Optionnelles)**
- `width?: number` - Largeur (pour images)
- `height?: number` - Hauteur (pour images)
- `size?: number` - Taille du fichier

### Méthodes
- `+validateMessageData()` - Validation des données d'entrée
- `+generateMessageId()` - Génération de l'ID unique
- `+processMediaAttachment()` - Traitement des pièces jointes

---

## 5. CLASSE BOUTIQUE (Boutiques)

### Description
Représente les informations essentielles fournies lors de la création d'une boutique en ligne.

### Attributs Essentiels (Input)

#### **Informations de Base Obligatoires**
- `nom: string` - Nom de la boutique
- `desc: string` - Description de la boutique
- `type: string` - Type de boutique
- `idCompte: string` - ID du compte propriétaire (FK vers User)
- `proprietaire: string` - Nom du propriétaire

#### **Localisation**
- `adresse: string` - Adresse physique
- `lat: number` - Latitude
- `long: number` - Longitude

#### **Paramètres de Gestion**
- `gererSAV: boolean` - Activer la gestion SAV
- `duree: number` - Durée d'abonnement (en jours)
- `idpartner: string` - ID du partenaire

#### **Horaires d'Ouverture**
- `horaires: Horaire[]` - Horaires pour chaque jour de la semaine

### Sous-classe Horaire (Input)
- `jour: string` - Jour de la semaine
- `start: number` - Heure d'ouverture
- `end: number` - Heure de fermeture

### Méthodes
- `+validateBoutiqueData()` - Validation des données d'entrée
- `+generateBoutiqueId()` - Génération de l'ID unique
- `+validateHoraires()` - Validation des horaires d'ouverture

---

## 6. CLASSE CO_GESTIONNAIRE (Co-gestionnaires)

### Description
Représente les co-gestionnaires autorisés à gérer certaines parties du système.

### Attributs

#### **Identifiants et Informations**
- `id: string` - Identifiant unique
- `nom: string` - Nom du co-gestionnaire
- `email: string` - Adresse email
- `tel: string` - Numéro de t��léphone

#### **Localisation**
- `pays: string` - Pays
- `ville: string` - Ville

#### **Permissions**
- `ACCES: 'gerer' | 'consulter' | 'Ajouter'` - Niveau d'accès

---

## 7. CLASSE RETRAIT (Retraits)

### Description
Gère les demandes de retrait de fonds des utilisateurs.

### Attributs

#### **Identifiants**
- `id: string` - Identifiant unique
- `idcompte: string` - ID du compte (FK vers User)
- `tel: string` - Numéro de téléphone
- `nom: string` - Nom du demandeur

#### **Informations de Retrait**
- `operation: string` - Description de l'opération
- `montant: number` - Montant à retirer
- `rib: string` - RIB (si applicable)

#### **Dates et Temps**
- `date: string` - Date de la demande
- `heure: string` - Heure de la demande

#### **Types de Retrait**
- `iskouri: boolean` - Retrait de Kouri
- `isbusiness: boolean` - Retrait business
- `isservice: boolean` - Retrait service
- `ismobilem: boolean` - Retrait mobile money

#### **Statuts**
- `istraite: boolean` - Demande traitée
- `issubmit: boolean` - Demande soumise
- `islivreur: boolean` - Retrait par livreur

---

## Relations entre les Classes

### Relations Principales

1. **User (1) ←→ (N) Laala**
   - Un utilisateur peut créer plusieurs Laalas
   - Relation via `Laala.idCreateur → User.id`

2. **User (1) ←→ (N) Contenu**
   - Un utilisateur peut créer plusieurs contenus
   - Relation via `Contenu.idCreateur → User.id`

3. **Laala (1) ←→ (N) Contenu**
   - Un Laala peut contenir plusieurs contenus
   - Relation via `Contenu.idLaala → Laala.id`

4. **User (1) ←→ (N) Boutique**
   - Un utilisateur peut avoir plusieurs boutiques
   - Relation via `Boutique.idCompte → User.id`

5. **User (1) ←→ (N) Retrait**
   - Un utilisateur peut faire plusieurs demandes de retrait
   - Relation via `Retrait.idcompte → User.id`

6. **User (N) ←→ (N) Message**
   - Les utilisateurs peuvent s'envoyer des messages
   - Relation via `Message.idsender` et `Message.receiverId → User.id`

### Relations Secondaires

- **User.fan/friend** : Relations many-to-many entre utilisateurs
- **Laala.tablikes** : Relation many-to-many User-Laala pour les likes
- **Contenu.tablikes/tabvues** : Relations many-to-many User-Contenu
- **Laala.idparticipants** : Relation many-to-many User-Laala pour la participation

---

## Indexes et Optimisations Recommandés

### Indexes Composites Suggérés

1. **User** : `(pays, ville)`, `(iscert, isconnect)`, `(registerDate)`
2. **Laala** : `(idCreateur, encours)`, `(categorie, alaune)`, `(date)`
3. **Contenu** : `(idLaala, position)`, `(idCreateur, type)`, `(date)`
4. **Boutique** : `(idCompte, isdesactive)`, `(lat, long)`
5. **Retrait** : `(idcompte, istraite)`, `(date)`
6. **Message** : `(idsender, receiverId)`, `(date)`

### Contraintes de Validation

1. **Champs obligatoires** marqués dans chaque classe
2. **Formats de validation** : emails, téléphones, URLs
3. **Valeurs énumérées** : types, statuts, permissions
4. **Contraintes de cohérence** : dates, montants positifs

---

*Ce document représente la structure complète des collections de la base de données La-a-La Dashboard, optimisée pour les performances et la cohérence des données.*