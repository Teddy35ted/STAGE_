# Système de Solde Animateur - Documentation

## Vue d'ensemble

Le système de solde permet aux animateurs de gérer leur solde virtuel et d'effectuer des demandes de retrait en respectant leur solde disponible.

## Fonctionnalités implémentées

### 🏦 Gestion du solde
- **Génération automatique** : Solde unique par animateur (50,000 - 500,000 FCFA)
- **Persistance** : Stockage dans localStorage avec l'UID utilisateur
- **Temps réel** : Mise à jour immédiate après retrait
- **Sécurité** : Impossible de retirer plus que le solde disponible

### 💳 Interface de solde
- **Carte dédiée** : Affichage élégant avec gradient bleu
- **Masquage/Affichage** : Bouton pour masquer le montant (••••••)
- **Format monétaire** : Formatage français avec espaces (ex: 150 000 FCFA)
- **État de chargement** : Animation pendant le chargement initial

### 📝 Formulaire de retrait
- **Validation temps réel** : Vérification du solde pendant la saisie
- **Messages d'erreur** : Alerts clairs pour solde insuffisant
- **Limite automatique** : Max du champ = solde disponible
- **Débit automatique** : Soustraction du solde après demande réussie

### 📊 Page des retraits
- **Statistiques complètes** : 4 cartes avec totaux
- **Liste des retraits** : Historique avec statuts
- **Filtres et recherche** : Par statut et terme de recherche
- **État vide** : Message d'encouragement pour première demande

## Structure technique

### Hook `useSoldeAnimateur`
```typescript
const {
  solde,           // Solde actuel
  loading,         // État de chargement
  debiterSolde,    // Fonction pour débiter
  crediterSolde,   // Fonction pour créditer
  peutDebiter,     // Vérification possible
  setSolde         // Modification manuelle
} = useSoldeAnimateur();
```

### Composants créés
- `SoldeCard.tsx` : Affichage du solde avec icônes
- `RetraitForm.tsx` : Formulaire avec validation
- `retraits/page.tsx` : Page complète des retraits

### Génération du solde
- **Base** : UID de l'utilisateur Firebase
- **Hash** : Conversion en nombre reproductible
- **Plage** : 50,000 à 500,000 FCFA
- **Persistance** : localStorage avec timestamp

## Flux utilisateur

1. **Première connexion** :
   - Génération automatique du solde basé sur l'UID
   - Stockage dans localStorage
   - Affichage dans la carte de solde

2. **Demande de retrait** :
   - Utilisateur clique "Nouveau Retrait"
   - Affichage du solde disponible dans le formulaire
   - Validation en temps réel du montant saisi
   - Vérification finale avant soumission
   - Débit automatique du solde après succès

3. **Gestion du solde** :
   - Mise à jour immédiate de l'affichage
   - Persistance automatique dans localStorage
   - Cohérence entre tous les composants

## Sécurité et validation

### Côté client
- Vérification du montant vs solde disponible
- Validation des champs obligatoires
- Messages d'erreur explicites
- Désactivation du bouton si invalide

### Côté persistence
- Stockage sécurisé avec UID utilisateur
- Format JSON avec timestamp de mise à jour
- Récupération automatique au chargement

## Interface utilisateur

### Couleurs et design
- **Solde** : Gradient bleu élégant
- **Erreurs** : Rouge avec icônes d'alerte
- **Succès** : Vert avec icônes de validation
- **Info** : Bleu avec icônes d'information

### Responsivité
- **Mobile** : Cartes empilées verticalement
- **Desktop** : Grille 4 colonnes pour statistiques
- **Adaptation** : Composants flexibles selon écran

## Extensions possibles

1. **Historique détaillé** : Journal des débits/crédits
2. **Notifications** : Alerts pour solde faible
3. **Limites** : Montants min/max par retrait
4. **Multi-devises** : Support CFA, EUR, USD
5. **Rechargement** : Ajout de fonds via admin
6. **Export** : PDF/Excel des transactions

## Configuration

Pour modifier les paramètres par défaut :

```typescript
// Dans useSoldeAnimateur.ts
const min = 50000;   // Solde minimum
const max = 500000;  // Solde maximum
```

Le système est maintenant pleinement opérationnel et respecte toutes les contraintes demandées !
