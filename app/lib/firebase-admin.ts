// ===== REDIRECTION VERS CONFIGURATION BACKEND =====
// Ce fichier redirige vers la configuration Firebase centralisée du Backend

// Import de la configuration centralisée
export {
  adminDb,
  adminAuth,
  adminStorage,
  COLLECTIONS,
  dbUtils,
  validateFirebaseConfig,
  testFirebaseConnection
} from '../Backend/config/firebase-admin';

// Export par défaut
export { default } from '../Backend/config/firebase-admin';