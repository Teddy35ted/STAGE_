# Système de Retraits Automatiques

## Vue d'ensemble

Le système de retraits a été modifié pour implémenter un processus de demande avec traitement automatique différé. Au lieu de débiter le solde immédiatement, le système fonctionne désormais comme suit :

## Flux de traitement

### 1. Création de la demande
- L'utilisateur soumet une demande de retrait
- Le système vérifie que le solde est suffisant
- La demande est créée avec le statut "En attente"
- **Le solde n'est PAS débité à ce moment**
- Une date de traitement automatique est définie (+5 minutes)

### 2. Période d'attente
- La demande reste en statut "En attente" pendant 5 minutes
- L'utilisateur peut voir le temps restant avant traitement
- Le solde affiché reste inchangé

### 3. Traitement automatique
- Après 5 minutes, le système traite automatiquement la demande
- Le statut passe à "Approuvé"
- **Le solde est débité uniquement à ce moment**
- L'utilisateur reçoit une confirmation

## Nouveaux champs du modèle Retrait

```typescript
interface Retrait {
  // ... champs existants
  statut: 'En attente' | 'Approuvé' | 'Refusé' | 'En cours de traitement';
  dateTraitement?: string; // Date à laquelle le retrait sera traité automatiquement
  dateApprobation?: string; // Date à laquelle le retrait a été approuvé
  montantDebite?: boolean; // Indique si le montant a déjà été débité du solde
}
```

## APIs

### `/api/retraits` (POST)
Créer une nouvelle demande de retrait avec `dateTraitement` = maintenant + 5 minutes

### `/api/retraits/process` (POST)
Traite automatiquement tous les retraits dont la `dateTraitement` est dépassée

### `/api/retraits/process` (GET)
Récupère le statut des retraits en attente de traitement

### `/api/retraits/debit-solde` (POST)
Marque un retrait comme ayant eu son montant débité

## Hook automatique

Le hook `useRetraitAutoProcessor` s'exécute automatiquement :
- Vérification toutes les 30 secondes
- Traitement des retraits éligibles
- Débit automatique du solde

## Interface utilisateur

### Nouvelles fonctionnalités :
1. **Compte à rebours** : Affiche le temps restant avant traitement automatique
2. **Statuts visuels** : Différentes couleurs selon l'état du retrait
3. **Messages informatifs** : Explications claires sur le processus
4. **Mise à jour en temps réel** : L'affichage se met à jour automatiquement

### Statuts possibles :
- 🟡 **En attente** : Demande soumise, en attente de traitement (5min)
- 🔵 **En cours de traitement** : Traitement en cours
- 🟢 **Approuvé** : Retrait approuvé et montant débité
- 🔴 **Refusé** : Demande refusée

## Avantages du nouveau système

1. **Transparence** : L'utilisateur voit clairement quand son solde sera débité
2. **Flexibilité** : Possibilité d'annuler une demande pendant la période d'attente
3. **Traçabilité** : Historique complet des étapes de traitement
4. **Sécurité** : Vérification du solde au moment de la demande ET du traitement
5. **Experience utilisateur** : Feedback visuel en temps réel

## Test du système

Utiliser le script `test-retrait-automatique.js` :

```javascript
// Dans la console du navigateur
await testRetraitAutomatique(); // Teste le traitement automatique
await creerRetraitTest(); // Crée un retrait de test (10 secondes au lieu de 5min)
```

## Configuration

- **Délai de traitement** : 5 minutes (configurable dans l'API)
- **Fréquence de vérification** : 30 secondes (configurable dans le hook)
- **Timeout auto-refresh** : 1 seconde pour les comptes à rebours
