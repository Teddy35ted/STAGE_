# Script PowerShell pour créer l'administrateur
Write-Host "🔧 Création de l'administrateur..." -ForegroundColor Blue

# Données pour créer l'admin
$adminData = @{
    email = "tedkouevi701@gmail.com"
    password = "feiderus"
    name = "Administrateur Principal"
} | ConvertTo-Json

Write-Host "📡 Appel API /api/admin/init..." -ForegroundColor Yellow

try {
    # Appel API pour créer l'admin
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/admin/init" -Method POST -Body $adminData -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "✅ Administrateur créé avec succès !" -ForegroundColor Green
    Write-Host "📧 Email: $($response.admin.email)" -ForegroundColor White
    Write-Host "🆔 ID Admin: $($response.admin.id)" -ForegroundColor White
    
    # Test de connexion
    Write-Host "`n🔐 Test de connexion..." -ForegroundColor Blue
    
    $loginData = @{
        email = "tedkouevi701@gmail.com"
        password = "feiderus"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/admin/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "✅ CONNEXION RÉUSSIE !" -ForegroundColor Green
    Write-Host "🎫 Token reçu: $($loginResponse.token -ne $null)" -ForegroundColor White
    Write-Host "👤 Admin connecté: $($loginResponse.admin.email)" -ForegroundColor White
    
} catch {
    $errorDetails = $_.Exception.Response
    if ($errorDetails) {
        $reader = New-Object System.IO.StreamReader($errorDetails.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $errorData = $responseBody | ConvertFrom-Json
        
        if ($errorData.error -eq "Des administrateurs existent déjà") {
            Write-Host "ℹ️ L'admin existe déjà, test de connexion..." -ForegroundColor Yellow
            
            # Test de connexion même si admin existe déjà
            try {
                $loginData = @{
                    email = "tedkouevi701@gmail.com"
                    password = "feiderus"
                } | ConvertTo-Json
                
                $loginResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/admin/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
                
                Write-Host "✅ CONNEXION RÉUSSIE !" -ForegroundColor Green
                Write-Host "🎫 Token reçu: $($loginResponse.token -ne $null)" -ForegroundColor White
                Write-Host "👤 Admin connecté: $($loginResponse.admin.email)" -ForegroundColor White
                
            } catch {
                Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Erreur: $($errorData.error)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Erreur réseau: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Script terminé. Vous pouvez maintenant vous connecter sur: http://localhost:3002/login" -ForegroundColor Cyan
