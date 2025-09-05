# 🗃️ SCRIPTS DE NETTOYAGE BASE DE DONNÉES

## 🚀 Exécution via cURL

### **Windows PowerShell**
```powershell
# Nettoyage de la base de données
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/cleanup-database" -Method POST -ContentType "application/json"
```

### **Command Prompt (cmd)**
```cmd
curl -X POST "http://localhost:3000/api/admin/cleanup-database" -H "Content-Type: application/json"
```

### **Git Bash / Linux / macOS**
```bash
curl -X POST "http://localhost:3000/api/admin/cleanup-database" \
  -H "Content-Type: application/json"
```

## 🎯 Réponse Attendue

```json
{
  "success": true,
  "message": "Nettoyage de la base de données terminé",
  "deletedDocuments": {
    "users": 15,
    "laalas": 8,
    "contenus": 12,
    "co_gestionnaires": 3,
    "retraits": 25,
    "account_requests": 2
  },
  "preservedCollections": ["admins"],
  "totalDeleted": 65
}
```

## ⚠️ AVERTISSEMENTS IMPORTANTS

### 🔴 **ATTENTION - ACTION IRRÉVERSIBLE**
- ✅ **Garde** : Collection `admins`
- ❌ **Supprime** : Toutes les autres collections
- 💾 **Sauvegarde** : Recommandée avant exécution

### 🛡️ **Sécurité**
- L'API vérifie l'environnement
- Protection contre suppression accidentelle
- Logs détaillés des opérations

## 🧪 Test Sécurisé

### **1. Vérifier d'abord les données**
```powershell
# Voir ce qui va être supprimé
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET
```

### **2. Exécuter le nettoyage**
```powershell
# Nettoyer
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/cleanup-database" -Method POST -ContentType "application/json"
```

### **3. Vérifier le résultat**
```powershell
# Vérifier que c'est vide
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET
```
