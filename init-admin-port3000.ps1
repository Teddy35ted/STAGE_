# Script pour initialiser l'administrateur
$body = @{
    email = "tedkouevi701@gmail.com"
    password = "feiderus"
    name = "Administrateur Principal"
} | ConvertTo-Json

try {
    Write-Host "Creation de l'administrateur..." -ForegroundColor Blue
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/init" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Admin cree avec succes!" -ForegroundColor Green
    Write-Host "Reponse: $($response | ConvertTo-Json)" -ForegroundColor White
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Code de statut: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host "`nVous pouvez maintenant vous connecter avec:" -ForegroundColor Cyan
Write-Host "Email: tedkouevi701@gmail.com" -ForegroundColor White
Write-Host "Mot de passe: feiderus" -ForegroundColor White
Write-Host "URL: http://localhost:3000/login" -ForegroundColor White
