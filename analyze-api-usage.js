#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Fonction pour scanner les composants et pages
function scanComponents(dir, componentList = []) {
    if (!fs.existsSync(dir)) return componentList;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            scanComponents(filePath, componentList);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Extraire les appels d'API
                const apiCalls = [];
                const fetchMatches = content.match(/fetch\(['"](\/api\/[^'"]+)['"]/g);
                if (fetchMatches) {
                    fetchMatches.forEach(match => {
                        const endpoint = match.match(/['"](\/api\/[^'"]+)['"]/)[1];
                        apiCalls.push(endpoint);
                    });
                }
                
                // Rechercher d'autres patterns d'API
                const apiMatches = content.match(/['"`](\/api\/[^'"`]+)['"`]/g);
                if (apiMatches) {
                    apiMatches.forEach(match => {
                        const endpoint = match.slice(1, -1); // Retirer les guillemets
                        if (!apiCalls.includes(endpoint)) {
                            apiCalls.push(endpoint);
                        }
                    });
                }
                
                if (apiCalls.length > 0) {
                    componentList.push({
                        file: filePath.replace('c:\\Stage\\STAGE_\\', ''),
                        apiCalls: [...new Set(apiCalls)], // Supprimer les doublons
                        hasUseEffect: content.includes('useEffect'),
                        hasUseState: content.includes('useState'),
                        isFunctionalComponent: content.includes('export') && (content.includes('function') || content.includes('=>'))
                    });
                }
            } catch (error) {
                console.error(`Erreur lecture ${filePath}:`, error.message);
            }
        }
    }
    
    return componentList;
}

// Scanner les dossiers principaux
const components = [
    ...scanComponents('c:/Stage/STAGE_/components'),
    ...scanComponents('c:/Stage/STAGE_/app'),
    ...scanComponents('c:/Stage/STAGE_/pages'),
    ...scanComponents('c:/Stage/STAGE_/hooks')
];

// Lire la liste des APIs existantes
const apiReport = fs.readFileSync('c:/Stage/STAGE_/rapport-apis.md', 'utf8');
const apiLines = apiReport.split('\n').filter(line => line.startsWith('| `/'));
const existingApis = apiLines.map(line => {
    const match = line.match(/\| \`([^`]+)\`/);
    return match ? match[1] : null;
}).filter(Boolean);

// Analyser l'utilisation des APIs
let report = `# 🔗 ANALYSE UTILISATION DES APIs DANS LES INTERFACES

## 📊 Statistiques Générales

- **APIs existantes** : ${existingApis.length}
- **Composants utilisant des APIs** : ${components.length}
- **Total appels d'API détectés** : ${components.reduce((sum, comp) => sum + comp.apiCalls.length, 0)}

## 📋 APIs Utilisées dans les Interfaces

| API | Composants Utilisateurs | Status |
|-----|------------------------|--------|
`;

// Analyser chaque API
const usedApis = new Set();
existingApis.forEach(api => {
    const usingComponents = components.filter(comp => 
        comp.apiCalls.some(call => call === api || call.includes(api))
    );
    
    if (usingComponents.length > 0) {
        usedApis.add(api);
        const componentsList = usingComponents.map(comp => `\`${comp.file}\``).join(', ');
        report += `| \`${api}\` | ${componentsList} | ✅ Utilisée |\n`;
    }
});

// APIs non utilisées
const unusedApis = existingApis.filter(api => !usedApis.has(api));

report += `\n## ⚠️ APIs Non Utilisées dans les Interfaces (${unusedApis.length})\n\n`;

unusedApis.forEach(api => {
    report += `- \`${api}\` ❌ **Non utilisée**\n`;
});

// Détails par composant
report += `\n## 📁 Détails par Composant\n\n`;

components.forEach(comp => {
    report += `### \`${comp.file}\`\n\n`;
    report += `**APIs utilisées :**\n`;
    comp.apiCalls.forEach(api => {
        const exists = existingApis.includes(api);
        const status = exists ? '✅' : '❌';
        report += `- \`${api}\` ${status}\n`;
    });
    report += `\n**Caractéristiques :**\n`;
    report += `- ${comp.hasUseEffect ? '✅' : '❌'} useEffect\n`;
    report += `- ${comp.hasUseState ? '✅' : '❌'} useState\n`;
    report += `- ${comp.isFunctionalComponent ? '✅' : '❌'} Composant fonctionnel\n\n`;
});

// APIs référencées mais inexistantes
const allReferencedApis = [...new Set(components.flatMap(comp => comp.apiCalls))];
const missingApis = allReferencedApis.filter(api => !existingApis.includes(api));

if (missingApis.length > 0) {
    report += `\n## 🚨 APIs Référencées mais Inexistantes (${missingApis.length})\n\n`;
    missingApis.forEach(api => {
        const usingComponents = components.filter(comp => comp.apiCalls.includes(api));
        const componentsList = usingComponents.map(comp => `\`${comp.file}\``).join(', ');
        report += `- \`${api}\` utilisé dans : ${componentsList}\n`;
    });
}

// Analyse des doublons/conflits détectés
report += `\n## 🔍 Analyse des Conflits d'Utilisation\n\n`;

// Rechercher les patterns de doublons dans l'utilisation
const apiUsagePatterns = {};
components.forEach(comp => {
    comp.apiCalls.forEach(api => {
        if (!apiUsagePatterns[api]) {
            apiUsagePatterns[api] = [];
        }
        apiUsagePatterns[api].push(comp.file);
    });
});

// Détecter les APIs similaires utilisées différemment
const similarUsages = [];
Object.keys(apiUsagePatterns).forEach(api1 => {
    Object.keys(apiUsagePatterns).forEach(api2 => {
        if (api1 !== api2 && api1.includes(api2.split('/').pop()) || api2.includes(api1.split('/').pop())) {
            if (Math.abs(api1.length - api2.length) < 10) {
                similarUsages.push({
                    api1,
                    api2,
                    components1: apiUsagePatterns[api1],
                    components2: apiUsagePatterns[api2]
                });
            }
        }
    });
});

if (similarUsages.length > 0) {
    report += `### ⚠️ Utilisations Potentiellement Redondantes\n\n`;
    [...new Set(similarUsages.map(s => `${s.api1}|${s.api2}`))].forEach(pair => {
        const [api1, api2] = pair.split('|');
        const usage = similarUsages.find(s => s.api1 === api1 && s.api2 === api2);
        if (usage) {
            report += `**${api1}** vs **${api2}**\n`;
            report += `- \`${api1}\`: ${usage.components1.join(', ')}\n`;
            report += `- \`${api2}\`: ${usage.components2.join(', ')}\n\n`;
        }
    });
} else {
    report += `✅ **Aucun conflit d'utilisation détecté**\n\n`;
}

// Recommandations
report += `\n## 💡 Recommandations\n\n`;

if (unusedApis.length > 0) {
    report += `### 🧹 Nettoyage\n`;
    report += `- Considérer la suppression de ${unusedApis.length} APIs non utilisées\n`;
    report += `- Ou créer des interfaces pour les utiliser\n\n`;
}

if (missingApis.length > 0) {
    report += `### 🔧 APIs Manquantes\n`;
    report += `- Implémenter ${missingApis.length} APIs référencées\n`;
    report += `- Ou corriger les références erronées\n\n`;
}

report += `### ✅ Points Positifs\n`;
report += `- ${usedApis.size} APIs sont activement utilisées\n`;
report += `- ${components.length} composants intègrent des APIs\n`;
report += `- Architecture React moderne avec hooks\n`;

console.log(report);
