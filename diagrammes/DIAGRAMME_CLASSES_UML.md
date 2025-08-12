# DIAGRAMME DE CLASSES UML - LA-A-LA DASHBOARD (DONNÉES UTILISATEUR)

## Vue d'ensemble du Système

Le système La-a-La Dashboard est structuré autour de 8 entités principales représentant **uniquement les données saisies par l'utilisateur** avant insertion en base de données. Ce diagramme exclut tous les champs générés automatiquement par le système (ID, dates de création, compteurs, etc.) et se concentre sur les informations que l'utilisateur doit fournir lors de la création ou modification des entités.

```mermaid
classDiagram
    %% ===== CLASSE USER (Données saisies par l'utilisateur) =====
    class User {
        +String nom*
        +String prenom*
        +String email*
        +String tel*
        +String password*
        +String date_de_naissance*
        +String sexe*
        +String pays*
        +String ville*
        +String codePays*
        +String quartier?
        +String region?
        +String bio?
        +Array~String~ domaines?
        +Array~String~ centreinnteret?
        +Array~String~ services?
        
        +validateUserData() Boolean
    }

    %% ===== CLASSE COGESTIONNAIRE (Données saisies) =====
    class CoGestionnaire {
        +String nom*
        +String prenom*
        +String email*
        +String tel*
        +String telephone?
        +String pays*
        +String ville*
        +String ACCES*
        +Array~ResourcePermission~ permissions*
        +String description?
        +String password*
        
        +validatePermissions() Boolean
    }

    %% ===== CLASSE RESOURCEPERMISSION =====
    class ResourcePermission {
        +String resource*
        +Array~String~ actions*
        
        +validateResource() Boolean
        +validateActions() Boolean
    }

    %% ===== CLASSE LAALA (Données saisies par l'utilisateur) =====
    class Laala {
        +String nom*
        +String description*
        +String type*
        +String categorie*
        +Boolean isLaalaPublic*
        +Boolean ismonetise*
        +Boolean choosetext*
        +Boolean chooseimg*
        +Boolean choosevideo*
        +Boolean chooselive*
        +String date_fin?
        +Number jour_fin?
        +Number mois_fin?
        +Number annee_fin?
        +String cover?
        +Array~String~ sujets?
        +Array~String~ domaines?
        +Array~String~ htags?
        
        +validateLaalaData() Boolean
    }

    %% ===== CLASSE CONTENU (Données saisies par l'utilisateur) =====
    class Contenu {
        +String nom*
        +String idLaala*
        +String type*
        +String src?
        +String cover?
        +Boolean allowComment*
        +Array~String~ htags*
        +Array~String~ personnes*
        
        +validateContenuData() Boolean
    }

    %% ===== CLASSE BOUTIQUE (Données saisies par l'utilisateur) =====
    class Boutique {
        +String nom*
        +String type*
        +String desc*
        +String adresse*
        +Number lat*
        +Number long*
        +Boolean gererSAV?
        +String cover?
        +Array~Horaire~ horaires?
        +Array~Object~ lesCategories?
        +Array~Object~ lesServices?
        
        +validateBoutiqueData() Boolean
    }

    %% ===== CLASSE HORAIRE =====
    class Horaire {
        +String jour*
        +Number start*
        +Number end*
        
        +validateHoraire() Boolean
    }

    %% ===== CLASSE MESSAGE (Données saisies par l'utilisateur) =====
    class Message {
        +String receiverId*
        +MessageItem message*
        
        +validateMessageData() Boolean
    }

    %% ===== CLASSE MESSAGEITEM =====
    class MessageItem {
        +String type*
        +String text?
        +String name?
        +String uri?
        +Number width?
        +Number height?
        +Number size?
        
        +validateMessageItem() Boolean
    }

    %% ===== CLASSE RETRAIT (Données saisies par l'utilisateur) =====
    class Retrait {
        +String nom*
        +String tel*
        +Number montant*
        +String operation*
        +String rib*
        +Boolean iskouri*
        +Boolean isbusiness*
        +Boolean isservice*
        +Boolean ismobilem*
        +Boolean islivreur*
        
        +validateRetraitData() Boolean
        +calculateFees() Number
    }

    %% ===== RELATIONS (Basées sur les données utilisateur) =====
    User ||--o{ Laala : "crée"
    User ||--o{ Contenu : "crée"
    User ||--o{ Boutique : "possède"
    User ||--o{ Message : "envoie"
    User ||--o{ Retrait : "demande"
    User ||--o{ CoGestionnaire : "gère"
    
    Laala ||--o{ Contenu : "contient"
    
    CoGestionnaire ||--o{ ResourcePermission : "possède"
    
    Boutique ||--o{ Horaire : "a des horaires"
    
    Message ||--o{ MessageItem : "contient"
```

