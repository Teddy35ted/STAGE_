# Script PowerShell pour déployer les index Firestore
# Usage: .\deploy-indexes.ps1

Write-Host "🚀 Déploiement des index Firestore..." -ForegroundColor Cyan

# Vérifier si Firebase CLI est installé
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI trouvé: $firebaseVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Firebase CLI n'est pas installé." -ForegroundColor Red
    Write-Host "📦 Installation: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Vérifier le fichier firestore.indexes.json
if (-Not (Test-Path "firestore.indexes.json")) {
    Write-Host "❌ Fichier firestore.indexes.json non trouvé" -ForegroundColor Red
    Write-Host "🔍 Assurez-vous d'être dans le répertoire racine du projet" -ForegroundColor Yellow
    exit 1
}

# Lire le projet ID depuis .env
$projectId = $null
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    foreach ($line in $envContent) {
        if ($line -match "^FIREBASE_PROJECT_ID=(.+)$") {
            $projectId = $matches[1] -replace '"', ''
            break
        }
    }
}

if (-Not $projectId) {
    Write-Host "⚠️ FIREBASE_PROJECT_ID non trouvé dans .env" -ForegroundColor Yellow
    Write-Host "📋 Projets disponibles:" -ForegroundColor Cyan
    firebase projects:list
    $projectId = Read-Host "🔍 Entrez l'ID du projet Firebase"
}

Write-Host "🎯 Projet cible: $projectId" -ForegroundColor Blue

# Vérifier l'authentification
try {
    firebase projects:list --project $projectId | Out-Null
    Write-Host "✅ Authentification Firebase OK" -ForegroundColor Green
}
catch {
    Write-Host "🔑 Connexion à Firebase requise..." -ForegroundColor Yellow
    firebase login
}

# Déployer les index
Write-Host "📤 Déploiement des index Firestore..." -ForegroundColor Cyan
try {
    firebase deploy --only firestore:indexes --project $projectId
    Write-Host "✅ Index Firestore déployés avec succès!" -ForegroundColor Green
    Write-Host "⏱️ Les index peuvent prendre quelques minutes à être construits" -ForegroundColor Yellow
    Write-Host "🔍 Vérifiez le statut dans Firebase Console > Firestore > Index" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Erreur lors du déploiement des index" -ForegroundColor Red
    Write-Host "💡 Vérifiez votre connexion et les permissions du projet" -ForegroundColor Yellow
    exit 1
}