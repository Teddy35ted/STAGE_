# Configuration Email pour l'Envoi Automatique

## Système d'Email Implémenté

Le système d'envoi d'emails automatique est maintenant intégré pour :

### ✅ **Approbation de Compte**
- **Déclencheur** : Quand l'admin approuve une demande
- **Contenu** : Email avec mot de passe temporaire + commentaire admin (optionnel)
- **De** : Email de l'administrateur
- **À** : Email du demandeur

### ✅ **Rejet de Compte**
- **Déclencheur** : Quand l'admin rejette une demande
- **Contenu** : Email avec raison du rejet + commentaire admin (obligatoire)
- **De** : Email de l'administrateur  
- **À** : Email du demandeur

## Configuration Required

### 1. Configuration Gmail (Recommandé)

Pour utiliser Gmail, vous devez :

1. **Activer l'authentification à 2 facteurs** sur votre compte Gmail
2. **Générer un mot de passe d'application** :
   - Allez dans : Compte Google > Sécurité > Authentification à 2 facteurs > Mots de passe des applications
   - Générez un mot de passe pour "Autre (nom personnalisé)"
   - Utilisez ce mot de passe dans la configuration

3. **Mettre à jour le fichier `.env.local`** :
```bash
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # Mot de passe d'application généré
```

### 2. Configuration avec Autre Fournisseur

Modifiez le service EmailService pour utiliser votre fournisseur :

```typescript
// Dans app/Backend/services/email/EmailService.ts
this.transporter = nodemailer.createTransporter({
  host: 'smtp.votre-fournisseur.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Fonctionnalités Email

### Template d'Approbation
- ✅ Design responsive HTML
- ✅ Affichage du mot de passe temporaire
- ✅ Commentaire admin (si fourni)
- ✅ Lien direct vers la connexion
- ✅ Instructions de sécurité

### Template de Rejet
- ✅ Explanation claire du rejet
- ✅ Commentaire admin obligatoire
- ✅ Contact admin pour questions
- ✅ Lien pour nouvelle demande

## API Endpoints Ajoutés

### `/api/admin/account-requests/approve` (POST)
- **Authentification** : Token JWT admin requis
- **Body** : `{ requestId: string, comment?: string }`
- **Action** : Approuve + crée utilisateur + envoie email

### `/api/admin/account-requests/reject` (POST)
- **Authentification** : Token JWT admin requis
- **Body** : `{ requestId: string, comment: string }`
- **Action** : Rejette + envoie email (comment obligatoire)

## Test de Configuration

Pour tester la configuration email, vous pouvez :

1. **Créer une demande test** via le bouton dans le dashboard admin
2. **Approuver ou rejeter** la demande
3. **Vérifier la console** pour les logs d'envoi
4. **Vérifier l'email** du destinataire

## Gestion des Erreurs

- Les erreurs d'email **ne bloquent pas** le traitement des demandes
- Les erreurs sont loggées dans la console avec préfixe ⚠️
- Les succès sont loggés avec préfixe ✅

## Prochaines Améliorations Possibles

- 📧 Template emails plus avancés avec CSS inline
- 📊 Système de tracking d'ouverture d'emails
- 🔄 Retry automatique en cas d'échec d'envoi
- 📝 Logs d'envoi en base de données
- 🎨 Templates personnalisables par admin