---

## Détails des Relations et Contraintes

### **Relations One-to-Many (1:N)**

#### **User → Laala**
- **Cardinalité** : 1 User peut créer N Laalas
- **Clé étrangère** : `Laala.idCreateur → User.id`
- **Contrainte** : Un Laala doit avoir un créateur valide
- **Index recommandé** : `(idCreateur, type, date)`

#### **User → Contenu**
- **Cardinalité** : 1 User peut créer N Contenus
- **Clé étrangère** : `Contenu.idCreateur → User.id`
- **Contrainte** : Un Contenu doit avoir un créateur valide
- **Index recommandé** : `(idCreateur, type, date)`

#### **Laala → Contenu**
- **Cardinalité** : 1 Laala peut contenir N Contenus
- **Clé étrangère** : `Contenu.idLaala → Laala.id`
- **Contrainte** : Un Contenu peut être associé à un Laala
- **Index recommandé** : `(idLaala, position)`

#### **User → Boutique**
- **Cardinalité** : 1 User peut posséder N Boutiques
- **Clé étrangère** : `Boutique.idCompte → User.id`
- **Contrainte** : Une Boutique doit avoir un propriétaire valide
- **Index recommandé** : `(idCompte, isdesactive)`

#### **User → CoGestionnaire**
- **Cardinalité** : 1 User peut avoir N CoGestionnaires
- **Clé étrangère** : `CoGestionnaire.idProprietaire → User.id`
- **Contrainte** : Un CoGestionnaire doit avoir un propriétaire valide
- **Index recommandé** : `(idProprietaire, statut)`

#### **User → Retrait**
- **Cardinalité** : 1 User peut faire N Retraits
- **Clé étrangère** : `Retrait.idcompte → User.id`
- **Contrainte** : Un Retrait doit être lié à un compte valide
- **Index recommandé** : `(idcompte, istraite, date)`

#### **Boutique → Horaire**
- **Cardinalité** : 1 Boutique a N Horaires (7 jours)
- **Relation** : Composition (Horaire fait partie de Boutique)
- **Contrainte** : Exactement 7 horaires par boutique

#### **CoGestionnaire → ResourcePermission**
- **Cardinalité** : 1 CoGestionnaire a N ResourcePermissions
- **Relation** : Composition (Permissions font partie du CoGestionnaire)
- **Contrainte** : Au moins une permission par co-gestionnaire

#### **Message → MessageItem**
- **Cardinalité** : 1 Message contient N MessageItems
- **Relation** : Composition (MessageItem fait partie de Message)
- **Contrainte** : MessageItems ordonnés par timestamp

### **Relations Many-to-Many (N:N)**

#### **User ↔ User (Relations Sociales)**
- **fan** : `User.fan[]` contient les IDs des fans
- **friend** : `User.friend[]` contient les IDs des amis
- **jfan** : `User.jfan[]` contient les IDs suivis en tant que fan
- **jfriend** : `User.jfriend[]` contient les IDs suivis en tant qu'ami
- **Contrainte** : Relations bidirectionnelles cohérentes

