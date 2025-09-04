@echo off
echo 🚀 Creation rapide de l'administrateur...
echo.

set PORT=3000
set URL=http://localhost:%PORT%

echo 🌐 URL: %URL%/api/admin/init
echo 📧 Email: tedkouevi701@gmail.com
echo 🔑 Mot de passe: feiderus
echo.

rem Utiliser curl si disponible
where curl >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo 🔧 Utilisation de curl...
    curl -X POST "%URL%/api/admin/init" ^
         -H "Content-Type: application/json" ^
         -d "{\"email\":\"tedkouevi701@gmail.com\",\"password\":\"feiderus\",\"name\":\"Administrateur Principal\"}" ^
         --max-time 10
    echo.
    if %ERRORLEVEL% == 0 (
        echo ✅ Requete envoyee avec succes!
    ) else (
        echo ❌ Erreur lors de l'envoi de la requete
        echo 💡 Assurez-vous que le serveur est demarre avec: npm run dev
    )
) else (
    echo ❌ curl n'est pas disponible
    echo 💡 Utilisez plutot le script PowerShell: .\scripts\quick-admin.ps1
    echo 💡 Ou le script Node.js: npm run admin:direct
)

echo.
echo 🎉 Informations de connexion:
echo 📧 Email: tedkouevi701@gmail.com
echo 🔑 Mot de passe: feiderus
echo 🌐 URL: %URL%/login
echo.
pause
