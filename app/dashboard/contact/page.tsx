'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMessageSquare, FiArrowRight } from 'react-icons/fi';

export default function ContactRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique vers le dashboard après 3 secondes
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirect = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-[#f01919] rounded-full flex items-center justify-center mx-auto mb-6">
          <FiMessageSquare className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Section Contact Déplacée
        </h1>
        
        <p className="text-gray-600 mb-6">
          La section contact est maintenant accessible via l'icône de contact flottante 
          en bas à droite du dashboard.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleRedirect}
            className="w-full bg-[#f01919] hover:bg-[#d01515] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>Aller au Dashboard</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
          
          <p className="text-sm text-gray-500">
            Redirection automatique dans 3 secondes...
          </p>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Comment contacter le support ?</h3>
          <p className="text-sm text-blue-700">
            1. Allez sur le Dashboard<br/>
            2. Cliquez sur l'icône de message rouge en bas à droite<br/>
            3. Remplissez le formulaire de contact
          </p>
        </div>
      </div>
    </div>
  );
}