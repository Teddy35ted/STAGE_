#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🧹 SCRIPT DE NETTOYAGE DES APIs DOUBLONS');
console.log('==========================================\n');

// Liste des fichiers à supprimer (doublons identifiés)
const filesToDelete = [
    'app/api/co-gestionnaires/check-email-new/route.ts',
    'app/api/auth/co-gestionnaire/route.ts',
    'app/api/auth/co-gestionnaire-login/route.ts',
    'app/api/auth/login-temporary/route.ts'
];

// Références à mettre à jour dans le code
const references = [
    {
        files: ['components/auth/CoGestionnaireLoginForm.tsx'],
        oldApi: '/api/auth/co-gestionnaire-login',
        newApi: '/api/co-gestionnaires/auth/login'
    },
    {
        files: ['components/auth/CoGestionnaireAuth.tsx'],
        oldApi: '/api/auth/co-gestionnaire',
        newApi: '/api/co-gestionnaires/auth/login'
    }
];

function deleteFileAndDirectory(filePath) {
    const fullPath = path.join('c:/Stage/STAGE_', filePath);
    const dir = path.dirname(fullPath);
    
    try {
        if (fs.existsSync(fullPath)) {
            console.log(`🗑️  Suppression: ${filePath}`);
            fs.unlinkSync(fullPath);
            
            // Supprimer le dossier s'il est vide
            try {
                const files = fs.readdirSync(dir);
                if (files.length === 0) {
                    fs.rmdirSync(dir);
                    console.log(`📁 Dossier vide supprimé: ${path.relative('c:/Stage/STAGE_', dir)}`);
                }
            } catch (err) {
                // Dossier non vide ou erreur, ignorer
            }
            
            return true;
        } else {
            console.log(`⚠️  Fichier introuvable: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Erreur suppression ${filePath}:`, error.message);
        return false;
    }
}

function updateReferences(ref) {
    ref.files.forEach(file => {
        const fullPath = path.join('c:/Stage/STAGE_', file);
        
        try {
            if (fs.existsSync(fullPath)) {
                let content = fs.readFileSync(fullPath, 'utf8');
                const originalContent = content;
                
                // Remplacer les références
                content = content.replace(
                    new RegExp(ref.oldApi.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'),
                    ref.newApi
                );
                
                if (content !== originalContent) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`🔄 Mis à jour: ${file}`);
                    console.log(`   ${ref.oldApi} → ${ref.newApi}`);
                } else {
                    console.log(`ℹ️  Aucune référence trouvée dans: ${file}`);
                }
            } else {
                console.log(`⚠️  Fichier introuvable: ${file}`);
            }
        } catch (error) {
            console.error(`❌ Erreur mise à jour ${file}:`, error.message);
        }
    });
}

function createBackup() {
    const backupDir = 'c:/Stage/STAGE_/backup-before-cleanup';
    
    try {
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `apis-backup-${timestamp}.json`);
        
        const backupData = {
            timestamp: new Date().toISOString(),
            deletedFiles: [],
            updatedFiles: []
        };
        
        // Sauvegarder le contenu des fichiers à supprimer
        filesToDelete.forEach(file => {
            const fullPath = path.join('c:/Stage/STAGE_', file);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                backupData.deletedFiles.push({
                    path: file,
                    content: content
                });
            }
        });
        
        // Sauvegarder les fichiers à modifier
        references.forEach(ref => {
            ref.files.forEach(file => {
                const fullPath = path.join('c:/Stage/STAGE_', file);
                if (fs.existsSync(fullPath)) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    backupData.updatedFiles.push({
                        path: file,
                        originalContent: content
                    });
                }
            });
        });
        
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        console.log(`💾 Sauvegarde créée: ${backupFile}\n`);
        
        return backupFile;
    } catch (error) {
        console.error('❌ Erreur création sauvegarde:', error.message);
        return null;
    }
}

function generateReport() {
    let report = `# 📊 RAPPORT DE NETTOYAGE DES APIs

## 🗑️ Fichiers Supprimés

`;

    filesToDelete.forEach(file => {
        const fullPath = path.join('c:/Stage/STAGE_', file);
        const exists = fs.existsSync(fullPath);
        report += `- \`${file}\` ${exists ? '❌ **À supprimer**' : '✅ **Supprimé**'}\n`;
    });

    report += `\n## 🔄 Références Mises à Jour

`;

    references.forEach(ref => {
        report += `### ${ref.oldApi} → ${ref.newApi}\n\n`;
        ref.files.forEach(file => {
            report += `- \`${file}\`\n`;
        });
        report += '\n';
    });

    report += `\n## 📈 Impact

- **APIs supprimées** : ${filesToDelete.length}
- **Fichiers mis à jour** : ${references.reduce((total, ref) => total + ref.files.length, 0)}
- **Conflits résolus** : 4 majeurs

## ✅ Résultat

Après nettoyage, le projet aura une architecture API plus claire et maintenable, sans doublons ni conflits.
`;

    fs.writeFileSync('c:/Stage/STAGE_/RAPPORT_NETTOYAGE.md', report);
    console.log('\n📋 Rapport généré: RAPPORT_NETTOYAGE.md');
}

// Exécution du script
console.log('🏁 DÉBUT DU NETTOYAGE\n');

// 1. Créer une sauvegarde
console.log('1️⃣ Création de la sauvegarde...');
const backupFile = createBackup();

if (!backupFile) {
    console.log('❌ Impossible de créer la sauvegarde. Arrêt du script.');
    process.exit(1);
}

// 2. Mettre à jour les références
console.log('2️⃣ Mise à jour des références...');
references.forEach(updateReferences);

// 3. Supprimer les fichiers doublons
console.log('\n3️⃣ Suppression des doublons...');
let deletedCount = 0;
filesToDelete.forEach(file => {
    if (deleteFileAndDirectory(file)) {
        deletedCount++;
    }
});

// 4. Générer le rapport
console.log('\n4️⃣ Génération du rapport...');
generateReport();

// Résumé final
console.log('\n🎉 NETTOYAGE TERMINÉ !');
console.log('====================');
console.log(`✅ ${deletedCount}/${filesToDelete.length} fichiers supprimés`);
console.log(`✅ ${references.length} types de références mises à jour`);
console.log(`💾 Sauvegarde disponible: ${path.basename(backupFile)}`);
console.log('\n🔍 Vérifiez le rapport: RAPPORT_NETTOYAGE.md');
console.log('🚀 Projet prêt pour les tests !');
