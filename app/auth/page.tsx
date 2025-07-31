'use client';

import React, { useState } from 'react';
import { LoginForm } from '../../components/auth/LoginForm';
import { CompleteRegistrationForm } from '../../components/auth/CompleteRegistrationForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f01919] to-[#d01515] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {isLogin ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <CompleteRegistrationForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
}