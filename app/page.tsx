'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirection directe vers la page d'authentification unifiée
    router.replace('/auth');
  }, [router]);

  // Pendant la redirection, affichage minimal
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f01919] to-[#d01515]">
      <div className="text-center text-white">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-sm">Redirection...</p>
      </div>
    </div>
  );
}
