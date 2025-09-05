#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Fonction pour scanner tous les fichiers API
function scanApiFiles(dir, apiList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            scanApiFiles(filePath, apiList);
        } else if (file === 'route.ts') {
            // Extraire l'endpoint depuis le chemin
            const relativePath = path.relative('c:/Stage/STAGE_/app/api', filePath);
            const endpoint = '/' + relativePath.replace(/\\/g, '/').replace('/route.ts', '');
            
            // Lire le contenu du fichier
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const methods = [];
                
                // Détecter les méthodes HTTP
                if (content.includes('export async function GET')) methods.push('GET');
                if (content.includes('export async function POST')) methods.push('POST');
                if (content.includes('export async function PUT')) methods.push('PUT');
                if (content.includes('export async function DELETE')) methods.push('DELETE');
                if (content.includes('export async function PATCH')) methods.push('PATCH');
                
                apiList.push({
                    endpoint,
                    filePath,
                    methods,
                    content: content.substring(0, 500) // Premier extrait
                });
            } catch (error) {
                console.error(`Erreur lecture ${filePath}:`, error.message);
            }
        }
    }
    
    return apiList;
}

// Scanner toutes les APIs
const apiDir = 'c:/Stage/STAGE_/app/api';
const apis = scanApiFiles(apiDir);

// Générer le rapport
let report = `# 📊 ANALYSE COMPLÈTE DES APIs - ${new Date().toISOString()}

## 🎯 Statistiques Générales

- **Total APIs trouvées** : ${apis.length}
- **Endpoints uniques** : ${new Set(apis.map(api => api.endpoint)).size}

## 📋 Liste Complète des APIs

| Endpoint | Méthodes | Fichier |
|----------|----------|---------|
`;

apis.forEach(api => {
    report += `| \`${api.endpoint}\` | ${api.methods.join(', ')} | \`${api.filePath.replace('c:/Stage/STAGE_/', '')}\` |\n`;
});

// Détecter les doublons potentiels
report += `\n## ⚠️ Analyse des Conflits Potentiels\n\n`;

const endpointGroups = {};
apis.forEach(api => {
    if (!endpointGroups[api.endpoint]) {
        endpointGroups[api.endpoint] = [];
    }
    endpointGroups[api.endpoint].push(api);
});

let hasConflicts = false;
Object.keys(endpointGroups).forEach(endpoint => {
    const group = endpointGroups[endpoint];
    if (group.length > 1) {
        hasConflicts = true;
        report += `### 🚨 CONFLIT: \`${endpoint}\`\n\n`;
        group.forEach(api => {
            report += `- **Fichier**: \`${api.filePath.replace('c:/Stage/STAGE_/', '')}\`\n`;
            report += `- **Méthodes**: ${api.methods.join(', ')}\n`;
            report += `\n`;
        });
        report += `\n`;
    }
});

if (!hasConflicts) {
    report += `✅ **Aucun conflit détecté** - Tous les endpoints sont uniques\n\n`;
}

// Analyser les similitudes
report += `\n## 🔍 APIs Similaires (potentiels doublons)\n\n`;

const similarApis = [];
for (let i = 0; i < apis.length; i++) {
    for (let j = i + 1; j < apis.length; j++) {
        const api1 = apis[i];
        const api2 = apis[j];
        
        // Vérifier la similarité des endpoints
        const similarity = calculateSimilarity(api1.endpoint, api2.endpoint);
        if (similarity > 0.7) {
            similarApis.push({
                api1: api1.endpoint,
                api2: api2.endpoint,
                similarity: similarity.toFixed(2),
                file1: api1.filePath,
                file2: api2.filePath
            });
        }
    }
}

if (similarApis.length > 0) {
    similarApis.forEach(sim => {
        report += `### 🔗 Similarité ${sim.similarity * 100}%\n`;
        report += `- \`${sim.api1}\` (\`${sim.file1.replace('c:/Stage/STAGE_/', '')}\`)\n`;
        report += `- \`${sim.api2}\` (\`${sim.file2.replace('c:/Stage/STAGE_/', '')}\`)\n\n`;
    });
} else {
    report += `✅ **Aucune API similaire détectée**\n\n`;
}

// Catégoriser les APIs
report += `\n## 📂 Catégorisation des APIs\n\n`;

const categories = {
    'Authentification': [],
    'Utilisateurs': [],
    'Co-gestionnaires': [],
    'Administration': [],
    'Contenus': [],
    'Messages': [],
    'Retraits': [],
    'Diagnostic': [],
    'Autres': []
};

apis.forEach(api => {
    if (api.endpoint.includes('/auth')) categories['Authentification'].push(api);
    else if (api.endpoint.includes('/users')) categories['Utilisateurs'].push(api);
    else if (api.endpoint.includes('/co-gestionnaires')) categories['Co-gestionnaires'].push(api);
    else if (api.endpoint.includes('/admin')) categories['Administration'].push(api);
    else if (api.endpoint.includes('/contenus')) categories['Contenus'].push(api);
    else if (api.endpoint.includes('/messages')) categories['Messages'].push(api);
    else if (api.endpoint.includes('/retraits')) categories['Retraits'].push(api);
    else if (api.endpoint.includes('/diagnostic')) categories['Diagnostic'].push(api);
    else categories['Autres'].push(api);
});

Object.keys(categories).forEach(category => {
    const categoryApis = categories[category];
    if (categoryApis.length > 0) {
        report += `### ${category} (${categoryApis.length})\n\n`;
        categoryApis.forEach(api => {
            report += `- \`${api.endpoint}\` [${api.methods.join(', ')}]\n`;
        });
        report += `\n`;
    }
});

console.log(report);

// Fonction pour calculer la similarité entre deux chaînes
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}
