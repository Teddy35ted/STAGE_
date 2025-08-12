# 👤 DIAGRAMME CAS D'UTILISATION - UTILISATEUR PRINCIPAL

## Diagramme PlantUML - Utilisateur Principal

```plantuml
@startuml UtilisateurPrincipal

!define BUSINESS_COLOR #E8F4FD
!define CONTENT_COLOR #E8F8F0
!define FINANCE_COLOR #FFF8E8
!define MANAGEMENT_COLOR #F8E8F8

actor "Utilisateur Principal" as User

package "Gestion de Compte" BUSINESS_COLOR {
  usecase "UC-01: Se connecter /\nCréer un compte" as UC01
  usecase "UC-02: Modifier\nson profil" as UC02
}

package "Gestion Co-gestionnaires" MANAGEMENT_COLOR {
  usecase "UC-03: Ajouter un\nco-gestionnaire avec permissions" as UC03
  usecase "UC-04: Modifier/Supprimer\nun co-gestionnaire" as UC04
}

package "Gestion Contenus" CONTENT_COLOR {
  usecase "UC-05: Créer\nun laala" as UC05
  usecase "UC-06: Modifier/Supprimer\nun laala" as UC06
  usecase "UC-07: Ajouter un contenu\n(image/vidéo/texte)" as UC07
  usecase "UC-08: Modifier/Supprimer\nun contenu" as UC08
}

package "Gestion Boutiques" BUSINESS_COLOR {
  usecase "UC-09: Créer\nune boutique" as UC09
  usecase "UC-10: Modifier/Supprimer\nune boutique" as UC10
}

package "Gestion Finances" FINANCE_COLOR {
  usecase "UC-11: Consulter\nses gains" as UC11
  usecase "UC-12: Demander\nun retrait" as UC12
}

' Relations Utilisateur -> Cas d'utilisation
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

' Relations entre cas d'utilisation (extends/includes)
UC01 ..> UC02 : <<include>>
UC03 ..> UC04 : <<extend>>
UC05 ..> UC07 : <<include>>
UC06 ..> UC08 : <<extend>>
UC11 ..> UC12 : <<extend>>

' Notes
note right of UC01
  **Préconditions:**
  - Application accessible
  - (Connexion) Compte existant
  
  **Scénarios alternatifs:**
  - Mot de passe oublié
  - Email déjà existant
  - Données incomplètes
end note

note right of UC03
  **Préconditions:**
  - Utilisateur propriétaire
  - Limite non atteinte
  - Email valide
  
  **Permissions configurables:**
  - laalas (CRUD)
  - contenus (CRUD)  
  - communications (CRUD)
  - campaigns (CRUD)
end note

note bottom of UC12
  **Préconditions:**
  - Solde > minimum requis
  - Aucune demande en cours
  - RIB configuré
  
  **Types de retrait:**
  - Kouri, Business
  - Services, Mobile Money
end note

@enduml
```

## Description des Relations

### **Relations Directes (Association)**
- **Utilisateur Principal** interagit directement avec tous les cas d'utilisation
- Chaque UC représente une fonctionnalité accessible via le dashboard

### **Relations Include (<<include>>)**
- **UC-01 → UC-02** : Après connexion/création, modification du profil souvent nécessaire
- **UC-05 → UC-07** : Créer un laala implique généralement d'ajouter du contenu

### **Relations Extend (<<extend>>)**
- **UC-04 ← UC-03** : Modifier/Supprimer est une extension de l'ajout de co-gestionnaires
- **UC-08 ← UC-07** : Modifier/Supprimer contenu étend l'ajout de contenu
- **UC-12 ← UC-11** : Demander retrait est une extension de la consultation des gains

### **Packages Fonctionnels**
- **Gestion de Compte** : Authentification et profil utilisateur
- **Gestion Co-gestionnaires** : Délégation et permissions
- **Gestion Contenus** : Création et gestion des laalas/contenus
- **Gestion Boutiques** : Commerce et vitrine
- **Gestion Finances** : Revenus et retraits

---

*Diagramme PlantUML pour l'acteur Utilisateur Principal avec 12 cas d'utilisation essentiels.*
