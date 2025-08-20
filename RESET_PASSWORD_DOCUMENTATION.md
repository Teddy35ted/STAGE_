# Réinitialisation de mot de passe - Documentation

## Fonctionnalité implémentée

La fonctionnalité de réinitialisation de mot de passe a été ajoutée au formulaire de connexion des animateurs.

### Comment ça fonctionne

1. **Interface utilisateur** : Sur le formulaire de connexion, cliquez sur "Mot de passe oublié ?"
2. **Saisie email** : Entrez votre adresse email
3. **Envoi** : Un email de réinitialisation est envoyé via Firebase
4. **Confirmation** : Message de succès avec instructions
5. **Retour** : Possibilité de revenir au formulaire de connexion

### Composants modifiés

- `components/auth/LoginForm.tsx` : Interface utilisateur complète
- `app/api/auth/reset-password/route.ts` : API route optionnelle

### Fonctionnalités

✅ **Interface intuitive** : Bascule entre connexion et réinitialisation
✅ **Validation** : Vérification du format email
✅ **Gestion d'erreurs** : Messages clairs pour chaque cas
✅ **Firebase intégré** : Utilise sendPasswordResetEmail
✅ **États de chargement** : Indicateurs visuels
✅ **Retour facile** : Bouton pour revenir à la connexion
✅ **Succès visuel** : Icône et message de confirmation

### Utilisation

1. L'utilisateur clique sur "Mot de passe oublié ?"
2. L'interface bascule vers le formulaire de réinitialisation
3. Saisie de l'email et soumission
4. Firebase envoie automatiquement l'email
5. Affichage du message de succès
6. L'utilisateur peut revenir à la connexion

### Sécurité

- Validation côté client et serveur
- Gestion des tentatives multiples (Firebase)
- Messages d'erreur informatifs mais sécurisés
- Pas d'exposition d'informations sensibles

### Configuration Firebase

Assurez-vous que Firebase Auth est configuré pour l'envoi d'emails :
- Modèles d'email personnalisés dans la console Firebase
- Domaine autorisé pour les liens de réinitialisation
- Configuration SMTP si nécessaire

### API Route (optionnelle)

Une route API `/api/auth/reset-password` est disponible pour :
- Logging côté serveur
- Validation supplémentaire
- Intégration avec d'autres services

Pour l'utiliser, décommentez la section correspondante dans `LoginForm.tsx`.
