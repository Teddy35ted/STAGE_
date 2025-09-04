'use client';

import { useEffect } from 'react';

/**
 * Composant d'auto-initialisation de l'admin
 * S'exécute côté client au chargement de l'app
 */
export default function AutoInitAdmin() {
  useEffect(() => {
    const initAdmin = async () => {
      try {
        console.log('🚀 Auto-initialisation admin côté client...');
        
        const response = await fetch('/api/admin/auto-init', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Admin auto-initialisé:', result.message);
        } else {
          console.warn('⚠️ Auto-init admin échoué:', response.status);
        }
      } catch (error) {
        console.error('❌ Erreur auto-init côté client:', error);
        // Ne pas bloquer l'application
      }
    };

    // Lancer l'auto-init après un court délai pour éviter de bloquer le rendu
    const timeoutId = setTimeout(initAdmin, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Ce composant ne rend rien
  return null;
}
