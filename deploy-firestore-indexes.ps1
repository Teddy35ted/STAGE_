# ===== SCRIPT POWERSHELL DE DÉPLOIEMENT DES INDEX FIRESTORE =====
# Déploie automatiquement tous les index requis pour le projet

Write-Host "🔥 === DÉPLOIEMENT DES INDEX FIRESTORE ===" -ForegroundColor Cyan

# Configuration
$PROJECT_ID = "votre-project-id"  # ⚠️ À REMPLACER par votre Project ID Firebase
$REGION = "europe-west1"

# Fonctions d'affichage coloré
function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "⚠️ $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

function Write-Info($message) {
    Write-Host "ℹ️ $message" -ForegroundColor Blue
}

# Vérifications préliminaires
Write-Host "🔍 Vérifications préliminaires..." -ForegroundColor Cyan

# Vérifier Firebase CLI
try {
    $firebaseVersion = firebase --version
    Write-Success "Firebase CLI trouvé: $firebaseVersion"
} catch {
    Write-Error "Firebase CLI n'est pas installé"
    Write-Host "Installez-le avec: npm install -g firebase-tools" -ForegroundColor White
    exit 1
}

# Vérifier le fichier d'index
if (-Not (Test-Path "firestore.indexes.json")) {
    Write-Error "Fichier firestore.indexes.json non trouvé"
    Write-Host "Assurez-vous d'être dans le répertoire racine du projet" -ForegroundColor White
    exit 1
}
Write-Success "Fichier firestore.indexes.json trouvé"

# Vérifier la connexion Firebase
Write-Host "🔐 Vérification de l'authentification Firebase..." -ForegroundColor Cyan
try {
    $projects = firebase projects:list 2>$null
    Write-Success "Authentification Firebase OK"
} catch {
    Write-Warning "Non authentifié avec Firebase"
    Write-Host "Connexion à Firebase..." -ForegroundColor White
    firebase login
}

# Sélectionner le projet
Write-Host "📋 Sélection du projet Firebase..." -ForegroundColor Cyan
if ($PROJECT_ID -eq "votre-project-id") {
    Write-Error "⚠️ ATTENTION: Vous devez modifier PROJECT_ID dans ce script"
    Write-Host "Remplacez 'votre-project-id' par votre vrai Project ID Firebase" -ForegroundColor White
    exit 1
}

try {
    firebase use $PROJECT_ID
    Write-Success "Projet $PROJECT_ID sélectionné"
} catch {
    Write-Error "Impossible de sélectionner le projet $PROJECT_ID"
    Write-Host "Vérifiez que le Project ID est correct" -ForegroundColor White
    exit 1
}

# Afficher les index actuels
Write-Host "📊 État actuel des index..." -ForegroundColor Cyan
firebase firestore:indexes

# Afficher le contenu du fichier d'index
Write-Host "`n📄 Index à déployer:" -ForegroundColor Cyan
if (Get-Command jq -ErrorAction SilentlyContinue) {
    Get-Content firestore.indexes.json | jq '.indexes[] | {collection: .collectionGroup, fields: [.fields[] | {field: .fieldPath, order: .order}]}'
} else {
    Write-Host "Contenu de firestore.indexes.json:" -ForegroundColor White
    Get-Content firestore.indexes.json
}

# Confirmation utilisateur
Write-Host "`n❓ Voulez-vous déployer ces index ? (y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -notmatch "^[Yy]$") {
    Write-Warning "Déploiement annulé par l'utilisateur"
    exit 0
}

# Déploiement des index
Write-Host "`n🚀 Déploiement des index Firestore..." -ForegroundColor Cyan
try {
    firebase deploy --only firestore:indexes
    Write-Success "Index déployés avec succès!"
} catch {
    Write-Error "Erreur lors du déploiement des index"
    exit 1
}

# Vérification post-déploiement
Write-Host "`n🔍 Vérification post-déploiement..." -ForegroundColor Cyan
firebase firestore:indexes

# Informations sur la construction des index
Write-Host "`n📋 === INFORMATIONS IMPORTANTES ===" -ForegroundColor Cyan
Write-Info "Les index peuvent prendre plusieurs minutes à se construire"
Write-Info "Statut des index:"
Write-Host "  🟡 Building: Index en cours de construction" -ForegroundColor White
Write-Host "  🟢 Ready: Index prêt à l'utilisation" -ForegroundColor White
Write-Host "  🔴 Error: Erreur de construction" -ForegroundColor White

Write-Info "Consultez la console Firebase pour plus de détails:"
Write-Host "https://console.firebase.google.com/project/$PROJECT_ID/firestore/indexes" -ForegroundColor White

# Index déployés
Write-Host "`n✅ === INDEX DÉPLOYÉS ===" -ForegroundColor Green
Write-Host "Les index suivants ont été configurés:" -ForegroundColor White
Write-Host "  📊 campaigns: createdBy + createdAt (pour getCampaignsByUser)" -ForegroundColor White
Write-Host "  📬 notifications: userId + createdAt (pour getUserNotifications)" -ForegroundColor White
Write-Host "  📬 notifications: userId + isRead (pour getUnreadCount)" -ForegroundColor White
Write-Host "  📄 contenus: idLaala + position (pour getByLaala)" -ForegroundColor White
Write-Host "  🎯 laalas: idCreateur + date (pour getByCreator)" -ForegroundColor White
Write-Host "  🔥 laalas: encours + vues (pour getLaalasPopulaires)" -ForegroundColor White
Write-Host "  💬 messages: idsender/idExpediteur + createdAt" -ForegroundColor White
Write-Host "  💰 retraits: userId/statut + dateCreation" -ForegroundColor White
Write-Host "  👥 users: filtres + createdAt" -ForegroundColor White
Write-Host "  🤝 co_gestionnaires: laalaId/userId + metadata" -ForegroundColor White

Write-Host "`n🎯 === ACTIVATION DES REQUÊTES ===" -ForegroundColor Cyan
Write-Warning "Une fois les index construits, activez les requêtes commentées:"
Write-Host "  1. CampaignService.ts ligne 165: Décommentez .orderBy('createdAt', 'desc')" -ForegroundColor White
Write-Host "  2. LaalaService.ts ligne 202: Décommentez .orderBy('date', 'desc')" -ForegroundColor White
Write-Host "  3. Testez les fonctionnalités pour vérifier le bon fonctionnement" -ForegroundColor White

Write-Success "Déploiement terminé avec succès!"
Write-Host "`n👉 Surveillez la console Firebase pour le statut de construction des index" -ForegroundColor Cyan