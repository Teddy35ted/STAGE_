# ⚙️ DIAGRAMME CAS D'UTILISATION - SYSTÈME ET INTERACTIONS TECHNIQUES

## Diagramme PlantUML - Architecture Système et Interactions

```plantuml
@startuml InteractionsSysteme

!define FRONTEND_COLOR #E8F4FD
!define BACKEND_COLOR #F0F8FF
!define DATABASE_COLOR #F8F8E8
!define AUTH_COLOR #FFE8E8
!define EXTERNAL_COLOR #E8FFE8

left to right direction

actor "Utilisateur Principal" as User
actor "Co-gestionnaire" as CoGest
actor "Système Firebase" as Firebase EXTERNAL_COLOR
actor "Système Appwrite" as Appwrite EXTERNAL_COLOR

rectangle "Frontend (Next.js)" FRONTEND_COLOR {
  
  package "Authentification UI" {
    usecase "Page de\nconnexion" as UI_LOGIN
    usecase "Formulaires\nd'authentification" as UI_AUTH_FORMS
  }
  
  package "Interface Dashboard" {
    usecase "Interface\nutilisateur" as UI_DASHBOARD
    usecase "Formulaires\nde gestion" as UI_FORMS
    usecase "Navigation\nconditionnelle" as UI_NAV
  }
  
  package "Middleware Frontend" {
    usecase "Vérification\nsession" as UI_SESSION
    usecase "Contrôle d'accès\nUI" as UI_ACCESS
  }
}

rectangle "Backend API (Next.js)" BACKEND_COLOR {
  
  package "Services d'Authentification" AUTH_COLOR {
    usecase "Authentification\nUtilisateur Principal" as AUTH_USER
    usecase "Authentification\nCo-gestionnaire" as AUTH_COGEST
    usecase "Génération tokens\nJWT custom" as AUTH_JWT
  }
  
  package "Middleware de Permissions" {
    usecase "Vérification\npermissions" as PERM_CHECK
    usecase "Validation\nressources" as PERM_VALID
    usecase "Audit des\nactions" as PERM_AUDIT
  }
  
  package "API Endpoints" {
    usecase "API\nLaalas" as API_LAALAS
    usecase "API\nContenus" as API_CONTENUS
    usecase "API\nCo-gestionnaires" as API_COGEST
    usecase "API\nBoutiques" as API_BOUTIQUES
    usecase "API\nRetraits" as API_RETRAITS
  }
  
  package "Services Backend" {
    usecase "Service\nUtilisateurs" as SRV_USERS
    usecase "Service\nMédias" as SRV_MEDIA
    usecase "Service\nNotifications" as SRV_NOTIF
  }
}

rectangle "Base de Données" DATABASE_COLOR {
  
  package "Collections Firestore" {
    usecase "Collection\nusers" as DB_USERS
    usecase "Collection\nlaalas" as DB_LAALAS
    usecase "Collection\ncontenus" as DB_CONTENUS
    usecase "Collection\nco_gestionnaires" as DB_COGEST
  }
  
  package "Stockage Médias" {
    usecase "Storage\nFirebase" as DB_STORAGE
    usecase "Bucket\nAppwrite" as DB_BUCKET
  }
}

' Relations Frontend - User
User --> UI_LOGIN
User --> UI_DASHBOARD
User --> UI_FORMS

' Relations Frontend - CoGest
CoGest --> UI_LOGIN
CoGest --> UI_DASHBOARD
CoGest --> UI_FORMS

' Flux Frontend
UI_LOGIN --> UI_SESSION
UI_DASHBOARD --> UI_ACCESS
UI_FORMS --> UI_NAV

' Relations Frontend vers Backend
UI_AUTH_FORMS --> AUTH_USER : <<invoke>>
UI_AUTH_FORMS --> AUTH_COGEST : <<invoke>>
UI_FORMS --> API_LAALAS : <<invoke>>
UI_FORMS --> API_CONTENUS : <<invoke>>
UI_FORMS --> API_COGEST : <<invoke>>
UI_FORMS --> API_BOUTIQUES : <<invoke>>
UI_FORMS --> API_RETRAITS : <<invoke>>

' Flux d'authentification
AUTH_USER --> AUTH_JWT : <<include>>
AUTH_COGEST --> AUTH_JWT : <<include>>
AUTH_JWT --> Firebase : <<external>>

' Middleware de permissions
API_LAALAS --> PERM_CHECK : <<include>>
API_CONTENUS --> PERM_CHECK : <<include>>
API_COGEST --> PERM_CHECK : <<include>>
API_BOUTIQUES --> PERM_CHECK : <<include>>
API_RETRAITS --> PERM_CHECK : <<include>>

PERM_CHECK --> PERM_VALID : <<include>>
PERM_CHECK --> PERM_AUDIT : <<include>>

' Services Backend
API_LAALAS --> SRV_USERS : <<use>>
API_CONTENUS --> SRV_MEDIA : <<use>>
API_COGEST --> SRV_NOTIF : <<use>>

' Accès base de données
SRV_USERS --> DB_USERS : <<persist>>
API_LAALAS --> DB_LAALAS : <<persist>>
API_CONTENUS --> DB_CONTENUS : <<persist>>
API_COGEST --> DB_COGEST : <<persist>>

' Stockage médias
SRV_MEDIA --> DB_STORAGE : <<store>>
SRV_MEDIA --> DB_BUCKET : <<store>>
SRV_MEDIA --> Appwrite : <<external>>

' Relations externes
AUTH_USER --> Firebase : <<authenticate>>
AUTH_COGEST --> Firebase : <<authenticate>>
DB_USERS --> Firebase : <<sync>>

note as N1
**Flux d'Authentification Utilisateur Principal:**
1. Login via UI_AUTH_FORMS
2. Validation Firebase via AUTH_USER  
3. Génération JWT custom via AUTH_JWT
4. Session établie avec claims standard
end note

note as N2
**Flux d'Authentification Co-gestionnaire:**
1. Login via UI_AUTH_FORMS avec credentials co-gestionnaire
2. Validation bcrypt via AUTH_COGEST
3. Récupération permissions depuis DB_COGEST
4. Génération JWT custom avec claims de permissions
5. Session établie avec permissions granulaires
end note

note as N3
**Flux de Contrôle d'Accès:**
1. Requête API avec JWT token
2. PERM_CHECK extrait et valide les permissions
3. PERM_VALID vérifie l'accès à la ressource
4. PERM_AUDIT enregistre l'action
5. Exécution ou rejet de la requête
end note

N1 .. AUTH_USER
N2 .. AUTH_COGEST  
N3 .. PERM_CHECK

@enduml
```

