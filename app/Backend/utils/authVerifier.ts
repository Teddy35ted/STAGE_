import { NextRequest } from 'next/server';
import { adminAuth } from '../config/firebase-admin';

export interface AuthResult {
  uid: string;
  token: string;
  email?: string;
  permissions: {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export async function verifyAuth(request: NextRequest): Promise<{ uid: string; token: string } | null> {
  const authorization = request.headers.get('Authorization');
  
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    try {
      console.log('🔐 Vérification du token d\'authentification...');
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      console.log('✅ Authentification réussie pour:', decodedToken.uid);
      
      return { 
        uid: decodedToken.uid, 
        token: idToken
      };
    } catch (error) {
      console.error('❌ Erreur vérification token:', error);
      return null;
    }
  }
  
  console.warn('⚠️ Aucun token d\'authentification fourni');
  return null;
}

// Version étendue avec permissions
export async function verifyAuthWithPermissions(request: NextRequest): Promise<AuthResult | null> {
  const authorization = request.headers.get('Authorization');
  
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    try {
      console.log('🔐 Vérification du token avec permissions...');
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      // Permissions par défaut très permissives pour le développement
      const permissions = {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true
      };
      
      console.log('✅ Authentification avec permissions réussie pour:', decodedToken.uid);
      
      return { 
        uid: decodedToken.uid, 
        token: idToken,
        email: decodedToken.email,
        permissions
      };
    } catch (error) {
      console.error('❌ Erreur vérification token avec permissions:', error);
      return null;
    }
  }
  
  console.warn('⚠️ Aucun token d\'authentification fourni');
  return null;
}

// Fonction utilitaire pour vérifier les permissions
export function checkPermission(
  auth: AuthResult,
  operation: 'create' | 'read' | 'update' | 'delete',
  resource?: string,
  resourceData?: any
): { allowed: boolean; reason?: string } {
  
  // En mode développement, tout est autorisé
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔓 Mode dev - ${operation} autorisé pour ${auth.uid}`);
    return { allowed: true, reason: 'Mode développement' };
  }
  
  // Vérifier les permissions de base
  switch (operation) {
    case 'create':
      return { allowed: auth.permissions.canCreate, reason: auth.permissions.canCreate ? 'Autorisé' : 'Création non autorisée' };
    case 'read':
      return { allowed: auth.permissions.canRead, reason: auth.permissions.canRead ? 'Autorisé' : 'Lecture non autorisée' };
    case 'update':
      return { allowed: auth.permissions.canUpdate, reason: auth.permissions.canUpdate ? 'Autorisé' : 'Modification non autorisée' };
    case 'delete':
      return { allowed: auth.permissions.canDelete, reason: auth.permissions.canDelete ? 'Autorisé' : 'Suppression non autorisée' };
    default:
      return { allowed: false, reason: 'Opération non reconnue' };
  }
}