#### **User ↔ Laala (Interactions)**
- **Likes** : `Laala.tablikes[]` contient les IDs des utilisateurs
- **Participation** : `Laala.idparticipants[]` contient les IDs des participants
- **Vues** : Trackées via métriques (non stockées individuellement)

#### **User ↔ Contenu (Interactions)**
- **Likes** : `Contenu.tablikes[]` contient les IDs des utilisateurs
- **Vues** : `Contenu.tabvues[]` contient les IDs des utilisateurs
- **Contrainte** : Un utilisateur ne peut liker/voir qu'une fois

#### **User ↔ Boutique (Consultations)**
- **Consultations** : `Boutique.lesConsultes[]` contient les IDs des visiteurs
- **Clients** : `Boutique.lesClients[]` contient les informations clients

#### **User ↔ Message (Messagerie)**
- **Expéditeur** : `Message.idsender → User.id`
- **Destinataire** : `Message.receiverId → User.id`
- **Participants** : `Message.chateurs[]` pour conversations de groupe

---

## Types et Énumérations

### **Énumérations Principales**

#### **User.sexe**
```typescript
'Masculin' | 'Féminin' | 'Autre'
```

#### **Laala.type**
```typescript
'Laala freestyle' | 'Laala planifié' | 'Laala groupe' | 'Laala personnel'
```

#### **Contenu.type**
```typescript
'image' | 'video' | 'texte' | 'album'
```

#### **CoGestionnaire.ACCES**
```typescript
'gerer' | 'consulter' | 'Ajouter'
```

#### **CoGestionnaire.statut**
```typescript
'actif' | 'inactif' | 'pending' | 'suspended'
```

#### **ResourcePermission.resource**
```typescript
'laalas' | 'contenus' | 'communications' | 'campaigns'
```

#### **ResourcePermission.actions (PermissionAction)**
```typescript
'create' | 'read' | 'update' | 'delete'
```

#### **MessageItem.type**
```typescript
'text' | 'image' | 'file'
```

---

## Patterns de Conception Utilisés

### 1. **Interface de Création (Core)**
- **UserCore**, **LaalaCore**, **ContenuCore**, **CoGestionnaireCore**
- **Avantages** : Séparation création/affichage, validation ciblée
- **Usage** : Formulaires de création, APIs d'insertion

### 2. **Interface d'Extension (Dashboard)**
- **UserDashboard**, **LaalaDashboard**, **ContenuDashboard**
- **Avantages** : Données complètes pour affichage, champs calculés
- **Usage** : Affichage dashboard, APIs de lecture

### 3. **Dénormalisation Contrôlée**
- **Informations créateur** dupliquées dans Laala et Contenu
- **Avantages** : Performance des requêtes, réduction des jointures
- **Inconvénients** : Synchronisation nécessaire lors des mises à jour

### 4. **Système de Permissions Granulaires**
- **ResourcePermission** avec actions CRUD par ressource
- **Avantages** : Contrôle fin des accès, extensibilité
- **Implémentation** : Middleware de vérification des permissions

### 5. **Authentification Partagée**
- **Co-gestionnaires** avec authentification vers compte principal
- **Avantages** : Gestion d'équipe, délégation de responsabilités
- **Sécurité** : JWT avec claims spécifiques, audit des actions

### 6. **Soft Delete**
- **Flags** : `isdelete`, `isdesactive` au lieu de suppression physique
- **Avantages** : Récupération possible, audit trail
- **Contrainte** : Filtrage nécessaire dans toutes les requêtes

### 7. **Versioning Temporel**
- **Dates multiples** : création, modification, alternatives
- **Granularité** : jour, mois, année séparés pour requêtes optimisées
- **Historique** : Conservation des versions précédentes

---

## Contraintes d'Intégrité

