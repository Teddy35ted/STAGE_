# 🏆 4 CAS D'UTILISATION INDISPENSABLES

Cette section décrit les 4 cas d'utilisation jugés critiques pour le lancement et l'adoption de la plateforme par les Animateurs Professionnels.

---

### 1. Gérer ses Laalas et Contenus

- **ID :** UC-CORE-01
- **Acteur Principal :** Animateur Pro
- **Description :** Ce cas d'utilisation permet à l'Animateur Pro de gérer l'ensemble de son catalogue de spectacles (laalas) et les éléments qui les composent (contenus). C'est la fonctionnalité centrale de création de valeur de la plateforme.
- **Pré-conditions :**
  - L'Animateur Pro doit être authentifié sur la plateforme.
- **Scénario Nominal :**
  1. L'Animateur accède à la section "Gérer mes laalas" de son dashboard.
  2. Il peut **créer** un nouveau laala en définissant son nom, sa description, sa catégorie, et ses paramètres (public, monétisé, etc.).
  3. Pour un laala existant, il peut **ajouter/modifier/supprimer** des contenus (texte, image, vidéo).
  4. Il peut **mettre à jour** les informations d'un laala ou d'un contenu.
  5. Il peut **programmer** la date et l'heure de publication d'un laala ou d'un contenu spécifique.
  6. Il peut **supprimer** un laala ou un contenu, ce qui le retire de la vue publique.
- **Post-conditions :**
  - Le catalogue de l'animateur est mis à jour et visible par les fans selon les paramètres de publication.
  - Les contenus programmés seront publiés automatiquement par le système à la date prévue.

---

### 2. Gérer ses Gains et Demander un Retrait

- **ID :** UC-CORE-02
- **Acteur Principal :** Animateur Pro
- **Description :** Ce cas d'utilisation est au cœur de la proposition de valeur "Pro". Il permet à l'animateur de suivre ses revenus, de comprendre d'où ils proviennent, et surtout de pouvoir les retirer. C'est un facteur de confiance et de motivation essentiel.
- **Pré-conditions :**
  - L'Animateur Pro doit être authentifié.
  - L'Animateur doit avoir généré des gains (solde supérieur à zéro).
- **Scénario Nominal :**
  1. L'Animateur accède à la section "Gérer mes gains".
  2. Le système affiche un tableau de bord des gains, incluant les revenus directs, indirects, les couris, et les revenus publicitaires.
  3. L'Animateur peut consulter l'historique détaillé de chaque type de revenu.
  4. Si son solde disponible est supérieur au seuil minimum, l'option "Demander un retrait" est active.
  5. L'Animateur clique sur "Demander un retrait", choisit un montant et une méthode de paiement (préalablement configurée).
  6. Le système enregistre la demande et la passe au statut "En attente".
- **Post-conditions :**
  - Une demande de retrait est créée et en attente de traitement par les administrateurs de LaaLa.
  - Le solde disponible de l'animateur est mis à jour (ou bloqué) en conséquence.
  - L'animateur reçoit une notification confirmant sa demande.

---

### 3. Gérer son Profil

- **ID :** UC-CORE-03
- **Acteur Principal :** Animateur Pro
- **Description :** Le profil est la vitrine de l'animateur. Ce cas d'utilisation lui permet de contrôler son image publique, de mettre en avant ses compétences et de fournir les informations nécessaires pour être contacté et pour que la plateforme puisse fonctionner correctement (ex: informations de paiement).
- **Pré-conditions :**
  - L'Animateur Pro doit être authentifié.
- **Scénario Nominal :**
  1. L'Animateur accède à la section "Profil" de son dashboard.
  2. Il peut **mettre à jour** ses informations personnelles (nom, photo, biographie, spécialités, localisation).
  3. Il peut **gérer ses boutiques** associées, en créant de nouvelles ou en modifiant celles existantes.
  4. Il peut **configurer ses informations de paiement** pour les retraits.
  5. Il peut **modifier son mot de passe** et gérer ses paramètres de sécurité.
- **Post-conditions :**
  - Les informations du profil public de l'animateur sont immédiatement mises à jour.
  - Les nouvelles informations de paiement sont enregistrées pour les futurs retraits.

---

### 4. Consulter ses Statistiques

- **ID :** UC-CORE-04
- **Acteur Principal :** Animateur Pro
- **Description :** Pour un professionnel, l'analyse des données est indispensable pour optimiser sa stratégie et maximiser ses revenus. Ce cas d'utilisation fournit à l'animateur les outils pour comprendre la performance de ses activités.
- **Pré-conditions :**
  - L'Animateur Pro doit être authentifié.
  - Des activités (vues, likes, gains, etc.) doivent avoir été enregistrées par le système.
- **Scénario Nominal :**
  1. L'Animateur accède à la section "Statistiques".
  2. Il peut choisir une période d'analyse (jour, semaine, mois, année).
  3. Le système affiche des graphiques et des chiffres clés concernant :
     - La **performance des laalas** (les plus vus, les plus rentables).
     - La **performance des contenus** (les plus aimés, ceux qui génèrent le plus d'engagement).
     - L'**évolution de ses revenus** (par source et sur la période choisie).
     - La **croissance de sa communauté** (nouveaux fans/friends).
     - Le **retour sur investissement** de ses publicités.
- **Post-conditions :**
  - L'Animateur a une vision claire de ses performances et peut prendre des décisions éclairées pour ses futures activités.
