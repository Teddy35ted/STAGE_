import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

class FirebaseAdmin {
  private static instance: FirebaseAdmin;
  private app: App;
  private _db: Firestore;
  private _auth: Auth;

  private constructor() {
    // Vérification des variables d'environnement
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Variables d\'environnement Firebase Admin manquantes');
    }

    // Initialisation avec certificat
    this.app = getApps().find(app => app?.name === 'admin') || 
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      }, 'admin');

    this._db = getFirestore(this.app);
    this._auth = getAuth(this.app);
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
}

// Export des instances
const firebaseAdmin = FirebaseAdmin.getInstance();
export const adminDb = firebaseAdmin.db;
export const adminAuth = firebaseAdmin.auth;
export default firebaseAdmin;