### 1. **Contraintes Référentielles**
```typescript
// Exemples de contraintes pour Firebase/NoSQL
Laala.idCreateur -> User.id (required)
Contenu.idCreateur -> User.id (required)
Contenu.idLaala -> Laala.id (required)
CoGestionnaire.idProprietaire -> User.id (required)
Boutique.idCompte -> User.id (required)
Retrait.idcompte -> User.id (required)
```

### 2. **Contraintes de Domaine**
```typescript
// Validation des types énumérés
Laala.type IN ['Laala freestyle', 'Laala planifié', 'Laala groupe', 'Laala personnel']
Contenu.type IN ['image', 'video', 'texte', 'album']
User.sexe IN ['Masculin', 'Féminin', 'Autre']
CoGestionnaire.ACCES IN ['gerer', 'consulter', 'Ajouter']
CoGestionnaire.statut IN ['actif', 'inactif', 'pending', 'suspended']
ResourcePermission.resource IN ['laalas', 'contenus', 'communications', 'campaigns']
ResourcePermission.actions IN ['create', 'read', 'update', 'delete']
```

### 3. **Contraintes de Cohérence**
```typescript
// Exemples de règles métier
User.age = calculateAge(User.date_de_naissance)
Laala.likes = Laala.tablikes.length
Contenu.vues = Contenu.tabvues.length
Boutique.nbrConsultes = Boutique.lesConsultes.length
CoGestionnaire.role = 'assistant' (toujours)
```

---

## Optimisations et Index Recommandés

### 1. **Index Composites Recommandés**
```javascript
// User
db.users.createIndex({ "pays": 1, "ville": 1 })
db.users.createIndex({ "iscert": 1, "isconnect": 1 })
db.users.createIndex({ "registerDate": -1 })

// Laala
db.laalas.createIndex({ "idCreateur": 1, "encours": 1 })
db.laalas.createIndex({ "categorie": 1, "alaune": 1 })
db.laalas.createIndex({ "date": -1, "likes": -1 })

// Contenu
db.contenus.createIndex({ "idLaala": 1, "position": 1 })
db.contenus.createIndex({ "idCreateur": 1, "type": 1 })
db.contenus.createIndex({ "date": -1, "vues": -1 })

// CoGestionnaire
db.cogestionnaires.createIndex({ "idProprietaire": 1, "statut": 1 })
db.cogestionnaires.createIndex({ "email": 1 })

// Boutique
db.boutiques.createIndex({ "idCompte": 1, "isdesactive": 1 })
db.boutiques.createIndex({ "lat": 1, "long": 1 })

// Message
db.messages.createIndex({ "idsender": 1, "receiverId": 1 })
db.messages.createIndex({ "date": -1 })

// Retrait
db.retraits.createIndex({ "idcompte": 1, "istraite": 1 })
db.retraits.createIndex({ "date": -1 })
```

### 2. **Stratégies de Requête**
- **Pagination** : Utilisation de curseurs pour les grandes collections
- **Filtrage** : Index sur les champs de filtre fréquents
- **Tri** : Index descendant sur les dates pour les listes récentes
- **Recherche** : Index texte sur les champs de recherche
- **Permissions** : Cache des permissions par utilisateur/co-gestionnaire

---

*Ce diagramme UML représente l'architecture complète et mise à jour du système La-a-La Dashboard, incluant le système avancé d'authentification des co-gestionnaires avec permissions granulaires, optimisée pour les performances, la cohérence et l'évolutivité.*

---

## Diagramme PlantUML Textuel

