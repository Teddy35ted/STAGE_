'use client';

import React, { useState } from 'react';
import { RoleSelector } from '../../components/auth/RoleSelector';
import { AnimateurAuth } from '../../components/auth/AnimateurAuth';
import { CoGestionnaireAuth } from '../../components/auth/CoGestionnaireAuth';

type AuthStep = 'role-selection' | 'animateur' | 'cogestionnaire';

export default function AuthPage() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('role-selection');

  const handleRoleSelect = (role: 'animateur' | 'cogestionnaire') => {
    setCurrentStep(role);
  };

  const handleBack = () => {
    setCurrentStep('role-selection');
  };

  switch (currentStep) {
    case 'animateur':
      return <AnimateurAuth onBack={handleBack} />;
    
    case 'cogestionnaire':
      return <CoGestionnaireAuth onBack={handleBack} />;
    
    default:
      return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }
}