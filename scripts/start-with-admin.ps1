# Script PowerShell pour démarrer le serveur avec initialisation admin
param(
    [switch]$Force,
    [int]$Port = 3000
)

Write-Host "🚀 Démarrage du système avec initialisation automatique..." -ForegroundColor Blue
Write-Host ""

# Configuration
$AdminCredentials = @{
    email = "tedkouevi701@gmail.com"
    password = "feiderus"
    name = "Administrateur Principal"
}

$ServerUrl = "http://localhost:$Port"
$MaxRetries = 30
$RetryDelay = 1000

# Fonction pour vérifier si le serveur est disponible
function Test-ServerHealth {
    try {
        $response = Invoke-WebRequest -Uri "$ServerUrl/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Fonction pour initialiser l'admin
function Initialize-Admin {
    $body = $AdminCredentials | ConvertTo-Json
    
    try {
        Write-Host "🔧 Initialisation de l'administrateur..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri "$ServerUrl/api/admin/init" -Method POST -Body $body -ContentType "application/json"
        Write-Host "✅ Administrateur initialisé avec succès!" -ForegroundColor Green
        return $true
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        if ($errorMessage -like "*already exists*" -or $errorMessage -like "*déjà existe*") {
            Write-Host "ℹ️  L'administrateur existe déjà - OK!" -ForegroundColor Cyan
            return $true
        } else {
            Write-Host "⚠️  Erreur lors de l'initialisation admin: $errorMessage" -ForegroundColor Yellow
            Write-Host "ℹ️  Vous pouvez initialiser manuellement via /api/admin/init" -ForegroundColor Cyan
            return $false
        }
    }
}

# Fonction principale
try {
    # Démarrer le serveur Next.js en arrière-plan
    Write-Host "🌟 Démarrage du serveur Next.js..." -ForegroundColor Green
    $serverJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run dev
    }
    
    # Attendre que le serveur soit disponible
    Write-Host "⏳ Attente de la disponibilité du serveur..." -ForegroundColor Yellow
    $retryCount = 0
    $serverReady = $false
    
    while ($retryCount -lt $MaxRetries -and -not $serverReady) {
        Start-Sleep -Milliseconds $RetryDelay
        $serverReady = Test-ServerHealth
        $retryCount++
        
        if ($retryCount % 5 -eq 0) {
            Write-Host "   ... tentative $retryCount/$MaxRetries" -ForegroundColor Gray
        }
    }
    
    if (-not $serverReady) {
        throw "Le serveur n'a pas pu être contacté dans les temps"
    }
    
    Write-Host "✅ Serveur disponible!" -ForegroundColor Green
    
    # Initialiser l'administrateur
    $adminInitialized = Initialize-Admin
    
    # Afficher les informations de connexion
    Write-Host ""
    Write-Host "🎉 Système prêt!" -ForegroundColor Green
    Write-Host "📧 Email admin: tedkouevi701@gmail.com" -ForegroundColor White
    Write-Host "🔑 Mot de passe: feiderus" -ForegroundColor White
    Write-Host "🌐 URL de connexion: $ServerUrl/login" -ForegroundColor Cyan
    Write-Host "🛠️  URL d'admin: $ServerUrl/admin" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✨ Le serveur continue à fonctionner..." -ForegroundColor Green
    Write-Host "   Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Gray
    Write-Host ""
    
    # Attendre l'arrêt manuel
    try {
        Wait-Job -Job $serverJob
    } catch {
        Write-Host "🛑 Arrêt du serveur..." -ForegroundColor Red
    } finally {
        Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
        Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
    }
    
} catch {
    Write-Host "❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    
    # Nettoyer les jobs en cas d'erreur
    if ($serverJob) {
        Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
        Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
    }
    
    exit 1
}
