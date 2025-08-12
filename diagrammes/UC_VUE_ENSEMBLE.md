# 🌐 DIAGRAMME CAS D'UTILISATION - VUE D'ENSEMBLE

## Diagramme PlantUML - Vue d'Ensemble du Système

```plantuml
@startuml VueEnsemble

!define SYSTEM_COLOR #F0F8FF
!define USER_COLOR #E8F4FD
!define CGEST_COLOR #F8E8F8
!define SHARED_COLOR #E8F8E8

left to right direction

actor "Utilisateur Principal" as User
actor "Co-gestionnaire" as CoGest

rectangle "Système La-a-La Dashboard" SYSTEM_COLOR {

  package "Gestion de Compte" USER_COLOR {
    usecase "Se connecter /\nCréer un compte" as UC01
    usecase "Modifier\nson profil" as UC02
  }

  package "Gestion Co-gestionnaires" USER_COLOR {
    usecase "Ajouter un\nco-gestionnaire" as UC03
    usecase "Modifier/Supprimer\nco-gestionnaire" as UC04
  }

  package "Gestion Laalas" SHARED_COLOR {
    usecase "Créer\nun laala" as UC05
    usecase "Modifier/Supprimer\nun laala" as UC06
  }

  package "Gestion Contenus" SHARED_COLOR {
    usecase "Ajouter\nun contenu" as UC07
    usecase "Modifier/Supprimer\nun contenu" as UC08
  }

  package "Gestion Boutiques" USER_COLOR {
    usecase "Créer\nune boutique" as UC09
    usecase "Modifier/Supprimer\nune boutique" as UC10
  }

  package "Gestion Finances" USER_COLOR {
    usecase "Consulter\nses gains" as UC11
    usecase "Demander\nun retrait" as UC12
  }

  package "Authentification Partagée" CGEST_COLOR {
    usecase "Se connecter au\ncompte partagé" as UC13
    usecase "Gérer selon\npermissions" as UC14
  }

  package "Ressources Partagées" SHARED_COLOR {
    usecase "Gérer Communications" as UC_COMM
    usecase "Gérer Campaigns" as UC_CAMP
  }

}

' Relations Utilisateur Principal
User --> UC01
User --> UC02
User --> UC03
User --> UC04
User --> UC05
User --> UC06
User --> UC07
User --> UC08
User --> UC09
User --> UC10
User --> UC11
User --> UC12

' Relations Co-gestionnaire
CoGest --> UC13
CoGest --> UC14

' Relations partagées (selon permissions)
UC14 ..> UC05 : <<extend>>\nsi permission laalas
UC14 ..> UC06 : <<extend>>\nsi permission laalas
UC14 ..> UC07 : <<extend>>\nsi permission contenus
UC14 ..> UC08 : <<extend>>\nsi permission contenus
UC14 ..> UC_COMM : <<extend>>\nsi permission communications
UC14 ..> UC_CAMP : <<extend>>\nsi permission campaigns

' Relations de gestion
User ..> CoGest : <<manage>>\naccorde permissions

' Relations système
UC01 ..> UC13 : <<generalize>>\nauthentification
UC03 ..> UC14 : <<include>>\ndélégation

' Contraintes
note as N1
  **Contraintes Système:**
  • Un co-gestionnaire ne peut pas créer d'autres co-gestionnaires
  • Les finances restent exclusives au propriétaire  
  • Les boutiques sont gérées uniquement par le propriétaire
  • L'audit de toutes les actions des co-gestionnaires
end note

note as N2
  **Niveaux d'Accès:**
  
  **Utilisateur Principal (Propriétaire):**
  • Accès complet à toutes les fonctionnalités
  • Gestion des co-gestionnaires et permissions
  • Contrôle exclusif des finances et boutiques
  
  **Co-gestionnaire:**
  • Accès limité selon permissions accordées
  • Actions sur laalas, contenus, communications, campaigns
  • Pas d'accès aux finances ni aux boutiques
  • Actions auditées et traçables
end note

N1 .. UC14
N2 .. User

@enduml
```

## Architecture des Acteurs et Permissions

### **🔐 Hiérarchie des Acteurs**

```
Utilisateur Principal (Propriétaire)
    ├── Contrôle total du système
    ├── Gestion des co-gestionnaires  
    ├── Accès exclusif : Finances, Boutiques
    └── Audit des actions des co-gestionnaires
    
Co-gestionnaire(s)
    ├── Authentification partagée
    ├── Permissions granulaires par ressource
    ├── Actions limitées selon autorisations
    └── Traçabilité complète des opérations
```

### **📊 Matrice d'Accès Fonctionnel**

| Fonctionnalité | Utilisateur Principal | Co-gestionnaire |
|----------------|----------------------|-----------------|
| **Authentification** | ✅ Complète | 🔒 Partagée avec permissions |
| **Profil** | ✅ Modification complète | ❌ Lecture seule du propriétaire |
| **Co-gestionnaires** | ✅ CRUD complet | ❌ Aucun accès |
| **Laalas** | ✅ CRUD complet | 🔒 Selon permissions accordées |
| **Contenus** | ✅ CRUD complet | 🔒 Selon permissions accordées |
| **Communications** | ✅ CRUD complet | 🔒 Selon permissions accordées |
| **Campaigns** | ✅ CRUD complet | 🔒 Selon permissions accordées |
| **Boutiques** | ✅ CRUD complet | ❌ Aucun accès |
| **Finances** | ✅ Consultation + Retraits | ❌ Aucun accès |

### **🎯 Packages Fonctionnels**

#### **Exclusifs Utilisateur Principal (USER_COLOR)**
- Gestion de compte et profil
- Gestion des co-gestionnaires
- Gestion des boutiques
- Gestion des finances

#### **Partagés avec Permissions (SHARED_COLOR)**
- Gestion des laalas
- Gestion des contenus
- Communications
- Campaigns

#### **Spécifiques Co-gestionnaire (CGEST_COLOR)**
- Authentification partagée
- Système de permissions

---

*Diagramme PlantUML de vue d'ensemble montrant les interactions entre les deux acteurs principaux et leurs accès différenciés au système.*
