'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, UserPlus } from 'lucide-react';
import LoginForm from './LoginForm';
import { CompleteRegistrationForm } from './CompleteRegistrationForm';

interface AnimateurAuthProps {
  onBack: () => void;
}

export const AnimateurAuth: React.FC<AnimateurAuthProps> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f01919] to-[#d01515] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header avec retour */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Changer de rôle</span>
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full">
              <User className="w-5 h-5" />
              <span className="font-semibold">Mode Animateur</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/20 backdrop-blur-md rounded-full p-1 flex">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                isLogin
                  ? 'bg-white text-red-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Se connecter
              </div>
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-red-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Créer un compte
              </div>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2">
          {isLogin ? (
            <LoginForm onToggleMode={toggleMode} />
          ) : (
            <CompleteRegistrationForm onToggleMode={toggleMode} />
          )}
        </div>

        {/* Info */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm">
            En tant qu'animateur, vous pouvez créer votre compte ou vous connecter 
            pour gérer vos laalas et inviter des co-gestionnaires.
          </p>
        </div>
      </div>
    </div>
  );
};
