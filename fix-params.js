const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/api/laalas/[id]/route.ts'
];

function fixParamsInFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Étape 1: Corriger les signatures de fonction
  content = content.replace(
    /export async function (GET|PUT|DELETE)\(request: NextRequest, \{ params \}: \{ params: \{ id: string \} \}\)/g,
    'export async function $1(request: NextRequest, { params }: { params: Promise<{ id: string }> })'
  );
  
  // Étape 2: Ajouter l'extraction de l'id en début de try block
  content = content.replace(
    /(\s+try \{)(\s+)(console\.log\(['"][^'"]+['"], params\.id\);)/g,
    '$1$2const { id } = await params;$2$3'
  );
  
  content = content.replace(
    /(\s+try \{)(\s+)((?!const \{ id \}).*console\.log\(['"][^'"]+['"], params\.id\);)/g,
    '$1$2const { id } = await params;$2$3'
  );
  
  // Étape 3: Remplacer toutes les occurrences de params.id par id
  content = content.replace(/params\.id/g, 'id');
  
  // Étape 4: Gérer les conflits de noms de variables (id déjà existant)
  // Pour PUT et DELETE, utiliser un nom différent
  content = content.replace(
    /(export async function (?:PUT|DELETE)[^{]+\{[^}]+try \{[^}]*)(const \{ id \} = await params;)/g,
    '$1const { id: resourceId } = await params;'
  );
  
  // Remplacer les utilisations d'id par resourceId dans PUT/DELETE seulement
  const lines = content.split('\n');
  let inPutOrDeleteFunction = false;
  let functionBraceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Détecter le début d'une fonction PUT ou DELETE
    if (line.includes('export async function PUT') || line.includes('export async function DELETE')) {
      inPutOrDeleteFunction = true;
      functionBraceCount = 0;
    }
    
    // Compter les accolades pour savoir quand la fonction se termine
    if (inPutOrDeleteFunction) {
      for (const char of line) {
        if (char === '{') functionBraceCount++;
        if (char === '}') functionBraceCount--;
      }
      
      // Si on utilise resourceId, remplacer les références à id sauf dans la destructuration
      if (line.includes('const { id: resourceId }')) {
        // Ne rien faire, c'est la ligne de destructuration
      } else if (line.includes('const { id,') || line.includes('const { id }')) {
        // Remplacer la destructuration des données par resourceId
        lines[i] = line.replace('const { id,', 'const { id: _,');
      } else {
        // Remplacer les autres utilisations d'id par resourceId
        lines[i] = line.replace(/\bid\b/g, 'resourceId');
      }
      
      // Si la fonction se termine
      if (functionBraceCount === 0 && line.includes('}')) {
        inPutOrDeleteFunction = false;
      }
    }
  }
  
  content = lines.join('\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
}

// Corriger chaque fichier
filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fixParamsInFile(fullPath);
  } else {
    console.log(`File not found: ${fullPath}`);
  }
});

console.log('All files fixed!');
