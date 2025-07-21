'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Redirection immédiate sans délai
      if (user) {
        console.log('User authenticated, redirecting to dashboard');
        router.replace('/dashboard');
      } else {
        console.log('User not authenticated, redirecting to auth');
        router.replace('/auth');
      }
    }
  }, [user, loading, router]);

  // Affichage minimal pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f01919] to-[#d01515]">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <h1 className="text-xl font-bold">La-à-La</h1>
        </div>
      </div>
    );
  }

  // Pendant la redirection, affichage minimal
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f01919] to-[#d01515]">
      <div className="text-center text-white">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
