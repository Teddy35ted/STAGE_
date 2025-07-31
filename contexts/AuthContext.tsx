'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '../app/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  logout: () => Promise<void>;
  setupRecaptcha: (containerId: string) => RecaptchaVerifier;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user);
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', result.user);
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign up with:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Sign up successful:', result.user);
      return result;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signInWithPhone = async (phoneNumber: string): Promise<ConfirmationResult> => {
    try {
      // Clean up any existing recaptcha
      const existingRecaptcha = document.getElementById('recaptcha-container');
      if (existingRecaptcha) {
        existingRecaptcha.innerHTML = '';
      }

      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });

      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      console.log('Phone sign in initiated:', result);
      return result;
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    try {
      return new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
      });
    } catch (error: any) {
      console.error('reCAPTCHA setup error:', error);
      throw new Error('Erreur lors de la configuration du reCAPTCHA');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  };

  // Helper function to translate Firebase error codes to French
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cet email.';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect.';
      case 'auth/email-already-in-use':
        return 'Cet email est déjà utilisé.';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères.';
      case 'auth/invalid-email':
        return 'Adresse email invalide.';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard.';
      case 'auth/network-request-failed':
        return 'Erreur de connexion. Vérifiez votre connexion internet.';
      case 'auth/invalid-phone-number':
        return 'Numéro de téléphone invalide.';
      case 'auth/missing-phone-number':
        return 'Numéro de téléphone manquant.';
      case 'auth/quota-exceeded':
        return 'Quota SMS dépassé. Réessayez plus tard.';
      case 'auth/invalid-verification-code':
        return 'Code de vérification invalide.';
      case 'auth/invalid-verification-id':
        return 'ID de vérification invalide.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithPhone,
    logout,
    setupRecaptcha,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};