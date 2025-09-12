#!/bin/bash

# ===== SCRIPT DE DÉPLOIEMENT DES INDEX FIRESTORE =====
# Déploie automatiquement tous les index requis pour le projet

echo "🔥 === DÉPLOIEMENT DES INDEX FIRESTORE ==="

# Configuration
PROJECT_ID="votre-project-id"  # ⚠️ À REMPLACER par votre Project ID Firebase
REGION="europe-west1"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage coloré
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier Firebase CLI
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI n'est pas installé"
    echo "Installez-le avec: npm install -g firebase-tools"
    exit 1
fi
print_status "Firebase CLI trouvé"

# Vérifier le fichier d'index
if [ ! -f "firestore.indexes.json" ]; then
    print_error "Fichier firestore.indexes.json non trouvé"
    echo "Assurez-vous d'être dans le répertoire racine du projet"
    exit 1
fi
print_status "Fichier firestore.indexes.json trouvé"

# Vérifier la connexion Firebase
echo "🔐 Vérification de l'authentification Firebase..."
if ! firebase projects:list &> /dev/null; then
    print_warning "Non authentifié avec Firebase"
    echo "Connexion à Firebase..."
    firebase login
fi
print_status "Authentification Firebase OK"

# Sélectionner le projet
echo "📋 Sélection du projet Firebase..."
if [ "$PROJECT_ID" = "votre-project-id" ]; then
    print_error "⚠️ ATTENTION: Vous devez modifier PROJECT_ID dans ce script"
    echo "Remplacez 'votre-project-id' par votre vrai Project ID Firebase"
    exit 1
fi

firebase use $PROJECT_ID
if [ $? -ne 0 ]; then
    print_error "Impossible de sélectionner le projet $PROJECT_ID"
    echo "Vérifiez que le Project ID est correct"
    exit 1
fi
print_status "Projet $PROJECT_ID sélectionné"

# Afficher les index actuels
echo "📊 État actuel des index..."
firebase firestore:indexes

# Afficher le contenu du fichier d'index
echo -e "\n📄 Index à déployer:"
cat firestore.indexes.json | jq '.indexes[] | {collection: .collectionGroup, fields: [.fields[] | {field: .fieldPath, order: .order}]}'

# Confirmation utilisateur
echo -e "\n❓ Voulez-vous déployer ces index ? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    print_warning "Déploiement annulé par l'utilisateur"
    exit 0
fi

# Déploiement des index
echo -e "\n🚀 Déploiement des index Firestore..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    print_status "Index déployés avec succès!"
else
    print_error "Erreur lors du déploiement des index"
    exit 1
fi

# Vérification post-déploiement
echo -e "\n🔍 Vérification post-déploiement..."
firebase firestore:indexes

# Informations sur la construction des index
echo -e "\n📋 === INFORMATIONS IMPORTANTES ==="
print_info "Les index peuvent prendre plusieurs minutes à se construire"
print_info "Statut des index:"
echo "  🟡 Building: Index en cours de construction"
echo "  🟢 Ready: Index prêt à l'utilisation"
echo "  🔴 Error: Erreur de construction"

print_info "Consultez la console Firebase pour plus de détails:"
echo "https://console.firebase.google.com/project/$PROJECT_ID/firestore/indexes"

# Index déployés
echo -e "\n✅ === INDEX DÉPLOYÉS ==="
echo "Les index suivants ont été configurés:"
echo "  📊 campaigns: createdBy + createdAt (pour getCampaignsByUser)"
echo "  📬 notifications: userId + createdAt (pour getUserNotifications)"
echo "  📬 notifications: userId + isRead (pour getUnreadCount)"
echo "  📄 contenus: idLaala + position (pour getByLaala)"
echo "  🎯 laalas: idCreateur + date (pour getByCreator)"
echo "  🔥 laalas: encours + vues (pour getLaalasPopulaires)"
echo "  💬 messages: idsender/idExpediteur + createdAt"
echo "  💰 retraits: userId/statut + dateCreation"
echo "  👥 users: filtres + createdAt"
echo "  🤝 co_gestionnaires: laalaId/userId + metadata"

echo -e "\n🎯 === ACTIVATION DES REQUÊTES ==="
print_warning "Une fois les index construits, activez les requêtes commentées:"
echo "  1. CampaignService.ts ligne 165: Décommentez .orderBy('createdAt', 'desc')"
echo "  2. LaalaService.ts ligne 202: Décommentez .orderBy('date', 'desc')"
echo "  3. Testez les fonctionnalités pour vérifier le bon fonctionnement"

print_status "Déploiement terminé avec succès!"
echo -e "\n👉 Surveillez la console Firebase pour le statut de construction des index"