```plantuml
@startuml LaalaClassDiagram

!define PRIMARY_KEY <b><color:blue>
!define FOREIGN_KEY <color:green>
!define REQUIRED <color:red>*</color>
!define OPTIONAL <color:gray>?</color>

' Classes principales avec données saisies par l'utilisateur
class User {
  REQUIRED nom : String
  REQUIRED prenom : String  
  REQUIRED email : String
  REQUIRED tel : String
  REQUIRED password : String
  REQUIRED date_de_naissance : String
  REQUIRED sexe : String
  REQUIRED pays : String
  REQUIRED ville : String
  REQUIRED codePays : String
  OPTIONAL quartier : String
  OPTIONAL region : String
  OPTIONAL bio : String
  OPTIONAL domaines : List<String>
  OPTIONAL centreinnteret : List<String>
  OPTIONAL services : List<String>
  --
  + validateUserData() : Boolean
}

class CoGestionnaire {
  REQUIRED nom : String
  REQUIRED prenom : String
  REQUIRED email : String
  REQUIRED tel : String
  OPTIONAL telephone : String
  REQUIRED pays : String
  REQUIRED ville : String
  REQUIRED ACCES : String
  REQUIRED permissions : List<ResourcePermission>
  OPTIONAL description : String
  REQUIRED password : String
  --
  + validatePermissions() : Boolean
}

class ResourcePermission {
  REQUIRED resource : String
  REQUIRED actions : List<String>
  --
  + validateResource() : Boolean
  + validateActions() : Boolean
}

class Laala {
  REQUIRED nom : String
  REQUIRED description : String
  REQUIRED type : String
  REQUIRED categorie : String
  REQUIRED isLaalaPublic : Boolean
  REQUIRED ismonetise : Boolean
  REQUIRED choosetext : Boolean
  REQUIRED chooseimg : Boolean
  REQUIRED choosevideo : Boolean
  REQUIRED chooselive : Boolean
  OPTIONAL date_fin : String
  OPTIONAL jour_fin : Number
  OPTIONAL mois_fin : Number
  OPTIONAL annee_fin : Number
  OPTIONAL cover : String
  OPTIONAL sujets : List<String>
  OPTIONAL domaines : List<String>
  OPTIONAL htags : List<String>
  --
  + validateLaalaData() : Boolean
}

class Contenu {
  REQUIRED nom : String
  REQUIRED idLaala : String
  REQUIRED type : String
  OPTIONAL src : String
  OPTIONAL cover : String
  REQUIRED allowComment : Boolean
  REQUIRED htags : List<String>
  REQUIRED personnes : List<String>
  --
  + validateContenuData() : Boolean
}

class Boutique {
  REQUIRED nom : String
  REQUIRED type : String
  REQUIRED desc : String
  REQUIRED adresse : String
  REQUIRED lat : Number
  REQUIRED long : Number
  OPTIONAL gererSAV : Boolean
  OPTIONAL cover : String
  OPTIONAL horaires : List<Horaire>
  OPTIONAL lesCategories : List<Object>
  OPTIONAL lesServices : List<Object>
  --
  + validateBoutiqueData() : Boolean
}

class Horaire {
  REQUIRED jour : String
  REQUIRED start : Number
  REQUIRED end : Number
  --
  + validateHoraire() : Boolean
}

class Message {
  REQUIRED receiverId : String
  REQUIRED message : MessageItem
  --
  + validateMessageData() : Boolean
}

class MessageItem {
  REQUIRED type : String
  OPTIONAL text : String
  OPTIONAL name : String
  OPTIONAL uri : String
  OPTIONAL width : Number
  OPTIONAL height : Number
  OPTIONAL size : Number
  --
  + validateMessageItem() : Boolean
}

class Retrait {
  REQUIRED nom : String
  REQUIRED tel : String
  REQUIRED montant : Number
  REQUIRED operation : String
  REQUIRED rib : String
  REQUIRED iskouri : Boolean
  REQUIRED isbusiness : Boolean
  REQUIRED isservice : Boolean
  REQUIRED ismobilem : Boolean
  REQUIRED islivreur : Boolean
  --
  + validateRetraitData() : Boolean
  + calculateFees() : Number
}

' Relations basées sur les données utilisateur
User ||--o{ Laala : "crée"
User ||--o{ Contenu : "crée"  
User ||--o{ Boutique : "possède"
User ||--o{ Message : "envoie"
User ||--o{ Retrait : "demande"
User ||--o{ CoGestionnaire : "gère"

Laala ||--o{ Contenu : "contient"
CoGestionnaire ||--o{ ResourcePermission : "possède"
Boutique ||--o{ Horaire : "a des horaires"
Message ||--o{ MessageItem : "contient"

@enduml
```

