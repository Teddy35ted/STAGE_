import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

class FirebaseAdmin {
  private static instance: FirebaseAdmin;
  private _app: App;
  private _db: Firestore;
  private _auth: Auth;
  private _storage: Storage;

  private constructor() {
    // Vérification des variables d'environnement
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Variables d\'environnement Firebase Admin manquantes');
    }

    // Configuration complète Firebase Admin
    const firebaseAdminConfig = {
      type: "service_account",
      project_id: projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: clientEmail,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
    };

    // Initialisation avec certificat complet
    this._app = getApps().find(app => app?.name === 'admin') || 
      initializeApp({
        credential: cert(firebaseAdminConfig as any),
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL
      }, 'admin');

    this._db = getFirestore(this._app);
    this._auth = getAuth(this._app);
    this._storage = getStorage(this._app);
  }

  public static getInstance(): FirebaseAdmin {
    if (!FirebaseAdmin.instance) {
      FirebaseAdmin.instance = new FirebaseAdmin();
    }
    return FirebaseAdmin.instance;
  }

  public get db(): Firestore {
    return this._db;
  }

  public get auth(): Auth {
    return this._auth;
  }

  public get storage(): Storage {
    return this._storage;
  }

  public get app(): App {
    return this._app;
  }
}

// Export des instances
const firebaseAdmin = FirebaseAdmin.getInstance();
export const adminDb = firebaseAdmin.db;
export const adminAuth = firebaseAdmin.auth;
export const adminStorage = firebaseAdmin.storage;

// Configuration des collections
export const COLLECTIONS = {
  USERS: process.env.COLLECTION_USERS || 'users',
  LAALAS: process.env.COLLECTION_LAALAS || 'laalas', 
  CONTENUS: process.env.COLLECTION_CONTENUS || 'contenus',
  MESSAGES: process.env.COLLECTION_MESSAGES || 'messages',
  BOUTIQUES: process.env.COLLECTION_BOUTIQUES || 'boutiques',
  CO_GESTIONNAIRES: process.env.COLLECTION_CO_GESTIONNAIRES || 'co_gestionnaires',
  RETRAITS: process.env.COLLECTION_RETRAITS || 'retraits',
} as const;

// Utilitaires Firestore
export const dbUtils = {
  // Timestamp Firestore
  timestamp: () => Timestamp.now(),
  
  // Conversion de timestamp en date
  timestampToDate: (timestamp: any) => {
    return timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  },
  
  // Création d'un timestamp à partir d'une date
  dateToTimestamp: (date: Date | string) => {
    return Timestamp.fromDate(new Date(date));
  },
  
  // Batch write pour opérations multiples
  batch: () => firebaseAdmin.db.batch(),
  
  // Transaction
  runTransaction: (updateFunction: any) => firebaseAdmin.db.runTransaction(updateFunction)
};

// Validation de la configuration
export const validateFirebaseConfig = () => {
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Variables d'environnement Firebase manquantes: ${missing.join(', ')}`);
  }
  
  console.log('✅ Configuration Firebase Admin validée');
  return true;
};

// Test de connexion
export const testFirebaseConnection = async () => {
  try {
    // Test simple de lecture Firestore
    const testDoc = await firebaseAdmin.db.collection('_test').limit(1).get();
    console.log('✅ Connexion Firebase Admin réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion Firebase Admin:', error);
    
    // Si l'erreur est NOT_FOUND, c'est que Firestore n'est pas activé
    if (error instanceof Error && error.message.includes('NOT_FOUND')) {
      console.log('ℹ️ Firestore n\'est pas activé. Veuillez l\'activer dans Firebase Console.');
      throw new Error('Firestore n\'est pas activé dans Firebase Console. Veuillez l\'activer pour continuer.');
    }
    
    return false;
  }
};

// Test de connexion Auth seulement (sans Firestore)
export const testFirebaseAuth = async () => {
  try {
    // Test Auth seulement
    const auth = firebaseAdmin.auth;
    console.log('✅ Firebase Auth disponible');
    return true;
  } catch (error) {
    console.error('❌ Erreur Firebase Auth:', error);
    return false;
  }
};

export default firebaseAdmin;