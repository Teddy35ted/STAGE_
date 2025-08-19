'use client';

import React from 'react';
import { User, Users, ArrowRight, Shield, Settings } from 'lucide-react';

interface RoleSelectorProps {
  onRoleSelect: (role: 'animateur' | 'cogestionnaire') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Bienvenue sur Laala</h1>
          <p className="text-white/90 text-lg">
            Choisissez votre type de connexion pour accéder à la plateforme
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Animateur Card */}
          <div
            onClick={() => onRoleSelect('animateur')}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Animateur</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Créer un compte</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Se connecter</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Gestion complète</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Vous êtes le propriétaire d'un compte et souhaitez gérer vos laalas, 
                contenus et inviter des co-gestionnaires.
              </p>

              <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                <span>Continuer comme animateur</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Co-gestionnaire Card */}
          <div
            onClick={() => onRoleSelect('cogestionnaire')}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Co-gestionnaire</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Connexion uniquement</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Permissions limitées</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Collaboration sécurisée</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Vous avez été invité(e) par un animateur pour collaborer 
                sur son compte avec des permissions spécifiques.
              </p>

              <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                <span>Continuer comme co-gestionnaire</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-center mt-8">
          <p className="text-white/80 text-sm">
            Vous ne savez pas quel rôle choisir ? <br />
            <span className="font-semibold">Animateur</span> = Vous créez votre propre compte | 
            <span className="font-semibold"> Co-gestionnaire</span> = Vous avez été invité(e)
          </p>
        </div>
      </div>
    </div>
  );
};
