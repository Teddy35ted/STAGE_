# 🔧 Scripts d'Initialisation Administrateur

Ce dossier contient les scripts pour initialiser automatiquement l'administrateur du système.

## 📋 Scripts Disponibles

### 1. `start-with-admin.js` (Node.js)
Script principal qui démarre le serveur et initialise automatiquement l'admin.

**Usage:**
```bash
npm run dev:admin
```

### 2. `start-with-admin.ps1` (PowerShell)
Version PowerShell du script de démarrage avec initialisation auto.

**Usage:**
```powershell
npm run dev:admin:ps
# ou directement
powershell -ExecutionPolicy Bypass -File scripts/start-with-admin.ps1
```

### 3. `create-admin.js` (Node.js)
Script pour créer manuellement l'administrateur (serveur doit être démarré).

**Usage:**
```bash
# 1. Démarrer le serveur
npm run dev

# 2. Créer l'admin (dans un autre terminal)
npm run admin:create
```

## 🔑 Identifiants Administrateur

Les scripts créent automatiquement un administrateur avec ces identifiants :

- **Email:** `tedkouevi701@gmail.com`
- **Mot de passe:** `feiderus`
- **Nom:** `Administrateur Principal`

## 🚀 Démarrage Rapide

### Option 1: Démarrage automatique (Recommandé)
```bash
npm run dev:admin
```

Cette commande va :
1. ✅ Démarrer le serveur Next.js
2. ✅ Attendre que le serveur soit prêt
3. ✅ Créer automatiquement l'administrateur
4. ✅ Afficher les informations de connexion

### Option 2: Démarrage manuel
```bash
# Terminal 1: Démarrer le serveur
npm run dev

# Terminal 2: Créer l'admin
npm run admin:create
```

## 🌐 URLs d'Accès

Après l'initialisation, vous pouvez accéder à :

- **Page de connexion:** http://localhost:3000/login
- **Dashboard admin:** http://localhost:3000/admin
- **API de santé:** http://localhost:3000/api/health
- **API d'init admin:** http://localhost:3000/api/admin/init

## 🛠️ Fonctionnalités

### Vérification de Santé
Les scripts vérifient automatiquement si le serveur est disponible avant d'essayer de créer l'admin.

### Gestion des Erreurs
- Si l'admin existe déjà, les scripts l'indiquent sans erreur
- Si le serveur n'est pas disponible, les scripts attendent jusqu'à 30 secondes
- Gestion propre des timeouts et erreurs de connexion

### Compatibilité Multi-Plateforme
- Script Node.js pour tous les systèmes
- Script PowerShell spécialisé pour Windows
- Scripts npm pour une utilisation facile

## 📝 Logs et Debug

Les scripts affichent des logs colorés pour suivre le processus :
- 🚀 Démarrage
- ⏳ Attente du serveur
- 🔧 Initialisation admin
- ✅ Succès
- ❌ Erreurs
- ℹ️ Informations

## 🔄 Processus d'Initialisation

1. **Démarrage du serveur** Next.js avec Turbopack
2. **Vérification de santé** via `/api/health`
3. **Initialisation admin** via `/api/admin/init`
4. **Confirmation** et affichage des informations de connexion

## 🆘 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier les dépendances
npm install

# Vérifier la configuration
npm run lint
```

### L'admin n'est pas créé
```bash
# Créer manuellement l'admin
npm run admin:create

# Ou via l'API directement
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"email":"tedkouevi701@gmail.com","password":"feiderus","name":"Administrateur Principal"}'
```

### Erreur de permissions PowerShell
```powershell
# Autoriser l'exécution de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📂 Structure des Scripts

```
scripts/
├── start-with-admin.js      # Script principal Node.js
├── start-with-admin.ps1     # Script PowerShell
├── create-admin.js          # Création manuelle admin
└── README.md               # Cette documentation
```

---

**🎉 Utilisation recommandée:** `npm run dev:admin` pour un démarrage en un clic !
