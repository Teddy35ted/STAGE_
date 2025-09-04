# Script PowerShell simplifié pour créer l'admin
Write-Host "🔧 Création de l'administrateur..." -ForegroundColor Blue

# Données JSON pour créer l'admin
$json = '{"email":"tedkouevi701@gmail.com","password":"feiderus","name":"Administrateur Principal"}'

Write-Host "📡 Appel API /api/admin/init..." -ForegroundColor Yellow

try {
    # Créer l'admin
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/admin/init" -Method POST -Body $json -ContentType "application/json"
    
    Write-Host "📄 Statut: $($response.StatusCode)" -ForegroundColor White
    Write-Host "📄 Réponse:" -ForegroundColor White
    Write-Host $response.Content -ForegroundColor Gray
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Admin créé ou existe déjà !" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📄 Détails: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n🔐 Test de connexion..." -ForegroundColor Blue

# Test de connexion
$loginJson = '{"email":"tedkouevi701@gmail.com","password":"feiderus"}'

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/admin/auth/login" -Method POST -Body $loginJson -ContentType "application/json"
    
    Write-Host "📄 Statut connexion: $($loginResponse.StatusCode)" -ForegroundColor White
    Write-Host "📄 Réponse connexion:" -ForegroundColor White
    Write-Host $loginResponse.Content -ForegroundColor Gray
    
    if ($loginResponse.StatusCode -eq 200) {
        Write-Host "✅ CONNEXION RÉUSSIE !" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Erreur connexion: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📄 Détails: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Vous pouvez maintenant tester sur: http://localhost:3002/login" -ForegroundColor Cyan