## Architecture Technique du Système

### **🏗️ Stack Technologique**

#### **Frontend (Next.js 14)**
```typescript
// Structure des composants principaux
├── app/
│   ├── layout.tsx              // Layout principal avec AuthContext
│   ├── auth/page.tsx           // Page d'authentification unifiée
│   ├── dashboard/              // Interface dashboard protégée
│   └── api/                    // API Routes Next.js
├── components/
│   ├── auth/                   // Composants d'authentification
│   ├── forms/                  // Formulaires de gestion
│   └── dashboard/              // Interface utilisateur dashboard
└── contexts/
    └── AuthContext.tsx         // Gestion état authentification
```

#### **Backend API (Next.js API Routes)**
```typescript
// Services et middleware
├── app/Backend/
│   ├── services/
│   │   └── auth/CoGestionnaireAuthService.ts
│   ├── middleware/
│   │   └── PermissionMiddleware.ts
│   └── types/                  // Définitions TypeScript
└── app/api/
    ├── auth/                   // Endpoints authentification
    ├── laalas/                 // API gestion laalas
    ├── contenus/               // API gestion contenus
    └── co-gestionnaires/       // API gestion co-gestionnaires
```

### **🔄 Flux de Données et Sécurité**

#### **1. Authentification Dual-Mode**
```
Utilisateur Principal:
Firebase Auth → JWT Standard Claims → Session Complète

Co-gestionnaire:
Credentials → bcrypt Validation → JWT Custom Claims → Session Limitée
```

#### **2. Système de Permissions Granulaires**
```typescript
interface ResourcePermission {
  resource: 'laalas' | 'contenus' | 'communications' | 'campaigns';
  actions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}
```

#### **3. Middleware de Sécurité**
```
Requête API → JWT Validation → Permission Check → Resource Access → Audit Log
```

### **🗄️ Architecture Base de Données**

#### **Firebase Firestore Collections**
- `users/` - Données utilisateurs principaux
- `laalas/` - Contenus laalas avec owner_id
- `contenus/` - Médias et contenus avec owner_id  
- `co_gestionnaires/` - Profils et permissions co-gestionnaires
- `boutiques/` - Boutiques (accès propriétaire uniquement)
- `retraits/` - Demandes retrait (accès propriétaire uniquement)

#### **Stockage Médias**
- **Firebase Storage** - Stockage principal des médias
- **Appwrite Bucket** - Stockage alternatif configuré

### **📊 Patterns d'Architecture**

#### **Frontend Patterns**
- **Context API** - Gestion état authentification globale
- **Conditional Rendering** - Interface adaptive selon permissions
- **Form Unification** - Composants réutilisables entre dashboard et test

#### **Backend Patterns**
- **Middleware Chain** - Vérification permissions en cascade
- **Service Layer** - Services métier découplés
- **Repository Pattern** - Abstraction accès données

#### **Security Patterns**
- **JWT Custom Claims** - Permissions embarquées dans tokens
- **Resource-Based Access Control (RBAC)** - Contrôle granulaire
- **Audit Trail** - Traçabilité complète des actions

---

*Diagramme technique montrant l'architecture complète du système, les interactions entre composants, et les flux de données avec sécurité intégrée.*