## Définition des Classes (Données Utilisateur Uniquement)

### **🧑 User - Utilisateur Principal**
**Données requises lors de l'inscription :**
- Informations personnelles : nom, prénom, email, téléphone
- Mot de passe et date de naissance
- Localisation : pays, ville, code pays
- Informations optionnelles : quartier, région, bio
- Préférences : domaines d'intérêt, services, centres d'intérêt

### **🤝 CoGestionnaire - Co-gestionnaire**
**Données requises lors de la création :**
- Informations personnelles : nom, prénom, email, téléphone
- Localisation : pays, ville
- Niveau d'accès et permissions granulaires
- Mot de passe sécurisé
- Description optionnelle du rôle

### **📝 ResourcePermission - Permissions**
**Configuration des accès :**
- Ressource concernée (laalas, contenus, communications, campaigns)
- Actions autorisées (create, read, update, delete)

### **🎯 Laala - Publication Interactive**
**Données requises lors de la création :**
- Contenu : nom, description, type, catégorie
- Paramètres : visibilité publique, monétisation
- Options médias : texte, image, vidéo, live autorisés
- Temporalité : date de fin optionnelle
- Métadonnées : hashtags, sujets, domaines

### **📁 Contenu - Média Associé**
**Données requises lors de l'ajout :**
- Identifiants : nom, ID du Laala parent
- Média : type, source, couverture
- Paramètres : autorisation commentaires
- Métadonnées : hashtags, personnes mentionnées

### **🏪 Boutique - Commerce**
**Données requises lors de la création :**
- Identification : nom, type, description
- Localisation : adresse, coordonnées GPS
- Configuration : gestion SAV, horaires
- Visuels : image de couverture
- Catalogue : catégories et services

### **⏰ Horaire - Planning Boutique**
**Données pour chaque jour :**
- Jour de la semaine
- Heures d'ouverture et fermeture

### **💬 Message - Communication**
**Données lors de l'envoi :**
- Destinataire
- Contenu du message (MessageItem)

### **📨 MessageItem - Contenu Message**
**Données du message :**
- Type (texte, image, fichier)
- Contenu selon le type
- Métadonnées média si applicable

### **💰 Retrait - Demande de Paiement**
**Données requises :**
- Informations personnelles : nom, téléphone
- Montant et méthode d'opération
- Coordonnées bancaires (RIB)
- Types de solde à retirer

---

## Caractéristiques Techniques

### **🔒 Validation des Données**
Chaque classe possède sa méthode `validate()` pour vérifier :
- **Champs obligatoires** : Présence de toutes les données requises
- **Format des données** : Email, téléphone, coordonnées GPS
- **Cohérence métier** : Permissions valides, horaires logiques
- **Sécurité** : Validation des entrées utilisateur

### **📊 Relations Simplifiées**
- **User** → crée → **Laala, Contenu, Boutique, Message, Retrait**
- **User** → gère → **CoGestionnaire**
- **Laala** → contient → **Contenu**
- **CoGestionnaire** → possède → **ResourcePermission**
- **Boutique** → a → **Horaire**
- **Message** → contient → **MessageItem**

### **⚡ Points Clés**
- **Pas d'ID** : Les identifiants sont générés côté serveur
- **Pas de dates automatiques** : Les timestamps sont ajoutés par le système
- **Pas de compteurs** : Les likes, vues, etc. sont gérés automatiquement
- **Pas de métadonnées système** : Focus sur les données métier uniquement

---

*Ce diagramme représente exclusivement les données que l'utilisateur doit saisir lors de la création ou modification des entités, avant que le système n'ajoute les informations techniques automatiques.*