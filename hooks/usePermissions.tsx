'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface UserPermissions {
  id?: string;
  email?: string;
  isCoGestionnaire: boolean;
  permissions: {
    laalas: boolean;
    contenus: boolean;
  };
  animatorEmail?: string;
}

export interface PermissionCheck {
  canAccess: (resource: 'laalas' | 'contenus') => boolean;
  canCreate: (resource: 'laalas' | 'contenus') => boolean;
  canEdit: (resource: 'laalas' | 'contenus') => boolean;
  canDelete: (resource: 'laalas' | 'contenus') => boolean;
  canView: (resource: 'laalas' | 'contenus') => boolean;
  isOwner: boolean;
  isCoGestionnaire: boolean;
}

export function usePermissions(): {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
  check: PermissionCheck;
  refetch: () => Promise<void>;
} {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, getAuthToken } = useAuth();

  const fetchPermissions = async () => {
    console.log('🔍 fetchPermissions - Starting with user:', user?.email || 'No user');
    
    if (!user) {
      // Utilisateur non connecté = aucune permission
      console.log('⚠️ No user found - denying access');
      setPermissions({
        isCoGestionnaire: false,
        permissions: {
          laalas: false,
          contenus: false
        }
      });
      setLoading(false);
      return;
    }

    // NOUVELLE LOGIQUE: Vérifier le rôle sélectionné lors de l'authentification
    const selectedRole = typeof window !== 'undefined' ? localStorage.getItem('selectedRole') : null;
    console.log('🔍 Selected role from localStorage:', selectedRole);

    // Si l'utilisateur s'est connecté en tant qu'animateur
    if (selectedRole === 'animateur') {
      console.log('✅ User selected ANIMATEUR role - granting full access');
      setPermissions({
        isCoGestionnaire: false,
        permissions: {
          laalas: true,
          contenus: true
        }
      });
      setLoading(false);
      return;
    }

    // Si l'utilisateur s'est connecté en tant que co-gestionnaire
    if (selectedRole === 'cogestionnaire') {
      console.log('🔍 User selected CO-GESTIONNAIRE role - checking permissions in database');
      
      try {
        setLoading(true);
        setError(null);

        const token = await getAuthToken();
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        const response = await fetch('/api/co-gestionnaires/permissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('🔍 API Response status:', response.status);

        if (response.status === 404) {
          console.log('🚫 User selected co-gestionnaire but not found in database - denying access');
          setPermissions({
            isCoGestionnaire: true,
            permissions: {
              laalas: false,
              contenus: false
            }
          });
        } else if (response.ok) {
          // L'utilisateur est un vrai co-gestionnaire
          const data = await response.json();
          console.log('🔍 Co-gestionnaire data received:', data);
          setPermissions({
            id: data.id,
            email: data.email,
            isCoGestionnaire: true,
            permissions: data.permissions,
            animatorEmail: data.animatorEmail
          });
        } else {
          throw new Error('Erreur lors de la récupération des permissions');
        }
      } catch (err) {
        console.error('❌ Erreur permissions co-gestionnaire:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setPermissions({
          isCoGestionnaire: true,
          permissions: {
            laalas: false,
            contenus: false
          }
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // VÉRIFICATION IMPORTANTE : Déterminer qui est le vrai propriétaire (fallback)
    const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'teddy@laala.app';
    const isRealOwner = user.email === OWNER_EMAIL;
    
    console.log('🔍 Fallback owner check:', { userEmail: user.email, ownerEmail: OWNER_EMAIL, isRealOwner });

    if (isRealOwner) {
      console.log('✅ User is REAL OWNER (fallback) - granting full access');
      setPermissions({
        isCoGestionnaire: false,
        permissions: {
          laalas: true,
          contenus: true
        }
      });
    } else {
      console.log('🚫 Unknown user - denying access');
      setPermissions({
        isCoGestionnaire: false,
        permissions: {
          laalas: false,
          contenus: false
        }
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log('🔍 usePermissions - User changed:', user?.email || 'No user');
    fetchPermissions();
  }, [user]);

  // Système de vérification des permissions
  const check: PermissionCheck = {
    canAccess: (resource: 'laalas' | 'contenus') => {
      if (!permissions) {
        console.log('🔍 canAccess: No permissions object');
        return false;
      }
      if (!permissions.isCoGestionnaire) {
        console.log(`✅ canAccess(${resource}): OWNER - full access`);
        return true; // Propriétaire = accès complet
      }
      const hasAccess = permissions.permissions[resource] === true;
      console.log(`🔍 canAccess(${resource}): CO-GESTIONNAIRE - ${hasAccess ? 'ALLOWED' : 'DENIED'}`);
      return hasAccess;
    },

    canView: (resource: 'laalas' | 'contenus') => {
      if (!permissions) return false;
      if (!permissions.isCoGestionnaire) return true; // Propriétaire = accès complet
      return permissions.permissions[resource] === true;
    },

    canCreate: (resource: 'laalas' | 'contenus') => {
      if (!permissions) return false;
      if (!permissions.isCoGestionnaire) return true; // Propriétaire = accès complet
      return permissions.permissions[resource] === true;
    },

    canEdit: (resource: 'laalas' | 'contenus') => {
      if (!permissions) return false;
      if (!permissions.isCoGestionnaire) return true; // Propriétaire = accès complet
      return permissions.permissions[resource] === true;
    },

    canDelete: (resource: 'laalas' | 'contenus') => {
      if (!permissions) return false;
      if (!permissions.isCoGestionnaire) return true; // Propriétaire = accès complet
      return permissions.permissions[resource] === true;
    },

    isOwner: !permissions?.isCoGestionnaire,
    isCoGestionnaire: permissions?.isCoGestionnaire || false
  };

  return {
    permissions,
    loading,
    error,
    check,
    refetch: fetchPermissions
  };
}
