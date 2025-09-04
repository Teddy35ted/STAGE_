// Générateur de JWT_SECRET sécurisé
const crypto = require('crypto');

function generateJWTSecret() {
  console.log('🔐 GÉNÉRATEUR DE JWT_SECRET');
  console.log('============================');
  
  // Méthode 1: Hex (recommandée)
  const hexSecret = crypto.randomBytes(32).toString('hex');
  console.log('\n📋 JWT_SECRET (Hex - Recommandé):');
  console.log(hexSecret);
  
  // Méthode 2: Base64
  const base64Secret = crypto.randomBytes(32).toString('base64');
  console.log('\n📋 JWT_SECRET (Base64):');
  console.log(base64Secret);
  
  // Méthode 3: UUID-based
  const uuidSecret = crypto.randomUUID() + '-' + crypto.randomUUID();
  console.log('\n📋 JWT_SECRET (UUID-based):');
  console.log(uuidSecret);
  
  console.log('\n✅ COMMENT UTILISER:');
  console.log('1. Copiez une des clés générées ci-dessus');
  console.log('2. Remplacez "your-secret-key-for-jwt-tokens" dans .env.local');
  console.log('3. Redémarrez votre serveur de développement');
  
  console.log('\n⚠️  IMPORTANT:');
  console.log('- Ne partagez JAMAIS cette clé');
  console.log('- Utilisez une clé différente en production');
  console.log('- La clé doit avoir au moins 32 caractères');
  
  return hexSecret;
}

// Générer et afficher
const newSecret = generateJWTSecret();

// Exemple de mise à jour automatique du .env.local
console.log('\n🔧 LIGNE COMPLÈTE POUR .env.local:');
console.log(`JWT_SECRET=${newSecret}`);

module.exports = { generateJWTSecret };
