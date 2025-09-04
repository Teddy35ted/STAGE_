# Script PowerShell ultra-simple pour créer l'admin
param(
    [int]$Port = 3000,
    [string]$Host = "localhost"
)

$url = "http://${Host}:${Port}"
$adminData = @{
    email = "tedkouevi701@gmail.com"
    password = "feiderus"
    name = "Administrateur Principal"
} | ConvertTo-Json

Write-Host "🚀 Création rapide de l'administrateur..." -ForegroundColor Blue
Write-Host "🌐 URL: $url/api/admin/init" -ForegroundColor Gray
Write-Host ""

try {
    # Méthode 1: Invoke-RestMethod (plus rapide)
    $response = Invoke-RestMethod -Uri "$url/api/admin/init" -Method POST -Body $adminData -ContentType "application/json" -TimeoutSec 10
    
    Write-Host "✅ Administrateur créé avec succès!" -ForegroundColor Green
    Write-Host "📄 Réponse: $($response | ConvertTo-Json -Compress)" -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    if ($statusCode -eq 409) {
        Write-Host "ℹ️  L'administrateur existe déjà - c'est normal!" -ForegroundColor Cyan
    } elseif ($errorMessage -like "*ConnectFailure*" -or $errorMessage -like "*refused*") {
        Write-Host "❌ Serveur non disponible sur $url" -ForegroundColor Red
        Write-Host "💡 Démarrez d'abord le serveur avec: npm run dev" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "⚠️  Erreur: $errorMessage" -ForegroundColor Yellow
        Write-Host "📊 Code: $statusCode" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🎉 Informations de connexion:" -ForegroundColor Green
Write-Host "📧 Email: tedkouevi701@gmail.com" -ForegroundColor White
Write-Host "🔑 Mot de passe: feiderus" -ForegroundColor White
Write-Host "🌐 URL de connexion: $url/login" -ForegroundColor Cyan
Write-Host ""
