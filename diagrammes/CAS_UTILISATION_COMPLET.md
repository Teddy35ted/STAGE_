# ✅ ANALYSE COMPLÈTE DES CAS D'UTILISATION

## 🎯 Contexte : Dashboard Animateur Pro

Cette analyse détaille toutes les interactions possibles entre les acteurs (Animateur Pro, Le Système) et la plateforme, basées sur le cahier des charges fourni.

---

## 👤 Acteur : Animateur Pro

### Module : Profil & Gestion
- **UC-A01 :** Gérer son profil (Créer, Lire, Mettre à jour, Supprimer)
- **UC-A02 :** Gérer ses boutiques (CRUD)
- **UC-A03 :** Payer sa contribution mensuelle
- **UC-A04 :** Gérer les cogestionnaires (CRUD)
- **UC-A05 :** Définir les permissions d'un cogestionnaire

### Module : Laalas & Contenus
- **UC-A06 :** Gérer ses laalas (CRUD)
- **UC-A07 :** Gérer les contenus d'un laala (CRUD)
- **UC-A08 :** Programmer la publication d'un laala
- **UC-A09 :** Programmer la publication d'un contenu
- **UC-A10 :** Booster un laala ou un contenu
- **UC-A11 :** Demander un espace laala sponsorisé

### Module : Communauté (Fans/Friends)
- **UC-A12 :** Consulter la liste de ses fans/friends
- **UC-A13 :** Filtrer les fans/friends (actifs, rentables, nouveaux)
- **UC-A14 :** Lancer une communication ciblée (message unique)
- **UC-A15 :** Lancer une campagne de communication (message de masse)
- **UC-A16 :** Analyser la démographie de sa communauté (genre, etc.)

### Module : Gains & Monétisation
- **UC-A17 :** Consulter son tableau de bord des gains
- **UC-A18 :** Demander un retrait de gains
- **UC-A19 :** Consulter l'historique de ses revenus (directs, indirects, couris, pub)
- **UC-A20 :** Consulter l'historique de ses retraits

### Module : Publicités
- **UC-A21 :** Consulter les nouvelles propositions de publicité
- **UC-A22 :** Accepter ou refuser une proposition de publicité
- **UC-A23 :** Discuter les termes d'une publicité
- **UC-A24 :** Suivre les performances d'une publicité active
- **UC-A25 :** Consulter l'historique de ses publicités passées

### Module : Statistiques
- **UC-A26 :** Consulter les statistiques de ses laalas
- **UC-A27 :** Consulter les statistiques de ses contenus
- **UC-A28 :** Consulter les statistiques de ses revenus
- **UC-A29 :** Consulter les statistiques de son profil
- **UC-A30 :** Consulter les statistiques de ses publicités

### Module : Support & Communication
- **UC-A31 :** Contacter le support LaaLa (réclamation, suggestion, etc.)
- **UC-A32 :** Joindre un fichier à une demande de support
- **UC-A33 :** Consulter ses notifications
- **UC-A34 :** Marquer une notification comme lue/archivée

---

## ⚙️ Acteur : Le Système

### Module : Tâches Automatisées & Calculs
- **UC-S01 :** Authentifier l'Animateur Pro
- **UC-S02 :** Authentifier un cogestionnaire (selon ses droits)
- **UC-S03 :** Publier automatiquement un laala programmé
- **UC-S04 :** Publier automatiquement un contenu programmé
- **UC-S05 :** Calculer les gains directs (contenus sur ses propres laalas)
- **UC-S06 :** Calculer les gains indirects (contenus sur les laalas d'autres)
- **UC-S07 :** Calculer les revenus publicitaires
- **UC-S08 :** Mettre à jour le solde des couris
- **UC-S09 :** Agréger les données pour les statistiques
- **UC-S10 :** Mettre à jour les métriques du tableau de bord (gains du mois, etc.)

### Module : Notifications
- **UC-S11 :** Envoyer une notification pour un nouveau fan/friend
- **UC-S12 :** Envoyer une notification pour un nouveau gain
- **UC-S13 :** Envoyer une notification pour une nouvelle proposition de publicité
- **UC-S14 :** Envoyer une notification pour une activité sur un laala (like, commentaire)
- **UC-S15 :** Envoyer une notification pour une mise à jour du statut d'un retrait
- **UC-S16 :** Envoyer une notification pour une réponse du support
- **UC-S17 :** Envoyer un rappel pour le paiement de la contribution mensuelle
