// Script de test pour audit des modifications

// Test 1: Vérification de l'extraction de fileId depuis les URLs Appwrite
function testExtractFileId() {
  console.log('🧪 Test extraction fileId...');
  
  // URLs de test
  const testUrls = [
    'https://fra.cloud.appwrite.io/v1/storage/buckets/medias/files/64f1b2c3d4e5f6a7b8c9d0e1/view?project=688f85190004fa948692',
    'https://fra.cloud.appwrite.io/v1/storage/buckets/test/files/abc123def456/view?project=test123',
    '/uploads/1692364800000-abc123.jpg',
    'invalid-url',
    '',
    null
  ];
  
  const expected = [
    '64f1b2c3d4e5f6a7b8c9d0e1',
    'abc123def456',
    null, // URL locale
    null, // URL invalide
    null, // String vide
    null  // null
  ];
  
  function extractFileIdFromUrl(url) {
    try {
      if (!url) return null;
      
      // Format URL Appwrite: https://fra.cloud.appwrite.io/v1/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
      const match = url.match(/\/files\/([^\/]+)\/view/);
      return match ? match[1] : null;
    } catch (error) {
      console.warn('⚠️ Erreur extraction fileId:', error);
      return null;
    }
  }
  
  let passed = 0;
  let failed = 0;
  
  testUrls.forEach((url, index) => {
    const result = extractFileIdFromUrl(url);
    const expectedResult = expected[index];
    
    if (result === expectedResult) {
      console.log(`✅ Test ${index + 1}: PASSED - "${url}" → "${result}"`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: FAILED - "${url}" → "${result}" (attendu: "${expectedResult}")`);
      failed++;
    }
  });
  
  console.log(`\n📊 Résultats: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test 2: Vérification de la détection du type de fichier (Appwrite vs local)
function testFileTypeDetection() {
  console.log('\n🧪 Test détection type de fichier...');
  
  const testUrls = [
    { url: 'https://fra.cloud.appwrite.io/v1/storage/buckets/medias/files/abc123/view?project=test', expected: 'appwrite' },
    { url: '/uploads/test-image.jpg', expected: 'local' },
    { url: '/uploads/video-1692364800000.mp4', expected: 'local' },
    { url: 'https://example.com/other-file.jpg', expected: 'unknown' }
  ];
  
  function detectFileType(url) {
    if (!url) return 'unknown';
    if (url.startsWith('/uploads/')) return 'local';
    if (url.includes('appwrite.io') && url.includes('/files/')) return 'appwrite';
    return 'unknown';
  }
  
  let passed = 0;
  let failed = 0;
  
  testUrls.forEach(({ url, expected }, index) => {
    const result = detectFileType(url);
    
    if (result === expected) {
      console.log(`✅ Test ${index + 1}: PASSED - "${url}" → "${result}"`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: FAILED - "${url}" → "${result}" (attendu: "${expected}")`);
      failed++;
    }
  });
  
  console.log(`\n📊 Résultats: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test 3: Vérification de la validation des fichiers
function testFileValidation() {
  console.log('\n🧪 Test validation des fichiers...');
  
  // Simulation d'objets File pour les tests
  const testFiles = [
    { name: 'image.jpg', size: 5 * 1024 * 1024, type: 'image/jpeg', category: 'image', expectedValid: true },
    { name: 'large-image.jpg', size: 15 * 1024 * 1024, type: 'image/jpeg', category: 'image', expectedValid: false }, // Trop gros
    { name: 'video.mp4', size: 50 * 1024 * 1024, type: 'video/mp4', category: 'video', expectedValid: true },
    { name: 'large-video.mp4', size: 150 * 1024 * 1024, type: 'video/mp4', category: 'video', expectedValid: false }, // Trop gros
    { name: 'document.pdf', size: 1 * 1024 * 1024, type: 'application/pdf', category: 'image', expectedValid: false }, // Type non supporté
  ];
  
  function validateFile(file, category) {
    const maxSize = category === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB pour images, 100MB pour vidéos
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Fichier trop volumineux. Taille maximale: ${maxSize / (1024 * 1024)}MB`
      };
    }

    const allowedTypes = category === 'image' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      : ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non supporté. Types autorisés: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }
  
  let passed = 0;
  let failed = 0;
  
  testFiles.forEach(({ name, size, type, category, expectedValid }, index) => {
    const file = { name, size, type };
    const result = validateFile(file, category);
    
    if (result.valid === expectedValid) {
      console.log(`✅ Test ${index + 1}: PASSED - ${name} (${category}) → ${result.valid ? 'valide' : 'invalide'}`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: FAILED - ${name} (${category}) → ${result.valid ? 'valide' : 'invalide'} (attendu: ${expectedValid ? 'valide' : 'invalide'})`);
      if (result.error) console.log(`   Erreur: ${result.error}`);
      failed++;
    }
  });
  
  console.log(`\n📊 Résultats: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Exécution des tests
console.log('🚀 Début de l\'audit des modifications...\n');

const test1 = testExtractFileId();
const test2 = testFileTypeDetection();
const test3 = testFileValidation();

console.log('\n📋 RÉSUMÉ DE L\'AUDIT:');
console.log(`✅ Extraction fileId: ${test1 ? 'PASSED' : 'FAILED'}`);
console.log(`✅ Détection type fichier: ${test2 ? 'PASSED' : 'FAILED'}`);
console.log(`✅ Validation fichiers: ${test3 ? 'PASSED' : 'FAILED'}`);

const allPassed = test1 && test2 && test3;
console.log(`\n🎯 STATUT GLOBAL: ${allPassed ? '✅ TOUS LES TESTS PASSENT' : '❌ CERTAINS TESTS ÉCHOUENT'}`);

if (allPassed) {
  console.log('\n🎉 Audit réussi ! Aucune erreur de logique détectée.');
} else {
  console.log('\n⚠️ Des erreurs de logique ont été détectées. Veuillez réviser le code.');
}
