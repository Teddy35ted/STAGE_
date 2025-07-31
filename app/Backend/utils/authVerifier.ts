import { NextRequest } from 'next/server';
import { adminAuth } from '../config/firebase-admin';

export async function verifyAuth(request: NextRequest): Promise<{ uid: string; token: string } | null> {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      return { uid: decodedToken.uid, token: idToken };
    } catch (error) {
      console.error('Error verifying auth token:', error);
      return null;
    }
  }
  return null;
}
