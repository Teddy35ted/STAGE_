# Script PowerShell ultra-rapide (1 ligne)
# Usage: .\quick-init.ps1

try { Invoke-RestMethod "http://localhost:3000/api/admin/auto-init" | ConvertTo-Json } catch { Write-Host "❌ Erreur: $_" }; Write-Host "🎉 Admin: tedkouevi701@gmail.com / feiderus → http://localhost:3000/login"
